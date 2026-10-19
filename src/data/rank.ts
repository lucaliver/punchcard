import type { HeroId, Rarity } from '../game/types';
import { HEROES } from './heroes';

/**
 * The career ladder: a hero wins a full day at their top rank and is promoted to the next one. Every rank gives a bonus and asks a duty, and a run
 * plays under all of them up to the rank picked on the hero select (so a lower rank can always be played again). Texts: `rank.<level>` is the
 * title, `rank.fx.<kind>` the line of an effect (`{n}` = its `n`, `{cards}` = the names of its `cards`).
 */
export type RankBonus =
  | { kind: 'maxHp'; n: number }
  /** The hero's ability costs `n`. */
  | { kind: 'abilityCost'; n: number }
  /** `n` random cards of this rarity (the hero's class and the neutral ones) join the starting deck. */
  | { kind: 'cards'; rarity: Rarity; n: number }
  /** These starter cards start upgraded. */
  | { kind: 'upgrade'; cards: string[] }
  /** One random stationery, as the Lost & Found would deal it. */
  | { kind: 'relic' }
  | { kind: 'rewardCards'; n: number }
  /** Mana crystals more, for good. */
  | { kind: 'crystal'; n: number }
  | { kind: 'restBoth' }
  /** Mana refills `n`% faster. */
  | { kind: 'manaRegen'; n: number };

/** A duty's `n` is a percentage. */
export type RankDuty =
  | { kind: 'restHeal'; n: number }
  | { kind: 'eliteHp'; n: number }
  | { kind: 'enemyHp'; n: number }
  | { kind: 'enemyDmg'; n: number }
  | { kind: 'belt'; n: number }
  | { kind: 'manaSlow'; n: number }
  | { kind: 'blockFade'; n: number }
  | { kind: 'enemyTime'; n: number }
  | { kind: 'noSkipPay' }
  | { kind: 'noBeg' }
  /** The hero starts with `n`% less max HP. */
  | { kind: 'heroHp'; n: number }
  /** The sleeve has `n` slots fewer (never under one). */
  | { kind: 'sleeveCut'; n: number };

export type RankEffect = RankBonus | RankDuty;

/** One rung: what it gives and what it asks. */
export interface RankStep {
  bonus: RankBonus;
  duty: RankDuty;
}

const step = (bonus: RankBonus, duty: RankDuty): RankStep => ({ bonus, duty });

