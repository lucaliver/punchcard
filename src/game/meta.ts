import { load, store } from '../core/save';
import { ACT_DEFS, MAIN_ACTS } from '../data/acts';
import { CARD_LIST, CARDS } from '../data/cards';
import { ENEMIES, ENEMY_LIST } from '../data/enemies';
import { HERO_LIST, HEROES } from '../data/heroes';
import { rankMax } from '../data/rank';
import { EVENTS } from '../data/events';
import { RELIC_LIST, RELICS } from '../data/relics';
import { CONFIG } from '../data/config';
import type { EnemyDef, HeroId, HeroUnlock, Records, RunLog } from './types';

/** What the handbook collects, as `collection()` counts it. */
export type CollectionKind = 'cards' | 'foes' | 'relics';
type Tally = Record<CollectionKind, number>;

/** A hero's place on the career ladder (`data/rank.ts`). */
interface RankProgress {
  top: number;
  seen: number;
  pick: number;
}

/** Progress kept across runs. */
interface Meta {
  /** Card ids the player has seen (starter decks, rewards, cards met in combat). */
  discovered: string[];
  /** Heroes unlocked so far (heroes without an unlock condition are always available). */
  heroes: HeroId[];
  /** Unlocked but not yet seen on the hero select (shown as new). */
  fresh: HeroId[];
  /** Enemy ids fought at least once (the handbook hides the others' names). */
  met: string[];
  /** Relic ids seen (offered or owned): the handbook hides the others' names. */
  relics: string[];
  /** Ids of the Water Cooler scenes met (`data/events.ts`). */
  scenes: string[];
  /** Runs started so far (the very first one has a scripted act 1). */
  runs: number;
  /** The employment contract has been signed (the start screen's first-time hold). */
  signed: boolean;
  /** Acts finished (their boss beaten), one `hero:act` entry per hero and act: the records page stamps them. */
  stamps: string[];
  records: Records;
  /** Acts whose map has been shown at least once: the first time an act is met its rooms are scripted. */
  actsReached: number[];
  /** Enemies on the map of the last run started: the next run's map keeps away from them. */
  lastEnemies: string[];
  /** The runs played, newest first (`CONFIG.historyMax` of them). */
  history: RunLog[];
  /** The career ladder of each hero that has one: the top rank reached, the one the hire screen has shown (a promotion is animated once), and the one picked for the next run. */
  ranks: Partial<Record<HeroId, RankProgress>>;
  /** A review has been sent: the home stops asking for one. */
  rated: boolean;
  /** The handbook has been opened (or the home's hint about it dismissed). */
  handbookSeen: boolean;
  /** How many of each page of the handbook had been found when the page was last opened: a dot on its tab says more has been found since. `null` until the first look. */
  pagesSeen: Tally | null;
  /** How much of the handbook was filled when the last run started: the end of the run shows the bars climbing from there. */
  base: Tally | null;
}

const NO_RECORDS: Records = {
  wins: 0,
  fullDays: 0,
  weekends: 0,
  kills: 0,
  elites: 0,
  bosses: 0,
  cardsPlayed: 0,
  bestPay: 0,
  bestKills: 0,
  bestCards: 0,
  bestAct: 0,
  bestFloor: 0,
  fastest: 0,
};

const meta: Meta = load('meta', {
  discovered: [],
  heroes: [],
  fresh: [],
  met: [],
  relics: [],
  scenes: [],
  runs: 0,
  signed: false,
  stamps: [],
  records: { ...NO_RECORDS },
  actsReached: [],
  lastEnemies: [],
  history: [],
  ranks: {},
  rated: false,
  handbookSeen: false,
  pagesSeen: null,
  base: null,
});
// Saved data is untrusted: keep only known hero ids.
for (const k of ['heroes', 'fresh'] as const) meta[k] = Array.isArray(meta[k]) ? meta[k].filter((id) => id in HEROES) : [];
const discovered = new Set(Array.isArray(meta.discovered) ? meta.discovered.filter((id) => typeof id === 'string' && id in CARDS) : []);
meta.met = Array.isArray(meta.met) ? meta.met.filter((id) => typeof id === 'string' && id in ENEMIES) : [];
meta.relics = Array.isArray(meta.relics) ? meta.relics.filter((id) => typeof id === 'string' && id in RELICS) : [];
meta.scenes = Array.isArray(meta.scenes) ? meta.scenes.filter((id) => typeof id === 'string' && id in EVENTS) : [];
if (typeof meta.runs !== 'number') meta.runs = 0;
meta.signed = meta.signed === true;
meta.rated = meta.rated === true;
meta.handbookSeen = meta.handbookSeen === true;
const isTally = (x: unknown): x is Tally =>
  typeof x === 'object' && x !== null && (['cards', 'foes', 'relics'] as const).every((k) => Number.isFinite((x as Record<string, unknown>)[k]));
