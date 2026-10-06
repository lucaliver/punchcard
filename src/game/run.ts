import { Rng } from '../core/rng';
import { loadRaw, remove, store } from '../core/save';
import { nextUid, peekUid, resetUid } from '../core/util';
import { CARD_LIST, CARDS, RARITY_ORDER, cardCostOf, cardKeywordsOf, rewardPool } from '../data/cards';
import { PERKS } from '../data/perks';
import { RELIC_LIST, RELICS, relicSum } from '../data/relics';
import { ACT_DEFS, actDef } from '../data/acts';
import { CONFIG, type RewardKind, relicGuarantee, relicOdds, rewardGuarantee, rewardOdds, rewardUpgradeChance } from '../data/config';
import { MODIFIERS, resolveMods } from '../data/modifiers';
import { ENEMIES, enemiesFor } from '../data/enemies';
import { HERO_LIST, HEROES, starterCards } from '../data/heroes';
import type { Combat, CombatSetup } from './combat';
import { discover, heroHidden, logRun, progress, type RunRecord, recordFight, recordRun, seeRelics, stampAct } from './meta';
import type { CardDef, CardInst, EnemyDef, HeroId, RelicDef, RunLog } from './types';

export const NODE_TYPES = ['fight', 'elite', 'rest', 'promotion', 'copy', 'tailor', 'lostFound', 'vending', 'crossTraining', 'boss'] as const;
export type NodeType = (typeof NODE_TYPES)[number];

/** A room of a lane as written in `LANES`: a real room type or a slot still to be dealt. */
type Slot = NodeType | 'special';

/** One step of the run. `next` holds the reachable node ids (the player picks one when there are two). */
export interface RunNode {
  id: number;
  act: number;
  floor: number;
  /** Column on the map: 0 left, 1 right, 0.5 for a floor with a single node. */
  lane: number;
  type: NodeType;
  next: number[];
  /** Enemy picked when the run is generated, so reloading can't reroll it. */
  enemy?: string;
}

export interface RunStats {
  kills: number;
  elites: number;
  cardsPlayed: number;
  damageTaken: number;
  /** Seconds spent in fights (the run's play time). */
  time: number;
}

/** Shape of the saved run; a save of another version is dropped. */
const SAVE_VERSION = 6;

export interface RunState {
  version: number;
  seed: number;
  rng: number;
  hero: HeroId;
  hp: number;
  maxHp: number;
  deck: CardInst[];
  relics: string[];
  relicFlags: Record<string, number>;
  nodes: RunNode[];
  /** Node the player is on (or about to enter). */
  current: number;
  /** Nodes entered so far, in order (the path drawn on the map). */
  path: number[];
  /** Card rewards skipped for max HP so far: each one raises the next skip's pay. */
  skips: number;
  /** True once the current node has been completed. */
  cleared: boolean;
  stats: RunStats;
  /** Pay earned so far: the run's score (fast wins pay more). */
  money: number;
  uid: number;
  /** Management memos active for this run (`MODIFIERS` ids). */
  mods: string[];
  /** The card reward on offer after a fight, until it is taken or skipped: kept in the save so closing the game on that screen doesn't lose it. */
  reward?: { id: string; up: boolean }[];
}

const SAVE_KEY = 'run';
/**
 * Floors between the first fight and the boss, one list per lane. Lanes are dealt to a random side, and a few
 * floors swap their two nodes, so each run's map differs while both lanes keep a fair mix. The last floor never swaps: both
 * lanes end on a rest before the boss.
 */
const LANES: Slot[][] = [
  ['fight', 'special', 'rest', 'fight', 'elite', 'special', 'fight', 'rest'],
  ['promotion', 'fight', 'special', 'fight', 'rest', 'special', 'fight', 'rest'],
];
/** A `special` slot of a lane becomes one of these when the act is built; one act never deals the same room twice. */
export const SPECIALS: NodeType[] = ['copy', 'tailor', 'lostFound', 'vending', 'crossTraining'];
/** Rooms that show up once in a whole run, however many acts it has. */
const ONCE_PER_RUN: NodeType[] = ['tailor'];
/** Floors on a single road at the start of act 1, before the map splits in two (then the lanes skip as many floors). */
const ACT1_OPENING = 3;
/** Links between the lanes per act: diagonal (to the other lane one floor up) or flat (across the same floor, both ways). */
const LINKS = 2;
/** Times an act's layout is dealt again looking for one with no two equal choices. */
const MAX_DEALS = 200;
export const ACTS = ACT_DEFS.length;

/** Seed of the very first run: its map is always the same, with the enemies in order of difficulty. */
export const FIRST_RUN_SEED = 1;
/** Acts whose rooms are fixed the first time a player meets them (see `ACT_SCRIPTS`). */
export const SCRIPTED_ACTS = [1, 2, 3];

/** A room of an act laid out by hand: its floor and column, what it holds and the rooms it leads to (indexes in the act's list). */
interface ScriptNode {
  floor: number;
  lane: 0 | 0.5 | 1;
  type: NodeType;
  /** The enemy of a fight, an elite or a boss. */
  enemy?: string;
  next: number[];
}

