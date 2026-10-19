import { getLocale, type TKey, t } from '../../core/i18n';
import { sfx } from '../../audio/sfx';
import { CARD_LIST, RARITY_ORDER } from '../../data/cards';
import { ACT_DEFS } from '../../data/acts';
import { ENEMIES, ENEMY_LIST } from '../../data/enemies';
import { EVENT_LIST, type EventDef } from '../../data/events';
import type { EnemyDef, RelicDef } from '../../game/types';
import { HERO_LIST } from '../../data/heroes';
import { RELIC_LIST } from '../../data/relics';
import {
  cardHidden,
  type CollectionKind,
  collection,
  enemyMet,
  hasStamp,
  heroHidden,
  isDiscovered,
  markPageSeen,
  newPages,
  records,
  relicSeen,
  sceneSeen,
  runHistory,
} from '../../game/meta';
import type { CardClass, RunLog } from '../../game/types';
import type { Screen } from '../app';
import { h, onPress, stagger } from '../dom';
import { creature } from '../art/creatures';
import { icon } from '../art/icons';
import { relicArt } from '../art/relics';
import { roomArt } from '../art/rooms';
import { cardView, KEYWORD_LIST, keywordHtml, keywordIconHtml, UNKNOWN } from '../components/cardView';
import { collectionBars } from '../components/collectionBars';
import { foeView } from '../components/moveText';
import { openCardAnatomy, openCardDetail, openInfo, sortCards, sortControl } from '../components/modals';
import { openRunDetail } from '../components/runDetail';

/** The class tabs of the handbook (a hero still in the works has none). */
const tabsNow = (): CardClass[] => [...HERO_LIST.filter((hd) => !heroHidden(hd.id)).map((hd) => hd.id), 'neutral', 'curse'];

const tabLabel = (c: CardClass): string => t(`compendium.tab.${c}`);

const CLASS_ICON: Record<CardClass, string> = {
  warrior: 'sword',
  mage: 'bolt2',
  necromancer: 'bone',
  rogue: 'stickyFingers',
  neutral: 'cards',
  curse: 'skull',
};

export type Section = 'cards' | 'enemies' | 'relics' | 'gossip' | 'keywords' | 'records' | 'history';
const SECTIONS: Section[] = ['cards', 'enemies', 'relics', 'gossip', 'keywords', 'records', 'history'];
const SECTION_ICON: Record<Section, string> = {
  cards: 'cards',
  enemies: 'clipboard',
  relics: 'stapler',
  gossip: 'cooler',
  keywords: 'book',
  records: 'medal',
  history: 'lateClock',
};

/** A tab button's face: its pixel icon, then its word (and a dot when the page has something new). */
const tabFace = (iconId: string, label: string, fresh = false): string =>
  `${icon(iconId)}<span>${label}</span>${fresh ? '<i class="new-dot"></i>' : ''}`;

/** The page of the collection a section is (the others hold no collection). */
const PAGE_OF: Partial<Record<Section, CollectionKind>> = { cards: 'cards', enemies: 'foes', relics: 'relics' };

/** Every page of the handbook in the order a swipe turns through them: a class of cards, an act of enemies, then the single pages. */
interface Page {
  section: Section;
  tab?: CardClass;
  act?: number;
}
const pagesNow = (): Page[] => [
  ...tabsNow().map((tab): Page => ({ section: 'cards', tab })),
  ...ACT_DEFS.map((_, i): Page => ({ section: 'enemies', act: i + 1 })),
  { section: 'relics' },
  { section: 'gossip' },
  { section: 'keywords' },
  { section: 'records' },
  { section: 'history' },
];
/** A swipe has to go this far across (px) and be this much more sideways than up or down. */
const SWIPE_PX = 60;
const SWIPE_SLOPE = 1.5;

const TIERS: EnemyDef['tier'][] = ['normal', 'elite', 'boss'];

/** The stationery page lists the common ones first, the rarest last (a stable sort: the data's order breaks ties). */
const RELICS_BY_RARITY = [...RELIC_LIST].sort((a, b) => RARITY_ORDER.indexOf(a.rarity) - RARITY_ORDER.indexOf(b.rarity));

