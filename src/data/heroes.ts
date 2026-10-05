import { CONFIG } from './config';
import type { HeroDef, HeroId } from '../game/types';

const rep = (id: string, n: number): string[] => new Array(n).fill(id);

/** The starter deck as cards: one copy of each `startUpgraded` id starts upgraded. */
export function starterCards(hero: HeroDef): { id: string; up: boolean }[] {
  const pending = new Set(hero.startUpgraded);
  return hero.startDeck.map((id) => ({ id, up: pending.delete(id) }));
}
/** Thick Skin (Warrior passive): Block under this much fades this many times slower. */
export const THICK_SKIN = { below: 15, mul: 1.3 };
/** Virulence (Necromancer passive): every enemy starts the fight with this much Poison. */
export const VIRULENCE_START = 3;
/** Overtime (Warrior ability): attacks deal this many times as much, for this long (s). */
export const OVERTIME_MULT = 2;
export const OVERTIME_TIME = 10;
/** Sticky Fingers (Rogue passive): with the sleeve full, a card falling off the belt takes this much off the cost of every card in it, until played. */
export const STICKY_FINGERS = { discount: 1 };
/** Time Theft (Mage ability): the enemy is stunned and the belt rushed for this long (s). */
export const TIME_THEFT = 5;

const warrior: HeroDef = {
  id: 'warrior',
  hp: 60,
  maxMana: 3,
  regen: 1.25,
  blockDecay: CONFIG.heroBlockDecay,
  slowBlock: THICK_SKIN,
  // Starter decks: only basic cards (plus mana crystals); everything else comes from rewards.
  startDeck: [...rep('punch', 8), ...rep('bobTheBuilder', 7), 'bellaCiao', 'coffee', 'coffee'],
  startUpgraded: ['punch', 'bobTheBuilder'],
  // The simplest class: no once-per-run special. One arm left: a single sleeve slot.
  sleeve: 1,
  ink: 'var(--p)',
  ability: {
    id: 'overtime',
    cost: 6,
    use: (c) => c.applyStatus('hero', 'overtime', 1, OVERTIME_TIME),
  },
  hooks: {
    damageMult: (c, def) => (def?.type === 'attack' && c.has('hero', 'overtime') ? OVERTIME_MULT : 1),
  },
};

const mage: HeroDef = {
  id: 'mage',
  unlock: { finishRun: 'warrior' },
  hp: 70,
  maxMana: 3,
  regen: 1.25,
  blockDecay: 1.0,
  startDeck: [...rep('clippy', 8), ...rep('fireDoor', 7), 'coffee', 'italianEspresso', 'caffeineJolt'],
  startUpgraded: ['clippy', 'fireDoor'],
  sleeve: 2,
  passiveStatus: 'multitasking',
  ink: 'var(--b)',
  ability: {
    id: 'timeTheft',
    cost: 6,
    use: (c) => {
      c.applyStatus('enemy', 'stun', 1, TIME_THEFT);
      c.rushBelt(TIME_THEFT);
    },
  },
  hooks: {
    // Multitasking: each attack played within the window adds a stack (+1 attack damage each).
    onCardPlayed: (c, _card, def) => {
      if (def.type !== 'attack') return;
      c.chargeMultitasking();
    },
    bonusDamage: (c, def) => (def?.type === 'attack' ? c.stacks('hero', 'multitasking') : 0),
  },
};

const necromancer: HeroDef = {
  id: 'necromancer',
  unlock: { reachBoss: 1 },
  hp: 50,
  maxMana: 2,
  regen: 1.25,
  blockDecay: 0.9,
  startDeck: [...rep('skeletonCrew', 6), ...rep('karlMarx', 6), ...rep('toxicMemo', 4), 'coffee', 'italianEspresso'],
  startUpgraded: ['skeletonCrew', 'karlMarx'],
  sleeve: 3,
  ink: 'var(--green)',
  ability: {
    id: 'generalStrike',
    cost: 6,
    // Double the enemy's Poison.
    use: (c) => c.applyStatus('enemy', 'poison', c.stacks('enemy', 'poison')),
  },
  hooks: {
    // Virulence: the enemy starts with Poison.
    onCombatStart: (c) => c.applyStatus('enemy', 'poison', VIRULENCE_START, 0, true),
    // Virulent Form: its stacks add to every Poison tick.
    enemyDotBonus: (c, id) => (id === 'poison' ? c.stacks('hero', 'virulence') : 0),
    // Plague: Attacks also apply Poison.
    onCardPlayed: (c, _card, def) => {
      const plague = c.stacks('hero', 'plague');
      if (plague > 0 && def.type === 'attack') c.applyStatus('enemy', 'poison', plague, 0, true);
    },
  },
};

const rogue: HeroDef = {
  id: 'rogue',
  // Still in the works: only the debug menu's unlock-all hires them, and until then none of their cards turns up anywhere.
  unlock: { debug: true },
  hp: 50,
  maxMana: 3,
  regen: 1.25,
  blockDecay: 1.0,
  startDeck: [...rep('borrowedStapler', 8), ...rep('hideTheEvidence', 7), 'coffee', 'coffee', 'italianEspresso'],
  startUpgraded: ['borrowedStapler', 'hideTheEvidence'],
  sleeve: 4,
  catchesFalls: STICKY_FINGERS,
  ink: 'var(--rust)',
  ability: {
    id: 'stocktake',
    cost: 6,
    // Everything on the belt falls at once: the sleeve fills up, and what doesn't fit makes it cheaper.
    use: (c) => void c.dropBelt(),
  },
  hooks: {},
};

export const HEROES: Record<HeroId, HeroDef> = { warrior, mage, necromancer, rogue };
export const HERO_LIST: HeroDef[] = [warrior, mage, necromancer, rogue];