/** An act laid out by hand, floor by floor (the first room opens it, the last one is its boss); built by `addScripted`. Rooms and roads are exactly these. */
const ACT_SCRIPTS: Record<number, ScriptNode[]> = {
  // Act 1, the very first run: the orientation video, a snitch, a gift (so the map isn't only jobs), then two lanes with a rest on each side.
  1: [
    /* 0 */ { floor: 1, lane: 0.5, type: 'fight', enemy: 'hrOrientationVideo', next: [1] },
    /* 1 */ { floor: 2, lane: 0.5, type: 'fight', enemy: 'snitch', next: [2] },
    /* 2 */ { floor: 3, lane: 0.5, type: 'lostFound', next: [3, 4] },
    /* 3 */ { floor: 4, lane: 0, type: 'fight', enemy: 'newHire', next: [5] },
    /* 4 */ { floor: 4, lane: 1, type: 'rest', next: [6] },
    /* 5 */ { floor: 5, lane: 0, type: 'rest', next: [7] },
    /* 6 */ { floor: 5, lane: 1, type: 'fight', enemy: 'sickCoworker', next: [8] },
    /* 7 */ { floor: 6, lane: 0, type: 'elite', enemy: 'securityMonitor', next: [9, 10] },
    /* 8 */ { floor: 6, lane: 1, type: 'copy', next: [10, 9] },
    /* 9 */ { floor: 7, lane: 0, type: 'promotion', next: [11] },
    /* 10 */ { floor: 7, lane: 1, type: 'fight', enemy: 'goblinConsultant', next: [12] },
    /* 11 */ { floor: 8, lane: 0, type: 'rest', next: [13] },
    /* 12 */ { floor: 8, lane: 1, type: 'rest', next: [13] },
    /* 13 */ { floor: 9, lane: 0.5, type: 'lostFound', next: [14] },
    /* 14 */ { floor: 10, lane: 0.5, type: 'boss', enemy: 'slavesCeo', next: [] },
  ],
  // Act 2, the first time it is reached: a rule-breaker opens it, every room kind shows once, and the Tailor is on offer.
  2: [
    /* 0 */ { floor: 1, lane: 0.5, type: 'fight', enemy: 'exaggeratedGirl', next: [1, 2] },
    /* 1 */ { floor: 2, lane: 0, type: 'fight', enemy: 'nightJanitor', next: [3] },
    /* 2 */ { floor: 2, lane: 1, type: 'promotion', next: [4] },
    /* 3 */ { floor: 3, lane: 0, type: 'vending', next: [5, 4] },
    /* 4 */ { floor: 3, lane: 1, type: 'fight', enemy: 'powerSocket', next: [6] },
    /* 5 */ { floor: 4, lane: 0, type: 'rest', next: [7] },
    /* 6 */ { floor: 4, lane: 1, type: 'copy', next: [8] },
    /* 7 */ { floor: 5, lane: 0, type: 'fight', enemy: 'changeManager', next: [9] },
    /* 8 */ { floor: 5, lane: 1, type: 'rest', next: [10] },
    /* 9 */ { floor: 6, lane: 0, type: 'elite', enemy: 'theNerd', next: [11] },
    /* 10 */ { floor: 6, lane: 1, type: 'elite', enemy: 'theNerd', next: [12, 11] },
    /* 11 */ { floor: 7, lane: 0, type: 'tailor', next: [13] },
    /* 12 */ { floor: 7, lane: 1, type: 'crossTraining', next: [14] },
    /* 13 */ { floor: 8, lane: 0, type: 'fight', enemy: 'beanCounter', next: [15] },
    /* 14 */ { floor: 8, lane: 1, type: 'fight', enemy: 'beanCounter', next: [16] },
    /* 15 */ { floor: 9, lane: 0, type: 'rest', next: [17] },
    /* 16 */ { floor: 9, lane: 1, type: 'rest', next: [17] },
    /* 17 */ { floor: 10, lane: 0.5, type: 'boss', enemy: 'micromanager', next: [] },
  ],
  // Act 3, the first time it is reached: the night shift's rules open it (the siren) and the Tailor stays away.
  3: [
    /* 0 */ { floor: 1, lane: 0.5, type: 'fight', enemy: 'factorySiren', next: [1, 2] },
    /* 1 */ { floor: 2, lane: 0, type: 'lostFound', next: [3] },
    /* 2 */ { floor: 2, lane: 1, type: 'promotion', next: [4] },
    /* 3 */ { floor: 3, lane: 0, type: 'fight', enemy: 'vipClient', next: [5] },
    /* 4 */ { floor: 3, lane: 1, type: 'fight', enemy: 'lineLead', next: [6] },
    /* 5 */ { floor: 4, lane: 0, type: 'rest', next: [7] },
    /* 6 */ { floor: 4, lane: 1, type: 'rest', next: [8] },
    /* 7 */ { floor: 5, lane: 0, type: 'fight', enemy: 'smokeDetector', next: [9] },
    /* 8 */ { floor: 5, lane: 1, type: 'fight', enemy: 'microwave', next: [10, 9] },
    /* 9 */ { floor: 6, lane: 0, type: 'elite', enemy: 'tourist', next: [11] },
    /* 10 */ { floor: 6, lane: 1, type: 'copy', next: [12] },
    /* 11 */ { floor: 7, lane: 0, type: 'lostFound', next: [13] },
    /* 12 */ { floor: 7, lane: 1, type: 'vending', next: [14] },
    /* 13 */ { floor: 8, lane: 0, type: 'fight', enemy: 'helpdeskChatbot', next: [15, 14] },
    /* 14 */ { floor: 8, lane: 1, type: 'elite', enemy: 'conveyorSis', next: [16, 13] },
    /* 15 */ { floor: 9, lane: 0, type: 'rest', next: [17] },
    /* 16 */ { floor: 9, lane: 1, type: 'rest', next: [17] },
    /* 17 */ { floor: 10, lane: 0.5, type: 'boss', enemy: 'theBoard', next: [] },
  ],
};

