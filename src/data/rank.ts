import type { HeroId, Rarity } from '../game/types';
import { mergeMods, NO_MODS, type Mods } from './modifiers';

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
  | { kind: 'restBoth' };

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
  | { kind: 'noBeg' };

export type RankEffect = RankBonus | RankDuty;

/** One rung: what it gives and what it asks. */
export interface RankStep {
  bonus: RankBonus;
  duty: RankDuty;
}

const LADDER: Partial<Record<HeroId, readonly RankStep[]>> = {
  // Ordered so a run gets harder a little at a time: the mild duties first, the ones that change how you play after; a bonus comes with every rung and the big gifts crown the top.
  warrior: [
    { bonus: { kind: 'maxHp', n: 10 }, duty: { kind: 'restHeal', n: 15 } },
    { bonus: { kind: 'abilityCost', n: 3 }, duty: { kind: 'eliteHp', n: 10 } },
    { bonus: { kind: 'cards', rarity: 'rare', n: 1 }, duty: { kind: 'enemyDmg', n: 10 } },
    { bonus: { kind: 'upgrade', cards: ['skillIssue', 'heavyLifting', 'caffeineJolt'] }, duty: { kind: 'belt', n: 10 } },
    { bonus: { kind: 'relic' }, duty: { kind: 'noSkipPay' } },
    { bonus: { kind: 'crystal', n: 1 }, duty: { kind: 'manaSlow', n: 15 } },
    { bonus: { kind: 'rewardCards', n: 1 }, duty: { kind: 'blockFade', n: 25 } },
    { bonus: { kind: 'restBoth' }, duty: { kind: 'enemyTime', n: 10 } },
    { bonus: { kind: 'cards', rarity: 'epic', n: 1 }, duty: { kind: 'enemyHp', n: 10 } },
    { bonus: { kind: 'cards', rarity: 'legendary', n: 2 }, duty: { kind: 'noBeg' } },
  ],
};

/** The ranks a hero can reach (0 when the hero has no ladder: the hero plays under management memos instead). */
export const rankMax = (hero: HeroId): number => LADDER[hero]?.length ?? 0;

/** The first `level` rungs of a hero's ladder, in order. */
export const rankSteps = (hero: HeroId, level: number): readonly RankStep[] => LADDER[hero]?.slice(0, Math.max(0, level)) ?? [];

/** The effects of one side of the rungs up to `level`. */
export const rankEffects = (hero: HeroId, level: number, side: keyof RankStep): RankEffect[] => rankSteps(hero, level).map((s) => s[side]);

const pct = (n: number): number => 1 + n / 100;

/** What an effect changes while the run is played (the part of it that isn't a gift at the start: those are `RankEffect`s read by `newRun`). */
function modsOf(e: RankEffect): Partial<Mods> {
  switch (e.kind) {
    case 'maxHp':
    case 'cards':
    case 'upgrade':
    case 'relic':
    case 'crystal':
      return {};
    case 'abilityCost':
      return { abilityCost: e.n };
    case 'rewardCards':
      return { rewardCards: e.n };
    case 'restBoth':
      return { restBoth: true };
    case 'restHeal':
      return { restHeal: 1 - e.n / 100 };
    case 'eliteHp':
      return { eliteHp: pct(e.n) };
    case 'enemyHp':
      return { enemyHp: pct(e.n) };
    case 'enemyDmg':
      return { enemyDmg: pct(e.n) };
    case 'belt':
      return { beltMul: pct(e.n) };
    case 'manaSlow':
      return { manaSlow: pct(e.n) };
    case 'blockFade':
      return { blockFade: pct(e.n) };
    case 'enemyTime':
      return { enemyTime: pct(e.n) };
    case 'noSkipPay':
      return { noSkipPay: true };
    case 'noBeg':
      return { noBeg: true };
  }
}

/** What playing a hero at this rank changes, all the rungs up to it together (`NO_MODS` at rank 0). */
export function rankMods(hero: HeroId, level: number): Mods {
  if (level <= 0 || !rankMax(hero)) return NO_MODS;
  let total: Mods = { ...NO_MODS, hard: true };
  for (const step of rankSteps(hero, level)) {
    for (const e of [step.bonus, step.duty]) total = mergeMods(total, { ...NO_MODS, ...modsOf(e) });
  }
  return total;
}
