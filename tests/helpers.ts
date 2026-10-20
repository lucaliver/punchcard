import { Battle } from '../src/game/battle';
import type { CardInst, KeeperId, Spawn, StageDef, Terrain } from '../src/game/types';
import { COLS, ROWS } from '../src/game/types';

let uid = 1;
export const cards = (...ids: string[]): CardInst[] => ids.map((id) => ({ uid: uid++, id, up: false }));

export const flatTerrain = (): Terrain[][] => Array.from({ length: COLS }, () => Array.from({ length: ROWS }, () => 'ground' as Terrain));

/**
 * A quiet stage with only the spawns given, for testing one rule at a time. A last foe that never comes (after the night ends) keeps the
 * fight from being won early.
 */
export function stage(spawns: Spawn[] = [], over: Partial<StageDef> = {}): StageDef {
  const duration = over.duration ?? 600;
  return { act: 1, duration, spawns: [...spawns, { t: duration + 100, lane: 0, foe: 'zori' }], terrain: flatTerrain(), hpMul: 1, ...over };
}

export function battle(deck: string[], st: StageDef = stage(), keeper: KeeperId = 'miko', relics: string[] = []): Battle {
  const b = new Battle({ seed: 7, keeper, deck: cards(...deck), relics, stage: st, flame: 10, maxFlame: 10 });
  b.start();
  return b;
}

/** Puts the card of `id` in hand slot 0 by swapping it in, tops the oil up, and returns the slot. */
export function hold(b: Battle, id: string, slot = 0): number {
  const c = { uid: uid++, id, up: false };
  b.hand[slot] = c;
  b.oil = b.maxOil;
  return slot;
}

export const run = (b: Battle, seconds: number): void => {
  for (let i = 0; i < Math.round(seconds * 10); i++) b.step(0.1);
};