/**
 * A new run; the acts in `scripted` have the rooms and enemies of `ACT_SCRIPTS` instead of shuffled ones (the first run's act 1, and every other act the
 * first time it is met), the rest are dealt as usual. `mods` are the memos it plays under.
 */
export function newRun(hero: HeroId, seed: number, scripted: readonly number[] = [], mods: string[] = []): RunState {
  resetUid(0);
  const rng = new Rng(seed);
  const def = HEROES[hero];
  const nodes = buildNodes(rng, scripted);
  discover(def.startDeck);
  const maxHp = Math.round(def.hp * resolveMods(mods).heroHp);
  return {
    version: SAVE_VERSION,
    seed,
    rng: rng.state,
    hero,
    hp: maxHp,
    maxHp,
    deck: starterCards(def).map((c) => ({ uid: nextUid(), ...c })),
    relics: def.starterRelic ? [def.starterRelic] : [],
    relicFlags: {},
    nodes,
    current: 0,
    path: [0],
    cleared: false,
    stats: { kills: 0, elites: 0, cardsPlayed: 0, damageTaken: 0, time: 0 },
    money: 0,
    skips: 0,
    uid: peekUid(),
    mods,
  };
}

/** A room of a lane: its floor (row) and side. */
type Cell = [row: number, side: number];
/** A one-way road between two rooms of the lanes. */
type Road = [from: Cell, to: Cell];

/**
 * The lanes of an act and the roads between their rooms: both lanes' floors, a few one-way links between the lanes, and now and then a cut road.
 * Dealt again until no room offers two choices of the same kind (a special slot is always a different room from any other).
 */
function dealLayout(rng: Rng, opening: number): { lanes: Slot[][]; roads: Road[] } {
  const deal = (): { lanes: Slot[][]; roads: Road[] } => {
    const lanes = rng.shuffle(LANES.map((l) => l.slice(opening - 1)));
    for (let i = 0; i < lanes[0].length - 1; i++) if (rng.next() < CONFIG.laneSwap) [lanes[0][i], lanes[1][i]] = [lanes[1][i], lanes[0][i]];
    const n = lanes[0].length;
    const roads: Road[] = [];
    for (let i = 1; i < n; i++)
      for (const side of [0, 1])
        roads.push([
          [i - 1, side],
          [i, side],
        ]);
    // A few one-way links between the lanes, never on neighbouring floors, so no two lines ever cross or touch.
    const floors: number[] = [];
    for (const i of rng.shuffle([...Array(n - 1).keys()])) if (floors.length < LINKS && floors.every((f) => Math.abs(f - i) > 1)) floors.push(i);
    for (const i of floors) {
      const side = rng.next() < 0.5 ? 0 : 1;
      if (rng.next() < 0.5)
        roads.push([
          [i, side],
          [i + 1, 1 - side],
        ]);
      else {
        // Flat: across the floor either way (a node already visited can't be entered again).
        roads.push(
          [
            [i, side],
            [i, 1 - side],
          ],
          [
            [i, 1 - side],
            [i, side],
          ],
        );
      }
    }
    // Now and then one road between two floors is cut: its lane is crossed over, down the other lane and back (the long way round).
    // Both crossings are one-way, so no room is ever a dead end.
    if (rng.next() < CONFIG.roadCut) {
      const i = rng.shuffle([...Array(n - 1).keys()]).find((f) => floors.every((l) => Math.abs(l - f) > 1));
      if (i !== undefined) {
        const side = rng.next() < 0.5 ? 0 : 1;
        const cut = roads.findIndex(([f, t]) => f[0] === i && f[1] === side && t[0] === i + 1 && t[1] === side);
        roads.splice(cut, 1);
        roads.push(
          [
            [i, side],
            [i, 1 - side],
          ],
          [
            [i + 1, 1 - side],
            [i + 1, side],
          ],
        );
      }
    }
    return { lanes, roads };
  };
  const clashes = ({ lanes, roads }: { lanes: Slot[][]; roads: Road[] }): boolean => {
    const same = (a: Cell, b: Cell): boolean => lanes[a[1]][a[0]] === lanes[b[1]][b[0]] && lanes[a[1]][a[0]] !== 'special';
    if (same([0, 0], [0, 1])) return true;
    return roads.some(([from, to], i) => roads.some(([f2, t2], j) => j > i && f2[0] === from[0] && f2[1] === from[1] && same(to, t2)));
  };
  let layout = deal();
  for (let tries = 0; tries < MAX_DEALS && clashes(layout); tries++) layout = deal();
  return layout;
}