meta.pagesSeen = isTally(meta.pagesSeen) ? meta.pagesSeen : null;
meta.base =
  typeof meta.base === 'object' && meta.base && (['cards', 'foes', 'relics'] as const).every((k) => Number.isFinite(meta.base?.[k]))
    ? meta.base
    : null;
{
  const valid = (s: unknown): s is string => {
    if (typeof s !== 'string') return false;
    const [hero, act] = s.split(':');
    return hero in HEROES && Number.isInteger(Number(act)) && Number(act) >= 1 && Number(act) <= ACT_DEFS.length;
  };
  meta.stamps = Array.isArray(meta.stamps) ? [...new Set(meta.stamps.filter(valid))] : [];
}
meta.lastEnemies = Array.isArray(meta.lastEnemies) ? meta.lastEnemies.filter((id) => typeof id === 'string' && id in ENEMIES) : [];
{
  // Only finite numbers survive; anything missing starts at zero.
  const saved: Partial<Record<keyof Records, unknown>> = typeof meta.records === 'object' && meta.records ? meta.records : {};
  meta.records = { ...NO_RECORDS };
  for (const k of Object.keys(NO_RECORDS) as (keyof Records)[]) {
    const v = saved[k];
    if (typeof v === 'number' && Number.isFinite(v)) meta.records[k] = v;
  }
}

// Acts met: a save from before this was kept has them in its furthest act record.
meta.actsReached = Array.isArray(meta.actsReached)
  ? [...new Set(meta.actsReached.filter((a): a is number => Number.isInteger(a) && a >= 1 && a <= ACT_DEFS.length))]
  : Array.from({ length: Math.min(meta.records.bestAct, ACT_DEFS.length) }, (_, i) => i + 1);

{
  const isNum = (x: unknown): x is number => typeof x === 'number' && Number.isFinite(x);
  const valid = (l: unknown): l is RunLog =>
    typeof l === 'object' &&
    l !== null &&
    'hero' in l &&
    typeof l.hero === 'string' &&
    l.hero in HEROES &&
    'result' in l &&
    (l.result === 'win' || l.result === 'lose' || l.result === 'abandon') &&
    ['act', 'floor', 'kills', 'cards', 'pay', 'elites', 'damageTaken', 'time', 'at'].every(
      (k) => k in l && isNum((l as Record<string, unknown>)[k]),
    ) &&
    'begged' in l &&
    typeof l.begged === 'boolean' &&
    (!('rank' in l) || isNum(l.rank)) &&
    'deck' in l &&
    Array.isArray(l.deck) &&
    l.deck.every(
      (c: unknown) =>
        typeof c === 'object' &&
        c !== null &&
        'id' in c &&
        typeof c.id === 'string' &&
        c.id in CARDS &&
        'up' in c &&
        typeof c.up === 'boolean' &&
        (!('perks' in c) || (Array.isArray(c.perks) && c.perks.every((p: unknown) => typeof p === 'string'))),
    ) &&
    'relics' in l &&
    Array.isArray(l.relics) &&
    l.relics.every((id: unknown) => typeof id === 'string' && id in RELICS);
  meta.history = Array.isArray(meta.history) ? meta.history.filter(valid).slice(0, CONFIG.historyMax) : [];
}

{
  // The ladders: only heroes that have one, each rank within the ladder's length, the one on show never above the top and the one picked never above it either.
  const saved: Record<string, unknown> = typeof meta.ranks === 'object' && meta.ranks ? meta.ranks : {};
  const ranks: Partial<Record<HeroId, RankProgress>> = {};
  for (const hd of HERO_LIST) {
    const r = saved[hd.id];
    const max = rankMax(hd.id);
    if (!max || typeof r !== 'object' || r === null) continue;
    const field = (k: keyof RankProgress): number => {
      const v = (r as Record<string, unknown>)[k];
      return typeof v === 'number' && Number.isInteger(v) ? Math.min(max, Math.max(0, v)) : 0;
    };
    const top = field('top');
    ranks[hd.id] = { top, seen: Math.min(top, field('seen')), pick: Math.min(top, field('pick')) };
  }
  meta.ranks = ranks;
}

