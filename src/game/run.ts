import { Rng } from '../core/rng';
import { loadRaw, remove, store } from '../core/save';
import { CARDS, card } from '../data/cards';
import { CONFIG } from '../data/config';
import { KEEPERS } from '../data/keepers';
import { RELICS, relicMods } from '../data/relics';
import type { BattleSetup, BattleStats } from './battle';
import type { CardInst, KeeperId, RelicDef, Rarity, RoomType } from './types';
import { type FightKind, makeStage } from './waves';

/**
 * A run: the keeper climbs the mountain over three nights, each a map of rooms. Everything here is pure data and functions (no DOM), so the
 * flow is testable; the screens only show it. Dice come from `run.seed` plus a counter that is saved, so a reload deals the same offers.
 */

export const SAVE_VERSION = 1;

export interface RunNode {
  id: number;
  row: number;
  col: number;
  type: RoomType;
  next: number[];
  seed: number;
}

export interface RewardOffer {
  kind: FightKind;
  mon: number;
  cards: CardInst[];
  /** Relics on offer (an elite gives one, a boss a choice of three). */
  relics: string[];
  /** Mon the early dawn and the flame still burning added, for the receipt. */
  bonus: number;
  /** Set once the player has chosen. */
  taken: boolean;
}

export interface ShopCard {
  card: CardInst;
  price: number;
  sold: boolean;
}
export interface ShopRelic {
  id: string;
  price: number;
  sold: boolean;
}
export interface ShopStock {
  cards: ShopCard[];
  relics: ShopRelic[];
  removeCost: number;
  healCost: number;
  healed: boolean;
}

export interface RunState {
  version: number;
  seed: number;
  keeper: KeeperId;
  act: number;
  map: RunNode[];
  /** The last room cleared in this act, or null at the foot of the mountain. */
  at: number | null;
  /** A room entered but not finished (a reload comes back to it). */
  inRoom: number | null;
  deck: CardInst[];
  relics: string[];
  flame: number;
  maxFlame: number;
  mon: number;
  counter: number;
  uid: number;
  removals: number;
  fights: number;
  kills: number;
  leaks: number;
  /** Rooms of each kind visited, for the summary. */
  visited: Record<string, number>;
  reward: RewardOffer | null;
  shop: ShopStock | null;
  /** The very first run: a gentler road and a guided first fight. */
  first: boolean;
  /** Act whose intro has been shown. */
  introAct: number;
}

// ——— dice ———

/** A fresh `Rng` for a purpose, from the run's seed and its saved counter. */
export function rngFor(run: RunState, tag: string): Rng {
  let hsh = 2166136261 ^ run.seed;
  for (let i = 0; i < tag.length; i++) hsh = Math.imul(hsh ^ tag.charCodeAt(i), 16777619);
  hsh = Math.imul(hsh ^ run.counter++, 16777619);
  return new Rng(hsh >>> 0);
}

export const newUid = (run: RunState): number => ++run.uid;

export const instance = (run: RunState, id: string, up = false): CardInst => ({ uid: newUid(run), id, up });

// ——— the map ———

const ROWS_PER_ACT = CONFIG.run.mapRows;
const COLS_PER_ROW = CONFIG.run.mapWidth;

/** Weights of the rooms dealt on a free spot of the map. */
const ROOM_WEIGHTS: [RoomType, number][] = [
  ['watch', 52],
  ['elite', 14],
  ['rest', 13],
  ['market', 9],
  ['shrine', 7],
  ['treasure', 5],
];