/**
 * One act appended to `nodes`: a shared road (one fight; three floors in act 1), two lanes linked a couple of times, and the
 * boss where they meet. `last` are the nodes of the act before (they lead to its first fight). Returns the boss.
 */
function addAct(nodes: RunNode[], rng: Rng, act: number, last: RunNode[], taken: readonly NodeType[] = []): RunNode[] {
  // `taken`: once-per-run rooms a scripted act of this run already holds.
  const dealt = new Set([...nodes.map((n) => n.type), ...taken]);
  // Deal normal enemies from a shuffled bag so the same one doesn't repeat back to back.
  let bag: EnemyDef[] = [];
  let specials: NodeType[] = [];
  const add = (floor: number, lane: number, slot: Slot): RunNode => {
    if (slot === 'special' && !specials.length) specials = rng.shuffle(SPECIALS.filter((s) => !(ONCE_PER_RUN.includes(s) && dealt.has(s))));
    const type = slot === 'special' ? specials.pop()! : slot;
    dealt.add(type);
    let enemy: string | undefined;
    if (type === 'fight') {
      if (!bag.length) bag = rng.shuffle(enemiesFor(act, 'normal'));
      // Act 2 opens on a rule-breaker (the bag is fresh here, so one is always in it).
      const opener = act === 2 && floor === 1 ? bag.findIndex((e) => e.ruleBreaker) : -1;
      enemy = (opener >= 0 ? bag.splice(opener, 1)[0] : bag.pop()!).id;
    } else if (type === 'elite' || type === 'boss') {
      enemy = rng.pick(enemiesFor(act, type)).id;
    }
    const node: RunNode = { id: nodes.length, act, floor, lane, type, next: [], enemy };
    nodes.push(node);
    return node;
  };
  const opening = act === 1 ? ACT1_OPENING : 1;
  const { lanes, roads } = dealLayout(rng, opening);

  // The shared road: one fight per floor, then the two lanes.
  let road = add(1, 0.5, 'fight');
  for (const n of last) n.next.push(road.id);
  for (let f = 2; f <= opening; f++) {
    const n = add(f, 0.5, 'fight');
    road.next.push(n.id);
    road = n;
  }
  const rows = lanes[0].map((_, i) => [add(i + opening + 1, 0, lanes[0][i]), add(i + opening + 1, 1, lanes[1][i])]);
  road.next.push(rows[0][0].id, rows[0][1].id);
  for (const [[fr, fs], [tr, ts]] of roads) rows[fr][fs].next.push(rows[tr][ts].id);
  const boss = add(lanes[0].length + opening + 1, 0.5, 'boss');
  for (const n of rows[rows.length - 1]) n.next.push(boss.id);
  return [boss];
}

/** An act laid out by hand (`ACT_SCRIPTS`) appended to `nodes`: `last` lead to its first room. Returns its boss. */
function addScripted(nodes: RunNode[], act: number, last: RunNode[]): RunNode[] {
  const script = ACT_SCRIPTS[act];
  const made = script.map(({ floor, lane, type, enemy }, i): RunNode => ({ id: nodes.length + i, act, floor, lane, type, next: [], enemy }));
  for (const [i, s] of script.entries()) made[i].next = s.next.map((j) => made[j].id);
  nodes.push(...made);
  for (const n of last) n.next.push(made[0].id);
  return [made[made.length - 1]];
}

function buildNodes(rng: Rng, scripted: readonly number[]): RunNode[] {
  const nodes: RunNode[] = [];
  let last: RunNode[] = [];
  const taken = ONCE_PER_RUN.filter((type) => scripted.some((act) => ACT_SCRIPTS[act].some((n) => n.type === type)));
  for (let act = 1; act <= ACTS; act++) last = scripted.includes(act) ? addScripted(nodes, act, last) : addAct(nodes, rng, act, last, taken);
  return nodes;
}

export const currentNode = (run: RunState): RunNode => run.nodes[run.current];

/** The act the map shows: right after an act boss has fallen it already turns to the next act. */
export function mapAct(run: RunState): number {
  const cur = currentNode(run);
  const next = run.cleared ? cur.next.find((id) => !run.path.includes(id)) : undefined;
  return next === undefined ? cur.act : run.nodes[next].act;
}

/** Workday clock (minutes after midnight) when a node's floor starts: the floors share the act's shift evenly, so the
 * shift ends as its boss floor does. */
export function clockAt(run: RunState, node: RunNode): number {
  const floors = run.nodes.filter((n) => n.act === node.act).map((n) => n.floor);
  const first = Math.min(...floors);
  const count = Math.max(...floors) - first + 1;
  const [from, to] = actDef(node.act).shift;
  return Math.round((from + ((to - from) * (node.floor - first)) / count) * 60);
}
export const totalFloors = (run: RunState): number => Math.max(...run.nodes.map((n) => n.floor));

function rngOf(run: RunState): Rng {
  return new Rng(run.rng);
}

