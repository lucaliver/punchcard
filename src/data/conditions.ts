import { Rng } from '../core/rng';
import { CONFIG } from './config';

/**
 * Office conditions: the day's twist on an ordinary fight, told before it starts (a perk day, or a trouble day that pays more). A condition is a few
 * statuses either side starts the fight with and the share of the pay it changes; the engine knows nothing of it (`CombatSetup.condition`).
 * Texts: `condition.<id>.name`, `condition.<id>.d` (`{n}` = the first status's amount).
 */
export interface Start {
  id: string;
  v: number;
}

export interface ConditionDef {
  id: string;
  /** The acts it can come in, first to last. */
  acts: [first: number, last: number];
  /** Pixel icon. */
  icon: string;
  hero?: Start[];
  enemy?: Start[];
  /** What the fight pays, as a multiple of the usual. */
  pay: number;
}

/** What a day of trouble pays over a plain one. */
const TROUBLE_PAY = 1.35;

export const CONDITIONS: ConditionDef[] = [
  // ---- perk days
  { id: 'freeCoffeeDay', acts: [1, 4], icon: 'coffee', hero: [{ id: 'freeCoffee', v: 1 }], pay: 1 },
  { id: 'casualFriday', acts: [1, 4], icon: 'muscle', hero: [{ id: 'strength', v: 2 }], pay: 1 },
  { id: 'safetyWeek', acts: [1, 4], icon: 'hiVisVest', hero: [{ id: 'steelToes', v: 2 }], pay: 1 },
  { id: 'compDay', acts: [1, 4], icon: 'redCross', hero: [{ id: 'workersComp', v: 4 }], pay: 1 },
  { id: 'pizzaParty', acts: [1, 4], icon: 'pizza', hero: [{ id: 'regen', v: 1 }], pay: 1 },
  { id: 'unionDay', acts: [1, 4], icon: 'picketSign', hero: [{ id: 'thorns', v: 2 }], pay: 1 },
  // ---- trouble days
  { id: 'understaffed', acts: [1, 4], icon: 'intern', enemy: [{ id: 'strength', v: 2 }], pay: TROUBLE_PAY },
  { id: 'overtime', acts: [1, 4], icon: 'creepClock', enemy: [{ id: 'overtimeCreep', v: 1 }], pay: TROUBLE_PAY },
  { id: 'auditWeek', acts: [1, 4], icon: 'thorns', enemy: [{ id: 'thorns', v: 1 }], pay: TROUBLE_PAY },
  { id: 'nepotism', acts: [1, 4], icon: 'tophat', enemy: [{ id: 'strength', v: 3 }], pay: 1.5 },
  { id: 'wellnessWeek', acts: [1, 2], icon: 'leaf', enemy: [{ id: 'forcedSmile', v: 1 }], pay: TROUBLE_PAY },
];

export const CONDITION_LIST = CONDITIONS;
export const CONDITION_BY_ID: Record<string, ConditionDef> = Object.fromEntries(CONDITIONS.map((c) => [c.id, c]));

/** The amount the text quotes: the first status the condition hands out. */
export const conditionAmount = (c: ConditionDef): number => (c.hero ?? c.enemy ?? [])[0]?.v ?? 0;

/**
 * The condition of an ordinary fight (none for the rest): dealt from the run's seed and the room, so the same room always has the same one
 * and nothing needs saving.
 */
export function rollCondition(seed: number, nodeId: number, act: number): ConditionDef | undefined {
  const rng = new Rng((seed ^ Math.imul(nodeId + 7, 2246822519)) >>> 0);
  if (rng.next() >= CONFIG.condition.chance) return undefined;
  const fits = CONDITIONS.filter((c) => c.acts[0] <= act && act <= c.acts[1]);
  return fits.length ? rng.pick(fits) : undefined;
}