export function genMap(seed: number, act: number, first: boolean): RunNode[] {
  const rng = new Rng(seed * 31 + act * 977);
  const nodes: RunNode[] = [];
  const rows: RunNode[][] = [];
  let id = 0;
  for (let r = 0; r < ROWS_PER_ACT; r++) {
    const width = r === 0 ? 2 + (rng.chance(0.5) ? 1 : 0) : r === ROWS_PER_ACT - 1 ? 2 : 2 + (rng.chance(0.55) ? 1 : 0);
    const cols = [0, 1, 2].slice(0, COLS_PER_ROW);
    const chosen = rng.sample(cols, Math.min(width, cols.length)).sort((a, b) => a - b);
    rows.push(
      chosen.map((col) => {
        const n: RunNode = { id: id++, row: r, col, type: 'watch', next: [], seed: rng.int(1, 2 ** 30) };
        nodes.push(n);
        return n;
      }),
    );
  }
  const boss: RunNode = { id: id++, row: ROWS_PER_ACT, col: 1, type: 'boss', next: [], seed: rng.int(1, 2 ** 30) };
  nodes.push(boss);
  rows.push([boss]);

  // Roads: each room leads to the nearest rooms of the next row, and every room of that row is reached by something.
  for (let r = 0; r < rows.length - 1; r++) {
    const from = rows[r];
    const to = rows[r + 1];
    for (const n of from) {
      const near = [...to].sort((a, b) => Math.abs(a.col - n.col) - Math.abs(b.col - n.col));
      n.next.push(near[0].id);
      if (near[1] && rng.chance(0.45) && Math.abs(near[1].col - n.col) <= 1) n.next.push(near[1].id);
    }
    for (const t of to) {
      if (!from.some((n) => n.next.includes(t.id))) {
        const nearest = [...from].sort((a, b) => Math.abs(a.col - t.col) - Math.abs(b.col - t.col))[0];
        nearest.next.push(t.id);
      }
    }
    for (const n of from) n.next.sort((a, b) => a - b);
  }

  // Rooms: the foot is all watches, the last row before the boss is a rest, the rest are dealt, then the rooms every night needs are guaranteed.
  const free = nodes.filter((n) => n.row > 0 && n.row < ROWS_PER_ACT - 1);
  for (const n of rows[ROWS_PER_ACT - 1]) n.type = 'rest';
  for (const n of free) n.type = first && n.row < 2 ? 'watch' : rng.weighted(ROOM_WEIGHTS, (w) => w[1])[0];
  const elitesOk = (n: RunNode): boolean => n.row >= 2;
  for (const n of free) if (n.type === 'elite' && !elitesOk(n)) n.type = 'watch';
  const ensure = (type: RoomType, minRow: number, maxRow: number): void => {
    if (nodes.some((n) => n.type === type)) return;
    const spots = free.filter((n) => n.row >= minRow && n.row <= maxRow && n.type === 'watch');
    if (spots.length) rng.pick(spots).type = type;
  };
  ensure('market', 2, 4);
  ensure('shrine', 2, 5);
  ensure('elite', 3, 4);
  // No two elites in a row on one road.
  for (const n of nodes) if (n.type === 'elite' && n.next.some((id) => nodes[id].type === 'elite')) nodes[n.next[0]].type = 'watch';
  return nodes;
}

export const nodeOf = (run: RunState, id: number): RunNode => run.map[id];

/** The rooms that can be entered now. */
export function reachable(run: RunState): RunNode[] {
  if (run.at === null) return run.map.filter((n) => n.row === 0);
  return run.map[run.at].next.map((id) => run.map[id]);
}

// ——— starting ———

export function newRun(keeper: KeeperId, seed: number, first: boolean): RunState {
  const k = KEEPERS[keeper];
  const run: RunState = {
    version: SAVE_VERSION,
    seed,
    keeper,
    act: 1,
    map: [],
    at: null,
    inRoom: null,
    deck: [],
    relics: [],
    flame: k.flame,
    maxFlame: k.flame,
    mon: CONFIG.run.startCoins,
    counter: 0,
    uid: 0,
    removals: 0,
    fights: 0,
    kills: 0,
    leaks: 0,
    visited: {},
    reward: null,
    shop: null,
    first,
    introAct: 0,
  };
  run.deck = k.deck.map((id) => instance(run, id));
  run.map = genMap(seed, 1, first);
  return run;
}

export function startAct(run: RunState, act: number): void {
  run.act = act;
  run.at = null;
  run.inRoom = null;
  run.map = genMap(run.seed, act, false);
  run.reward = null;
  run.shop = null;
}

// ——— fights ———

/** How far into the act a room is, for scaling (0-based). */
export const floorOf = (n: RunNode): number => n.row;

export function fightKind(n: RunNode): FightKind {
  return n.type === 'boss' ? 'boss' : n.type === 'elite' ? 'elite' : 'watch';
}

export function battleSetup(run: RunState, node: RunNode): BattleSetup {
  const kind = fightKind(node);
  return {
    seed: node.seed ^ run.seed,
    keeper: run.keeper,
    deck: run.deck.map((c) => ({ ...c })),
    relics: [...run.relics],
    stage: makeStage({ act: run.act, floor: floorOf(node), kind, seed: node.seed ^ run.seed, gentle: run.first && run.act === 1 && node.row === 0 }),
    flame: run.flame,
    maxFlame: run.maxFlame,
  };
}