/** Enemy scaling: normal enemies get tougher as the act goes on, and every enemy under the run's memos. */
export function enemyScale(node: RunNode, mods: string[] = []): { hp: number; dmg: number } {
  const f = node.type === 'fight' ? node.floor - 1 : 0;
  const m = resolveMods(mods);
  return { hp: (1 + CONFIG.floorHp * f) * CONFIG.enemyHp * m.enemyHp, dmg: (1 + CONFIG.floorDmg * f) * CONFIG.enemyDmg * m.enemyDmg };
}

export function combatSetup(run: RunState): CombatSetup {
  const node = currentNode(run);
  const rng = rngOf(run);
  const seed = (rng.next() * 2 ** 32) >>> 0;
  run.rng = rng.state;
  return {
    hero: HEROES[run.hero],
    hp: run.hp,
    maxHp: run.maxHp,
    deck: run.deck.map((c) => ({ ...c })),
    relics: run.relics,
    relicFlags: run.relicFlags,
    enemy: ENEMIES[node.enemy!],
    scale: enemyScale(node, run.mods),
    beltMul: resolveMods(run.mods).beltMul,
    canBeg: true,
    seed,
  };
}

/** Pay for beating an enemy of this tier in `seconds`: the base, plus a bonus for every second under par. */
export function fightPay(tier: EnemyDef['tier'], seconds: number): number {
  const p = CONFIG.pay;
  return p[tier] + Math.max(0, Math.round(p.par - seconds)) * p.perSecond;
}

/** Copies the combat outcome back into the run. */
export function applyCombat(run: RunState, combat: Combat): void {
  // Max HP gained in the fight (It's-a Me) is only for the fight: HP never stays above the run's max.
  const hp = Math.min(Math.max(0, combat.hero.hp), run.maxHp);
  run.stats.damageTaken += Math.max(0, run.hp - hp);
  run.hp = hp;
  run.stats.cardsPlayed += combat.cardsPlayed;
  run.stats.time += combat.time;
  const node = currentNode(run);
  recordFight({
    tier: combat.enemy.def.tier,
    won: combat.result === 'win',
    seconds: combat.time,
    cards: combat.cardsPlayed,
  });
  if (combat.consumed.length) run.deck = run.deck.filter((c) => !combat.consumed.includes(c.uid));
  if (combat.result === 'win') {
    run.stats.kills++;
    if (combat.enemy.def.tier === 'elite') run.stats.elites++;
    run.money += fightPay(combat.enemy.def.tier, combat.time);
    if (node.type === 'boss') stampAct(run.hero, node.act);
  }
  run.cleared = true;
}

/** Distinct reward cards for the current node (the player swaps one into the deck). */
export const REWARD_CHOICES = 4;
export const rewardChoices = (run: RunState): number =>
  Math.max(1, REWARD_CHOICES + resolveMods(run.mods).rewardCards + relicSum(run.relics, 'rewardCards'));

/** A card on offer: one of the offered cards may come already upgraded. */
export interface RewardOffer {
  def: CardDef;
  up: boolean;
}

/** One card of a reward pool: the hero's own class weighs `CONFIG.classCardWeight` against a neutral card. */
const pickReward = (rng: Rng, hero: HeroId, pool: CardDef[]): CardDef => rng.weighted(pool, (c) => (c.cls === hero ? CONFIG.classCardWeight : 1));

export function rollRewards(run: RunState, kind: RewardKind): RewardOffer[] {
  const rng = rngOf(run);
  const picks: CardDef[] = [];
  const act = currentNode(run).act;
  const odds = rewardOdds(kind, act);
  const { rarity: floor, count } = rewardGuarantee(kind, act);
  // The first cards dealt follow the odds of the guaranteed rarity and above.
  const atLeast = odds.filter(([r]) => RARITY_ORDER.indexOf(r) >= RARITY_ORDER.indexOf(floor));
  for (let tries = 0; picks.length < rewardChoices(run) && tries < 80; tries++) {
    const rarity = rng.weighted(picks.length < count ? atLeast : odds, ([, w]) => w)[0];
    const pool = rewardPool(run.hero, rarity).filter((c) => !picks.includes(c));
    if (pool.length) picks.push(pickReward(rng, run.hero, pool));
  }
  const upgraded = picks.length && rng.next() < rewardUpgradeChance(currentNode(run).act) ? rng.int(0, picks.length - 1) : -1;
  run.rng = rng.state;
  discover(picks.map((p) => p.id));
  return byRarity(picks.map((def, i) => ({ def, up: i === upgraded })));
}

/** Offers always come in rising rarity, then rising cost (a stable sort: the dealt order breaks ties). */
const byRarity = (offers: RewardOffer[]): RewardOffer[] => {
  const cost = (o: RewardOffer): number => cardCostOf({ uid: 0, id: o.def.id, up: o.up });
  return offers.sort((a, b) => RARITY_ORDER.indexOf(a.def.rarity) - RARITY_ORDER.indexOf(b.def.rarity) || cost(a) - cost(b));
};

/** Elites and act bosses add a card to the deck; a normal fight swaps one. */
export const rewardAdds = (kind: RewardKind): boolean => kind !== 'fight';

