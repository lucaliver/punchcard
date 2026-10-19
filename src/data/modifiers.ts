import type { ModifierDef } from '../game/types';

/** Management memos: optional handicaps for a run, open to a hero that has won a full day (`ModifierDef`). */
const defs: ModifierDef[] = [
  { id: 'quotas', icon: 'target', n: 25, enemyHp: 1.25 },
  { id: 'hostile', icon: 'siren', n: 25, enemyDmg: 1.25 },
  { id: 'speedUp', icon: 'stopwatch', n: 15, beltMul: 1.15 },
  { id: 'benefits', icon: 'healthPlan', n: 20, heroHp: 0.8 },
  { id: 'noBreaks', icon: 'coffee', n: 50, restHeal: 0.5 },
  { id: 'budget', icon: 'priceTag', n: 1, rewardCards: -1 },
];

export const MODIFIER_LIST = defs;
export const MODIFIERS: Record<string, ModifierDef> = Object.fromEntries(defs.map((d) => [d.id, d]));

/** What the active memos and the hero's rank add up to (1 / 0 / false = no change). */
export interface Mods {
  enemyHp: number;
  /** Elites and bosses only, on top of `enemyHp`. */
  eliteHp: number;
  enemyDmg: number;
  beltMul: number;
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
  restBoth: false,
  noBeg: false,
  noSkipPay: false,
  hard: false,
};

/** Two sets of mods in force together: multipliers multiply, sums add, switches turn on, and the cheaper ability price wins. */
export function mergeMods(a: Mods, b: Mods): Mods {
  return {
    enemyHp: a.enemyHp * b.enemyHp,
    eliteHp: a.eliteHp * b.eliteHp,
    enemyDmg: a.enemyDmg * b.enemyDmg,
    beltMul: a.beltMul * b.beltMul,
    heroHp: a.heroHp * b.heroHp,
    restHeal: a.restHeal * b.restHeal,
    rewardCards: a.rewardCards + b.rewardCards,
    manaSlow: a.manaSlow * b.manaSlow,
    blockFade: a.blockFade * b.blockFade,
    enemyTime: a.enemyTime * b.enemyTime,
    abilityCost: a.abilityCost === null || b.abilityCost === null ? (a.abilityCost ?? b.abilityCost) : Math.min(a.abilityCost, b.abilityCost),
    restBoth: a.restBoth || b.restBoth,
    noBeg: a.noBeg || b.noBeg,
    noSkipPay: a.noSkipPay || b.noSkipPay,
    hard: a.hard || b.hard,
  };
}

export function resolveMods(ids: readonly string[]): Mods {
  const m: Mods = { ...NO_MODS, hard: ids.length > 0 };
  for (const id of ids) {
    const d = MODIFIERS[id];
    if (!d) continue;
    m.enemyHp *= d.enemyHp ?? 1;
    m.enemyDmg *= d.enemyDmg ?? 1;
    m.beltMul *= d.beltMul ?? 1;
    m.heroHp *= d.heroHp ?? 1;
    m.restHeal *= d.restHeal ?? 1;
    m.rewardCards += d.rewardCards ?? 0;
  }
  return m;
}
