import { t } from '../../core/i18n';
import type { Combat } from '../../game/combat';
import { fightSignals, learn, pressureScale } from '../../game/pressure';
import { isFirstRun, pressureLearns, type RunState } from '../../game/run';
import { sfx } from '../../audio/sfx';
import { CARD_LIST, CARDS } from '../../data/cards';
import { CONFIG } from '../../data/config';
import { DEBUG_ENEMY, ENEMY_LIST } from '../../data/enemies';
import { HERO_LIST } from '../../data/heroes';
import { RELIC_LIST } from '../../data/relics';
import { heroHidden, unlockAll } from '../../game/meta';
import { saveSettings, settings } from '../../game/settings';
import type { HeroId } from '../../game/types';
import { openModal, type ModalHandle } from '../app';
import { keywordText } from './cardView';
import type { CardDef } from '../../game/types';
import { openCardDetail, openResetConfirm } from './modals';
import { h, onTapOrHold } from '../dom';
import { foeView } from './moveText';
import { creature } from '../art/creatures';
import { haptic } from '../fx/fx';
import { icon } from '../art/icons';

/** Puts the card-art switch on the page (`card-art` on the root: the cards' own paintings take the icons' place). */
export function applyCardArt(): void {
  document.documentElement.classList.toggle('card-art', settings.cardArt);
}

/** Temporary debug tool: the card-art switch, at runtime (every card on screen changes at once). */
function cardArtSwitch(cls: string): HTMLButtonElement {
  const btn = h(
    'button',
    {
      class: cls,
      'aria-pressed': String(settings.cardArt),
      onclick: () => {
        settings.cardArt = !settings.cardArt;
        saveSettings();
        applyCardArt();
        btn.setAttribute('aria-pressed', String(settings.cardArt));
        sfx('tap');
      },
    },
    t('debug.cardArt'),
  );
  return btn;
}

/** Temporary debug tool: sliders for the mana regen and the belt's speed, saved for the next fights; `onChange` lets a running fight take them at once. */
function paceSliders(onChange?: () => void): HTMLElement {
  const { regen, belt } = CONFIG.debugPace;
  const rows = [
    {
      key: 'debugRegen',
      label: t('debug.regen'),
      range: regen,
      start: regen.start,
      text: (v: number) => (v ? t('debug.paceSeconds', { n: v.toFixed(2) }) : t('debug.paceAuto')),
    },
    { key: 'debugBelt', label: t('debug.belt'), range: belt, start: 1, text: (v: number) => `${Math.round(v * 100)}%` },
  ] as const;
  const sync: (() => void)[] = [];
  const els = rows.map((row) => {
    const input = h('input', {
      class: 'slider',
      type: 'range',
      min: row.range.min,
      max: row.range.max,
      step: row.range.step,
      'aria-label': row.label,
    });
    const num = h('b', { class: 'slider-val' });
    const show = (): void => {
      input.value = String(settings[row.key] || row.start);
      num.textContent = row.text(settings[row.key]);
    };
    sync.push(show);
    show();
    input.addEventListener('input', () => {
      settings[row.key] = Number(input.value);
      num.textContent = row.text(settings[row.key]);
      onChange?.();
    });
    input.addEventListener('change', saveSettings);
    return h('div', { class: 'debug-pace-row' }, h('span', null, row.label), h('div', { class: 'slider-wrap' }, input, num));
  });
  const reset = h(
    'button',
    {
      class: 'btn small secondary',
      onclick: () => {
        settings.debugRegen = 0;
        settings.debugBelt = 1;
        saveSettings();
        for (const show of sync) show();
        onChange?.();
        sfx('tap');
      },
    },
    t('debug.paceReset'),
  );
  return h('div', { class: 'debug-pace' }, ...els, reset);
}

/** Temporary debug tool: the small floating bug button that opens a debug menu (placed per screen by `.debug-fab`). */
export function debugButton(label: string, onClick: () => void): HTMLButtonElement {
  return h('button', {
    class: 'icon-btn debug-fab',
    'aria-label': label,
    hidden: !settings.debugMenus,
    html: icon('bug'),
    onclick: () => {
      sfx('tap');
      onClick();
    },
  });
}