export const contractSigned = (): boolean => meta.signed;
export function signContract(): void {
  meta.signed = true;
  store('meta', meta);
}

/** The home asks for a review: `CONFIG.ratingAfterRuns` runs are over and none has been sent yet. */
export const ratingDue = (): boolean => !meta.rated && meta.history.length >= CONFIG.ratingAfterRuns;
export function markRated(): void {
  meta.rated = true;
  store('meta', meta);
}

/** After the first run is over, the home points at the handbook once (until it is opened or the hint tapped away). */
export const handbookHintDue = (): boolean => !meta.handbookSeen && meta.history.length >= 1;
export function markHandbookSeen(): void {
  meta.handbookSeen = true;
  store('meta', meta);
}

/** No run has ever been started (the title then points at the time card). */
export const neverPlayed = (): boolean => meta.runs === 0;

/** The handbook's pages, as found and as many as there are (a hero still in the works hides its cards). */
const tally = (): { found: Tally; total: Tally } => {
  const cards = CARD_LIST.filter((c) => !cardHidden(c.id));
  return {
    found: {
      cards: cards.filter((c) => discovered.has(c.id)).length,
      foes: ENEMY_LIST.filter((e) => meta.met.includes(e.id)).length,
      relics: RELIC_LIST.filter((r) => meta.relics.includes(r.id)).length,
    },
    total: { cards: cards.length, foes: ENEMY_LIST.length, relics: RELIC_LIST.length },
  };
};

/** What each page held when it was last opened; the first look takes what it holds now as read. */
function pagesSeen(found: Tally): Tally {
  meta.pagesSeen ??= { ...found };
  return meta.pagesSeen;
}

/** The handbook's pages that have something new since they were last opened (the first look takes today's count as read). */
export function newPages(): Record<CollectionKind, boolean> {
  const { found } = tally();
  const seen = pagesSeen(found);
  return { cards: found.cards > seen.cards, foes: found.foes > seen.foes, relics: found.relics > seen.relics };
}

/** A page of the handbook has been opened: whatever it holds now is no longer new. */
export function markPageSeen(kind: CollectionKind): void {
  const { found } = tally();
  const seen = pagesSeen(found);
  if (seen[kind] === found[kind]) return;
  seen[kind] = found[kind];
  store('meta', meta);
}

/** How much of each page of the handbook is filled now (`n` of `total`), and how much was when the last run started (`from`). */
export function collection(): Record<CollectionKind, { from: number; n: number; total: number }> {
  const { found, total } = tally();
  const kinds = ['cards', 'foes', 'relics'] as const;
  return Object.fromEntries(
    kinds.map((k) => [k, { from: Math.min(meta.base?.[k] ?? found[k], found[k]), n: found[k], total: total[k] }]),
  ) as ReturnType<typeof collection>;
}

/** True for the very first run ever; counts the run as started (and notes how full the handbook is, before the run fills it). */
export function startingFirstRun(): boolean {
  const first = meta.runs === 0;
  meta.runs++;
  meta.base = tally().found;
  store('meta', meta);
  return first;
}

/** The acts whose first meeting is still to come, among `acts`: those are laid out by hand for the next run. */
export const unmetActs = (acts: readonly number[]): number[] => acts.filter((a) => !meta.actsReached.includes(a));

/** The map of an act is shown: the next run won't script it any more. */
export function reachAct(act: number): void {
  if (meta.actsReached.includes(act)) return;
  meta.actsReached.push(act);
  store('meta', meta);
}

export function discover(ids: Iterable<string>): void {
  let changed = false;
  for (const id of ids) {
    if (discovered.has(id)) continue;
    discovered.add(id);
    changed = true;
  }
  if (!changed) return;
  meta.discovered = [...discovered];
  store('meta', meta);
}

export const isDiscovered = (id: string): boolean => discovered.has(id);

export function meetEnemy(id: string): void {
  if (meta.met.includes(id)) return;
  meta.met.push(id);
  store('meta', meta);
}
export const enemyMet = (id: string): boolean => meta.met.includes(id);

