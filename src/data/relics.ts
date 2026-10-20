import type { RelicDef } from '../game/types';

/** Charms and trinkets carried for the whole run. Names and texts: `relic.<id>.name` / `.d` (`{n}` = the number). */
const list: RelicDef[] = [
  { id: 'oilFlask', rarity: 'common', n: 2, art: 'oilFlask', mods: { maxOil: 2 } },
  { id: 'wickTrimmer', rarity: 'common', n: 0.12, art: 'wickTrimmer', mods: { regen: 0.12 } },
  { id: 'paperFan', rarity: 'common', n: 0.25, art: 'paperFan', mods: { drawCut: 0.25 } },
  { id: 'lanternGlass', rarity: 'common', n: 3, art: 'lanternGlass', mods: { flame: 3 } },
  { id: 'luckyPaw', rarity: 'common', n: 10, art: 'luckyPaw', mods: { coins: 10 } },
  { id: 'geta', rarity: 'common', n: 3, art: 'geta', mods: { startOil: 3 } },
  { id: 'thickBamboo', rarity: 'rare', n: 20, art: 'thickBamboo', mods: { hp: 0.2 } },
  { id: 'whetstone', rarity: 'rare', n: 15, art: 'whetstone', mods: { dmg: 0.15 } },
  { id: 'fortuneScroll', rarity: 'rare', n: 1, art: 'fortuneScroll', mods: { rewardCards: 1 } },
  { id: 'incense', rarity: 'rare', n: 5, art: 'incense', hook: { k: 'killOil', every: 5 } },
  { id: 'redLantern', rarity: 'rare', n: 1, art: 'redLantern', hook: { k: 'dawnMend' } },
  { id: 'samuraiSeal', rarity: 'rare', n: 35, art: 'samuraiSeal', hook: { k: 'abilityFast', n: 0.35 } },
  { id: 'mamori', rarity: 'epic', n: 4, art: 'mamori', hook: { k: 'leakSpare', every: 4 } },
  { id: 'wideSleeve', rarity: 'epic', n: 1, art: 'wideSleeve', mods: { hand: 1 } },
  { id: 'amaterasuMirror', rarity: 'boss', n: 4, m: 0.1, art: 'mirror', mods: { flame: 4, regen: 0.1 } },
  { id: 'kitsuneMask', rarity: 'boss', n: 1, m: 10, art: 'kitsuneMask', mods: { hand: 1, dmg: 0.1 } },
  { id: 'nurariTea', rarity: 'boss', n: 3, art: 'teaCup', mods: { maxOil: 3, startOil: 3 } },
];

export const RELICS: Record<string, RelicDef> = Object.fromEntries(list.map((r) => [r.id, r]));
export const RELIC_IDS: string[] = list.map((r) => r.id);

export type RelicMods = Required<NonNullable<RelicDef['mods']>>;

/** The sum of what a set of relics does by plain numbers. */
export function relicMods(ids: readonly string[]): RelicMods {
  const sum: RelicMods = { maxOil: 0, startOil: 0, regen: 0, hand: 0, flame: 0, drawCut: 0, hp: 0, dmg: 0, coins: 0, rewardCards: 0 };
  for (const id of ids) for (const [k, v] of Object.entries(RELICS[id]?.mods ?? {})) sum[k as keyof RelicMods] += v;
  return sum;
}