/** The kind of reward the room the player is in pays. */
export const rewardKindOf = (run: RunState): RewardKind => {
  const { type } = currentNode(run);
  return type === 'boss' ? 'boss' : type === 'elite' ? 'elite' : 'fight';
};

/** Remembers the offers shown to the player (see `RunState.reward`). */
export function offerReward(run: RunState, picks: RewardOffer[]): void {
  run.reward = picks.map((p) => ({ id: p.def.id, up: p.up }));
}

/** The offers of a reward the player left unanswered, if any. */
export const pendingReward = (run: RunState): RewardOffer[] | undefined => run.reward?.map(({ id, up }) => ({ def: CARDS[id], up }));

function newCard(run: RunState, id: string): CardInst {
  resetUid(run.uid);
  const card = { uid: nextUid(), id, up: false };
  run.uid = peekUid();
  return card;
}

/** Skipping a card reward pays max HP (so passing on a weak offer still pays), a little more every time. */
export const skipPay = (run: RunState): number => CONFIG.skipMaxHp + CONFIG.skipMaxHpStep * run.skips;

/** Skipping also pays one more card, dealt like the offer's (same kind and act odds) but never one of the cards just shown. */
export function skipReward(run: RunState, kind: RewardKind, shown: string[]): CardInst | null {
  const pay = skipPay(run);
  run.maxHp += pay;
  run.hp += pay;
  run.skips++;
  const rng = rngOf(run);
  const odds = rewardOdds(kind, currentNode(run).act);
  let def: CardDef | null = null;
  for (let tries = 0; !def && tries < 80; tries++) {
    const pool = rewardPool(run.hero, rng.weighted(odds, ([, w]) => w)[0]).filter((c) => !shown.includes(c.id));
    if (pool.length) def = pickReward(rng, run.hero, pool);
  }
  run.rng = rng.state;
  if (!def) return null;
  discover([def.id]);
  const card = newCard(run, def.id);
  run.deck.push(card);
  return card;
}

/** Debug: adds a copy of a card to the deck. */
export function addCard(run: RunState, id: string): void {
  run.deck.push(newCard(run, id));
}

/** The new card replaces one already in the deck (a reward). */
export function swapCard(run: RunState, removeUid: number, id: string, up = false): void {
  const idx = run.deck.findIndex((c) => c.uid === removeUid);
  if (idx >= 0) run.deck[idx] = { ...newCard(run, id), up };
}

export function upgradeCard(run: RunState, uid: number): void {
  const card = run.deck.find((c) => c.uid === uid);
  if (card) card.up = true;
}

/** Curses and special cards (generated in a fight) are never upgraded or perked. */
const fixed = (card: CardInst): boolean => CARDS[card.id].cls === 'curse' || CARDS[card.id].rarity === 'special';

export const canUpgrade = (card: CardInst): boolean => !card.up && !fixed(card);

/** A perk fits a card when it would change something: a keyword it lacks, or a cost it can still lose. */
export function canPerk(card: CardInst, perk: string): boolean {
  const p = PERKS[perk];
  if (card.perks?.includes(perk) || fixed(card)) return false;
  if (p.keywords?.every((k) => cardKeywordsOf(card).includes(k))) return false;
  if (p.costDelta && cardCostOf(card) <= (CARDS[card.id].minCost ?? 0)) return false;
  return true;
}

export function addPerk(run: RunState, uid: number, perk: string): void {
  const card = run.deck.find((c) => c.uid === uid);
  if (card) card.perks = [...(card.perks ?? []), perk];
  run.cleared = true;
}

export const hasRelic = (run: RunState, id: string): boolean => run.relics.includes(id);

/** The run takes a relic (once each). */
export function gainRelic(run: RunState, id: string): void {
  if (!hasRelic(run, id)) {
    run.relics.push(id);
    RELICS[id].onGain?.(run);
  }
  seeRelics([id]);
  run.cleared = true;
}

/**
 * The relics the Lost & Found offers: ones the run doesn't hold yet, each dealt from the act's rarity odds. The first is at least
 * the act's guaranteed rarity, and no two share a rarity while the pool allows it.
 */
export function rollRelics(run: RunState): string[] {
  const rng = rngOf(run);
  const act = currentNode(run).act;
  const floor = RARITY_ORDER.indexOf(relicGuarantee(act));
  let left = RELIC_LIST.filter((r) => r.rarity !== 'special' && !hasRelic(run, r.id));
  const picks: RelicDef[] = [];
  while (picks.length < CONFIG.lostFoundChoices && left.length) {
    const fresh = (r: RelicDef): boolean => !picks.some((p) => p.rarity === r.rarity);
    const high = (r: RelicDef): boolean => RARITY_ORDER.indexOf(r.rarity) >= floor;
    // Each rule gives way when it would leave nothing to pick from.
    const rules = picks.length ? [fresh] : [high];
    const pool = rules.reduce((from, rule) => (from.some(rule) ? from.filter(rule) : from), left);
    const odds = relicOdds(act).filter(([rarity]) => pool.some((r) => r.rarity === rarity));
    const rarity = odds.length ? rng.weighted(odds, ([, w]) => w)[0] : undefined;
    const choice = rng.pick(rarity ? pool.filter((r) => r.rarity === rarity) : pool);
    picks.push(choice);
    left = left.filter((r) => r !== choice);
  }
  run.rng = rng.state;
  const ids = picks.sort((a, b) => RARITY_ORDER.indexOf(a.rarity) - RARITY_ORDER.indexOf(b.rarity)).map((r) => r.id);
  seeRelics(ids);
  return ids;
}

