import { t } from '../../core/i18n';
import { endTemporaryMusic, playTemporaryMusic, setMusicHeaviness, setMusicTempo } from '../../audio/music';
import { sfx } from '../../audio/sfx';
import { CARDS } from '../../data/cards';
import { actDef } from '../../data/acts';
import { CONFIG, halfAtOf } from '../../data/config';
import type { Combat } from '../../game/combat';
import type { MoveDef } from '../../game/types';
import { currentNode, isFirstRun, type RunState, totalFloors } from '../../game/run';
import { meetEnemy } from '../../game/meta';
import { saveSettings, settings } from '../../game/settings';
import { type ModalHandle, openModal, type Screen } from '../app';
import { debugButton, openDebugMenu, openFightRecap, pressureInfo } from '../components/debugMenu';
import { type InfoOpts, openDeck, openInfo, openSettings } from '../components/modals';
import { creature } from '../art/creatures';
import { spriteBox } from '../art/riso';
import { icon } from '../art/icons';
import { coach } from '../components/coach';
import { bindMoveDetails, enemyTraits, moveEffect, moveIcon, movePattern } from '../components/moveText';
import { $, SLACK_MS, cssMs, cssNumber, h, onPress, onTapOrHold } from '../dom';
import { burst, haptic, shake } from '../fx/fx';
import { bindCrank } from './crank';
import { bindMop } from './mop';
import { realClockText } from '../screens/journey';
import { createCardLayer } from './cardLayer';
import { bindCombatFx } from './combatFx';
import { createBadgeWindow } from './badgeWindow';
import { createCheckoutWindow } from './checkoutWindow';
import { createTaskWindow } from './coffeeWindow';
import { createShellWindow } from './shellWindow';
import { createMatch3Window } from './match3Window';
import { createSushiSlip } from './sushiSlip';
import { createHud } from './hud';
import { watchSideways } from '../components/rotateBanner';
import { ABILITY_ICON, createCombatView, PASSIVE_ICON } from './view';

export { ABILITY_ICON } from './view';

export interface CombatCallbacks {
  onEnd: (c: Combat) => void;
  /** Abandon the whole run. */
  onQuit: () => void;
  /** Back to the title keeping the run (this fight restarts on Continue). */
  onMenu: () => void;
}

/** Fixed simulation step: the engine stays deterministic regardless of frame rate. */
const STEP = 1 / 60;
/** Largest enemy sprite (px), and how far its drawing may be zoomed in to fill the room. */
const ENEMY_MAX = 256;
const ENEMY_ZOOM = 1.6;
/** Pixels between the two rows of a two-row belt. */
const BELT_ROW_GAP = 10;
/** Tallest a belt card may be, as a share of the screen height, with one, two and three rows. */
const CARD_MAX_H = [0.118, 0.118, 0.092, 0.066];
/** Screen heights between which three rows grow from the short-screen share above to the two-row one: on a roomy phone a third row keeps the cards as big, on a short one the enemy would be crushed. */
const THREE_ROWS_FROM = 620;
const THREE_ROWS_TO = 844;

/** The tallest a belt card may be (px of the screen height `h`) with `rows` belt rows. */
const cardMaxH = (rows: number, h: number): number => {
  const share = CARD_MAX_H[Math.min(rows, CARD_MAX_H.length - 1)];
  if (rows < 3) return h * share;
  const k = Math.max(0, Math.min(1, (h - THREE_ROWS_FROM) / (THREE_ROWS_TO - THREE_ROWS_FROM)));
  return h * (share + (CARD_MAX_H[2] - share) * k);
};
/** Pixels after which the belt's track pattern repeats (the scroll wraps there). */
const TRACK_PERIOD = 26;
/** Most simulation steps run in one frame; past that the fight drops the lag instead of spiralling. */
const MAX_STEPS = 12;
/** A boss goes down in this many blasts, this far apart (ms). */
const BOSS_BLASTS = 7;
const BOSS_BLAST_GAP = 140;