const signed = (x: number): string => `${x >= 0 ? '+' : ''}${x.toFixed(2)}`;

/** Temporary debug tool: what the adaptive difficulty has learned so far (the levels of `run.pressure` and the multipliers they give the next enemies). */
export function pressureInfo(run: RunState): HTMLElement {
  const scale = pressureScale(run.pressure, run.mods.length > 0);
  const state = isFirstRun(run)
    ? t('debug.pressure.off')
    : pressureLearns(run)
      ? t('debug.pressure.on')
      : t('debug.pressure.warmup', { n: CONFIG.pressure.warmup - run.stats.kills });
  const rows: [string, string][] = [
    [t('debug.pressure.state'), state],
    [t('debug.pressure.hp'), t('debug.pressure.value', { level: signed(run.pressure.hp), mult: scale.hp.toFixed(2) })],
    [t('debug.pressure.dmg'), t('debug.pressure.value', { level: signed(run.pressure.dmg), mult: scale.dmg.toFixed(2) })],
  ];
  return h('dl', { class: 'debug-info' }, ...rows.flatMap(([k, v]) => [h('dt', null, k), h('dd', null, v)]));
}

/** Temporary debug tool: a window of cheat buttons; a tap closes the window, then does it. `info` sits above the buttons. */
export function openDebugMenu(
  title: string,
  items: { label: string; icon: string; run: () => void }[],
  { onClose, onPace, info }: { onClose?: () => void; onPace?: () => void; info?: HTMLElement } = {},
): ModalHandle {
  const handle = openModal({
    title,
    body: h(
      'div',
      { class: 'debug-menu' },
      ...(info ? [info] : []),
      ...items.map((it) =>
        h(
          'button',
          {
            class: 'btn small secondary',
            html: icon(it.icon),
            onclick: () => {
              sfx('button');
              handle.close();
              it.run();
            },
          },
          h('span', null, it.label),
        ),
      ),
      cardArtSwitch('btn small secondary debug-switch'),
      paceSliders(onPace),
    ),
    actions: [{ label: t('common.close'), cls: 'secondary' }],
    onClose,
  });
  return handle;
}

/** The names of a card's keywords (base and upgraded), so the search finds them even when the text only shows their icon. */
function cardKeywords(c: CardDef): string {
  return [...new Set([...(c.keywords ?? []), ...(c.upKeywords ?? [])])].map((k) => t(`kw.${k}`)).join(' ');
}