// Ordered so a run gets harder a little at a time: the mild duties first, the ones that change how you play after; a perk comes with every rung and the big gifts crown the top.
const LADDER: Partial<Record<HeroId, readonly RankStep[]>> = {
  warrior: [
    step({ kind: 'maxHp', n: 10 }, { kind: 'restHeal', n: 15 }),
    step({ kind: 'abilityCost', n: 3 }, { kind: 'eliteHp', n: 10 }),
    step({ kind: 'cards', rarity: 'rare', n: 1 }, { kind: 'enemyDmg', n: 10 }),
    step({ kind: 'upgrade', cards: ['skillIssue', 'heavyLifting', 'caffeineJolt'] }, { kind: 'belt', n: 10 }),
    step({ kind: 'relic' }, { kind: 'noSkipPay' }),
    step({ kind: 'crystal', n: 1 }, { kind: 'manaSlow', n: 15 }),
    step({ kind: 'rewardCards', n: 1 }, { kind: 'blockFade', n: 25 }),
    step({ kind: 'restBoth' }, { kind: 'enemyTime', n: 10 }),
    step({ kind: 'cards', rarity: 'epic', n: 1 }, { kind: 'enemyHp', n: 10 }),
    step({ kind: 'cards', rarity: 'legendary', n: 2 }, { kind: 'noBeg' }),
  ],
  // The glass cannon: the duties go for its HP and its tempo.
  mage: [
    step({ kind: 'maxHp', n: 10 }, { kind: 'restHeal', n: 15 }),
    step({ kind: 'abilityCost', n: 4 }, { kind: 'eliteHp', n: 15 }),
    step({ kind: 'cards', rarity: 'rare', n: 1 }, { kind: 'enemyDmg', n: 15 }),
    step({ kind: 'upgrade', cards: ['staticShock', 'burnout', 'caffeineJolt'] }, { kind: 'belt', n: 10 }),
    step({ kind: 'relic' }, { kind: 'noSkipPay' }),
    step({ kind: 'crystal', n: 1 }, { kind: 'heroHp', n: 15 }),
    step({ kind: 'rewardCards', n: 1 }, { kind: 'blockFade', n: 25 }),
    step({ kind: 'manaRegen', n: 10 }, { kind: 'enemyTime', n: 10 }),
    step({ kind: 'cards', rarity: 'epic', n: 1 }, { kind: 'enemyHp', n: 20 }),
    step({ kind: 'cards', rarity: 'legendary', n: 2 }, { kind: 'noBeg' }),
  ],
  // Starts with two mana: the perks feed it, the duties take its sleeve and its HP.
  necromancer: [
    step({ kind: 'maxHp', n: 10 }, { kind: 'restHeal', n: 15 }),
    step({ kind: 'abilityCost', n: 4 }, { kind: 'eliteHp', n: 15 }),
    step({ kind: 'cards', rarity: 'rare', n: 1 }, { kind: 'enemyDmg', n: 15 }),
    step({ kind: 'upgrade', cards: ['zombieShift', 'holdMusic', 'caffeineJolt'] }, { kind: 'sleeveCut', n: 1 }),
    step({ kind: 'relic' }, { kind: 'noSkipPay' }),
    step({ kind: 'manaRegen', n: 10 }, { kind: 'belt', n: 10 }),
    step({ kind: 'crystal', n: 1 }, { kind: 'enemyTime', n: 10 }),
    step({ kind: 'restBoth' }, { kind: 'heroHp', n: 15 }),
    step({ kind: 'cards', rarity: 'epic', n: 1 }, { kind: 'enemyHp', n: 20 }),
    step({ kind: 'cards', rarity: 'legendary', n: 2 }, { kind: 'noBeg' }),
  ],
  // The sleeve is its engine: the sleeve is what the last duties come for.
  rogue: [
    step({ kind: 'maxHp', n: 10 }, { kind: 'restHeal', n: 15 }),
    step({ kind: 'abilityCost', n: 4 }, { kind: 'eliteHp', n: 10 }),
    step({ kind: 'cards', rarity: 'rare', n: 1 }, { kind: 'enemyDmg', n: 10 }),
    step({ kind: 'upgrade', cards: ['caffeineJolt', 'lupin', 'plausibleDeniability'] }, { kind: 'enemyTime', n: 10 }),
    step({ kind: 'relic' }, { kind: 'noSkipPay' }),
    step({ kind: 'crystal', n: 1 }, { kind: 'manaSlow', n: 15 }),
    step({ kind: 'rewardCards', n: 1 }, { kind: 'blockFade', n: 25 }),
    step({ kind: 'restBoth' }, { kind: 'sleeveCut', n: 1 }),
    step({ kind: 'cards', rarity: 'epic', n: 1 }, { kind: 'enemyHp', n: 10 }),
    step({ kind: 'cards', rarity: 'legendary', n: 2 }, { kind: 'noBeg' }),
  ],
};

/** The ranks a hero can reach. */
export const rankMax = (hero: HeroId): number => LADDER[hero]?.length ?? 0;

/** The first `level` rungs of a hero's ladder, in order. */
export const rankSteps = (hero: HeroId, level: number): readonly RankStep[] => LADDER[hero]?.slice(0, Math.max(0, level)) ?? [];

/** The effects of one side of the rungs up to `level`. */
export const rankEffects = (hero: HeroId, level: number, side: keyof RankStep): RankEffect[] => rankSteps(hero, level).map((s) => s[side]);

