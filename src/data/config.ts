import type { Rarity } from '../game/types';

/** Global tuning constants. Times are in seconds at 1× speed. */
export const CONFIG = {
  /** The made-up voice that reads a speech bubble: base pitch range (Hz, picked per speaker) and ms per letter. */
  voicePitch: [150, 420],
  voiceMs: 42,
  /** Milliseconds an enemy's speech bubble stays up once all its text is there. */
  speechHold: 2500,
  /** An enemy under this many HP (and alive) is heard breathing: a heartbeat every `heartbeatGap` seconds until it falls. */
  enemyLowHp: 15,
  heartbeatGap: 0.9,
  /** Milliseconds under which a light vibration is dropped if another has just fired (patterns and heavy knocks always go through). */
  hapticGap: 30,
  /** Milliseconds a press must last to count as "hold to inspect" (every screen). */
  longPressMs: 350,
  /** Taps on the version line in Settings that reveal the Debug menus switch. */
  debugTaps: 5,
  /** The hero's portrait sweats under this share of max HP. */
  heroLowHp: 0.3,
  /** An enemy tenses up before its move lands: from this many seconds left (or half the wind-up, if shorter) it winds up, and from `hard` it shakes harder and rims pink. */
  anticipate: { soft: 1.5, hard: 0.6 },
  /** The rust mop: grime a stroke as long as the belt is wide takes off a spot (a spot is 1), and how far (px) past a spot its head still reaches. */
  mop: { scrubPerBelt: 5, reach: 8 },
  /** How far along the belt (in belt widths) a card with a tip has come when the fight stops to explain it. */
  tipPos: 0.25,
  /** Milliseconds between the end of the fight and leaving it (the enemy finishes dying). */
  endMs: { lose: 1500, win: 2200, boss: 3400 },
  /** Beg to stay (the first time a run's hero would be let go): the Dodge seconds, the Strength and the mana crystals it brings back. */
  beg: { dodge: 10, strength: 10, crystals: 1 },
  /** Runs the handbook's history keeps (the newest). */
  historyMax: 30,
  /** Debug fight option: the hero's HP. */
  debugHp: 500,
  /** Runs finished (won, lost or abandoned) before the home asks for a rating. */
  ratingAfterRuns: 2,
  /** Stars from which a rating counts as a good one (the review asks what was liked, not what was not). */
  ratingGood: 4,
  /** Longest review text kept (characters). */
  reviewMax: 500,
  /** Longest crash report (characters) sent to the `crashes` collection. */
  crashMax: 2000,
  /** Seconds between two stats hits (`src/analytics/`): a burst is spread out instead of sent at once. */
  statsGap: 0.4,
  /** Seconds for a card to cross one full belt width. */
  beltTime: 7.7,
  /** Card width as a fraction of the belt width (the UI mirrors this). */
  cardWidth: 0.25,
  /** Minimum gap between spawns, in belt widths. */
  spacing: 0.27,
  /** Never spawn a card closer than this to the previous one of its row (more than a card width, so cards never overlap,
   * e.g. when curses queued on one row send every draw to the other). */
  minGap: 0.26,
  /** When the belt reverses, no card ends up past the new exit: the turn itself never throws a card off (only a card still sliding in is nudged). */
  reverseMaxPos: 1,
  /** The belt stands still this long before it turns around, so no card seems to jump (Paradigm Shift). */
  beltTurnPause: 0.5,
  /** A card expires once its left edge is this far past the belt's left edge (fraction of card width). */
  expireOverhang: 0.1,
  /** Seconds before an enemy steals a card that a hand is shown over it. */
  stealWarn: 0.5,
  /** Belt speed multiplier while rushed (Time Slip, Time Warp). */
  beltRush: 1.5,
  /** Seconds a card that slips off the end of the belt is still within reach (it tips over meanwhile; you can stash it). */
  fallGrace: 0.35,
  /** Seconds a card dragged at the end of the belt is still kept in the hand before it falls off. */
  dragGrace: 2,
  /** Belt speed multipliers imposed by enemies: Hurry (faster) and Slowdown. */
  beltHurry: 1.5,
  beltSlow: 0.6,
  /** Crunch (the CEO's Crunch Time): the belt runs at twice the speed. */
  beltCrunch: 2,
  /** Global difficulty knobs applied to every enemy (the records hold the real numbers, so keep them at 1 unless testing). */
  enemyHp: 1,
  enemyDmg: 1,
  maxManaCap: 10,
  /** Damage multiplier of a critical attack (Critical status). */
  critMult: 2,
  /** Seconds a virus card rides the belt before it infects the card behind it. */
  virusDelay: 4,
  startMana: 0,
  dotInterval: 1.5,
  multitaskingWindow: 2.5,
  multitaskingMax: 5,
  /** At the start of a fight the belt has already run until the first card is this far in (belt widths): a couple of cards. */
  prewarm: 0.25,
  /** Seconds of "Fight!" intro before the clock starts. */
  introTime: 1.2,
  /** Seconds the enemy's first move starts late: the belt and the mana run first, so the hero gets a head start. */
  enemyDelay: 0.9,
  /** Cap on cards per belt row. */
  maxHandBelt: 7,
  /** Belt rows: two is the standard layout (cards alternate between them). */
  beltRows: 2,
  /** Belt widths the belt moves for one full clockwise turn of the crank knob (`EnemyDef.beltOff`): small, so it takes many turns. */
  crankTurn: 0.1,
  /** Mana a tap on the button gives (`EnemyDef.manaTap`): about four taps a second match the usual regeneration. */
  manaTapAmount: 0.2,
  /** Degrees of crank turn between two buzzes of the phone. */
  crankBuzz: 24,
  /** Seconds between the lower part of the screen sinking (`EnemyDef.deepBelt`) and the extra belt row opening in its place. */
  sinkTime: 1,
  /** With two rows each row runs at this fraction of the one-row speed. */
  twoRowSpeed: 0.8,
  /** Share of the belt's speed-up (Rush, Hurry, Slowdown) the music follows: 1 = the same change (a 1.5× rush, 1.5× music). */
  musicFollowsBelt: 1,
  /** Pay for a won fight (the run's score): a base by enemy tier, plus `perSecond` for every second under `par`. */
  pay: { normal: 10, elite: 25, boss: 50, par: 60, perSecond: 1 },
  /** Share of a fighter's current Block lost per decay step (at least 1), and the seconds between steps for an enemy (the hero's is on its `HeroDef`). */
  blockDecayShare: 0.1,
  enemyBlockDecay: 0.6,
  /** The seconds between Block decay steps a hero starts from: a hero's own pace (`HeroDef.blockDecay`) starts from it. */
  heroBlockDecay: 1,
  /** Mana more a card costs for each Inflation it carries, and while it is infected with a Virus. */
  inflationCost: 1,
  virusCost: 1,
  /** An update window's buttons answer only after it has been up this long (s), so a tap meant for a card doesn't answer it. */
  popupArm: 0.4,
  /**
   * The coffee chore (`MoveDef.task`, `game/coffee.ts`): `brewTime` s the machine takes to pour and `doneHold` s the finished cup stays up; a mistake takes `penalty` s off the move's countdown
   * (`penaltyMax` s in all); the Boss then `calm`s down (the enemy is stunned that long). The order: a `price` ([min, max] cents) paid with `payCoins` ([min, max]) coins, `decoys` more in the purse (no fewer than `minCoins` of them ever make the price),
   * a `codeLength` keys code on a pad of `keys`, `sugar` ([min, max]) sugars out of a dial that goes up to `maxSugar`.
   */
  coffee: {
    brewTime: 5,
    doneHold: 1.6,
    penalty: 2,
    penaltyMax: 8,
    calm: 3,
    price: [60, 250],
    payCoins: [4, 5],
    minCoins: 4,
    decoys: 3,
    codeLength: 3,
    keys: 9,
    sugar: [1, 3],
    maxSugar: 4,
  },
  /**
   * The Board's chore (`MoveDef.task` = 'shells', `game/shells.ts`): `cards` covered cards show their faces for `showTime` s, then swap places `swaps` times, `swapTime` s each;
   * a wrong pick is shown for `revealTime` s and the round restarts, the right one stays up `doneHold` s. A mistake takes `penalty` s off the move's countdown (`penaltyMax` s in all);
   * done in time, the Board is stunned `calm` s.
   */
  shells: {
    cards: 3,
    showTime: 1.5,
    swaps: 7,
    swapTime: 0.45,
    revealTime: 1.1,
    doneHold: 1.4,
    penalty: 2,
    penaltyMax: 6,
    calm: 3,
  },
  /**
   * The Sushi Chef's chore (`MoveDef.task` = 'sushi', `game/sushi.ts`): an order of `length` pieces, eaten in that order off the belt, which serves nothing but sushi meanwhile;
   * `decoy` is the chance a piece dealt is a random one instead of one the order still wants, `doneHold` s the finished order is shown. A wrong piece takes `penalty` s off the move's countdown
   * (`penaltyMax` s in all); done in time, the Chef is stunned `calm` s.
   */
  sushi: {
    length: 5,
    decoy: 0.4,
    doneHold: 1.2,
    penalty: 2,
    penaltyMax: 6,
    calm: 3,
  },
  /** The Weak Spot target shows at least this far (share of the sprite) from every edge. */
  weakSpotMargin: 0.25,
  /** Hours a page can stay open before the home asks for a reload (the game runs offline, so a forgotten tab misses updates). */
  staleHours: 24,
  /** Each floor of an act makes normal enemies this much tougher (HP, damage). */
  floorHp: 0.06,
  floorDmg: 0.04,
  /** Chance that a floor of the map swaps its two rooms between the lanes. */
  laneSwap: 0.3,
  /** Chance that an act's map has one road between two floors cut, so that lane is crossed to the other and back. */
  roadCut: 0.5,
  /** Break Room: a rest heals this share of max HP plus this share of the HP missing. Skipping a card reward: the max HP it pays. */
  restHeal: 0.9,
  skipMaxHp: 3,
  /** Skipping pays one more max HP every this many rooms walked in the run. */
  skipMaxHpRooms: 3,
  /** Copy Room: a card can't be shredded below this many deck cards; a photocopy costs this much HP (and needs more left). */
  shredMinDeck: 10,
  copyHpCost: 8,
  /** Tailor: the max HP the let-out uniform gives. */
  tailorCrystals: 1,
  /** Lost & Found: how many relics lie in the box. */
  lostFoundChoices: 3,
  /** Rewards and the Vending Machine deal a card of the hero's class this many times as likely as a neutral one (a class stays itself). */
  classCardWeight: 2,
  /** Cross-Training: how many cards of each of the other classes are on offer. */
  crossTrainPerClass: 2,
  /** Vending Machine: the HP a card of each rarity costs (the machine takes blood). */
  vendingHp: { rare: 6, epic: 12 },
} as const;

