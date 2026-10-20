/** Every tuning number of the game. Rules text never types one: it reads it from here or from the records. */
export const CONFIG = {
  /** Fixed engine step, in seconds. */
  tick: 1 / 60,

  oil: {
    start: 3,
    max: 10,
    /** Oil per second. */
    regen: 0.55,
  },

  hand: {
    size: 4,
    /** Seconds before the slot of a played card is filled again. */
    drawDelay: 0.9,
    /** Extra wait when the draw pile has to be shuffled back in. */
    shuffleDelay: 0.8,
  },

  /** Spirits of the same kind merge up to this level. */
  maxLevel: 3,
  /** Hit points and damage grow by this share of the base for every level above the first. */
  levelGrowth: 0.65,
  /** A spirit on a shrine tile hits and works this much harder. */
  shrineBoost: 0.3,

  /** How long before a foe walks in its lantern shows at the top of its lane. */
  warn: 2.6,
  /** A foe is stopped by a spirit when its centre is within `reach` of the spirit's; fliers go over. */
  contactSlack: 0.05,
  /** Spirits strike a foe this far past their own centre (a fly just overhead). */
  behindRange: 0.35,
  /** Starting y of a foe (just above the field). */
  spawnY: -0.6,
  /** Seconds of quiet at the start of a fight before the first foe. */
  openingQuiet: 4,
  /** Seconds before dawn when no new foe is dealt. */
  tailQuiet: 9,

  /** Share of a stunned or webbed spirit's attack speed that is left when webbed. */
  webSlow: 0.5,
  /** Vulnerable foes take this much more damage. */
  vulnerable: 0.5,

  /** After this many seconds the lantern's flame flickers louder: purely visual. */
  lowFlame: 0.34,

  stage: {
    /** Seconds until dawn: normal, elite, boss. */
    duration: { watch: 62, elite: 78, boss: 96 },
    /** Wave budget (foe `cost`) of a fight: base + perFloor * floor + perAct * (act - 1). */
    budget: { base: 22, perFloor: 2.4, perAct: 24, elite: 1.25, boss: 1 },
    /** Foes beyond this many in a lane at once are held back a few seconds. */
    rocks: [0, 3] as [number, number],
    shrines: [0, 2] as [number, number],
    /** Foe hit points and spirit-facing damage grow this much per act and per floor. */
    foeHpAct: 0.28,
    foeHpFloor: 0.02,
  },

  /** The moon ladder: each phase adds a rule to a run, on top of the ones below it. Shares are added to 1. */
  moons: [{ hp: 0.1 }, { flame: -2 }, { elite: 0.25 }, { price: 0.3 }, { speed: 0.12 }] as {
    hp?: number;
    flame?: number;
    elite?: number;
    price?: number;
    speed?: number;
  }[],

  run: {
    acts: 3,
    /** Columns of the map. */
    mapWidth: 3,
    /** Fights and rooms on a map before the boss, per act. */
    mapRows: 7,
    startCoins: 40,
    /** Mon a won fight pays: base, plus a share for each bit of flame still burning, plus a bonus for beating dawn. */
    pay: { watch: 18, elite: 34, boss: 60, perFlame: 2, early: 8 },
    /** Heal at a rest stop (share of max flame). */
    restHeal: 0.4,
    /** After a boss the lantern is fed: share of max flame. */
    bossHeal: 0.5,
    /** Cards on offer after a fight. */
    rewardCards: 3,
    /** Odds of each rarity in a reward, by tier of fight. */
    odds: {
      watch: { common: 0.66, rare: 0.28, epic: 0.06, legend: 0 },
      elite: { common: 0.38, rare: 0.44, epic: 0.15, legend: 0.03 },
      boss: { common: 0, rare: 0.55, epic: 0.35, legend: 0.1 },
    },
    /** Chance a reward card is already upgraded. */
    upChance: { watch: 0.08, elite: 0.2, boss: 0.35 },
    /** Mon: skipping a reward pays this. */
    skipPay: 10,
    /** Market prices by rarity, relics and services. */
    price: { common: 28, rare: 52, epic: 90, legend: 140, relic: 120, bossRelic: 160, remove: 40, removeStep: 15, heal: 30 },
    /** Mon variation of shop prices (± share). */
    priceSpread: 0.15,
    /** Deck limits. */
    minDeck: 6,
  },

  /** Percent of the max flame a lost fight returns on the meta score. Visual only. */
  longPressMs: 380,
  holdRingDelayMs: 120,
  /** Pixels a press may drift and still be a tap. */
  tapSlop: 10,
  /** Screen shake strength on a leak. */
  shake: 6,
  /** Undo of a drag: a card dropped on a bad tile goes back. */
  dragLift: 54,
  /** The history of runs kept. */
  historyMax: 12,
  /** Taps on the version line that open the debug tools. */
  debugTaps: 7,
} as const;