/** What the ranks change while a run is played (1 / 0 / false / null = no change). */
export interface Mods {
  enemyHp: number;
  /** Elites and bosses only, on top of `enemyHp`. */
  eliteHp: number;
  enemyDmg: number;
  beltMul: number;
  /** The hero's max HP, times this (the start of the run: `rankStart`). */
  heroHp: number;
  restHeal: number;
  rewardCards: number;
  /** Seconds per mana, times this (above 1: mana refills slower). */
  manaSlow: number;
  /** How fast the hero's Block fades, times this. */
  blockFade: number;
  /** How fast the enemy's moves come, times this (above 1: sooner). */
  enemyTime: number;
  /** The hero's ability costs exactly this much, whatever the hero's own price. */
  abilityCost: number | null;
  /** Sleeve slots added to the hero's own (below zero: taken away). */
  sleeve: number;
  /** The Break Room gives the nap and the training both. */
  restBoth: boolean;
  /** The hero can't beg to stay. */
  noBeg: boolean;
  /** Skipping a card reward pays nothing. */
  noSkipPay: boolean;
  /** The run is harder than plain: the adaptive pressure climbs less (`pressureScale`). */
  hard: boolean;
}

export const NO_MODS: Readonly<Mods> = {
  enemyHp: 1,
  eliteHp: 1,
  enemyDmg: 1,
  beltMul: 1,
  heroHp: 1,
  restHeal: 1,
  rewardCards: 0,
  manaSlow: 1,
  blockFade: 1,
  enemyTime: 1,
  abilityCost: null,
  sleeve: 0,
  restBoth: false,
  noBeg: false,
  noSkipPay: false,
  hard: false,
};

const more = (n: number): number => 1 + n / 100;
const less = (n: number): number => 1 - n / 100;

/** Adds what an effect changes while the run is played to `m` (the gifts at the start of the run are `grantRank`'s and `rankStart`'s). */
function apply(m: Mods, e: RankEffect): void {
  switch (e.kind) {
    case 'maxHp':
    case 'cards':
    case 'upgrade':
    case 'relic':
    case 'crystal':
      break;
    case 'abilityCost':
      m.abilityCost = e.n;
      break;
    case 'rewardCards':
      m.rewardCards += e.n;
      break;
    case 'restBoth':
      m.restBoth = true;
      break;
    case 'manaRegen':
      m.manaSlow *= less(e.n);
      break;
    case 'restHeal':
      m.restHeal *= less(e.n);
      break;
    case 'eliteHp':
      m.eliteHp *= more(e.n);
      break;
    case 'enemyHp':
      m.enemyHp *= more(e.n);
      break;
    case 'enemyDmg':
      m.enemyDmg *= more(e.n);
      break;
    case 'belt':
      m.beltMul *= more(e.n);
      break;
    case 'manaSlow':
      m.manaSlow *= more(e.n);
      break;
    case 'blockFade':
      m.blockFade *= more(e.n);
      break;
    case 'enemyTime':
      m.enemyTime *= more(e.n);
      break;
    case 'noSkipPay':
      m.noSkipPay = true;
      break;
    case 'noBeg':
      m.noBeg = true;
      break;
    case 'heroHp':
      m.heroHp *= less(e.n);
      break;
    case 'sleeveCut':
      m.sleeve -= e.n;
      break;
  }
}

/** What playing a hero at this rank changes, all the rungs up to it together (`NO_MODS` at rank 0). */
export function rankMods(hero: HeroId, level: number): Mods {
  if (level <= 0 || !rankMax(hero)) return NO_MODS;
  const m: Mods = { ...NO_MODS, hard: true };
  for (const step of rankSteps(hero, level)) {
    apply(m, step.bonus);
    apply(m, step.duty);
  }
  return m;
}

/** What the hero starts the run with at this rank: max HP, mana and sleeve slots (the run is dealt them, the hire screen shows them). */
export function rankStart(hero: HeroId, level: number): { hp: number; mana: number; sleeve: number } {
  const def = HEROES[hero];
  const m = rankMods(hero, level);
  const gifts = rankEffects(hero, level, 'bonus');
  const sum = (kind: 'maxHp' | 'crystal'): number => gifts.reduce((n, e) => n + (e.kind === kind ? e.n : 0), 0);
  return { hp: Math.round(def.hp * m.heroHp) + sum('maxHp'), mana: def.maxMana + sum('crystal'), sleeve: Math.max(1, def.sleeve + m.sleeve) };
}
