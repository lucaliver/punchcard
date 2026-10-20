/**
 * Shapes shared by the data, the engine and the screens.
 *
 * Geometry: the field is `COLS` lanes wide and `ROWS` rows tall. Row 0 is the top (where the parade comes in), row `ROWS - 1` is the last one
 * before the lantern. A foe's `y` is a float in row units (tile `r` spans `r…r+1`, its centre is `r + 0.5`); a foe whose `y` reaches `ROWS`
 * has reached the lantern.
 */

export const COLS = 5;
export const ROWS = 7;
/** Spirits can be set only from this row down: the top rows are the road the parade walks in on. */
export const PLACE_ROW = 2;

export type KeeperId = 'miko' | 'ronin' | 'tanuki';
export type Rarity = 'common' | 'rare' | 'epic' | 'legend';
export type CardKind = 'spirit' | 'charm';
export type Terrain = 'ground' | 'rock' | 'shrine';

/** Id of a drawing in `ui/art/sprites.ts` (spirits and foes share one table). */
export type SpriteId = string;

/** Which foes an effect reaches. `front` = the foe nearest the lantern in the lane picked, `fronts` = the front foe of every lane. */
export type Scope = 'front' | 'fronts' | 'lane' | 'lanes3' | 'all' | 'strongest';

/** An effect of a charm, a keeper's ability, or a spirit's `onPlace`/`onDeath`. */
export type Effect =
  | { k: 'hit'; dmg: number; scope: Scope; stun?: number; slow?: [factor: number, secs: number]; burn?: [dps: number, secs: number] }
  | { k: 'stun'; secs: number; scope: Scope }
  | { k: 'push'; rows: number; scope: Scope }
  /** Damages the foes within `radius` tiles of the spirit this goes off from (its tile, or the one picked). */
  | { k: 'burst'; dmg: number; radius: number }
  | { k: 'oil'; n: number }
  /** Throws the rest of the hand away and deals a whole new one at once. */
  | { k: 'redeal' }
  | { k: 'mend'; hp: number; scope: 'all' | 'lane' }
  | { k: 'flame'; n: number }
  /** Spirits hit harder for a while: `atk` is the extra share of damage (0.3 = +30%). */
  | { k: 'bless'; atk: number; secs: number; scope: 'all' | 'lane' }
  /** Foes in the lane walk slower for a while. */
  | { k: 'zone'; slow: number; secs: number }
  /** Sets `n` spirits of its own: on the tile picked when `at` is `target`, else on random free tiles. */
  | { k: 'summon'; spirit: SpiritDef; n: number; at: 'target' | 'random' }
  /** A copy of the spirit played last, on the tile picked. */
  | { k: 'copyLast' }
  /** 50/50: gain `win` oil or lose `lose`. */
  | { k: 'gamble'; win: number; lose: number };

export interface AttackDef {
  /** melee: the foe in contact; shot: the first foe in `range` rows; lob: like shot but splashes; pierce: every foe in the lane within range; pulse: like pierce, no projectile. */
  kind: 'melee' | 'shot' | 'lob' | 'pierce' | 'pulse';
  dmg: number;
  /** Seconds between two attacks. */
  every: number;
  /** In rows, measured up the lane from the spirit. */
  range: number;
  /** Radius (in tiles, lanes included) of a lob. */
  splash?: number;
  /** A melee spirit that hits every foe within reach, not just the first. */
  cleave?: boolean;
  stun?: number;
  slow?: [factor: number, secs: number];
  burn?: [dps: number, secs: number];
}

export interface SpiritDef {
  art: SpriteId;
  hp: number;
  atk?: AttackDef;
  /** Makes oil. */
  oil?: { n: number; every: number };
  /** Damage handed back to a foe that hits it. */
  thorns?: number;
  /** Heals the spirits around it. */
  heal?: { hp: number; every: number; to: 'adjacent' | 'lane' };
  /** Boosts the spirits around it: `rate` = faster attacks (0.25 = +25%), `dmg` = harder ones. */
  aura?: { to: 'adjacent' | 'lane' | 'all'; rate?: number; dmg?: number };
  /** Goes off when a foe comes within 0.9 rows, once. */
  trap?: { dmg: number; radius: number; stun?: number };
  /** Seconds it stays (a decoy, a summon). */
  lifespan?: number;
  /** Stands back up once with this share of its HP. */
  revive?: number;
  /** Goes off when it falls (or its lifespan ends). */
  onDeath?: Effect[];
  /** Foes hit by it are slowed (a sticky wall). */
  sticky?: [factor: number, secs: number];
}

export interface CardDef {
  id: string;
  kind: CardKind;
  /** Oil. */
  cost: number;
  rarity: Rarity;
  /** `any` = neutral. */
  keeper: KeeperId | 'any';
  /** Only in the starting decks, never dealt as a reward. */
  starter?: boolean;
  /** Used up when played (does not go to the discard pile). */
  vanish?: boolean;
  /** What a spirit card sets down (`up` = the upgraded copy). */
  spirit?: (up: boolean) => SpiritDef;
  /** What a charm does (`up` = the upgraded copy). */
  fx?: (up: boolean) => Effect[];
  /** Where a charm is aimed: nowhere (played at once), at a lane, or at a tile. */
  aim?: 'none' | 'lane' | 'tile';
  /** The upgraded copy costs this instead. */
  upCost?: number;
  /** Picture of a charm (a spirit's is its sprite). */
  art?: SpriteId;
}