export type RewardKind = 'fight' | 'elite' | 'boss';

/**
 * Rarity odds (weights) of each card offered after a fight, an elite or an act boss, one entry per act (later acts use the last):
 * the deeper the shift, the better the cards. Legendary cards only drop from elites and bosses.
 */
const REWARD_ODDS: Record<RewardKind, [Rarity, number][][]> = {
  fight: [
    [
      ['common', 64],
      ['rare', 29],
      ['epic', 7],
    ],
    [
      ['common', 50],
      ['rare', 38],
      ['epic', 12],
    ],
    [
      ['common', 38],
      ['rare', 44],
      ['epic', 18],
    ],
  ],
  elite: [
    [
      ['common', 30],
      ['rare', 45],
      ['epic', 20],
      ['legendary', 5],
    ],
    [
      ['common', 20],
      ['rare', 45],
      ['epic', 28],
      ['legendary', 7],
    ],
    [
      ['common', 10],
      ['rare', 40],
      ['epic', 38],
      ['legendary', 12],
    ],
  ],
  boss: [[['legendary', 1]]],
};

export const rewardOdds = (kind: RewardKind, act: number): [Rarity, number][] => REWARD_ODDS[kind][Math.min(act, REWARD_ODDS[kind].length) - 1];

/** Chance, per act (later acts use the last), that one card of a reward offer comes already upgraded. */
const REWARD_UPGRADE_CHANCE = [0.3, 0.5, 0.8];

