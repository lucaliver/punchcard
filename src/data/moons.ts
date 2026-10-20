import { CONFIG } from './config';

export interface MoonMods {
  /** Share added to every foe's HP. */
  hp: number;
  /** Flame taken off the keeper's. */
  flame: number;
  /** Share added to the HP of elites and bosses. */
  elite: number;
  /** Share added to the market's prices. */
  price: number;
  /** Share added to every foe's walking speed. */
  speed: number;
}

export const MAX_MOON = CONFIG.moons.length;

/** What the rules of moon phases 1..`level` add up to. */
export function moonMods(level: number): MoonMods {
  const sum: MoonMods = { hp: 0, flame: 0, elite: 0, price: 0, speed: 0 };
  for (let i = 0; i < Math.min(level, MAX_MOON); i++) for (const [k, v] of Object.entries(CONFIG.moons[i])) sum[k as keyof MoonMods] += v;
  return sum;
}