export type FoeTier = 'minion' | 'normal' | 'elite' | 'boss';

export type FoeAbility =
  /** Jumps over the first spirit that blocks it. */
  | { k: 'leap' }
  /** Webs the nearest spirit in its lane (it attacks slower for `secs`). */
  | { k: 'web'; every: number; secs: number }
  /** Heals the foes around it. */
  | { k: 'mend'; hp: number; every: number; radius: number }
  /** The foes around it walk faster. */
  | { k: 'hasten'; radius: number; speed: number }
  /** Slides into the next lane now and then. */
  | { k: 'swap'; every: number }
  | { k: 'summon'; foe: string; n: number; every: number }
  /** Freezes the nearest spirit in its lane (it can't act for `secs`). */
  | { k: 'freeze'; every: number; secs: number }
  /** Leaves `n` smaller foes behind when it falls. */
  | { k: 'split'; foe: string; n: number }
  /** Below this share of its HP it walks `speed` times faster. */
  | { k: 'rage'; at: number; speed: number }
  /** Crushes every spirit in its lane for `dmg`. */
  | { k: 'slam'; every: number; dmg: number }
  /** Strikes the nearest spirit of each lane from afar. */
  | { k: 'volley'; every: number; dmg: number };

export interface FoeDef {
  id: string;
  art: SpriteId;
  tier: FoeTier;
  hp: number;
  /** Rows per second. */
  speed: number;
  /** Damage to the spirit it fights, per hit. */
  dmg: number;
  every: number;
  /** How far above a spirit it stops to fight it, in rows. */
  reach: number;
  /** Flame lost when it reaches the lantern. */
  leak: number;
  /** Visual size, in tiles. */
  size: number;
  /** Flies over spirits: nothing blocks it. */
  fly?: boolean;
  /** Taken off every hit (but at least 1). */
  armor?: number;
  abilities?: FoeAbility[];
  /** Acts it is dealt in, and the price of it in a wave's budget. */
  acts: number[];
  cost: number;
}

export interface Spawn {
  /** Seconds into the fight. */
  t: number;
  lane: number;
  foe: string;
}

export interface StageDef {
  act: number;
  /** Seconds until dawn. */
  duration: number;
  spawns: Spawn[];
  /** `terrain[lane][row]`. */
  terrain: Terrain[][];
  /** Foe hit points are multiplied by this (the act and the floor make fights tougher). */
  hpMul: number;
  boss?: string;
}

export interface CardInst {
  uid: number;
  id: string;
  up: boolean;
}

export interface KeeperDef {
  id: KeeperId;
  flame: number;
  /** Oil at the start of a fight, and the most the lantern holds. */
  oil: number;
  maxOil: number;
  hand: number;
  /** Starting deck: card ids. */
  deck: string[];
  /** Cooldown ability. */
  ability: { cd: number; fx: Effect[] };
  /** The keeper's colour, in CSS. */
  ink: string;
  unlock: 'start' | 'boss1' | 'boss2';
  /** Passive (read by the engine as flags). */
  passive: KeeperPassive;
}

export type KeeperPassive =
  /** Charms cost less. */
  | { k: 'charmCut'; n: number }
  /** Spirits have more HP (a share). */
  | { k: 'hardy'; n: number }
  /** Coins at the end of a fight. */
  | { k: 'purse'; n: number };

export interface RelicDef {
  id: string;
  rarity: Rarity | 'boss';
  /** Number the text shows. */
  n: number;
  /** Sprite id. */
  art: SpriteId;
  mods?: Partial<{
    maxOil: number;
    startOil: number;
    /** Oil per second, added. */
    regen: number;
    hand: number;
    flame: number;
    /** Seconds off the wait before a played card is replaced. */
    drawCut: number;
    /** Share added to spirit HP. */
    hp: number;
    /** Share added to spirit damage. */
    dmg: number;
    /** Added to coins at the end of a fight. */
    coins: number;
    /** Cards on offer after a fight. */
    rewardCards: number;
  }>;
  hook?: RelicHook;
}

export type RelicHook =
  /** Every `every`th foe that falls gives `n` oil. */
  | { k: 'killOil'; every: number }
  /** Every `every`th foe that reaches the lantern does it no harm. */
  | { k: 'leakSpare'; every: number }
  /** The lantern burns a little brighter after a won fight: heals `n` flame. */
  | { k: 'dawnMend' }
  /** The keeper's ability recharges this much faster (a share). */
  | { k: 'abilityFast'; n: number };

export type RoomType = 'watch' | 'elite' | 'boss' | 'rest' | 'market' | 'shrine' | 'treasure';