export function seeRelics(ids: Iterable<string>): void {
  const fresh = [...ids].filter((id) => !meta.relics.includes(id));
  if (!fresh.length) return;
  meta.relics.push(...fresh);
  store('meta', meta);
}
export const relicSeen = (id: string): boolean => meta.relics.includes(id);

/** A Water Cooler scene has been met: the handbook's Gossip page keeps it. */
export function seeScene(id: string): void {
  if (meta.scenes.includes(id)) return;
  meta.scenes.push(id);
  store('meta', meta);
}
export const sceneSeen = (id: string): boolean => meta.scenes.includes(id);

/** Debug: every hero hired and stamped for every act (the weekend is open to all, every rank of every ladder is reached), every card discovered, every enemy met and every relic seen. */
export function unlockAll(cards: Iterable<string>, enemies: Iterable<string>, relics: Iterable<string>): void {
  meta.heroes = HERO_LIST.filter((hd) => hd.unlock).map((hd) => hd.id);
  meta.fresh = [];
  meta.stamps = HERO_LIST.flatMap((hd) => ACT_DEFS.map((_, i) => `${hd.id}:${i + 1}`));
  meta.met = [...enemies];
  meta.relics = [...relics];
  meta.scenes = Object.keys(EVENTS);
  // Every rank of every ladder is reached (and seen), so each can be tried.
  for (const hd of HERO_LIST) if (rankMax(hd.id)) meta.ranks[hd.id] = { top: rankMax(hd.id), seen: rankMax(hd.id), pick: rankMax(hd.id) };
  for (const id of cards) discovered.add(id);
  meta.discovered = [...discovered];
  store('meta', meta);
}

export const heroUnlocked = (id: HeroId): boolean => !HEROES[id].unlock || meta.heroes.includes(id);
/** A hero still in the works (`unlock: { debug: true }`) leaves no trace until the debug menu's unlock-all hires them: not on the hero select, and none of their cards anywhere. */
export const heroHidden = (id: HeroId): boolean => {
  const u = HEROES[id].unlock;
  return !!u && 'debug' in u && !heroUnlocked(id);
};
/** Whether a card belongs to a hero that is hidden (see `heroHidden`): such a card is never offered, listed or counted. */
export const cardHidden = (id: string): boolean => {
  const cls = CARDS[id].cls;
  return cls !== 'neutral' && cls !== 'curse' && heroHidden(cls);
};
export const heroFresh = (id: HeroId): boolean => meta.fresh.includes(id);

export function markHeroSeen(id: HeroId): void {
  if (!heroFresh(id)) return;
  meta.fresh = meta.fresh.filter((x) => x !== id);
  store('meta', meta);
}

/** A fight ended: counts it in the records (kills, cards, the fastest win). */
export function recordFight(f: { tier: EnemyDef['tier']; won: boolean; seconds: number; cards: number }): void {
  const r = meta.records;
  r.cardsPlayed += f.cards;
  if (f.won) {
    r.kills++;
    if (f.tier === 'elite') r.elites++;
    if (f.tier === 'boss') r.bosses++;
    if (!r.fastest || f.seconds < r.fastest) r.fastest = Math.round(f.seconds);
  }
  store('meta', meta);
}

/** Records one run can beat (the payslip stamps them). */
export type RunRecord = 'bestFloor' | 'bestKills' | 'bestCards' | 'bestPay';

/**
 * A run ended (`fullDay`: won through every act). Returns the one-run records it beat; the very first value set
 * doesn't count, there was nothing to beat.
 */
export function recordRun(f: {
  won: boolean;
  fullDay: boolean;
  weekend: boolean;
  act: number;
  floor: number;
  pay: number;
  kills: number;
  cards: number;
}): RunRecord[] {
  const r = meta.records;
  const beaten: RunRecord[] = [];
  if (f.won) r.wins++;
  if (f.fullDay) r.fullDays++;
  if (f.weekend) r.weekends++;
  if (f.act > r.bestAct || (f.act === r.bestAct && f.floor > r.bestFloor)) {
    if (r.bestAct) beaten.push('bestFloor');
    r.bestAct = f.act;
    r.bestFloor = f.floor;
  }
  for (const [k, v] of [
    ['bestPay', f.pay],
    ['bestKills', f.kills],
    ['bestCards', f.cards],
  ] as const) {
    if (v <= r[k]) continue;
    if (r[k]) beaten.push(k);
    r[k] = v;
  }
  store('meta', meta);
  return beaten;
}

