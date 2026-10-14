import { CONFIG } from '../data/config';
import type { Combat } from './combat';
import type { EnemyDef } from './types';

/**
 * Adaptive difficulty: pure state of how hard the run leans on the player, never shown to them (`CONFIG.pressure`). Each field is a level from -1 (easing
 * off) to 1 (all the way up) for one thing the next enemies get: `hp` follows how hard the player hits, `dmg` follows how little HP they lose.
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

/** What a won fight says about the player. */
export interface FightFacts {
  tier: EnemyDef['tier'];
  /** Damage the player put into the enemy: the HP it lost plus what its Block soaked up (a blocky enemy is not a slower kill). */
  dealt: number;
  /** Seconds the fight took. */
  seconds: number;
  /** HP the hero lost, against `maxHp`, and what it had left at the end. */
  lost: number;
  left: number;
  maxHp: number;
  /** The hero begged to stay in it. */
  begged: boolean;
}

export const fightFacts = (c: Combat, maxHp: number): FightFacts => ({
  tier: c.enemy.def.tier,
  dealt: c.stats.damageDealt + c.stats.enemyBlocked,
  seconds: c.time,
  lost: c.stats.damageTaken,
  left: Math.min(Math.max(0, c.hero.hp), maxHp),
  maxHp,
  begged: c.begged,
});

/** The hero won on its last legs: too close to dying to say the fight was easy, whatever par says about the HP it lost. */
const closeCall = (f: FightFacts): boolean => f.left < f.maxHp * CONFIG.pressure.closeCall;

/**
 * What one won fight says, against what a decent player does at that tier. Positive = too easy: `hp` for the damage the player dealt per second (so
 * the enemy's size and the pressure's own HP don't count, only how hard the player hits), `dmg` for how little HP it cost them.
 */
export function fightSignals(f: FightFacts): Pressure {
  const { par, spread } = CONFIG.pressure;
  const dps = f.dealt / Math.max(f.seconds, 1);
  return {
    hp: signal(dps > 0 ? par[f.tier].dps / dps : Number.POSITIVE_INFINITY, spread.dps),
    dmg: closeCall(f) ? -1 : signal(f.lost / f.maxHp / par[f.tier].loss, spread.loss),
  };
}

/**
 * The levels after a won fight: each moves toward what the fight said, as far as its tier counts for; a hero who begged to stay sends both all the way down,
 * and one who won on its last legs sends the damage level all the way down.
 */
export function learn(p: Pressure, f: FightFacts): Pressure {
  if (f.begged) return { hp: -1, dmg: -1 };
  const s = fightSignals(f);
  const rate = CONFIG.pressure.rate[f.tier];
  return { hp: p.hp + rate * (s.hp - p.hp), dmg: closeCall(f) ? -1 : p.dmg + rate * (s.dmg - p.dmg) };
}

/** The multipliers on the enemies' HP and damage (1 = none); `memos` says the run plays under management memos, which already ask more of the player. */
export function pressureScale(p: Pressure, memos: boolean): { hp: number; dmg: number } {
  const { max, memoUp } = CONFIG.pressure;
  const mult = (level: number): number => 1 + (level >= 0 ? level * max.up * (memos ? memoUp : 1) : level * max.down);
  return { hp: mult(p.hp), dmg: mult(p.dmg) };
}
