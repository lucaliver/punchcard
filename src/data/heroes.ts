import { ACT_DEFS } from './acts';
import { CONFIG } from './config';
import type { HeroDef, HeroId } from '../game/types';

const rep = (id: string, n: number): string[] => new Array(n).fill(id);

/** A perk one copy of a card starts with in every starter deck: the first Coffee is Innate, so the mana grows from the first seconds. */
const STARTER_PERKS: Record<string, string> = { coffee: 'fastTrack' };

/** The starter deck as cards: one copy of each `startUpgraded` id starts upgraded, one of each `STARTER_PERKS` id starts with its perk. */
export function starterCards(hero: HeroDef): { id: string; up: boolean; perks?: string[] }[] {
  const pending = new Set(hero.startUpgraded);
  const perked = new Set(Object.keys(STARTER_PERKS));
  return hero.startDeck.map((id) => {
    const card = { id, up: pending.delete(id) };
    return perked.delete(id) ? { ...card, perks: [STARTER_PERKS[id]] } : card;
  });
}
/** Thick Skin (Warrior passive): Block under this much fades this many times slower. */
export const THICK_SKIN = { below: 15, mul: 1.3 };
/** Virulence (Necromancer passive): every enemy starts the fight with this much Poison. */
export const VIRULENCE_START = 5;
/** Picket Line (Warrior ability): the hero gains this much Block, held (it does not fade) for this long (s). */
export const PICKET_BLOCK = 20;
export const PICKET_TIME = 10;
/** Sticky Fingers (Rogue passive): a card falling off the belt takes this much off the cost of a random card in the sleeve, until played. */
export const STICKY_FINGERS = 1;
/** Time Theft (Mage ability): the enemy is stunned and the belt rushed for this long (s). */
export const TIME_THEFT = 5;

const warrior: HeroDef = {
  id: 'warrior',
  hp: 70,
  maxMana: 3,
  regen: 1.25,
  blockDecay: CONFIG.heroBlockDecay,
  slowBlock: THICK_SKIN,
  // Starter decks: only basic cards (plus mana crystals); everything else comes from rewards.
  startDeck: [...rep('punch', 8), ...rep('bobTheBuilder', 7), 'bellaCiao', 'coffee', 'coffee', 'skillIssue', 'heavyLifting'],
  startUpgraded: ['punch', 'bobTheBuilder'],
  // The simplest class: no once-per-run special. One arm left: a single sleeve slot.
  sleeve: 1,
  ink: 'var(--p)',
  ability: {
    id: 'picketLine',
    cost: 6,
    use: (c) => {
      c.applyStatus('hero', 'fortified', 1, PICKET_TIME);
      c.gainBlock('hero', PICKET_BLOCK);
    },
  },
  hooks: {},
};

const mage: HeroDef = {
  id: 'mage',
  unlock: { finishRun: 'warrior' },
  hp: 60,
  maxMana: 3,
  regen: 1.25,
  blockDecay: 1.0,
  startDeck: [...rep('clippy', 8), ...rep('fireDoor', 7), 'coffee', 'italianEspresso', 'caffeineJolt', 'staticShock', 'burnout'],
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
  hp: 60,
  maxMana: 2,
  regen: 1.25,
  blockDecay: 0.9,
  startDeck: [
    ...rep('skeletonCrew', 6),
    ...rep('karlMarx', 5),
    'graveyardBrew',
    ...rep('toxicMemo', 4),
    'coffee',
    'italianEspresso',
    'zombieShift',
    'holdMusic',
  ],
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
  },
};

const rogue: HeroDef = {
  id: 'rogue',
  unlock: { allStamped: ACT_DEFS.length },
  hp: 60,
  maxMana: 3,
  regen: 1.25,
  blockDecay: 1.0,
  startDeck: [
    ...rep('borrowedStapler', 7),
    ...rep('hideTheEvidence', 7),
    'slushFund',
    'coffee',
    'coffee',
    'italianEspresso',
    'lupin',
    'plausibleDeniability',
  ],
  startUpgraded: ['borrowedStapler', 'hideTheEvidence'],
  sleeve: 3,
  fallDiscount: STICKY_FINGERS,
  ink: 'var(--rust)',
  ability: {
    id: 'stocktake',
    cost: 6,
    // Everything on the belt falls at once, each card making a card in the sleeve cheaper.
    use: (c) => void c.dropBelt(),
  },
  hooks: {},
};

export const HEROES: Record<HeroId, HeroDef> = { warrior, mage, necromancer, rogue };
export const HERO_LIST: HeroDef[] = [warrior, mage, necromancer, rogue];