/** Vending Machine: what a snack costs in HP, by the rarity of the card that drops. */
export const vendingCost = (rarity: keyof typeof CONFIG.vendingHp): number => CONFIG.vendingHp[rarity];
export const canVend = (run: RunState, rarity: keyof typeof CONFIG.vendingHp): boolean => run.hp > vendingCost(rarity);

/** A random card of this rarity drops into the deck, for HP. Returns it. */
export function vend(run: RunState, rarity: keyof typeof CONFIG.vendingHp): CardInst {
  const rng = rngOf(run);
  const def = pickReward(rng, run.hero, rewardPool(run.hero, rarity));
  run.rng = rng.state;
  run.hp -= vendingCost(rarity);
  discover([def.id]);
  const card = newCard(run, def.id);
  run.deck.push(card);
  run.cleared = true;
  return card;
}

/** Cross-Training: `crossTrainPerClass` cards from each class but the hero's own, to take one of (rarities as after a normal fight of the act). */
export function rollCrossTraining(run: RunState): CardDef[] {
  const rng = rngOf(run);
  const odds = rewardOdds('fight', currentNode(run).act);
  const offer: CardDef[] = [];
  for (const hero of HERO_LIST) {
    if (hero.id === run.hero || heroHidden(hero.id)) continue;
    const own: CardDef[] = [];
    for (let tries = 0; own.length < CONFIG.crossTrainPerClass && tries < 80; tries++) {
      const rarity = rng.weighted(odds, ([, w]) => w)[0];
      const pool = CARD_LIST.filter((c) => c.cls === hero.id && c.rarity === rarity && !c.pack && !c.starterOnly && !own.includes(c));
      if (pool.length) own.push(rng.pick(pool));
    }
    offer.push(...own);
  }
  run.rng = rng.state;
  discover(offer.map((c) => c.id));
  return offer;
}

/** The hero takes one of the Cross-Training cards into the deck. Returns it. */
export function crossTrain(run: RunState, id: string): CardInst {
  const card = newCard(run, id);
  run.deck.push(card);
  run.cleared = true;
  return card;
}

/** Tailor: the uniform is let out, for good: more max HP, filled up. */
export function tailorVest(run: RunState): void {
  run.maxHp += CONFIG.tailorMaxHp;
  run.hp += CONFIG.tailorMaxHp;
  run.cleared = true;
}

export const canShred = (run: RunState): boolean => run.deck.length > CONFIG.shredMinDeck;
export const canCopy = (run: RunState): boolean => run.hp > CONFIG.copyHpCost;

export function shredCard(run: RunState, uid: number): void {
  run.deck = run.deck.filter((c) => c.uid !== uid);
  run.cleared = true;
}

/** A second copy of a deck card, upgrade and perks included, for some HP. */
export function photocopyCard(run: RunState, uid: number): void {
  const src = run.deck.find((c) => c.uid === uid);
  if (!src) return;
  const copy = newCard(run, src.id);
  copy.up = src.up;
  if (src.perks) copy.perks = [...src.perks];
  run.deck.push(copy);
  run.hp -= CONFIG.copyHpCost;
  run.cleared = true;
}

/** A new shift starts rested: heals fully as the next act's map opens. Returns the HP gained. */
export function startShift(run: RunState): number {
  const gained = run.maxHp - run.hp;
  run.hp = run.maxHp;
  return gained;
}

/** HP a Break Room rest would heal now. */
export const restHeal = (run: RunState): number => {
  const missing = run.maxHp - run.hp;
  return Math.round(missing * CONFIG.restHeal * resolveMods(run.mods).restHeal);
};

export function rest(run: RunState): number {
  const amount = restHeal(run);
  run.hp += amount;
  run.cleared = true;
  return amount;
}

/** Moves to a node reachable from the current one (the first by default). Returns false when the run is complete. */
export function advance(run: RunState, to?: number): boolean {
  const next = currentNode(run).next;
  const target = to ?? next.find((id) => !run.path.includes(id));
  if (target === undefined || !next.includes(target) || run.path.includes(target)) return false;
  run.current = target;
  run.path.push(target);
  run.cleared = false;
  const node = currentNode(run);
  if (node.type === 'boss') progress((u) => 'reachBoss' in u && u.reachBoss <= node.act);
  return true;
}

/** What the end of a run brought: the heroes it unlocked (the next hires) and the one-run records it beat. */
export interface RunEnd {
  hired: HeroId[];
  beaten: RunRecord[];
}

/** The history line of a run that ends now. */
const runLog = (run: RunState, result: RunLog['result']): RunLog => {
  const node = currentNode(run);
  return {
    hero: run.hero,
    result,
    act: node.act,
    floor: node.floor,
    kills: run.stats.kills,
    cards: run.stats.cardsPlayed,
    pay: run.money,
    elites: run.stats.elites,
    damageTaken: run.stats.damageTaken,
    memos: run.mods.length,
    deck: run.deck.map(({ id, up, perks }) => (perks?.length ? { id, up, perks } : { id, up })),
    relics: [...run.relics],
    at: Date.now(),
  };
};