/** The combat screen: wires the view, HUD, card layer and FX together and owns pause and the game loop. */
export function combatScreen(run: RunState, combat: Combat, cb: CombatCallbacks): Screen {
  const v = createCombatView(run, combat);
  const { el, r, state } = v;
  let pauseModal: ModalHandle | null = null;
  let beltOffset = 0;
  let lastDragged = 0;
  let lastTempo = 1;
  let lastHeavy = 0;
  let acc = 0;
  /** Seconds since the last heartbeat of an enemy about to fall. */
  let beat = 0;
  const timers: number[] = [];
  /** A timeout that leave() cancels. */
  const later = (fn: () => void, ms: number): void => void timers.push(window.setTimeout(fn, ms));

  // The fight runs only while no window at all is open (card detail, status info, pause menu…) and Start was pressed.
  const syncPause = (opening = false): void => {
    state.paused = opening || state.waiting || !!document.querySelector('.modal-back, .coach');
  };
  v.inspect = syncPause;
  const cards = createCardLayer(v);
  const hud = createHud(v, () => passiveInfo());
  const taskWindow = createTaskWindow(v);
  const shellWindow = createShellWindow(v);
  const badgeWindow = createBadgeWindow(v);
  const checkoutWindow = createCheckoutWindow(v);
  const sushiSlip = createSushiSlip(v);
  const match3Window = createMatch3Window(v);

  /** The time card on the belt: stamped IN as the fight starts (then it leaves), OUT when it's won (it stays). */
  const timeCard = (kind: 'in' | 'out', time: string, done?: () => void): void => {
    const card = h(
      'div',
      { class: `timecard ${kind}` },
      h('div', { class: 'tc-head' }, h('b', null, t('combat.timeCard')), h('span', null, t(`hero.${v.heroId}.name`))),
      h('div', { class: 'tc-lines' }),
      h('div', { class: 'tc-stamp' }, t(kind === 'in' ? 'combat.clockIn' : 'combat.clockOut', { time })),
    );
    card.addEventListener('animationend', (e) => {
      if (e.target !== card || kind !== 'in') return;
      card.remove();
      done?.();
    });
    r.belt.append(card);
    sfx('punchClock');
  };

  const finish = (result: 'win' | 'lose'): void => {
    if (state.ended) return;
    state.ended = true;
    r.belt.classList.add('halted');
    cards.cancelDrag();
    const boss = combat.enemy.def.tier === 'boss';
    if (result === 'win') {
      // Death throes (it shakes, bleeds and sinks), then the print comes apart ink by ink. A boss gets stamped first.
      r.enemyArt.classList.add('dead');
      v.mood.flash('cheer', Number.POSITIVE_INFINITY);
      r.eStatus.classList.add('gone');
      const p = v.enemyPoint();
      burst('blood', p.x, p.y, 36, 1.4);
      for (let i = 1; i <= (boss ? 5 : 3); i++) later(() => burst('blood', p.x + (i % 2 ? -30 : 30), p.y + i * 6, 14), i * 200);
      later(() => burst('gold', p.x, p.y + 20, 40, 1.5), boss ? 1100 : 700);
      shake('big');
      haptic('kill');
      sfx('enemyDown');
      if (boss) {
        // A chain of blasts over the sprite, a white flash on the last, and the stamp slams down after.
        for (let i = 0; i < BOSS_BLASTS; i++) {
          later(
            () => {
              burst(i % 2 ? 'fire' : 'gold', p.x + (Math.random() - 0.5) * 120, p.y + (Math.random() - 0.5) * 140, 24, 1.3, 90);
              shake(i % 3 ? 'small' : 'big');
              haptic(i % 3 ? 'hit' : 'heavy');
            },
            120 + i * BOSS_BLAST_GAP,
          );
        }
        later(
          () => {
            const flash = h('div', { class: 'boss-flash' });
            flash.addEventListener('animationend', () => flash.remove());
            el.append(flash);
            r.enemyArt.append(h('div', { class: 'boss-stamp' }, t('combat.bossDown')));
            sfx('blunt');
            sfx('bossVictory');
          },
          120 + BOSS_BLASTS * BOSS_BLAST_GAP,
        );
        sfx('bossBlast');
        r.enemyArt.classList.add('boss');
      } else v.shout(t('reward.cleared'));
      // Clocking out when the next floor starts (the end of the shift after a boss).
      timeCard('out', realClockText());
      if (!boss) sfx('victory');
    } else {
      // Fired: the hero goes down, and the payslip on the end screen says the rest.
      r.portrait.classList.add('down');
      v.mood.flash('hurt', Number.POSITIVE_INFINITY);
      sfx('defeat');
      haptic('defeat');
    }
    // A win waits for the enemy to finish dying (longer for a boss).
    later(
      () => (settings.debugMenus ? openFightRecap(combat, run, () => cb.onEnd(combat)) : cb.onEnd(combat)),
      result === 'lose' ? CONFIG.endMs.lose : boss ? CONFIG.endMs.boss : CONFIG.endMs.win,
    );
  };
  const unsubFx = bindCombatFx(v, cards, finish);
  // The belt has grown into the room the lower part left: the enemy's room changed, so it is measured again once the row is in.
  const unsubRow = combat.events.on((e) => {
    if (e.type === 'rowAdded' || e.type === 'rows') later(layout, cssMs('--dur-row-grow') + SLACK_MS);
    if (e.type === 'sleeveGrew' || e.type === 'sleeveShrank') fitSleeve();
  });
  const unsubscribe = (): void => {
    unsubFx();
    unsubRow();
  };

  // ------------------------------------------------------------------ layout
  /** The sleeve's slots shrink to share the room left of the ability button, if there are more of them than fit. */
  const fitSleeve = (): void => {
    const n = combat.sleeve.length;
    const gap = Number.parseFloat(getComputedStyle(r.sleeve).columnGap) || 0;
    r.sleeve.style.setProperty('--fit', `${Math.floor((r.sleeve.clientWidth - gap * (n - 1)) / n)}px`);
  };
  const startRows = combat.beltRows;
  const layout = (): void => {
    state.beltW = r.belt.clientWidth || el.clientWidth;
    // Cards follow the belt width, but shrink on short screens so the layout always fits (more with two rows).
    // A row that opens mid-fight in the room the sleeve left (`deepBelt`) doesn't resize the cards: the first two rows stay where they are.
    const rows = combat.enemy.def.deepBelt === undefined ? combat.beltRows : startRows;
    const cw = Math.round(Math.min(state.beltW * CONFIG.cardWidth, cardMaxH(rows, el.clientHeight)));
    state.cardW = cw;
    state.rowH = Math.round(cw * 1.4) + BELT_ROW_GAP;
    el.style.setProperty('--cw-belt', `${cw}px`);
    // One belt place in card widths (more than `CONFIG.spacing / CONFIG.cardWidth` when the cards shrank): a large card's body behind it is as long as the places it takes.
    if (cw) el.style.setProperty('--slot', String((state.beltW * CONFIG.spacing) / cw));
    el.style.setProperty('--belt-row-h', `${state.rowH}px`);
    fitSleeve();
    // What `.sunk` slides away (see combat-belt.css): the action row's height, and how long the slide takes.
    el.style.setProperty('--action-h', `${$('.action-row', el).offsetHeight}px`);
    el.style.setProperty('--sink-time', `${CONFIG.sinkTime}s`);
    el.style.setProperty('--fall-grace', `${CONFIG.fallGrace}s`);
    // Measure the enemy's room once (with the belt size applied) and lock the sprite size. The wrapper is flex: 1 with
    // min-height 0, so its box is the free room, independent of the sprite; the enemy stands lower, on its pixel shadow.
    requestAnimationFrame(() => {
      const wrap = r.enemyWrap.getBoundingClientRect();
      const shade = $('.shade', el).getBoundingClientRect();
      const ground = shade.top + shade.height / 2;
      const size = Math.max(72, Math.min(ENEMY_MAX, ground - wrap.top));
      // The room grew (a boss's belt lost a row): the enemy grows into it, from the size it had.
      const before = Number.parseFloat(el.style.getPropertyValue('--enemy-size'));
      if (before && size > before * 1.08 && !state.waiting) {
        r.enemyArt.style.setProperty('--grow-from', String(before / size));
        v.retrigger(r.enemyArt, 'grows');
      }
      // The drawing, not its square, fills the room: zoomed in (a little at most), centred, its feet on the ground.
      const [x0, y0, x1, y1] = spriteBox(combat.enemy.def.art);
      const k = Math.min(ENEMY_ZOOM, 1 / (y1 - y0), wrap.width / size / (x1 - x0));
      el.style.setProperty('--enemy-size', `${size}px`);
      el.style.setProperty('--enemy-drop', `${ground - wrap.bottom}px`);
      r.enemyArt.style.setProperty('--k', String(k));
      r.enemyArt.style.setProperty('--cx', String((x0 + x1) / 2));
      r.enemyArt.style.setProperty('--by', String(y1));
    });
  };

  v.relayout = layout;

  // ------------------------------------------------------------------ inspectables (hold to learn)
  const info = (opts: InfoOpts): ModalHandle => {
    sfx('tap');
    v.inspect(true);
    return openInfo(opts, () => v.inspect(false));
  };
  const abilityInfo = (): void =>
    void info({
      icon: ABILITY_ICON[v.heroId],
      title: t(`hero.${v.heroId}.ability`),
      tag: t('hero.tag.active'),
      tagCls: 'active',
      desc: t(`hero.${v.heroId}.abilityShort`),
      extra: [t('hero.abilityCost', { n: combat.abilityCost() }), t(combat.abilitySpent ? 'hero.abilitySpent' : 'hero.abilityOnce')],
    });
  const passiveInfo = (): void =>
    void info({
      icon: PASSIVE_ICON[v.heroId],
      title: t(`hero.${v.heroId}.passiveName`),
      tag: t('hero.tag.passive'),
      desc: t(`hero.${v.heroId}.passiveShort`),
    });
  // Live values: floor scaling, enemy Strength, Weak and Vulnerable, exactly as the threat bar shows them.
  const live = {
    dmg: (m: MoveDef) => combat.intentDamage(m),
    block: (m: MoveDef) => Math.round((m.block ?? 0) * combat.enemy.dmgScale),
    heal: (m: MoveDef) => Math.round((m.heal ?? 0) * combat.enemy.dmgScale),
  };
  /** The move being charged, then the enemy's whole pattern (the next special marked). */
  const moveInfo = (): void => {
    const e = combat.enemy;
    const special = combat.nextSpecial();
    const upcoming = special && e.move === combat.foe.main ? special : null;
    const sheet = info({
      icon: moveIcon(e.move),
      title: t(`move.${e.move.id}`),
      tag: t(`enemy.${e.def.id}.name`),
      tagCls: 'bad',
      desc: moveEffect(e.move, true, live) || t(`intent.${e.move.intent}`),
      extra: [movePattern(e.def, live, { now: e.move, next: upcoming })],
      ink: 'bad',
    });
    bindMoveDetails(sheet.el);
  };
  const payInfo = (): void => void info({ icon: 'coin', title: t('combat.payInfo.t'), desc: t('combat.payInfo.d') });
  const manaInfo = (): void => void info({ icon: 'crystal', title: t('common.mana'), desc: t('howto.mana.d') });
  /** Every card in this fight that isn't gone for good: draw pile, belt, sleeve and discard pile (curses included). */
  const deckInfo = (): void => {
    sfx('tap');
    v.inspect(true);
    const inPlay = [...combat.draw, ...combat.belt.map((b) => b.card), ...combat.sleeve.filter((c) => c !== null), ...combat.discard];
    openDeck(inPlay, { title: t('combat.deck'), onClose: () => v.inspect(false) });
  };

  onTapOrHold(
    r.ability,
    () => {
      if (state.waiting) return abilityInfo();
      if (state.paused || state.ended) return;
      if (!combat.useAbility()) {
        sfx('error');
        v.toast(combat.abilitySpent ? t('hero.abilitySpent') : t('hero.abilityCost', { n: combat.abilityCost() }));
      }
    },
    abilityInfo,
  );
  onPress(r.portrait, deckInfo);
  onPress(r.intent, moveInfo);
  onPress(r.intentNext, moveInfo);
  // Holding the enemy itself or its HP bar opens the same window as its move bar (a tap does nothing: they sit by the belt).
  onTapOrHold(r.enemyArt, () => {}, moveInfo);
  onTapOrHold(r.eHp, () => {}, moveInfo);
  // The weak spot answers on touch-down, not on release: it only stays up for a couple of seconds.
  r.weakSpot.addEventListener('click', (ev) => ev.stopPropagation());
  bindMop(v);
  bindCrank(v);
  r.weakSpot.addEventListener('pointerdown', (ev) => {
    // The spot sits on the enemy's art: a touch on it must not start the art's hold-to-inspect.
    ev.stopPropagation();
    if (state.paused || state.waiting || state.ended || !combat.hitWeakSpot()) return;
    haptic('hit');
  });
  // The update window's buttons: a full tap (a finger already down on a card doesn't answer it), and only once the window can be answered.
  const answerUpdate = (answer: () => boolean): void => {
    if (state.paused || state.waiting || state.ended || !answer()) return;
    sfx('button');
    haptic('tap');
  };
  r.popupUpdate.addEventListener('click', () => answerUpdate(() => combat.startUpdate()));
  r.popupPostpone.addEventListener('click', () => answerUpdate(() => combat.postponeUpdate()));
  // Big Sis's mana button: every touch gives mana at once (it doesn't wait for a full tap, so quick fingers keep up); it never starts the bar's hold-to-inspect.
  r.manaTap.addEventListener('pointerdown', (ev) => {
    ev.stopPropagation();
    if (state.paused || state.waiting || state.ended) return;
    combat.tapMana();
    haptic('tap');
  });
  // The Supervisor's button: opens the Backlog over the belt and closes it again (the fight runs on either way).
  r.minigame?.addEventListener('click', () => {
    if (state.paused || state.waiting || state.ended) return;
    cards.cancelDrag();
    if (combat.openMinigame(!combat.minigameOpen)) {
      sfx('button');
      haptic('tap');
    }
  });
  // The mana bar explains itself only on a hold (it's right under the thumb while playing).
  onTapOrHold(r.manaRow, () => {}, manaInfo);
  // So does the pay on offer in the top bar.
  onTapOrHold(r.payChip, () => {}, payInfo);

  const openPause = (): void => {
    if (pauseModal || state.ended) return;
    cards.cancelDrag();
    state.paused = true;
    sfx('button');
    haptic('tap');
    playTemporaryMusic('pause');
    pauseModal = openModal({
      title: t('combat.paused'),
      body: h('p', { class: 'kbd-hint' }, t('combat.keys')),
      actions: [
        { label: t('combat.resume'), icon: 'play' },
        {
          label: t('menu.settings'),
          icon: 'gear',
          cls: 'secondary',
          onClick: () => {
            openSettings();
            return false;
          },
        },
        {
          label: t('combat.toMenu'),
          icon: 'home',
          cls: 'secondary',
          onClick: () => {
            openModal({
              body: t('combat.toMenuConfirm'),
              actions: [
                { label: t('common.confirm'), onClick: () => cb.onMenu() },
                { label: t('common.cancel'), cls: 'secondary' },
              ],
            });
            return false;
          },
        },
        {
          label: t('combat.quit'),
          icon: 'door',
          cls: 'danger',
          onClick: () => {
            openModal({
              body: t('journey.abandonConfirm'),
              actions: [
                { label: t('common.holdConfirm'), cls: 'danger', hold: true, onClick: () => cb.onQuit() },
                { label: t('common.cancel'), cls: 'secondary' },
              ],
            });
            return false;
          },
        },
      ],
      onClose: () => {
        pauseModal = null;
        syncPause();
        endTemporaryMusic();
      },
    });
  };
  r.pause.addEventListener('click', openPause);

  // Keyboard (desktop): Space/P/Esc pause, A ability, D deck, 1… play the sleeve slot. Open windows keep the keys to themselves,
  // except Space/P, which also resume from the pause menu.
  const onKey = (e: KeyboardEvent): void => {
    if (e.repeat || e.ctrlKey || e.metaKey || e.altKey || state.ended) return;
    const key = e.key.toLowerCase();
    const pauseKey = key === ' ' || key === 'p';
    if (pauseModal) {
      if (!pauseKey) return;
      pauseModal.close();
    } else if (document.querySelector('.modal-back, .coach')) return;
    else if (state.waiting) {
      if (key !== ' ' && key !== 'enter') return;
      // The button is gone once pressed (the time card is stamping) and hidden until the first fight's tour reaches it.
      const start = el.querySelector<HTMLButtonElement>('.js-start');
      if (start && !start.closest('[hidden]')) start.click();
    } else if (pauseKey || key === 'escape') openPause();
    else if (key === 'a') r.ability.click();
    else if (key === 'd') deckInfo();
    else if (/^[1-9]$/.test(key)) {
      const card = combat.sleeve[Number(key) - 1];
      if (card && !state.paused) combat.playCard(card.uid);
    } else return;
    e.preventDefault();
    // A button left focused by a click would take the Space as its own press.
    (document.activeElement as HTMLElement | null)?.blur();
  };
  document.addEventListener('keydown', onKey);

  /** Temporary debug tool: cheats for the fight. The fight waits while the window is open. */
  const openDebug = (): void => {
    if (state.ended) return;
    cards.cancelDrag();
    v.inspect(true);
    const kill = (amount: number): void => void combat.damage('hero', 'enemy', amount, { raw: true, ignoreBlock: true }, 'hero');
    openDebugMenu(
      t('debug.fightMenu'),
      [
        {
          label: t('debug.kill'),
          icon: 'skull',
          // Some enemies get up again (Golden Parachute): hit until it stays down.
          run: () => {
            for (let i = 0; i < 3 && !combat.result; i++) kill(combat.enemy.hp + combat.enemy.block);
          },
        },
        { label: t('debug.half'), icon: 'crack', run: () => kill(combat.enemy.hp - Math.floor(combat.enemy.maxHp * halfAtOf(combat.enemy.def))) },
        { label: t('debug.stun'), icon: 'stars', run: () => combat.applyStatus('enemy', 'stun', 1, 10) },
        { label: t('debug.skipMove'), icon: 'swap', run: () => combat.skipEnemyMove() },
        { label: t('debug.shield'), icon: 'shield', run: () => combat.gainBlock('hero', 50) },
        { label: t('debug.heal'), icon: 'heart', run: () => void combat.heal('hero', combat.hero.maxHp) },
        { label: t('debug.mana'), icon: 'crystal', run: () => combat.gainMana(combat.hero.maxMana) },
        { label: t('debug.crystals'), icon: 'crystalSlot', run: () => combat.addManaCrystals(2) },
        { label: t('debug.lose'), icon: 'ko', run: () => combat.loseHp(combat.hero.hp) },
      ],
      { onClose: () => v.inspect(false), onPace: () => combat.setDebugPace(settings.debugRegen, settings.debugBelt), info: pressureInfo(run) },
    );
  };
  el.append(debugButton(t('debug.menu'), openDebug));

  /** A normal enemy walks in as the door opens onto the room: its shadow grows on the floor first, then it drops in and lands (a boss has its own entrance). */
  const enterScene = (): void => {
    r.stage.classList.replace('unseen', 'entering');
    // Class off when done, or it would outrank the idle bob and the death throes later.
    r.enemyArt.addEventListener(
      'animationend',
      (e) => {
        if (e.target === r.enemyArt) r.stage.classList.remove('entering');
      },
      { once: true },
    );
    later(() => {
      shake('small');
      sfx('blunt');
    }, cssMs('--dur-enter') * cssNumber('--enter-land'));
  };

  /**
   * A boss walks in with the office lights out: the room is black, the tubes flicker (the boss is only a shape against them), then they come on for
   * good and it stands there, its landing shaking the room. A tap skips it.
   */
  const bossIntro = (): void => {
    const dark = h('div', { class: 'boss-intro', 'aria-hidden': 'true' });
    const lightsOn = (): void => {
      const p = v.enemyPoint();
      burst('ash', p.x, p.y + 60, 26, 1.1);
      sfx('bossBlast');
      shake('big');
      haptic('alarm');
    };
    const skip = (): void => {
      dark.remove();
      r.enemyArt.classList.remove('boss-enter');
    };
    dark.addEventListener('animationend', (e) => {
      if (e.target === dark) dark.remove();
    });
    dark.addEventListener('click', skip);
    el.append(dark);
    r.enemyArt.classList.add('boss-enter');
    r.stage.classList.remove('unseen');
    // Class off when done, or it would outrank the death throes later.
    r.enemyArt.addEventListener(
      'animationend',
      (e) => {
        if (e.target === r.enemyArt) r.enemyArt.classList.remove('boss-enter');
      },
      { once: true },
    );
    later(() => dark.isConnected && lightsOn(), cssMs('--dur-boss-intro') * cssNumber('--boss-lights'));
    sfx('machinery');
  };

  /** The first run, after a few fights that never used the sleeve: once, an overlay points at it. */
  const sleeveHint = (): void => {
    if (!isFirstRun(run) || run.sleeveIdle < CONFIG.sleeveHintAfter || settings.seenTips.includes('sleeve')) return;
    settings.seenTips.push('sleeve');
    saveSettings();
    coach(el, [{ target: [r.sleeve], text: t('coach.sleeveHint') }], () => syncPause());
    syncPause();
  };

  /** The very first fight: before Start, a tour of the board, one part at a time. */
  const firstFightTour = (): void => {
    const startWrap = $('.start-wrap', el);
    coach(
      el,
      [
        { target: [r.enemyWrap, r.eHp, r.intent], text: t('coach.enemy') },
        { target: $('.hero-row', el), text: t('coach.hero') },
        { target: r.belt, text: t('coach.belt') },
        { target: [r.manaRow, r.sleeve, r.ability], text: t('coach.sleeve') },
        { target: $('.js-start', el), text: t('coach.start'), before: () => (startWrap.hidden = false) },
      ],
      () => {
        settings.seenTutorial = true;
        saveSettings();
      },
    );
  };

  /** A card with a tip, ridden far enough onto the belt to be seen: the first time ever, the fight stops to explain it. */
  const checkTip = (): void => {
    const b = combat.belt.find((x) => CARDS[x.card.id].tip && x.pos >= CONFIG.tipPos && !settings.seenTips.includes(x.card.id));
    const target = b && cards.elementOf(b.card.uid);
    if (!b || !target) return;
    settings.seenTips.push(b.card.id);
    saveSettings();
    cards.cancelDrag();
    coach(el, [{ target, text: t(`card.${b.card.id}.tip`) }], () => syncPause());
    syncPause();
  };

  const onVisibility = (): void => {
    if (document.hidden) openPause();
  };
  // A phone turned sideways covers the game with a banner: the fight waits behind it.
  let stopSideways = (): void => {};
  const onSideways = (sideways: boolean): void => {
    if (sideways) openPause();
  };
  const onResize = (): void => layout();

  // ------------------------------------------------------------------ loop
  const render = (dt: number): void => {
    state.frameNo++;
    // The music follows the belt a little: faster while it rushes, slower while it drags.
    const tempo = Math.max(CONFIG.beltSlow, 1 + (combat.beltBoost() - 1) * CONFIG.musicFollowsBelt);
    if (tempo !== lastTempo) {
      lastTempo = tempo;
      setMusicTempo(tempo);
    }
    // The lower the hero's HP, the heavier the music (it lightens again once the fight is over).
    const [calm, grim] = CONFIG.heavyMusic;
    const heavy = state.ended ? 0 : Math.max(0, Math.min(1, (calm - combat.hero.hp / combat.hero.maxHp) / (calm - grim)));
    if (heavy !== lastHeavy) {
      lastHeavy = heavy;
      setMusicHeaviness(heavy);
    }
    v.mood.frame(dt);
    hud.render();
    taskWindow.render();
    shellWindow.render();
    badgeWindow.render();
    checkoutWindow.render();
    sushiSlip.render();
    match3Window.render();
    cards.render();
    const draggedSeen = lastDragged;
    lastDragged = combat.beltCranked;
    if (!state.paused && !state.ended && state.stop <= 0 && combat.intro <= 0) {
      beltOffset -= (dt * settings.speed * combat.beltRate() * state.beltW) / CONFIG.beltTime;
      beltOffset -= (combat.beltCranked - draggedSeen) * state.beltW;
      r.track.style.setProperty('--belt-x', `${Math.round(beltOffset % TRACK_PERIOD)}px`);
    }
  };

  return {
    el,
    enter() {
      layout();
      // The way in: seen from the corridor, one office door with a brass plate and the enemy framed under it; three knocks, the latch,
      // the leaf swings open on its hinge onto the lit room, and we walk through into the fight.
      const node = currentNode(run);
      const door = h(
        'div',
        { class: 'office-door', 'aria-hidden': 'true' },
        h('div', { class: 'door-wainscot' }),
        h('div', { class: 'door-floor' }),
        h(
          'div',
          { class: 'door-way' },
          h(
            'div',
            { class: 'door-aperture' },
            h('div', { class: 'door-room' }),
            h(
              'div',
              { class: 'door-leaf' },
              h(
                'div',
                { class: 'door-plate' },
                h('b', null, t(`enemy.${combat.enemy.def.id}.name`)),
                h('span', null, t('common.floorOf', { a: node.act, n: node.floor, total: totalFloors(run) })),
              ),
              h(
                'div',
                { class: 'door-pic' },
                h('div', { class: 'door-frame' }, h('div', { class: 'door-art', html: creature(combat.enemy.def.art) })),
              ),
              h('div', { class: 'door-kick' }),
              h('i', { class: 'door-hinge a' }),
              h('i', { class: 'door-hinge b' }),
              h('i', { class: 'door-hinge c' }),
              h('i', { class: 'door-knob' }),
              h('i', { class: 'door-bar' }),
            ),
          ),
          h('i', { class: 'door-lamp' }),
        ),
        h('div', { class: 'door-mat' }),
      );
      /** The door is over (it walked away, or a tap skipped it): the boss's card or the first fight's tour comes next. */
      const doorDone = (): void => {
        if (!door.isConnected) return;
        door.remove();
        if (combat.enemy.def.tier === 'boss') bossIntro();
        else {
          // A normal enemy walks in as soon as the door is behind us; the tour (or the sleeve hint) waits until it has landed.
          enterScene();
          later(settings.seenTutorial ? sleeveHint : firstFightTour, cssMs('--dur-enter'));
        }
      };
      door.addEventListener('animationend', (e) => {
        if (e.target === door) doorDone();
      });
      door.addEventListener('click', doorDone);
      // The enemy stays out of sight while the door opens: a normal one walks in (`doorDone`), a boss shows up only inside the blackout (`bossIntro`).
      r.stage.classList.add('unseen');
      el.append(door);
      // The sound is the knocking: it waits while the name is read.
      later(() => door.isConnected && sfx(actDef(combat.enemy.def.act).door), cssMs('--dur-door-read'));
      addEventListener('resize', onResize);
      document.addEventListener('visibilitychange', onVisibility);
      stopSideways = watchSideways(onSideways);
      render(0);
      meetEnemy(combat.enemy.def.id);
      if (combat.enemy.def.tier === 'boss') sfx('siren');
      // The fight waits for Start: meanwhile the player can hold anything to read what it does.
      const startWrap = h(
        'div',
        { class: 'start-wrap' },
        // The hint about holding things is for the very first fight (where the tour has just said it): after that it is gone.
        h('button', {
          class: 'btn cta start-btn js-start',
          html: `${t('combat.start')}${settings.seenTutorial ? '' : `<small>${t('combat.startHint')}</small>`}`,
        }),
      );
      // In the very first fight Clock in stays hidden until the tour's last step (`firstFightTour`): pressed earlier, it would pull the tour's targets away.
      startWrap.hidden = !settings.seenTutorial && combat.enemy.def.tier !== 'boss';
      // Before the fight, the enemy's passives are spelled out under the button, on a slip headed with the enemy's face, so the player knows what they're facing.
      const traits = enemyTraits(combat.enemy.def, true);
      if (traits.length)
        startWrap.append(
          h(
            'div',
            { class: 'foe-traits' },
            h('div', { class: 'trait-head', html: `<span class="trait-face">${creature(combat.enemy.def.art)}</span>${t('combat.foePassive')}` }),
            ...traits.map((x) => h('div', { class: 'trait', html: `${icon(x.icon)}<p>${x.name ? `<b>${x.name}</b>` : ''}${x.desc}</p>` })),
          ),
        );
      startWrap.querySelector('button')!.addEventListener('click', () => {
        startWrap.remove();
        sfx('button');
        haptic('tap');
        // The clock-in is stamped first; once it is away the fight runs.
        timeCard('in', realClockText(), () => {
          state.waiting = false;
          syncPause();
          v.shout(t('combat.fight'));
        });
      });
      // Centred on the belt: the enemy, the threat bar and the hero stay readable.
      r.belt.append(startWrap);
    },
    leave() {
      setMusicTempo(1);
      setMusicHeaviness(0);
      for (const id of timers) clearTimeout(id);
      unsubscribe();
      removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', onVisibility);
      stopSideways();
      document.removeEventListener('keydown', onKey);
    },
    frame(dt) {
      if (state.stop > 0) state.stop -= dt;
      else if (!state.paused && !state.ended) {
        acc += dt * settings.speed;
        let steps = 0;
        while (acc >= STEP && steps < MAX_STEPS) {
          combat.tick(STEP);
          acc -= STEP;
          steps++;
        }
        if (steps === MAX_STEPS) acc = 0;
        checkTip();
        // The enemy hangs on by a thread: a heartbeat until it falls.
        const e = combat.enemy;
        if (e.hp > 0 && e.hp < CONFIG.enemyLowHp && !combat.isOver && combat.intro <= 0) {
          beat += dt * settings.speed;
          if (beat >= CONFIG.heartbeatGap) {
            beat = 0;
            sfx('heartbeat');
          }
        } else beat = CONFIG.heartbeatGap;
      }
      render(dt);
    },
  };
}
