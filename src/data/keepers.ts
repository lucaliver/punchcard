import type { KeeperDef, KeeperId } from '../game/types';

/** The lantern keepers. The first is open from the start; the others are won by beating a night's boss. */
export const KEEPERS: Record<KeeperId, KeeperDef> = {
  miko: {
    id: 'miko',
    flame: 14,
    oil: 3,
    maxOil: 10,
    hand: 4,
    deck: ['ofudaArcher', 'ofudaArcher', 'ofudaArcher', 'komainu', 'komainu', 'salt', 'salt', 'ofuda', 'kodama', 'oilJar'],
    /** The Purifying Bell: a clear note that hurts and holds every foe on the field. */
    ability: { cd: 42, fx: [{ k: 'hit', dmg: 3, scope: 'all', stun: 1.2 }] },
    ink: '#e9503a',
    unlock: 'start',
    passive: { k: 'charmCut', n: 1 },
  },
  ronin: {
    id: 'ronin',
    flame: 15,
    oil: 3,
    maxOil: 10,
    hand: 4,
    deck: ['wanderer', 'wanderer', 'wanderer', 'bambooWall', 'bambooWall', 'crane', 'kunai', 'kunai', 'kodama', 'ofuda'],
    /** Iai: one drawn cut that falls on the front foe of every lane. */
    ability: { cd: 40, fx: [{ k: 'hit', dmg: 14, scope: 'fronts' }] },
    ink: '#3f6fd6',
    unlock: 'boss1',
    passive: { k: 'hardy', n: 0.25 },
  },
  tanuki: {
    id: 'tanuki',
    flame: 12,
    oil: 4,
    maxOil: 10,
    hand: 4,
    deck: ['acorn', 'acorn', 'acorn', 'leafDecoy', 'leafDecoy', 'leafDecoy', 'kodama', 'kodama', 'ofuda', 'oilJar'],
    /** Leaf Shuffle: the whole table is tossed in the air and comes back with fresh oil. */
    ability: { cd: 36, fx: [{ k: 'oil', n: 4 }, { k: 'redeal' }] },
    ink: '#5b9a54',
    unlock: 'boss2',
    passive: { k: 'purse', n: 14 },
  },
};

export const KEEPER_IDS: KeeperId[] = ['miko', 'ronin', 'tanuki'];