/** The run is thrown away: it only goes in the history. */
export function abandonRun(run: RunState): void {
  logRun(runLog(run, 'abandon'));
  clearRun();
}

/** Ends the run (won or lost): records it and unlocks the heroes that finishing a run with this hero brings. */
export function finishRun(run: RunState, won: boolean): RunEnd {
  clearRun();
  logRun(runLog(run, won ? 'win' : 'lose'));
  const node = currentNode(run);
  const beaten = recordRun({
    won,
    fullDay: won && node.act === ACTS,
    act: node.act,
    floor: node.floor,
    pay: run.money,
    kills: run.stats.kills,
    cards: run.stats.cardsPlayed,
  });
  return { hired: progress((u) => 'finishRun' in u && u.finishRun === run.hero), beaten };
}

export function saveRun(run: RunState): void {
  store(SAVE_KEY, run);
}

const isObj = (x: unknown): x is Record<string, unknown> => typeof x === 'object' && x !== null && !Array.isArray(x);
const isNum = (x: unknown): x is number => typeof x === 'number' && Number.isFinite(x);
const isStrings = (x: unknown): x is string[] => Array.isArray(x) && x.every((s) => typeof s === 'string');
const isIndexes = (x: unknown, len: number): x is number[] => Array.isArray(x) && x.every((i) => Number.isInteger(i) && i >= 0 && i < len);

const isCard = (c: unknown): c is CardInst =>
  isObj(c) &&
  isNum(c.uid) &&
  typeof c.id === 'string' &&
  !!CARDS[c.id] &&
  typeof c.up === 'boolean' &&
  (c.perks === undefined || (isStrings(c.perks) && c.perks.every((p) => !!PERKS[p])));

const isNode = (n: unknown, i: number, len: number): n is RunNode => {
  if (!isObj(n) || n.id !== i || !isNum(n.lane) || !isIndexes(n.next, len)) return false;
  const { act, floor } = n;
  if (!isNum(act) || !isNum(floor) || !Number.isInteger(act) || act < 1 || act > ACTS) return false;
  const type = NODE_TYPES.find((x) => x === n.type);
  // Fights, elites and bosses carry their enemy; rooms don't.
  return (
    !!type && (type === 'fight' || type === 'elite' || type === 'boss' ? typeof n.enemy === 'string' && !!ENEMIES[n.enemy] : n.enemy === undefined)
  );
};

/** Saved data is untrusted: a run that doesn't have the exact shape (or names content that no longer exists) is dropped. */
function parseRun(raw: unknown): RunState | null {
  if (!isObj(raw) || raw.version !== SAVE_VERSION) return null;
  const { hero, hp, maxHp, seed, rng, uid, current, cleared, deck, relics, relicFlags, nodes, path, stats, money, skips, mods, reward } = raw;
  const heroId = HERO_LIST.find((hd) => hd.id === hero)?.id;
  if (!heroId || !isNum(hp) || !isNum(maxHp) || !isNum(seed) || !isNum(rng) || !isNum(uid) || typeof cleared !== 'boolean') return null;
  if (!Array.isArray(deck) || !deck.every(isCard) || !isStrings(relics)) return null;
  if (!isObj(relicFlags) || !Object.values(relicFlags).every(isNum)) return null;
  if (!Array.isArray(nodes) || !nodes.length || !nodes.every((n, i) => isNode(n, i, nodes.length))) return null;
  if (!isNum(current) || !isIndexes([current], nodes.length) || !isIndexes(path, nodes.length) || !isObj(stats)) return null;
  const { kills, elites, cardsPlayed, damageTaken, time } = stats;
  if (!isNum(kills) || !isNum(elites) || !isNum(cardsPlayed) || !isNum(damageTaken) || !isNum(time)) return null;
  if (Math.max(...nodes.map((n) => n.act)) !== ACTS) return null;
  const offers = Array.isArray(reward)
    ? reward.filter((o): o is { id: string; up: boolean } => isObj(o) && typeof o.id === 'string' && !!CARDS[o.id] && typeof o.up === 'boolean')
    : [];
  return {
    version: SAVE_VERSION,
    seed,
    rng,
    hero: heroId,
    hp,
    maxHp,
    deck,
    relics: relics.filter((id) => !!RELICS[id]),
    relicFlags: Object.fromEntries(Object.entries(relicFlags).filter((e): e is [string, number] => isNum(e[1]))),
    nodes,
    current,
    path,
    cleared,
    stats: { kills, elites, cardsPlayed, damageTaken, time },
    money: isNum(money) ? money : 0,
    skips: isNum(skips) ? skips : 0,
    uid,
    mods: isStrings(mods) ? mods.filter((id) => id in MODIFIERS) : [],
    reward: cleared && offers.length ? offers.map(({ id, up }) => ({ id, up })) : undefined,
  };
}

export const loadRun = (): RunState | null => parseRun(loadRaw<unknown>(SAVE_KEY));

export function clearRun(): void {
  remove(SAVE_KEY);
}
