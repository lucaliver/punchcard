import { t } from '../../core/i18n';
import { CARDS, cardCostOf, cardKeywordsOf, cardValsOf } from '../../data/cards';
import { PERKS } from '../../data/perks';
import { STATUSES } from '../../data/statuses';
import type { Combat } from '../../game/combat';
import type { CardInst, CardLike, Side, Tone } from '../../game/types';
import { h } from '../dom';
import { icon } from '../art/icons';

const KEYWORD_LINE = ['innate', 'pending', 'exhaust', 'consume', 'fleeting', 'volatile', 'unplayable', 'large', 'echo', 'anchor', 'credit'];
export const TAG_ICON: Record<string, string> = {
  innate: 'flag',
  pending: 'pending',
  exhaust: 'burntPaper',
  consume: 'trash',
  fleeting: 'mouse',
  volatile: 'feather',
  large: 'large',
  bulky: 'bulky',
  echo: 'echoKw',
  anchor: 'anchor',
  credit: 'debt',
};

/** Glyph kind → icon and the unit shown after its value. */
/** A glyph's `tone` is the one of the status or keyword it stands for (the text names it in the same ink: `StatusDef.tone`, `KEYWORD_TONE`). */
export const GLYPHS: Record<string, { icon: string; unit?: string; sign?: string; tone?: Tone }> = {
  dmg: { icon: 'sword' },
  block: { icon: 'shield', tone: 'teal' },
  /** Strips the enemy's Block. */
  breakBlock: { icon: 'shield', sign: '-', tone: 'teal' },
  heal: { icon: 'heart', sign: '+', tone: 'green' },
  mana: { icon: 'crystal', sign: '+', tone: 'blue' },
  stun: { icon: 'stars', unit: 's', tone: 'purple' },
  /** You are stunned (not the enemy). */
  selfStun: { icon: 'asleep', unit: 's', tone: 'purple' },
  chill: { icon: 'snow', unit: 's', tone: 'blue' },
  rush: { icon: 'speedCards', unit: 's', tone: 'amber' },
  burn: { icon: 'flame', tone: 'red' },
  str: { icon: 'muscle', sign: '+', tone: 'red' },
  dodge: { icon: 'dodge', unit: 's', tone: 'teal' },
  parry: { icon: 'crossed', tone: 'red' },
  hp: { icon: 'blood', sign: '-' },
  grow: { icon: 'growth', sign: '+' },
  snow: { icon: 'snow', tone: 'blue' },
  skull: { icon: 'heartbreak' },
  exit: { icon: 'exitSlot' },
  clog: { icon: 'slime' },
  virus: { icon: 'virus', tone: 'green' },
  gate: { icon: 'gate' },
  boom: { icon: 'bomb' },
  drain: { icon: 'crystal', sign: '-', tone: 'blue' },
  crystal: { icon: 'crystalSlot', sign: '+', tone: 'blue' },
  poison: { icon: 'poisonBottle', tone: 'toxic' },
  thorns: { icon: 'thorns', sign: '+', tone: 'red' },
  regen: { icon: 'redCross', sign: '+', tone: 'green' },
  vuln: { icon: 'crack', unit: 's', tone: 'red' },
  weak: { icon: 'broken', unit: 's', tone: 'purple' },
  fort: { icon: 'fortress', unit: 's', tone: 'teal' },
  cards: { icon: 'cards' },
  timer: { icon: 'timer', unit: 's' },
  skip: { icon: 'skip' },
  copy: { icon: 'copy' },
  addCard: { icon: 'addCard', sign: '+' },
  lane: { icon: 'lane' },
  sudo: { icon: 'terminal', unit: 's' },
  tickUp: { icon: 'timer', sign: '+' },
  sleeve: { icon: 'hand' },
  tickDown: { icon: 'timer', sign: '-' },
  undo: { icon: 'undo' },
  auto: { icon: 'autopilot', unit: 's', tone: 'blue' },
  pile: { icon: 'pile' },
  snatch: { icon: 'snatch' },
  pin: { icon: 'pushpin' },
  /** Petrifies cards of your deck (the hex's rock). */
  petrify: { icon: 'stone' },
  /** Crumples cards of your deck (the hex's paper ball). */
  crumple: { icon: 'crumple4' },
  sweep: { icon: 'windKey', sign: '+' },
  manaRegen: { icon: 'crystalUp', unit: 's', tone: 'blue' },
  /** Multitasking, for seconds or as charges. */
  multi: { icon: 'bolt2', unit: 's', tone: 'purple' },
  dark: { icon: 'bulbOff', unit: 's', tone: 'purple' },
  stop: { icon: 'pause', unit: 's', tone: 'purple' },
  shrink: { icon: 'growth', sign: '-' },
  /** Condition: no Block. */
  bare: { icon: 'shieldOff' },
  /** The card's own cost goes down. */
  cheaper: { icon: 'priceTag', sign: '-' },
  /** A price every card is set to. */
  price: { icon: 'priceTag' },
  /** A card is used up (the Exhaust keyword). */
  exhaust: { icon: 'burntPaper' },
  /** Max HP, for this fight. */
  maxHp: { icon: 'heartUp', sign: '+', tone: 'green' },
  /** The enemy's buffs (and its Block). */
  buff: { icon: 'up' },
  /** The debuffs you carry. */
  debuff: { icon: 'down' },
  /** A curse card. */
  curse: { icon: 'skull' },
  /** An angel: Forklift Certified's comeback below half HP. */
  angel: { icon: 'angel', tone: 'teal' },
  /** Handed over to the enemy. */
  pass: { icon: 'share' },
};