function relicView(r: RelicDef): HTMLElement {
  const seen = relicSeen(r.id);
  return h('article', {
    class: `relic-line${seen ? '' : ' undiscovered'}`,
    'data-rarity': r.rarity,
    html: `<i class="relic-gem"></i>${relicArt(r.id)}<div><b>${seen ? t(`relic.${r.id}.name`) : UNKNOWN}</b>${seen ? keywordHtml(t(`relic.${r.id}.d`, { n: r.n })) : UNKNOWN}</div>`,
  });
}

/** One line per Water Cooler scene: the speaker's face and the title once it has been met (a tap reads it again), question marks before. */
function sceneView(e: EventDef): HTMLElement {
  const seen = sceneSeen(e.id);
  const speaker = e.speaker ? ENEMIES[e.speaker] : undefined;
  const art = speaker ? creature(speaker.art) : roomArt('event');
  const who = speaker ? t(`enemy.${speaker.id}.name`) : t('event.cooler');
  const line = h('article', {
    class: `relic-line scene-line${seen ? '' : ' undiscovered'}`,
    'data-rarity': 'common',
    html: `<i class="relic-gem"></i>${art}<div><b>${seen ? t(`event.${e.id}.title`) : UNKNOWN}</b>${seen ? who : UNKNOWN}</div>`,
  });
  if (seen)
    onPress(line, () => {
      sfx('tap');
      openInfo({
        art,
        title: t(`event.${e.id}.title`),
        desc: t(`event.${e.id}.text`),
        extra: [
          t('gossip.who', { name: who }),
          ...(e.hero ? [t('gossip.hero', { hero: t(`hero.${e.hero}.name`) })] : []),
          ...(e.needs ? [t('gossip.chapter')] : []),
        ],
      });
    });
  return line;
}

/** One row per hero, one column per act: a rubber stamp where the hero beat that act's boss, a faint blank slot where not yet. */
function stampGrid(): HTMLElement {
  return h(
    'div',
    { class: 'stamps' },
    ...HERO_LIST.filter((hd) => !heroHidden(hd.id)).flatMap((hd) =>
      ACT_DEFS.map((_, i) =>
        hasStamp(hd.id, i + 1)
          ? h(
              'div',
              { class: 'stamp', 'data-act': String(i + 1), 'aria-label': t('records.stamp', { hero: t(`hero.${hd.id}.name`), a: i + 1 }) },
              h('b', null, tabLabel(hd.id)),
              h('span', null, t('journey.title', { n: i + 1 })),
            )
          : h('div', { class: 'stamp-slot', 'aria-hidden': 'true' }),
      ),
    ),
  );
}

/** The history before there is any: an empty desk with a mug still steaming and a note left on it. */
const emptyDesk = (): HTMLElement =>
  h(
    'div',
    { class: 'empty-desk' },
    h('div', {
      class: 'desk-scene',
      html: `<i class="mug">${icon('coffee')}<u></u><u></u></i><i class="tray">${icon('clipboard')}</i><i class="sticky">${t('history.note')}</i>`,
    }),
    h('p', { class: 'sub' }, t('history.empty')),
  );

/** The runs played, newest first, one line each. */
function historyList(): HTMLElement {
  const runs = runHistory();
  if (!runs.length) return emptyDesk();
  const line = (r: RunLog): HTMLElement =>
    h(
      'button',
      { class: `run-log ${r.result}`, onclick: () => openRunDetail(r) },
      h('div', { class: 'rl-art', html: creature(r.hero) }),
      h(
        'div',
        { class: 'rl-main' },
        h('b', null, t(`hero.${r.hero}.name`)),
        h('span', null, t('history.where', { a: r.act, n: r.floor })),
        h('span', { html: `${t('history.stats', { k: r.kills, c: r.cards })} · ${icon('coin')}${r.pay}` }),
      ),
      h(
        'div',
        { class: 'rl-end' },
        h('em', null, t(`history.${r.result}`)),
        h('small', null, new Date(r.at).toLocaleDateString(getLocale(), { dateStyle: 'medium' })),
      ),
    );
  return h('div', { class: 'run-logs' }, ...runs.map(line));
}