export const rewardUpgradeChance = (act: number): number => REWARD_UPGRADE_CHANCE[Math.min(act, REWARD_UPGRADE_CHANCE.length) - 1];

/** Cards an offer always holds of at least a rarity, per act (later acts use the last); the rest of it follows `rewardOdds`. */
const REWARD_GUARANTEE: Record<RewardKind, { rarity: Rarity; count: number }[]> = {
  fight: [
    { rarity: 'rare', count: 1 },
    { rarity: 'epic', count: 1 },
    { rarity: 'epic', count: 2 },
  ],
  elite: [{ rarity: 'legendary', count: 2 }],
  boss: [{ rarity: 'legendary', count: 0 }],
};

/** Rarity odds (weights) of each stationery in the Lost & Found box, one entry per act (later acts use the last). */
const RELIC_ODDS: [Rarity, number][][] = [
  [
    ['common', 50],
    ['rare', 40],
    ['epic', 10],
  ],
  [
    ['common', 35],
    ['rare', 45],
    ['epic', 18],
    ['legendary', 2],
  ],
  [
    ['common', 15],
    ['rare', 40],
    ['epic', 37],
    ['legendary', 8],
  ],
];

export const relicOdds = (act: number): [Rarity, number][] => RELIC_ODDS[Math.min(act, RELIC_ODDS.length) - 1];

/** The rarity the Lost & Found box always holds at least one stationery of (or above), per act (later acts use the last). */
const RELIC_GUARANTEE: Rarity[] = ['rare', 'rare', 'epic'];

export const relicGuarantee = (act: number): Rarity => RELIC_GUARANTEE[Math.min(act, RELIC_GUARANTEE.length) - 1];

export const rewardGuarantee = (kind: RewardKind, act: number): { rarity: Rarity; count: number } =>
  REWARD_GUARANTEE[kind][Math.min(act, REWARD_GUARANTEE[kind].length) - 1];

/** Where cards enter (0) and expire, in belt-distance units. */
/** The per-run flag (`CombatSetup.relicFlags`) set once the hero has begged to stay. */
export const BEG_FLAG = 'begToStay';

/** Where an Anchor card stops: right at the end of the belt, the whole card still in view. */
export const ANCHOR_POS = 1;

export const EXPIRE_POS = 1 + CONFIG.cardWidth * CONFIG.expireOverhang;

export const GAME_SPEEDS = [1, 1.5, 2] as const;

/** The share of its HP at which an enemy's `onHalf` trait fires. */
export const halfAtOf = (e: { halfAt?: number }): number => e.halfAt ?? 0.5;
export const halfPct = (e: { halfAt?: number }): number => Math.round(halfAtOf(e) * 100);