/** A run ended (won, lost or abandoned): it goes on top of the handbook's history. */
export function logRun(entry: RunLog): void {
  meta.history = [entry, ...meta.history].slice(0, CONFIG.historyMax);
  store('meta', meta);
}
/** The enemies on the map of the last run started, and the call that records a new run's. */
export const lastEnemies = (): readonly string[] => meta.lastEnemies;
export function setLastEnemies(ids: readonly string[]): void {
  meta.lastEnemies = [...new Set(ids)];
  store('meta', meta);
}

export const runHistory = (): readonly RunLog[] => meta.history;

export const records = (): Readonly<Records & { runs: number }> => ({ ...meta.records, runs: meta.runs });

/** A hero finished an act (beat its boss): the records page stamps it. */
export function stampAct(hero: HeroId, act: number): void {
  const key = `${hero}:${act}`;
  if (meta.stamps.includes(key)) return;
  meta.stamps.push(key);
  store('meta', meta);
}
export const hasStamp = (hero: HeroId, act: number): boolean => meta.stamps.includes(`${hero}:${act}`);

/** A hero who has won a full day (beaten the last act's boss) has the weekend, the bonus act, open. */
export const weekendOpen = (hero: HeroId): boolean => hasStamp(hero, MAIN_ACTS);

/** The highest rank a hero has reached on their career ladder (0: the plain game; always 0 for a hero without a ladder). */
export const rankTop = (hero: HeroId): number => meta.ranks[hero]?.top ?? 0;

/** The rank picked for the hero's next run: the top one, unless a lower one was chosen. */
export const rankPick = (hero: HeroId): number => {
  const r = meta.ranks[hero];
  return r ? Math.min(r.top, r.pick) : 0;
};

/** Picks the rank to play (never above the top one). */
export function setRankPick(hero: HeroId, level: number): void {
  const r = meta.ranks[hero];
  if (!r) return;
  r.pick = Math.max(0, Math.min(r.top, level));
  store('meta', meta);
}

/** Debug: puts the hero's top rank where the menu says (and picks it). With `promote` the hire screen plays the climb from the old rank, otherwise it is simply there. */
export function debugRank(hero: HeroId, top: number, promote = false): void {
  const max = rankMax(hero);
  if (!max) return;
  const was = meta.ranks[hero]?.top ?? 0;
  const to = Math.max(0, Math.min(max, top));
  meta.ranks[hero] = { top: to, seen: promote ? Math.min(was, to) : to, pick: to };
  store('meta', meta);
}

/** A full day won at the hero's top rank promotes them to the next one (and picks it for the next run). Returns the new rank, or 0 when nothing changed. */
export function promoteRank(hero: HeroId, played: number): number {
  const max = rankMax(hero);
  const r = meta.ranks[hero] ?? { top: 0, seen: 0, pick: 0 };
  if (!max || played !== r.top || r.top >= max) return 0;
  r.top++;
  r.pick = r.top;
  meta.ranks[hero] = r;
  store('meta', meta);
  return r.top;
}

/** A promotion the hire screen hasn't shown yet: the rank the hero had on the last look and the one they have now. */
export function rankPromotion(hero: HeroId): { from: number; to: number } | null {
  const r = meta.ranks[hero];
  return r && r.top > r.seen ? { from: r.seen, to: r.top } : null;
}

/** The hire screen has shown the hero's rank: the promotion is not animated again. */
export function markRankSeen(hero: HeroId): void {
  const r = meta.ranks[hero];
  if (!r || r.seen === r.top) return;
  r.seen = r.top;
  store('meta', meta);
}

/** Records progress that can unlock heroes (a run finished with a hero, an act boss reached). Returns the heroes it unlocked. */
export function progress(met: (u: HeroUnlock) => boolean): HeroId[] {
  // A stamp condition reads the records, so it is checked on every call, whatever `met` says.
  const done = (hd: { id: HeroId }, u: HeroUnlock): boolean =>
    met(u) || ('allStamped' in u && HERO_LIST.every((other) => other.id === hd.id || hasStamp(other.id, u.allStamped)));
  const unlocked = HERO_LIST.filter((hd) => hd.unlock && !('debug' in hd.unlock) && !heroUnlocked(hd.id) && done(hd, hd.unlock)).map((hd) => hd.id);
  if (!unlocked.length) return unlocked;
  meta.heroes.push(...unlocked);
  meta.fresh.push(...unlocked);
  store('meta', meta);
  return unlocked;
}