/** Lifetime records, printed like the end of a run's payslip. */
function recordSlip(): HTMLElement {
  const r = records();
  const none = t('records.none');
  const row = (k: TKey, v: string | number): HTMLElement => h('div', { class: 'slip-row' }, h('span', null, t(k)), h('b', null, String(v)));
  return h(
    'div',
    { class: 'payslip records' },
    h('div', { class: 'slip-head' }, h('b', null, t('records.title')), h('span', null, t('end.slip.company'))),
    row('records.runs', r.runs),
    row('records.wins', r.wins),
    row('records.fullDays', r.fullDays),
    row('records.weekends', r.weekends),
    row('records.furthest', r.bestAct ? t('records.furthestValue', { a: r.bestAct, n: r.bestFloor }) : none),
    row('records.kills', r.kills),
    row('records.elites', r.elites),
    row('records.bosses', r.bosses),
    row('records.cards', r.cardsPlayed),
    row('records.bestPay', r.bestPay),
    row('records.bestKills', r.bestKills),
    row('records.bestCards', r.bestCards),
    row('records.fastest', r.fastest ? t('records.seconds', { n: r.fastest }) : none),
    h('div', { class: 'slip-row slip-section' }, h('span', null, t('records.stamps'))),
    stampGrid(),
  );
}

