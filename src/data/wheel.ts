import { PERKS } from './perks';

/** What a slice of the Raffle's wheel does to the cards the player picks after the spin. */
export type WheelEffect = { kind: 'upgrade' } | { kind: 'perk'; perk: string } | { kind: 'none' };

/** A slice of the Raffle's wheel. A perk slice reads its name and text from `perk.<id>`, the others from `wheel.<id>` and `wheel.<id>.d`. */
export interface WheelSlot {
  id: string;
  icon: string;
  effect: WheelEffect;
}

const perkSlot = (perk: string): WheelSlot => ({ id: perk, icon: PERKS[perk].icon, effect: { kind: 'perk', perk } });

/** The slices in the order they are drawn, clockwise from the top: good and bad luck alternate. */
export const WHEEL: readonly WheelSlot[] = [
  { id: 'training', icon: 'upgrade', effect: { kind: 'upgrade' } },
  perkSlot('overtime'),
  perkSlot('fastTrack'),
  perkSlot('redTape'),
  perkSlot('budgetCut'),
  { id: 'dayOff', icon: 'hammock', effect: { kind: 'none' } },
];