/** Temporary debug tool: fight any enemy with any hero (a fresh run on floor 1), with extra cards added to the deck to try them. */
export function openDebugFight(onPick: (hero: HeroId, enemy: string, cards: string[], bigHp: boolean) => void): ModalHandle {
  let hero: HeroId = HERO_LIST[0].id;
  const extra: string[] = [];
  let bigHp = false;
  // The heroes across the whole width, each with its portrait.
  const heroSeg = h('div', { class: 'seg debug-heroes', role: 'group', 'aria-label': t('debug.hero') });
  const hpBtn = h(
    'button',
    {
      class: 'btn small secondary',
      'aria-pressed': 'false',
      onclick: () => {
        bigHp = !bigHp;
        hpBtn.setAttribute('aria-pressed', String(bigHp));
        sfx('tap');
      },
    },
    t('debug.bigHp', { n: CONFIG.debugHp }),
  );
  // One copy of every card the hero can play (its class and the neutral ones, no curses).
  const allBtn = h(
    'button',
    {
      class: 'btn small secondary',
      onclick: () => {
        extra.push(...CARD_LIST.filter((c) => c.type !== 'curse' && (c.cls === hero || c.cls === 'neutral')).map((c) => c.id));
        sfx('tap');
        renderCards();
      },
    },
    t('debug.allCards'),
  );
  const options = h('div', { class: 'debug-options' }, hpBtn, allBtn, cardArtSwitch('btn small secondary'));
  const renderHeroes = (): void => {
    heroSeg.replaceChildren(
      ...HERO_LIST.filter((hd) => !heroHidden(hd.id)).map((hd) =>
        h('button', {
          'aria-pressed': String(hd.id === hero),
          onclick: () => {
            hero = hd.id;
            sfx('tap');
            renderHeroes();
            renderCards();
          },
          html: `${creature(hd.id)}<span>${t(`compendium.tab.${hd.id}`)}</span>`,
        }),
      ),
    );
  };
  // Every card, filtered as you type by name, rules text or keyword; a tap adds a copy (the count says how many), a hold shows the card.
  const search = h('input', { class: 'debug-search', type: 'search', placeholder: t('debug.cards'), 'aria-label': t('debug.cards') });
  const cardList = h('div', { class: 'debug-cards' });
  const tabs = h('div', { class: 'debug-tabs', role: 'tablist' });
  const cardsPane = h('div', { class: 'debug-pane' }, search, cardList);
  const foeSearch = h('input', { class: 'debug-search', type: 'search', placeholder: t('debug.foes'), 'aria-label': t('debug.foes') });
  const foesPane = h('div', { class: 'debug-pane' }, foeSearch);
  let tab: 'foes' | 'cards' = 'cards';
  const renderTabs = (): void => {
    const tabBtn = (id: 'foes' | 'cards', label: string): HTMLButtonElement =>
      h(
        'button',
        {
          role: 'tab',
          'aria-selected': String(tab === id),
          onclick: () => {
            tab = id;
            sfx('tap');
            renderTabs();
          },
        },
        label,
      );
    tabs.replaceChildren(tabBtn('cards', t('debug.tab.cards', { n: extra.length })), tabBtn('foes', t('debug.tab.foes')));
    foesPane.hidden = tab !== 'foes';
    cardsPane.hidden = tab !== 'cards';
  };
  const renderCards = (): void => {
    renderTabs();
    const q = search.value.trim().toLowerCase();
    cardList.replaceChildren(
      ...Object.values(CARDS)
        .filter((c) => `${t(`card.${c.id}.name`)} ${keywordText(t(`card.${c.id}.desc`))} ${cardKeywords(c)}`.toLowerCase().includes(q))
        .map((c) => {
          const n = extra.filter((id) => id === c.id).length;
          const btn = h('button', {
            class: 'debug-card',
            html: `<span>${t(`card.${c.id}.name`)}</span>${n ? `<b>×${n}</b>` : ''}`,
          });
          onTapOrHold(
            btn,
            () => {
              extra.push(c.id);
              sfx('tap');
              renderCards();
            },
            () => openCardDetail({ uid: -1, id: c.id, up: false }),
          );
          return btn;
        }),
    );
  };
  search.addEventListener('input', renderCards);
  renderHeroes();
  let handle: ModalHandle | null = null;
  const list = h('div', { class: 'debug-foes' });
  // A tap starts the fight, a hold shows the enemy's sheet.
  const foeButtons = [DEBUG_ENEMY, ...ENEMY_LIST].map((e) => {
    const btn = h('button', {
      class: 'debug-foe',
      'data-enemy': e.id,
      html: `${creature(e.art)}<span>${t(`enemy.${e.id}.name`)}</span><small>${t('journey.title', { n: e.act })}${e.tier !== 'normal' ? ` · ${t(`journey.node.${e.tier}`)}` : ''}</small>`,
    });
    onTapOrHold(
      btn,
      () => {
        sfx('button');
        haptic('tap');
        handle?.close();
        onPick(hero, e.id, extra, bigHp);
      },
      () => openModal({ title: t(`enemy.${e.id}.name`), body: foeView(e, true), actions: [{ label: t('common.close'), cls: 'secondary' }] }),
    );
    return { id: e.id, btn };
  });
  const renderFoes = (): void => {
    const q = foeSearch.value.trim().toLowerCase();
    list.replaceChildren(...foeButtons.filter((f) => t(`enemy.${f.id}.name`).toLowerCase().includes(q)).map((f) => f.btn));
  };
  foeSearch.addEventListener('input', renderFoes);
  renderFoes();
  foesPane.append(list);
  renderCards();
  handle = openModal({
    title: t('debug.title'),
    cls: 'debug-modal',
    body: h('div', { class: 'debug-fight' }, heroSeg, options, tabs, foesPane, cardsPane),
    actions: [
      {
        label: t('debug.unlockAll'),
        icon: 'lock',
        onClick: () => {
          unlockAll(
            Object.keys(CARDS),
            ENEMY_LIST.map((e) => e.id),
            RELIC_LIST.map((r) => r.id),
          );
          sfx('ability');
          haptic('ability');
          const toast = h('div', { class: 'hint-toast debug-toast' }, t('debug.unlocked'));
          document.body.append(toast);
          toast.addEventListener('animationend', () => toast.remove());
          return false;
        },
      },
      {
        label: t('menu.reset'),
        icon: 'trash',
        cls: 'danger',
        onClick: () => {
          openResetConfirm();
          return false;
        },
      },
      { label: t('common.close'), cls: 'secondary' },
    ],
  });
  return handle;
}

