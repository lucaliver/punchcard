import type { HexDef } from '../game/types';

/** Curses enemies cast on single cards of the belt. */
const defs: HexDef[] = [
  { id: 'petrify', icon: 'stone', taps: 5, thaw: 0.5 },
  // The card is screwed up into a ball: each tap smooths it out a little.
  // The Tourist's luggage: shut up in a suitcase until it is unpacked.
  { id: 'suitcase', icon: 'luggage', taps: 2, thaw: 0.3, stages: ['luggage', 'luggageOpen'] },
  { id: 'crumple', icon: 'crumple4', taps: 4, thaw: 0.3, stages: ['crumple4', 'crumple3', 'crumple2', 'crumple1'] },
];

export const HEXES: Record<string, HexDef> = Object.fromEntries(defs.map((d) => [d.id, d]));