export function payFor(run: RunState, kind: FightKind, flame: number, timeLeft: number, early: boolean): { mon: number; bonus: number } {
  const p = CONFIG.run.pay;
  const mods = relicMods(run.relics);
  const keeper = KEEPERS[run.keeper];
  let mon = p[kind] + mods.coins + (keeper.passive.k === 'purse' ? keeper.passive.n : 0);
  let bonus = Math.round(flame * p.perFlame);
  if (early) bonus += Math.min(p.early * 2, Math.round((timeLeft / 8) * p.early));
  mon += bonus;
  return { mon, bonus };
}

// ——— cards and relics on offer ———

const RARITY_ORDER: Rarity[] = ['common', 'rare', 'epic', 'legend'];

export function rewardPool(keeper: KeeperId): string[] {
  return Object.values(CARDS)
    .filter((c) => !c.starter && (c.keeper === 'any' || c.keeper === keeper))
    .map((c) => c.id);
}

/** Picks a card id of the rarity (or the nearest below it that has any), the keeper's own cards a little likelier than the neutral ones. */
function pickOfRarity(rng: Rng, keeper: KeeperId, rarity: Rarity, taken: Set<string>): string | null {
  for (let i = RARITY_ORDER.indexOf(rarity); i >= 0; i--) {
    const pool = rewardPool(keeper).filter((id) => CARDS[id].rarity === RARITY_ORDER[i] && !taken.has(id));
    if (pool.length) return rng.weighted(pool, (id) => (CARDS[id].keeper === keeper ? 1.6 : 1));
  }
  return null;
}

export function rollCards(run: RunState, n: number, kind: FightKind): CardInst[] {
  const rng = rngFor(run, 'cards');
  const odds = CONFIG.run.odds[kind];
  const up = CONFIG.run.upChance[kind];
  const taken = new Set<string>();
  const out: CardInst[] = [];
  for (let i = 0; i < n; i++) {
    const rarity = rng.weighted(RARITY_ORDER, (r) => odds[r]);
    const id = pickOfRarity(rng, run.keeper, rarity, taken);
    if (!id) continue;
    taken.add(id);
    out.push(instance(run, id, rng.chance(up)));
  }
  return out.sort((a, b) => RARITY_ORDER.indexOf(card(a.id).rarity) - RARITY_ORDER.indexOf(card(b.id).rarity) || card(a.id).cost - card(b.id).cost);
}

const RELIC_WEIGHTS: Record<RelicDef['rarity'], number> = { common: 6, rare: 3.2, epic: 1.2, legend: 0, boss: 0 };

export function rollRelics(run: RunState, n: number, boss = false): string[] {
  const rng = rngFor(run, 'relics');
  const pool = Object.values(RELICS).filter((r) => !run.relics.includes(r.id) && (boss ? r.rarity === 'boss' : r.rarity !== 'boss'));
  const out: string[] = [];
  const left = [...pool];
  while (out.length < n && left.length) {
    const r = boss ? rng.pick(left) : rng.weighted(left, (x) => RELIC_WEIGHTS[x.rarity]);
    out.push(r.id);
    left.splice(left.indexOf(r), 1);
  }
  return out;
}

export function offerReward(run: RunState, kind: FightKind, flame: number, timeLeft: number, early: boolean): RewardOffer {
  const mods = relicMods(run.relics);
  const pay = payFor(run, kind, flame, timeLeft, early);
  const relics = kind === 'boss' ? rollRelics(run, 3, true) : kind === 'elite' ? rollRelics(run, 1) : [];
  const offer: RewardOffer = {
    kind,
    mon: pay.mon,
    bonus: pay.bonus,
    cards: rollCards(run, CONFIG.run.rewardCards + mods.rewardCards, kind),
    relics,
    taken: false,
  };
  run.reward = offer;
  return offer;
}

// ——— after a fight ———

export function applyBattle(run: RunState, node: RunNode, flame: number, stats: BattleStats): void {
  run.flame = Math.max(0, Math.min(run.maxFlame, Math.ceil(flame)));
  run.fights++;
  run.kills += stats.kills;
  run.leaks += stats.leaks;
  run.visited[node.type] = (run.visited[node.type] ?? 0) + 1;
  run.at = node.id;
  run.inRoom = null;
}