/** Long names get a smaller font (and two lines) so they fit the title band instead of being cut. */
const nameFit = (name: string): string => (name.length > 16 ? 'xlong' : name.length > 7 ? 'long' : '');

/** Stands in for the name or text of something not met or unlocked yet (handbook, hero select). */
export const UNKNOWN = '????';

export function cardName(card: CardInst): string {
  return t(`card.${card.id}.name`);
}

/** The cost number on a card face (for a card On Credit, what it will owe); in a fight `cost` is what `Combat.costOf` says. */
export function cardCostLabel(card: CardLike, cost = cardCostOf(card)): string {
  return cost < 0 ? 'X' : String(cost);
}

/** Value HTML with live damage preview (green = buffed/upgraded, red = weakened). */
function valueHtml(card: CardLike, idx: number, combat?: Combat | null): string {
  const def = CARDS[card.id];
  const base = cardValsOf(card)[idx];
  const upgraded = card.up && def.upVals && def.upVals[idx] !== def.vals[idx];
  // A value that moves with the fight (`CardDef.shown`) is read live, and tinted when it differs from the card's own.
  const now = combat ? combat.shownVals(card)[idx] : base;
  if (combat && def.dmg?.includes(idx)) {
    const v = combat.previewHeroDamage(now, def);
    const cls = v > base ? 'buff' : v < base ? 'nerf' : upgraded ? 'upg' : '';
    return `<b class="${cls}">${v}</b>`;
  }
  const cls = now > base ? 'buff' : now < base ? 'nerf' : upgraded ? 'upg' : '';
  return `<b class="${cls}">${now}</b>`;
}

/**
 * The language-neutral face: icons + big numbers, one effect per line (`|`).
 * Grammar: `{kind:i}` icon + value i · `{kind}` icon · `{?kind}` condition ("if"), shown as (icon) (`{?a+b}`: both in one pair of brackets) · `{*kind}` trigger ("every time"), shown as a loop icon and the icon (`{*a+b}`: both) · `{i}` bare value · other text as is.
 */
