import { expect } from 'vitest';
import { Combat, type CombatSetup } from '../../src/game/combat';
import { CoffeeTask } from '../../src/game/coffee';
import { ShellGame } from '../../src/game/shells';
import { ENEMIES } from '../../src/data/enemies';
import { HEROES } from '../../src/data/heroes';
import type { CardInst } from '../../src/game/types';

/** The coffee chore or the shell game the fight has set now (a test that finds another, or none, fails here). */
export const coffeeOf = (c: Combat): CoffeeTask => {
  expect(c.chore).toBeInstanceOf(CoffeeTask);
  return c.chore as CoffeeTask;
};
export const shellsOf = (c: Combat): ShellGame => {
  expect(c.chore).toBeInstanceOf(ShellGame);
  return c.chore as ShellGame;
};

export const deckOf = (ids: string[]): CardInst[] => ids.map((id, i) => ({ uid: i + 1, id, up: false }));

/** The default opponent: a Senior Boomer without his passives, so tests count only what they set up. */
export const plainBoomer = { ...ENEMIES.seniorBoomer, start: [], onHalf: undefined };

export function setup(over: Partial<CombatSetup> = {}): Combat {
  return new Combat({
    hero: HEROES.warrior,
    hp: 80,
    maxHp: 80,
    deck: deckOf(HEROES.warrior.startDeck),
    relics: [],
    relicFlags: {},
    enemy: plainBoomer,
    scale: { hp: 1, dmg: 1 },
    seed: 42,
    ...over,
  });
}

export const run = (c: Combat, seconds: number): void => {
  for (let t = 0; t < seconds; t += 1 / 60) c.tick(1 / 60);
};
