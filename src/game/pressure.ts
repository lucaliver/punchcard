import { CONFIG } from '../data/config';
import type { EnemyDef } from './types';

/**
 * Adaptive difficulty: pure state of how hard the run leans on the player, never shown to them (`CONFIG.pressure`). Each field is a level from -1 (easing
 * off) to 1 (all the way up) for one thing the next enemies get: `hp` follows how fast the player kills, `dmg` follows how little HP they lose.
 * `Pressure` lives in the run (`RunState.pressure`), `applyCombat` feeds it and `enemyScale` turns it into multipliers.
 */
export interface Pressure {
  hp: number;
  dmg: number;
}

export const calm = (): Pressure => ({ hp: 0, dmg: 0 });

const clamp = (x: number, lo: number, hi: number): number => Math.min(hi, Math.max(lo, x));

/** A level read from a save: anything that isn't a number inside -1..1 is kept inside it. */
export const clampLevel = (x: number): number => clamp(x, -1, 1);

/** -1..1 for how far a fight beat par: `ratio` is what it cost over par (under 1 is better). Nothing close to par, full at `spread` away from it. */
function signal(ratio: number, spread: number): number {
  const gap = 1 - ratio;
  const { dead } = CONFIG.pressure;
  return Math.sign(gap) * clamp((Math.abs(gap) - dead) / (spread - dead), 0, 1);
}

/** What one won fight says: `seconds` it took and `lost` HP it cost, against what a decent player spends at that tier. Positive = too easy. */
export function fightSignals(tier: EnemyDef['tier'], seconds: number, lost: number, maxHp: number): Pressure {
  const { par, spread } = CONFIG.pressure;
  return { hp: signal(seconds / par[tier].time, spread.time), dmg: signal(lost / maxHp / par[tier].loss, spread.loss) };
}

/** The levels after a won fight: each moves toward what the fight said, as far as its tier counts for. */
export function learn(p: Pressure, tier: EnemyDef['tier'], seconds: number, lost: number, maxHp: number): Pressure {
  const s = fightSignals(tier, seconds, lost, maxHp);
  const rate = CONFIG.pressure.rate[tier];
  return { hp: p.hp + rate * (s.hp - p.hp), dmg: p.dmg + rate * (s.dmg - p.dmg) };
}

/** The multipliers on the enemies' HP and damage (1 = none); `memos` says the run plays under management memos, which already ask more of the player. */
export function pressureScale(p: Pressure, memos: boolean): { hp: number; dmg: number } {
  const { max, memoUp } = CONFIG.pressure;
  const mult = (level: number): number => 1 + (level >= 0 ? level * max.up * (memos ? memoUp : 1) : level * max.down);
  return { hp: mult(p.hp), dmg: mult(p.dmg) };
}