/** Temporary debug tool: after a fight (debug menus on) a recap of its numbers, to compare and balance enemies. */
export function openFightRecap(combat: Combat, run: RunState, onClose: () => void): ModalHandle {
  const { stats, time, enemy, hero, result } = combat;
  const n = (x: number): string => String(Math.round(x));
  // What the adaptive difficulty takes from this fight (only a won fight it reads), and the levels it moves to.
  const read =
    result === 'win' && pressureLearns(run)
      ? {
          signals: fightSignals(enemy.def.tier, time, stats.damageTaken, run.maxHp),
          next: learn(run.pressure, enemy.def.tier, time, stats.damageTaken, run.maxHp),
        }
      : null;
  const rows: [string, string][] = [
    [t('debug.recap.time'), `${time.toFixed(1)}s`],
    [t('debug.recap.dealt'), n(stats.damageDealt)],
    [t('debug.recap.dot'), n(stats.damageDot)],
    [t('debug.recap.dps'), (stats.damageDealt / Math.max(time, 1)).toFixed(1)],
    [t('debug.recap.eblock'), n(stats.enemyBlocked)],
    [t('debug.recap.taken'), n(stats.damageTaken)],
    [t('debug.recap.hblock'), n(stats.heroBlocked)],
    [t('debug.recap.gained'), n(stats.blockGained)],
    [t('debug.recap.healed'), n(stats.healed)],
    [t('debug.recap.played'), n(combat.cardsPlayed)],
    [t('debug.recap.lost'), n(stats.cardsLost)],
    [t('debug.recap.abilities'), n(stats.abilities)],
    [t('debug.recap.hp'), `${n(Math.max(0, hero.hp))}/${n(hero.maxHp)}`],
    [t('debug.recap.ehp'), `${n(Math.max(0, enemy.hp))}/${n(enemy.maxHp)}`],
  ];
  if (read) {
    rows.push(
      [t('debug.recap.signalHp'), t('debug.recap.signal', { signal: signed(read.signals.hp), level: signed(read.next.hp) })],
      [t('debug.recap.signalDmg'), t('debug.recap.signal', { signal: signed(read.signals.dmg), level: signed(read.next.dmg) })],
    );
  }
  return openModal({
    title: t('debug.recap.title', { result: t(result === 'win' ? 'debug.recap.win' : 'debug.recap.lose'), enemy: t(`enemy.${enemy.def.id}.name`) }),
    body: h('dl', { class: 'recap' }, ...rows.flatMap(([k, v]) => [h('dt', null, k), h('dd', null, v)])),
    actions: [{ label: t('common.next'), cls: 'cta' }],
    dismissable: false,
    onClose,
  });
}