export function takeCard(run: RunState, c: CardInst): void {
  run.deck.push({ ...c });
}

export function takeRelic(run: RunState, id: string): void {
  if (run.relics.includes(id)) return;
  run.relics.push(id);
  const def = RELICS[id];
  if (def.mods?.flame) {
    run.maxFlame += def.mods.flame;
    run.flame += def.mods.flame;
  }
}

export function heal(run: RunState, n: number): number {
  const before = run.flame;
  run.flame = Math.min(run.maxFlame, run.flame + n);
  return run.flame - before;
}

/** After the fight: red lanterns mend, a boss feeds the lantern. */
export function afterFight(run: RunState, kind: FightKind): void {
  for (const id of run.relics) if (RELICS[id]?.hook?.k === 'dawnMend') heal(run, RELICS[id].n);
  if (kind === 'boss') heal(run, Math.ceil(run.maxFlame * CONFIG.run.bossHeal));
}

// ——— rooms ———

export const restHeal = (run: RunState): number => Math.ceil(run.maxFlame * CONFIG.run.restHeal);

export function upgradeCard(run: RunState, uid: number): boolean {
  const c = run.deck.find((x) => x.uid === uid);
  if (!c || c.up) return false;
  c.up = true;
  return true;
}

export const canUpgrade = (run: RunState): boolean => run.deck.some((c) => !c.up);

export function removeCard(run: RunState, uid: number): boolean {
  if (run.deck.length <= CONFIG.run.minDeck) return false;
  const i = run.deck.findIndex((c) => c.uid === uid);
  if (i < 0) return false;
  run.deck.splice(i, 1);
  run.removals++;
  return true;
}

/** Turns a card into another of the same rarity (never the same card). */
export function transformCard(run: RunState, uid: number): CardInst | null {
  const i = run.deck.findIndex((c) => c.uid === uid);
  if (i < 0) return null;
  const old = run.deck[i];
  const def = card(old.id);
  const rng = rngFor(run, 'transform');
  const rarity = def.starter ? 'common' : def.rarity;
  const pool = rewardPool(run.keeper).filter((id) => CARDS[id].rarity === rarity && id !== old.id);
  if (!pool.length) return null;
  const next = instance(run, rng.pick(pool), old.up);
  run.deck[i] = next;
  return next;
}

export function removePrice(run: RunState): number {
  return CONFIG.run.price.remove + run.removals * CONFIG.run.price.removeStep;
}

export function stockShop(run: RunState): ShopStock {
  const rng = rngFor(run, 'shop');
  const spread = (p: number): number => Math.round(p * (1 + (rng.next() * 2 - 1) * CONFIG.run.priceSpread));
  const price = CONFIG.run.price;
  const cards = rollCards(run, 5, 'elite').map((c) => ({ card: c, price: spread(price[card(c.id).rarity]) * (c.up ? 1.5 : 1), sold: false }));
  for (const sc of cards) sc.price = Math.round(sc.price);
  const relics = rollRelics(run, 2).map((id) => ({ id, price: spread(price.relic), sold: false }));
  const stock: ShopStock = { cards, relics, removeCost: removePrice(run), healCost: price.heal, healed: false };
  run.shop = stock;
  return stock;
}

// ——— saving ———

const KEY = 'run';

export function saveRun(run: RunState): void {
  store(KEY, run);
}

export const clearRun = (): void => remove(KEY);

const isNum = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);
const ROOM_TYPES: RoomType[] = ['watch', 'elite', 'boss', 'rest', 'market', 'shrine', 'treasure'];

function validCards(list: unknown): CardInst[] | null {
  if (!Array.isArray(list)) return null;
  const out: CardInst[] = [];
  for (const c of list) {
    if (!c || typeof c !== 'object') return null;
    const { uid, id, up } = c as Record<string, unknown>;
    if (!isNum(uid) || typeof id !== 'string' || !CARDS[id] || typeof up !== 'boolean') return null;
    out.push({ uid, id, up });
  }
  return out;
}

