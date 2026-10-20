import { sfx, unlockAudio, suspendAudio } from '../../audio/sfx';
import { t } from '../../core/i18n';
import { CONFIG } from '../../data/config';
import { card } from '../../data/cards';
import { foe as foeDef } from '../../data/foes';
import type { Battle, BattleEvent, BattleStats } from '../../game/battle';
import { COLS, PLACE_ROW, ROWS, type CardInst } from '../../game/types';
import type { FightKind } from '../../game/waves';
import { openModal, pico, type Screen } from '../app';
import { artUrl } from '../art/sprites';
import { openCardDetail, openFoeDetail } from '../components/cardShow';
import { cardView, cardArtId } from '../components/cardView';
import { costText } from '../components/cardText';
import { h, haptic, setText, toggle } from '../dom';
import { Field } from './field';

export interface BattleResult {
  won: boolean;
  early: boolean;
  stats: BattleStats;
  flame: number;
  /** Seconds of the night left when the last foe fell (0 when dawn came by itself). */
  timeLeft: number;
}

export interface BattleScreenOpts {
  battle: Battle;
  act: number;
  kind: FightKind;
  /** Heading of the start panel. */
  title: string;
  onEnd(result: BattleResult): void;
  onAbandon(): void;
  /** The guided first fight. */
  tour?: boolean;
}

interface Slot {
  el: HTMLElement;
  uid: number;
  card: HTMLElement | null;
  cost: HTMLElement | null;
  ring: HTMLElement;
}

interface Drag {
  slot: number;
  pointer: number;
  x0: number;
  y0: number;
  x: number;
  y: number;
  active: boolean;
  token: HTMLElement | null;
}

const fmtTime = (s: number): string => {
  const m = Math.floor(Math.max(0, s) / 60);
  return `${m}:${String(Math.floor(Math.max(0, s) % 60)).padStart(2, '0')}`;
};