export function cardFace(card: CardLike, combat?: Combat | null): string {
  const def = CARDS[card.id];
  const lines = def.face.split('|').map((line) => {
    const html = line.replace(
      /\{([?*])?([\w+]+)(?::(\d))?\}|([^{]+)/g,
      (_, mark: string | undefined, k: string | undefined, idx: string | undefined, text: string | undefined) => {
        if (text !== undefined) return `<span class="op">${text}</span>`;
        if (/^\d$/.test(k!)) return valueHtml(card, Number(k), combat);
        if (mark) {
          const icons = k!
            .split('+')
            .map((c) => icon(GLYPHS[c].icon))
            .join('');
          return mark === '?'
            ? `<span class="cond${combat && def.when?.(combat) ? ' met' : ''}">(${icons})</span>`
            : `<span class="each">${icon('loop')}${icons}</span>`;
        }
        const g = GLYPHS[k!];
        const val =
          idx !== undefined ? `${g.sign ?? ''}${valueHtml(card, Number(idx), combat)}${g.unit ? `<span class="unit">${g.unit}</span>` : ''}` : '';
        // Each glyph carries its own ink (its tone, else `.gk-<kind>`), so a line like {dmg}={block} gets a pink sword and a teal shield.
        return `<span class="gk gk-${k}"${g.tone ? ` data-tone="${g.tone}"` : ''}>${icon(g.icon)}${val}</span>`;
      },
    );
    return `<div class="gl">${html}</div>`;
  });
  // In a fight the face also holds the blackout cover (the HUD shows it while the lights are out).
  return lines.join('') + (combat ? `<div class="c-dark">${icon('bulbOff')}</div>` : '');
}

/** A status's name on a side (a stun reads Asleep on the hero), and its text. */
export const statusName = (id: string, side: Side): string => t(STATUSES[id].selfName && side === 'hero' ? `status.${id}.self` : `status.${id}`);
export const statusDesc = (id: string, side: Side, v: number): string =>
  keywordHtml(t(STATUSES[id].selfName && side === 'hero' ? `status.${id}.self.d` : `status.${id}.d`, { v }));

/** Keywords that are not statuses but still have a colour: Block is teal, mana blue, Asleep (the hero's stun) purple. */
const KEYWORD_TONE: Record<string, Tone> = { block: 'teal', mana: 'blue', crystal: 'blue', asleep: 'purple' };

/** Icons of keywords that have none of their own as a card tag, status or glyph. */
const KEYWORD_ICON: Record<string, string> = {
  power: 'infinity',
  unplayable: 'lock',
  strength: 'muscle',
  thickSkin: 'thickSkin',
  buff: 'up',
  block: 'shield',
  mana: 'crystal',
  crystal: 'crystalSlot',
  asleep: 'asleep',
  x: 'xCost',
};

/** The small icon that goes before a keyword's explanation, in its colour (nothing for a keyword without one). */
export function keywordIconHtml(kw: string): string {
  const id = KEYWORD_ICON[kw] ?? TAG_ICON[kw] ?? STATUSES[kw]?.icon ?? GLYPHS[kw]?.icon;
  if (!id) return '';
  const tone = STATUSES[kw]?.tone ?? KEYWORD_TONE[kw];
  return `<span class="kw-ico"${tone ? ` data-tone="${tone}"` : ''}>${icon(id)}</span>`;
}

/** Every keyword the game explains (`kw.<id>` and `kw.<id>.d`), card modifiers first, then the statuses and terms the texts use: the handbook lists them. */
export const KEYWORD_LIST = [
  'exhaust',
  'consume',
  'fleeting',
  'volatile',
  'innate',
  'pending',
  'large',
  'bulky',
  'echo',
  'anchor',
  'credit',
  'unplayable',
  'power',
  'x',
  'block',
  'mana',
  'crystal',
  'strength',
  'regen',
  'thorns',
  'multitasking',
  'thickSkin',
  'dodge',
  'parry',
  'rush',
  'poison',
  'burn',
  'chill',
  'stun',
  'asleep',
  'weak',
  'vulnerable',
  'buff',
];

/** Rules text with its `[keyword]` marks as bold names in the keyword's colour (`tone` in statuses.ts). */
export function keywordHtml(text: string): string {
  return text.replace(/\[(\w+)\]/g, (_, kw: string) => {
    const tone = STATUSES[kw]?.tone ?? KEYWORD_TONE[kw];
    return `<b class="kw"${tone ? ` data-tone="${tone}"` : ''}>${t(`kw.${kw}`)}</b>`;
  });
}

/** The same text for places that show no markup (toasts): the keywords as plain names. */
export function keywordText(text: string): string {
  return text.replace(/\[@(\w+)\]/g, (_, id: string) => t(`card.${id}.name`)).replace(/\[(\w+)\]/g, (_, kw: string) => t(`kw.${kw}`));
}

/** Full rules text as HTML (detail view). */
export function cardText(card: CardLike): string {
  const def = CARDS[card.id];
  const vals = cardValsOf(card);
  let s = t(`card.${card.id}.desc`).replace(/\{(\d)\}/g, (_, i: string) => {
    const idx = Number(i);
    const upgraded = card.up && def.upVals && def.upVals[idx] !== def.vals[idx];
    return `<span class="num ${upgraded ? 'upg' : ''}">${vals[idx]}</span>`;
  });
  // `[@id]` names another card: bold, coloured and tappable in the detail view (`openCardDetail` listens for `data-card`).
  s = keywordHtml(s).replace(
    /\[@(\w+)\]/g,
    (_, id: string) => `<b class="card-ref" role="button" tabindex="0" data-card="${id}">${t(`card.${id}.name`)}</b>`,
  );
  const kws = cardKeywordsOf(card).filter((k) => KEYWORD_LINE.includes(k));
  const extra = kws.map((k) => `<b class="kw">${t(`kw.${k}`)}</b>`);
  if (def.type === 'power') extra.unshift(`<b class="kw">${t('kw.power')}</b>`);
  if (extra.length) s += `<span class="kwline">${extra.join(' · ')}</span>`;
  return s;
}

/** Keywords referenced by a card, for the glossary in the detail view. */
export function cardKeywords(card: CardInst): string[] {
  const def = CARDS[card.id];
  const found = new Set<string>();
  for (const m of t(`card.${card.id}.desc`).matchAll(/\[(\w+)\]/g)) found.add(m[1]);
  for (const k of cardKeywordsOf(card)) if (KEYWORD_LINE.includes(k)) found.add(k);
  if (def.type === 'power') found.add('power');
  if (def.cost < 0) found.add('x');
  return [...found];
}

interface CardViewOpts {
  combat?: Combat | null;
  cls?: string;
}

export function cardView(card: CardLike, opts: CardViewOpts = {}): HTMLDivElement {
  const def = CARDS[card.id];
  const el = h('div', {
    class: `card ${opts.cls ?? ''} ${card.up ? 'is-up' : ''} ${def.pair ? 'pair' : ''}`,
    'data-cls': def.cls,
    'data-type': def.type,
    'data-rarity': def.rarity,
    'data-uid': card.uid,
    'aria-label': cardName(card),
  });
  const echo = cardKeywordsOf(card).includes('echo');
  const tags = [...(def.type === 'power' ? ['infinity'] : []), ...cardKeywordsOf(card).flatMap((k) => TAG_ICON[k] ?? [])]
    .map((id) => icon(id))
    .join('');
  const lines = def.face.split('|').length;
  el.innerHTML = `
    <div class="c-top"><div class="c-cost ${card.perks?.some((p) => PERKS[p]?.costDelta) ? 'cheap' : ''}">${cardCostLabel(card)}</div><div class="c-name ${nameFit(cardName(card))}">${cardName(card)}</div></div>
    <div class="c-art">${icon(def.art)}</div>
    <div class="c-face ${lines > 1 ? 'two' : ''}">${echo ? `<i class="c-wave l">${icon('echoWave')}</i><i class="c-wave r">${icon('echoWave')}</i>` : ''}<div class="c-body">${cardFace(card, opts.combat)}</div></div>
    ${tags ? `<div class="c-tags">${tags}</div>` : ''}
    <div class="c-gem"></div>`;
  return el;
}
