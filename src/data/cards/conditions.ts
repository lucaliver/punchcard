import type { Combat } from '../../game/combat';

/** Just Cause hits harder once the enemy is at or under this share of its max HP. */
export const JUST_CAUSE_HP = 0.3;

/** Hardship Case gives its bigger Block at or under this share of the hero's max HP. */
export const HARDSHIP_HP = 0.5;

/**
 * The conditions cards name on their face (`{?poison}`…): a card's `play` and its `when` read the same function, so the
 * belt can light the condition up while it holds.
 */
export const WHEN = {
  poison: (c: Combat): boolean => c.has('enemy', 'poison'),
  weak: (c: Combat): boolean => c.has('enemy', 'weak'),
  stun: (c: Combat): boolean => c.has('enemy', 'stun'),
  vulnerable: (c: Combat): boolean => c.has('enemy', 'vulnerable'),
  chill: (c: Combat): boolean => c.has('enemy', 'chill'),
  shock: (c: Combat): boolean => c.has('enemy', 'chill') && c.has('enemy', 'burn'),
  enemyLow: (c: Combat): boolean => c.enemy.hp <= c.enemy.maxHp * JUST_CAUSE_HP,
  heroLow: (c: Combat): boolean => c.hero.hp <= c.hero.maxHp * HARDSHIP_HP,
  block: (c: Combat): boolean => c.hero.block > 0,
  sleeveFull: (c: Combat): boolean => !c.sleeve.includes(null),
  bare: (c: Combat): boolean => c.hero.block <= 0,
} as const;