/** The fight screen: the field on one canvas, the lantern's gauges, and a hand of cards played by tap or by dragging them onto the garden. */
export function battleScreen(o: BattleScreenOpts): Screen {
  const b = o.battle;
  const field = new Field(b, o.act);

  // ——— DOM ———
  const pauseBtn = h('button', { class: 'icon-btn b-pause', 'aria-label': t('ui.pause') }, pico('pause'));
  const dawnFill = h('div', { class: 'fill' });
  const sun = h('div', { class: 'sun' });
  const marks = h('div', { class: 'marks' });
  const timeLeft = h('div', { class: 'b-time num' });
  const dawn = h('div', { class: 'b-dawn' }, h('div', { class: 'track' }, dawnFill, marks, sun), timeLeft);
  const top = h('div', { class: 'b-top' }, pauseBtn, dawn);

  const fieldWrap = h('div', { class: 'b-field' }, field.canvas);

  const flamePips = h('div', { class: 'pips b-flame-pips' });
  const flameNum = h('span', { class: 'num b-flame-num' });
  const flameBox = h('div', { class: 'b-flame' }, pico('flame'), flamePips, flameNum);
  const oilCells = h('div', { class: 'cells' });
  const oilNum = h('span', { class: 'num b-oil-num' });
  const oilBox = h('div', { class: 'b-oil' }, pico('oil'), oilCells, oilNum);
  const abilityRing = h('div', { class: 'ring' });
  const abilityBtn = h('button', { class: 'b-ability', 'aria-label': t('ui.ability') }, abilityRing, pico('bell'));
  const status = h('div', { class: 'b-status' }, h('div', { class: 'b-bars' }, flameBox, oilBox), abilityBtn);

  const handEl = h('div', { class: 'b-hand' });
  const slots: Slot[] = [];
  for (let i = 0; i < b.handSize; i++) {
    const ring = h('div', { class: 'refill' });
    const el = h('div', { class: 'slot', 'data-slot': i }, ring);
    slots.push({ el, uid: -1, card: null, cost: null, ring });
    handEl.append(el);
  }

  const overlay = h('div', { class: 'b-overlay' });
  const el = h('div', { class: 'screen battle', 'data-act': o.act, 'data-kind': o.kind }, top, fieldWrap, status, handEl, overlay);

  // ——— the engine's events: sound and a little DOM ———
  let sfxGate = 0;
  const gate = (ms: number): boolean => {
    const now = performance.now();
    if (now - sfxGate < ms) return false;
    sfxGate = now;
    return true;
  };
  const seenIncoming = new Set<string>();
  const onEvent = (e: BattleEvent): void => {
    switch (e.type) {
      case 'start':
        sfx('start');
        break;
      case 'place':
        sfx(e.merged ? 'merge' : 'place');
        haptic(8);
        break;
      case 'played':
        if (card(e.card.id).kind === 'charm') sfx('charm');
        break;
      case 'draw':
        sfx('draw');
        break;
      case 'shot':
        if (e.kind === 'melee') {
          if (gate(60)) sfx('slash');
        } else if (e.kind === 'lob' || e.kind === 'pulse') sfx('shotHeavy');
        else if (gate(50)) sfx('shot', 0.9 + Math.random() * 0.4);
        break;
      case 'hitFoe':
        if (gate(45)) sfx('hit', 0.9 + Math.random() * 0.3);
        break;
      case 'foeDied':
        if (e.foe.def.tier === 'boss') sfx('bossDie');
        else if (!e.dawn) sfx('foeDie', 0.9 + Math.random() * 0.4);
        break;
      case 'unitDied':
        sfx('unitDie');
        break;
      case 'leak':
        sfx('leak');
        haptic([30, 40, 30]);
        break;
      case 'oil':
        if (e.lane !== null && gate(90)) sfx('oil', 0.9 + Math.random() * 0.3);
        break;
      case 'telegraph':
        sfx('slamWarn');
        break;
      case 'foeAct':
        if (e.k === 'slam') sfx('slam');
        else if (e.k === 'web') sfx('web');
        else if (e.k === 'freeze') sfx('freeze');
        break;
      case 'heal':
        if (gate(120)) sfx('heal');
        break;
      case 'ability':
        sfx('ability');
        haptic(25);
        break;
      case 'dawn':
        sfx('dawn');
        break;
      case 'won':
        finish(true, e.early);
        break;
      case 'lost':
        finish(false, false);
        break;
      default:
        break;
    }
  };

  // ——— state ———
  let armed = -1;
  let paused = false;
  let inspecting = 0;
  let ended = false;
  let hover: { lane: number; row: number } | null = null;
  let drag: Drag | null = null;
  const closers: (() => void)[] = [];

  const isPaused = (): boolean => paused || inspecting > 0 || document.hidden;

  // ——— the start panel ———
  function startPanel(): HTMLElement {
    const counts = new Map<string, number>();
    for (const s of b.stage.spawns) counts.set(s.foe, (counts.get(s.foe) ?? 0) + 1);
    const ids = [...counts.keys()].sort((a, c) => foeDef(c).tier.localeCompare(foeDef(a).tier) || foeDef(a).cost - foeDef(c).cost);
    const order = { boss: 0, elite: 1, normal: 2, minion: 3 } as const;
    ids.sort((a, c) => order[foeDef(a).tier] - order[foeDef(c).tier] || foeDef(c).cost - foeDef(a).cost);
    const row = h(
      'div',
      { class: 'tonight' },
      ...ids.slice(0, 8).map((id) => {
        const def = foeDef(id);
        return h(
          'button',
          {
            class: `tn-foe tier-${def.tier}`,
            onclick: () => {
              inspecting++;
              openFoeDetail(def, b.stage.hpMul, () => inspecting--);
            },
          },
          h('img', { src: artUrl(def.art), alt: '' }),
          h('span', { class: 'num' }, `×${counts.get(id)}`),
        );
      }),
    );
    const go = h('button', { class: 'btn big', onclick: () => begin() }, pico('flame'), t('ui.lightLantern'));
    return h(
      'div',
      { class: 'start-panel panel' },
      h('div', { class: 'sp-title' }, o.title),
      h('div', { class: 'sp-sub' }, t(`act.${o.act}.name`)),
      h('div', { class: 'rule' }),
      h('div', { class: 'sp-head' }, t('ui.tonight')),
      row,
      h('div', { class: 'sp-dawn' }, pico('nodeWatch'), t('ui.holdUntil', { time: fmtTime(b.stage.duration) })),
      go,
    );
  }

  function begin(): void {
    unlockAudio();
    overlay.replaceChildren();
    overlay.classList.remove('on');
    b.start();
    syncHand();
  }

  // ——— playing a card ———
  const reasonText: Record<string, string> = {
    oil: 'ui.noOil',
    tile: 'ui.badTile',
    merge: 'ui.maxLevel',
    nothing: 'ui.nothingToCopy',
    target: 'ui.pickLane',
    empty: 'ui.badTile',
    state: 'ui.badTile',
  };

  function tryPlay(slot: number, lane: number, row: number): boolean {
    const chk = b.check(slot, lane, row);
    if (!chk.ok) {
      sfx('deny');
      haptic(20);
      const s = slots[slot];
      if (s.card) {
        s.card.classList.remove('nope');
        void s.card.offsetWidth;
        s.card.classList.add('nope');
      }
      if (chk.reason === 'oil') {
        oilBox.classList.remove('lack');
        void oilBox.offsetWidth;
        oilBox.classList.add('lack');
      } else {
        showHint(t(reasonText[chk.reason] as 'ui.badTile'));
      }
      return false;
    }
    const played = b.play(slot, lane, row);
    if (played) disarm();
    return played;
  }

  let hintTimer = 0;
  const hintEl = h('div', { class: 'b-hint' });
  function showHint(text: string): void {
    hintEl.textContent = text;
    hintEl.classList.add('on');
    clearTimeout(hintTimer);
    hintTimer = window.setTimeout(() => hintEl.classList.remove('on'), 1400);
  }
  fieldWrap.append(hintEl);

  function aimOf(slot: number): 'tile' | 'lane' | 'none' | null {
    const c = b.hand[slot];
    if (!c) return null;
    const def = card(c.id);
    return def.kind === 'spirit' ? 'tile' : (def.aim ?? 'none');
  }

  function updateHint(): void {
    const slot = drag?.active ? drag.slot : armed;
    const aim = slot >= 0 ? aimOf(slot) : null;
    if (!aim || aim === 'none') {
      field.setHint(null);
      return;
    }
    field.setHint({
      mode: aim === 'lane' ? 'lane' : 'tile',
      valid: (l, r) => b.check(slot, l, r).ok || (b.oil < b.cardCost(b.hand[slot] as CardInst) && tileOk(slot, l, r)),
      merge: (l, r) => !!b.unitAt(l, r),
      hover,
    });
  }

  /** The tile is a legal target, oil aside (so the garden still lights up while the oil is short). */
  function tileOk(slot: number, l: number, r: number): boolean {
    const c = b.hand[slot];
    if (!c) return false;
    const def = card(c.id);
    if (def.kind === 'charm' && def.aim === 'tile') return b.tileFree(l, r) && !!b.lastSpirit;
    const there = b.unitAt(l, r);
    if (r < PLACE_ROW || l < 0 || l >= COLS || r >= ROWS || b.terrain[l][r] === 'rock') return false;
    return !there || (there.cardId === c.id && there.level < CONFIG.maxLevel);
  }

  function arm(slot: number): void {
    if (b.state !== 'playing' || !b.hand[slot]) return;
    const aim = aimOf(slot);
    if (aim === 'none') {
      tryPlay(slot, -1, -1);
      return;
    }
    if (armed === slot) {
      disarm();
      return;
    }
    armed = slot;
    sfx('pick');
    updateHint();
  }

  function disarm(): void {
    armed = -1;
    updateHint();
  }

  // ——— input on cards ———
  function cardDown(slot: number, e: PointerEvent): void {
    if (ended || drag) return;
    const c = b.hand[slot];
    if (!c) return;
    unlockAudio();
    drag = { slot, pointer: e.pointerId, x0: e.clientX, y0: e.clientY, x: e.clientX, y: e.clientY, active: false, token: null };
    holdTimer = window.setTimeout(() => {
      if (!drag || drag.active) return;
      const uid = c.uid;
      endDrag(false);
      const current = b.hand.find((x) => x?.uid === uid);
      if (current) {
        haptic(18);
        inspecting++;
        openCardDetail(current, () => inspecting--);
      }
    }, CONFIG.longPressMs);
    addEventListener('pointermove', cardMove);
    addEventListener('pointerup', cardUp);
    addEventListener('pointercancel', cardCancel);
  }
  let holdTimer = 0;

  function cardMove(e: PointerEvent): void {
    if (!drag || e.pointerId !== drag.pointer) return;
    drag.x = e.clientX;
    drag.y = e.clientY;
    if (!drag.active && Math.hypot(drag.x - drag.x0, drag.y - drag.y0) > CONFIG.tapSlop) {
      clearTimeout(holdTimer);
      if (b.state !== 'playing') return;
      drag.active = true;
      const c = b.hand[drag.slot];
      if (!c) return;
      const token = h('div', { class: 'drag-token' }, h('img', { src: artUrl(cardArtId(c.id)), alt: '' }), h('span', { class: 'num' }, costText(c)));
      el.append(token);
      drag.token = token;
      slots[drag.slot].el.classList.add('lifted');
      armed = -1;
    }
    if (drag.active && drag.token) {
      drag.token.style.transform = `translate(${drag.x}px, ${drag.y - CONFIG.dragLift}px) translate(-50%, -50%)`;
      hover = field.tileAt(drag.x, drag.y - CONFIG.dragLift);
      updateHint();
    }
  }

  function cardUp(e: PointerEvent): void {
    if (!drag || e.pointerId !== drag.pointer) return;
    const d = drag;
    const slot = d.slot;
    clearTimeout(holdTimer);
    if (d.active) {
      const tile = field.tileAt(d.x, d.y - CONFIG.dragLift);
      const aim = aimOf(slot);
      endDrag(true);
      if (aim === 'none') {
        const dropAboveHand = d.y - CONFIG.dragLift < handEl.getBoundingClientRect().top;
        if (dropAboveHand) tryPlay(slot, -1, -1);
      } else if (tile) {
        tryPlay(slot, tile.lane, tile.row);
      }
      return;
    }
    endDrag(false);
    arm(slot);
  }

  function cardCancel(e: PointerEvent): void {
    if (!drag || e.pointerId !== drag.pointer) return;
    clearTimeout(holdTimer);
    endDrag(true);
  }

  function endDrag(_dropped: boolean): void {
    removeEventListener('pointermove', cardMove);
    removeEventListener('pointerup', cardUp);
    removeEventListener('pointercancel', cardCancel);
    clearTimeout(holdTimer);
    if (drag) {
      drag.token?.remove();
      slots[drag.slot]?.el.classList.remove('lifted');
    }
    drag = null;
    hover = null;
    updateHint();
  }

  // ——— input on the field ———
  fieldWrap.addEventListener('pointermove', (e) => {
    if (armed < 0) return;
    hover = field.tileAt(e.clientX, e.clientY);
    updateHint();
  });
  fieldWrap.addEventListener('click', (e) => {
    if (armed < 0 || ended) return;
    const tile = field.tileAt(e.clientX, e.clientY);
    if (!tile) return disarm();
    const aim = aimOf(armed);
    if (aim === 'lane') tryPlay(armed, tile.lane, -1);
    else tryPlay(armed, tile.lane, tile.row);
  });

  // ——— the ability ———
  abilityBtn.addEventListener('click', () => {
    if (!b.useAbility()) {
      sfx('deny');
      showHint(t('ui.abilityCooling'));
    }
  });

  // ——— pause ———
  function pause(): void {
    if (ended || paused) return;
    paused = true;
    suspendAudio(true);
    openModal({
      title: t('ui.paused'),
      dismiss: false,
      actions: [
        { label: t('ui.resume'), cls: 'red' },
        {
          label: t('ui.abandon'),
          cls: 'paper',
          onClick: () => {
            openModal({
              title: t('ui.abandonQ'),
              body: t('ui.abandonBody'),
              actions: [
                { label: t('ui.stay'), cls: 'red', onClick: () => pause() },
                {
                  label: t('ui.leave'),
                  cls: 'paper',
                  onClick: () => {
                    suspendAudio(false);
                    ended = true;
                    o.onAbandon();
                  },
                },
              ],
              dismiss: false,
            });
          },
        },
      ],
      onClose: () => {
        paused = false;
        suspendAudio(false);
      },
    });
  }
  pauseBtn.addEventListener('click', pause);
  const visibility = (): void => {
    if (document.hidden && b.state === 'playing') pause();
  };
  const keys = (e: KeyboardEvent): void => {
    if (e.repeat) return;
    if (e.key === 'Escape' || e.key.toLowerCase() === 'p') {
      pause();
      return;
    }
    if (e.key === ' ' || e.key === 'Enter') {
      if (b.state === 'ready') begin();
      return;
    }
    if (e.key.toLowerCase() === 'a') {
      abilityBtn.click();
      return;
    }
    const n = Number(e.key);
    if (n >= 1 && n <= slots.length) arm(n - 1);
  };

  // ——— the end ———
  function finish(won: boolean, early: boolean): void {
    if (ended) return;
    ended = true;
    armed = -1;
    field.setHint(null);
    const result: BattleResult = { won, early, stats: b.stats, flame: b.flame, timeLeft: early ? Math.max(0, b.stage.duration - b.time) : 0 };
    setTimeout(
      () => {
        overlay.replaceChildren(endPanel(result));
        overlay.classList.add('on', won ? 'won' : 'lost');
        sfx(won ? 'dawn' : 'lose');
      },
      won ? 1100 : 900,
    );
  }

  function endPanel(r: BattleResult): HTMLElement {
    const lines = [
      h('div', { class: 'ep-line' }, pico('flame'), t('ui.flameLeft', { n: Math.ceil(r.flame), max: b.maxFlame })),
      h('div', { class: 'ep-line' }, pico('sword'), t('ui.foesStopped', { n: r.stats.kills })),
    ];
    if (r.early) lines.push(h('div', { class: 'ep-line' }, pico('clock'), t('ui.earlyDawn', { time: fmtTime(r.timeLeft) })));
    return h(
      'div',
      { class: 'end-panel panel' },
      h('div', { class: 'ep-title' }, r.won ? t('ui.dawnBreaks') : t('ui.lanternOut')),
      h('div', { class: 'ep-sub' }, r.won ? t('ui.dawnSub') : t('ui.outSub')),
      h('div', { class: 'rule' }),
      ...lines,
      h('button', { class: 'btn big', onclick: () => o.onEnd(r) }, t('ui.continue')),
    );
  }

  // ——— the hand ———
  function syncHand(): void {
    for (let i = 0; i < slots.length; i++) {
      const s = slots[i];
      const c = b.hand[i];
      if ((c?.uid ?? -1) === s.uid) continue;
      if (s.card) {
        const old = s.card;
        old.classList.add('gone');
        setTimeout(() => old.remove(), 220);
        s.card = null;
        s.cost = null;
      }
      s.uid = c?.uid ?? -1;
      if (c) {
        const cv = cardView(c, { cost: b.cardCost(c) });
        cv.classList.add('dealt');
        s.card = cv;
        s.cost = cv.querySelector('.c-cost');
        s.el.append(cv);
        const slot = i;
        cv.addEventListener('pointerdown', (e) => cardDown(slot, e));
        cv.addEventListener('contextmenu', (e) => e.preventDefault());
        cv.addEventListener('dragstart', (e) => e.preventDefault());
      }
    }
  }

  function updateHud(): void {
    const p = b.progress;
    dawnFill.style.width = `${(p * 100).toFixed(1)}%`;
    sun.style.left = `${(p * 100).toFixed(1)}%`;
    setText(timeLeft, fmtTime(b.stage.duration - b.time));
    el.style.setProperty('--dawn', p.toFixed(3));

    const pips = flamePips.children;
    if (pips.length !== b.maxFlame) {
      flamePips.replaceChildren(
        ...Array.from({ length: b.maxFlame }, () => h('i', { class: 'pip', style: { '--img': `url("${artUrl('flame')}")` } })),
      );
    }
    const fl = Math.ceil(b.flame);
    for (let i = 0; i < flamePips.children.length; i++) toggle(flamePips.children[i], 'off', i >= fl);
    setText(flameNum, `${fl}`);
    toggle(flameBox, 'low', b.flame / b.maxFlame < CONFIG.lowFlame);

    if (oilCells.children.length !== b.maxOil) {
      oilCells.replaceChildren(...Array.from({ length: b.maxOil }, () => h('i', { class: 'cell' }, h('b'))));
    }
    const armedCard = armed >= 0 ? b.hand[armed] : null;
    const price = armedCard ? b.cardCost(armedCard) : 0;
    for (let i = 0; i < oilCells.children.length; i++) {
      const cell = oilCells.children[i] as HTMLElement;
      const fill = Math.max(0, Math.min(1, b.oil - i));
      (cell.firstChild as HTMLElement).style.height = `${(fill * 100).toFixed(0)}%`;
      toggle(cell, 'full', fill >= 1);
      toggle(cell, 'price', i < price);
    }
    setText(oilNum, `${Math.floor(b.oil)}`);

    const ready = b.abilityReady;
    toggle(abilityBtn, 'ready', ready);
    abilityRing.style.setProperty('--p', `${((1 - b.abilityCd / b.abilityMax) * 360).toFixed(0)}deg`);

    for (let i = 0; i < slots.length; i++) {
      const s = slots[i];
      const c = b.hand[i];
      if (c && s.card) {
        const dear = b.oil + 1e-6 < b.cardCost(c);
        toggle(s.card, 'unaffordable', dear);
        toggle(s.card, 'armed', armed === i);
        if (s.cost) setText(s.cost, String(b.cardCost(c)));
      }
      const wait = b.refill[i];
      const full = Math.max(0.15, CONFIG.hand.drawDelay);
      s.ring.style.setProperty('--p', `${c ? 0 : Math.max(0, Math.min(1, 1 - wait / full)) * 360}deg`);
    }
  }

  // ——— layout ———
  const layout = (): void => {
    const w = el.clientWidth;
    const hh = el.clientHeight;
    if (!w || !hh) return;
    const cw = Math.max(58, Math.min(Math.floor((w - 28) / b.handSize - 8), Math.floor((hh * 0.165) / 1.42), 96));
    handEl.style.setProperty('--cw', `${cw}px`);
    const fw = fieldWrap.clientWidth;
    const fh = fieldWrap.clientHeight;
    if (fw && fh) field.resize(fw, fh);
  };
  const ro = new ResizeObserver(layout);

  // dawn bar markers: where the elites and the boss walk in
  for (const s of b.stage.spawns) {
    const def = foeDef(s.foe);
    if (def.tier === 'elite' || def.tier === 'boss') {
      marks.append(h('i', { class: `mark ${def.tier}`, style: { left: `${((s.t / b.stage.duration) * 100).toFixed(1)}%` } }));
    }
  }

  return {
    el,
    enter() {
      overlay.append(startPanel());
      overlay.classList.add('on');
      closers.push(b.events.on(onEvent));
      ro.observe(el);
      ro.observe(fieldWrap);
      layout();
      addEventListener('keydown', keys);
      document.addEventListener('visibilitychange', visibility);
      syncHand();
      updateHud();
    },
    leave() {
      endDrag(false);
      field.destroy();
      for (const c of closers.splice(0)) c();
      ro.disconnect();
      removeEventListener('keydown', keys);
      document.removeEventListener('visibilitychange', visibility);
      clearTimeout(hintTimer);
      suspendAudio(false);
    },
    frame(dt) {
      const running = !isPaused() && !ended;
      if (running) {
        b.step(dt);
        // a new foe's lantern: a soft tick the first time it shows
        for (const inc of b.incoming()) {
          const key = `${inc.lane}:${inc.foe}:${Math.round(b.time + inc.in)}`;
          if (!seenIncoming.has(key)) {
            seenIncoming.add(key);
            if (inc.in > 1.5) sfx('warn');
          }
        }
      }
      syncHand();
      updateHud();
      field.frame(isPaused() ? 0 : dt);
    },
  };
}