/** Every card in the game by class, every enemy and its moves, the relics, and the player's records. */
/** `open`: the section the handbook opens on (the first, Cards, when none is given). */
export function compendiumScreen(onBack: () => void, open: Section = 'cards'): Screen {
  const classes = tabsNow();
  const pages = pagesNow();
  const cardList = CARD_LIST.filter((c) => !cardHidden(c.id));
  let tab: CardClass = classes[0];
  let act = 1;
  let section: Section = open;
  const filled = collection();
  // Pages with something new since they were last opened get a dot on their tab until they are.
  const news = newPages();
  const fresh = new Set<Section>(SECTIONS.filter((sct) => PAGE_OF[sct] && news[PAGE_OF[sct]]));

  const tabs = h('div', { class: 'tabs', role: 'tablist' });
  const grid = h('div', { class: 'deck-grid comp-grid print' });

  const sectionSwitch = h('div', { class: 'seg section-switch', role: 'tablist' });
  const foeViews = [...ENEMY_LIST]
    .sort((a, b) => TIERS.indexOf(a.tier) - TIERS.indexOf(b.tier))
    .map((e) => ({ act: e.act, el: foeView(e, enemyMet(e.id)) }));
  const actTabs = h('div', { class: 'tabs', role: 'tablist' });
  const foes = h('div', { class: 'foes' });
  const foesWrap = h('div', null, actTabs, h('div', { style: { height: '12px' } }), foes);
  const relics = h('div', { class: 'relics' }, ...RELICS_BY_RARITY.map(relicView));
  const gossip = h('div', { class: 'relics' }, ...EVENT_LIST.map(sceneView));
  const keywords = h(
    'div',
    { class: 'relics' },
    ...KEYWORD_LIST.map((kw) =>
      h('article', {
        class: 'relic-line kw-line',
        html: `${keywordIconHtml(kw) || '<span class="kw-ico"></span>'}<div><b>${t(`kw.${kw}`)}</b>${keywordHtml(t(`kw.${kw}.d`))}</div>`,
      }),
    ),
  );
  const cardsWrap = h('div', null);
  const sub = h('p', { class: 'sub' });
  const slip = h(
    'div',
    null,
    collectionBars(filled, (sct) => {
      section = sct;
      render();
      scroller.scrollTop = 0;
    }),
    recordSlip(),
  );
  const history = h('div', null);

  const render = (): void => {
    fresh.delete(section);
    const page = PAGE_OF[section];
    if (page) markPageSeen(page);
    sectionSwitch.replaceChildren(
      ...SECTIONS.map((sct) =>
        h('button', {
          role: 'tab',
          'aria-selected': String(sct === section),
          'aria-pressed': String(sct === section),
          html: tabFace(SECTION_ICON[sct], t(`compendium.${sct}`), fresh.has(sct)),
          onclick: () => {
            sfx('tap');
            section = sct;
            render();
          },
        }),
      ),
    );
    sub.textContent =
      section === 'cards'
        ? t('compendium.progress', { n: filled.cards.n, total: filled.cards.total })
        : section === 'enemies'
          ? t('compendium.foes', { n: filled.foes.n, total: filled.foes.total })
          : section === 'relics'
            ? t('compendium.relicsFound', { n: filled.relics.n, total: filled.relics.total })
            : section === 'gossip'
              ? t('compendium.gossipFound', { n: EVENT_LIST.filter((e) => sceneSeen(e.id)).length, total: EVENT_LIST.length })
              : '';
    sub.hidden = section === 'records' || section === 'history' || section === 'keywords';
    cardsWrap.hidden = section !== 'cards';
    foesWrap.hidden = section !== 'enemies';
    relics.hidden = section !== 'relics';
    gossip.hidden = section !== 'gossip';
    keywords.hidden = section !== 'keywords';
    slip.hidden = section !== 'records';
    history.hidden = section !== 'history';
    if (section === 'history') history.replaceChildren(historyList());
    // The switch can be wider than the screen: the open section scrolls into view.
    sectionSwitch.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    actTabs.replaceChildren(
      ...ACT_DEFS.map((_, i) =>
        h(
          'button',
          {
            role: 'tab',
            'aria-selected': String(i + 1 === act),
            onclick: () => {
              sfx('tap');
              act = i + 1;
              render();
            },
          },
          t('journey.title', { n: i + 1 }),
        ),
      ),
    );
    foes.replaceChildren(...foeViews.filter((f) => f.act === act).map((f) => f.el));
    tabs.replaceChildren(
      ...classes.map((c) =>
        h('button', {
          role: 'tab',
          'aria-selected': String(c === tab),
          html: tabFace(CLASS_ICON[c], tabLabel(c)),
          onclick: () => {
            sfx('tap');
            tab = c;
            render();
          },
        }),
      ),
    );
    const cards = sortCards(cardList.filter((c) => c.cls === tab).map((c) => ({ uid: -1, id: c.id, up: false })));
    grid.replaceChildren(
      ...stagger(
        cards.map((card) => {
          // Every card can be inspected; undiscovered ones hide their name behind question marks.
          const known = isDiscovered(card.id);
          const el = cardView(card, { cls: known ? '' : 'undiscovered' });
          const name = el.querySelector<HTMLElement>('.c-name');
          if (!known && name) name.textContent = UNKNOWN;
          onPress(el, () => {
            sfx('tap');
            openCardDetail(card);
          });
          return el;
        }),
      ),
    );
    grid.scrollTop = 0;
  };
  /** A swipe turns the page: along the tabs of the section, then on to the next section. */
  const turn = (by: number): void => {
    const now = pages.findIndex((p) => p.section === section && (p.tab ?? tab) === tab && (p.act ?? act) === act);
    const page = pages[now + by];
    if (!page) return;
    sfx('tap');
    section = page.section;
    tab = page.tab ?? tab;
    act = page.act ?? act;
    render();
    scroller.scrollTop = 0;
  };
  cardsWrap.append(tabs, h('div', { style: { height: '12px' } }), sortControl(render), grid);
  render();

  const scroller = h('div', { class: 'scroll', style: { flex: '1' } }, sub, cardsWrap, foesWrap, relics, gossip, keywords, slip, history);
  const el = h(
    'div',
    { class: 'screen compendium' },
    h(
      'div',
      { class: 'topline' },
      h('button', {
        class: 'icon-btn',
        'aria-label': t('common.back'),
        onclick: () => {
          sfx('tap');
          onBack();
        },
        html: icon('left'),
      }),
      h('h1', { class: 'h1' }, t('compendium.title')),
      h('button', {
        class: 'icon-btn',
        'aria-label': t('compendium.anatomy'),
        onclick: () => {
          sfx('tap');
          openCardAnatomy();
        },
        html: icon('question'),
      }),
    ),
    sectionSwitch,
    scroller,
  );
  let touch: { x: number; y: number } | null = null;
  scroller.addEventListener(
    'touchstart',
    (e) => {
      touch = e.touches.length === 1 ? { x: e.touches[0].clientX, y: e.touches[0].clientY } : null;
    },
    { passive: true },
  );
  scroller.addEventListener(
    'touchend',
    (e) => {
      const from = touch;
      touch = null;
      if (!from) return;
      const dx = e.changedTouches[0].clientX - from.x;
      const dy = e.changedTouches[0].clientY - from.y;
      if (Math.abs(dx) >= SWIPE_PX && Math.abs(dx) > Math.abs(dy) * SWIPE_SLOPE) turn(dx < 0 ? 1 : -1);
    },
    { passive: true },
  );
  return { el };
}