/** A saved run is untrusted: anything wrong and it is dropped (a run of another version is dropped too, never migrated). */
export function loadRun(): RunState | null {
  const raw = loadRaw<Record<string, unknown>>(KEY);
  if (!raw || raw.version !== SAVE_VERSION) return null;
  try {
    const keeper = raw.keeper as KeeperId;
    if (!KEEPERS[keeper]) return null;
    const deck = validCards(raw.deck);
    if (!deck || deck.length < 1) return null;
    if (!Array.isArray(raw.relics) || !raw.relics.every((r) => typeof r === 'string' && RELICS[r])) return null;
    if (!Array.isArray(raw.map) || raw.map.length < 2) return null;
    const map: RunNode[] = [];
    for (const n of raw.map as Record<string, unknown>[]) {
      if (!isNum(n.id) || !isNum(n.row) || !isNum(n.col) || !ROOM_TYPES.includes(n.type as RoomType) || !Array.isArray(n.next) || !isNum(n.seed))
        return null;
      map.push({ id: n.id, row: n.row, col: n.col, type: n.type as RoomType, next: (n.next as unknown[]).filter(isNum), seed: n.seed });
    }
    if (map.some((n, i) => n.id !== i || n.next.some((x) => x < 0 || x >= map.length))) return null;
    const nums = ['seed', 'act', 'flame', 'maxFlame', 'mon', 'counter', 'uid', 'removals', 'fights', 'kills', 'leaks', 'introAct'] as const;
    for (const k of nums) if (!isNum(raw[k])) return null;
    const act = raw.act as number;
    if (act < 1 || act > CONFIG.run.acts) return null;
    const at = raw.at === null ? null : isNum(raw.at) && raw.at >= 0 && raw.at < map.length ? raw.at : undefined;
    if (at === undefined) return null;
    const inRoom = raw.inRoom === null ? null : isNum(raw.inRoom) && raw.inRoom >= 0 && raw.inRoom < map.length ? raw.inRoom : undefined;
    if (inRoom === undefined) return null;
    const visited: Record<string, number> = {};
    for (const [k, v] of Object.entries((raw.visited ?? {}) as Record<string, unknown>)) if (isNum(v)) visited[k] = v;
    const reward = validReward(raw.reward);
    const shop = validShop(raw.shop);
    return {
      version: SAVE_VERSION,
      seed: raw.seed as number,
      keeper,
      act,
      map,
      at,
      inRoom,
      deck,
      relics: raw.relics as string[],
      flame: Math.max(1, Math.min(raw.flame as number, raw.maxFlame as number)),
      maxFlame: raw.maxFlame as number,
      mon: Math.max(0, raw.mon as number),
      counter: raw.counter as number,
      uid: raw.uid as number,
      removals: raw.removals as number,
      fights: raw.fights as number,
      kills: raw.kills as number,
      leaks: raw.leaks as number,
      visited,
      reward,
      shop,
      first: raw.first === true,
      introAct: raw.introAct as number,
    };
  } catch {
    return null;
  }
}

function validReward(r: unknown): RewardOffer | null {
  if (!r || typeof r !== 'object') return null;
  const o = r as Record<string, unknown>;
  const cards = validCards(o.cards);
  if (!cards || !isNum(o.mon) || !isNum(o.bonus) || !Array.isArray(o.relics) || !o.relics.every((x) => typeof x === 'string' && RELICS[x]))
    return null;
  if (o.kind !== 'watch' && o.kind !== 'elite' && o.kind !== 'boss') return null;
  return { kind: o.kind, mon: o.mon, bonus: o.bonus, cards, relics: o.relics as string[], taken: o.taken === true };
}

function validShop(s: unknown): ShopStock | null {
  if (!s || typeof s !== 'object') return null;
  const o = s as Record<string, unknown>;
  if (!Array.isArray(o.cards) || !Array.isArray(o.relics) || !isNum(o.removeCost) || !isNum(o.healCost)) return null;
  const cards: ShopCard[] = [];
  for (const e of o.cards as Record<string, unknown>[]) {
    const c = validCards([e.card]);
    if (!c || !isNum(e.price)) return null;
    cards.push({ card: c[0], price: e.price, sold: e.sold === true });
  }
  const relics: ShopRelic[] = [];
  for (const e of o.relics as Record<string, unknown>[]) {
    if (typeof e.id !== 'string' || !RELICS[e.id] || !isNum(e.price)) return null;
    relics.push({ id: e.id, price: e.price, sold: e.sold === true });
  }
  return { cards, relics, removeCost: o.removeCost, healCost: o.healCost, healed: o.healed === true };
}
