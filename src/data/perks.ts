import type { PerkDef } from '../game/types';

/** Perks a deck card can earn at a Promotion, and the drawbacks (`bad`) the Raffle's wheel can hand out. */
const defs: PerkDef[] = [
  { id: 'fastTrack', icon: 'flag', keywords: ['innate'] },
  { id: 'budgetCut', icon: 'priceTag', costDelta: -1 },
  { id: 'overtime', icon: 'shiftClock', costDelta: 1, bad: true },
  { id: 'redTape', icon: 'pending', keywords: ['pending'], bad: true },
];

export const PERKS: Record<string, PerkDef> = Object.fromEntries(defs.map((d) => [d.id, d]));
export const PERK_LIST: readonly PerkDef[] = defs;
