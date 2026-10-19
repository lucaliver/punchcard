import type { TrackId } from '../audio/music';
import type { SoundId } from '../audio/sfx';

/** One act of the run (a shift of the workday). */
export interface ActDef {
  /** Workday hours shown on the map: its first floor starts at the first, its boss floor ends at the second. */
  shift: [number, number];
  /** Music of its normal fights. */
  music: TrackId;
  /** Music of its map. */
  mapMusic: TrackId;
  /** The sound of the door into its fights (the door itself is drawn in `combat-fx.css` by act). */
  door: SoundId;
  /** Its boss is shown on the map as the workday clock (the morning ends at noon) instead of an icon. */
  bossClock?: boolean;
  /** Icon of its boss on the map (the generic boss one when missing). */
  bossIcon?: string;
}

/** The acts of a full workday: beating the last of them is a won day (`fullDay`), opens the weekend and is what the other heroes' unlocks count. The acts after them are a bonus. */
export const MAIN_ACTS = 3;

export const ACT_DEFS: readonly ActDef[] = [
  { shift: [8, 12], music: 'combat', mapMusic: 'map', door: 'door', bossClock: true },
  { shift: [13, 17], music: 'combat2', mapMusic: 'map2', door: 'doorOffice', bossIcon: 'watchEye' },
  // The night shift runs past midnight to the dawn: the clock shows 22:00 to 06:00.
  { shift: [22, 30], music: 'combat3', mapMusic: 'map3', door: 'doorShutter', bossIcon: 'gavel' },
  // The bonus act: the weekend, from Saturday morning to Sunday night (09:00 to 21:00 on the map's clock).
  { shift: [9, 21], music: 'combat4', mapMusic: 'map4', door: 'doorBell', bossIcon: 'stopwatch' },
];

/** The definition of an act (1-based; later acts fall back to the last one). */
export const actDef = (act: number): ActDef => ACT_DEFS[Math.min(act, ACT_DEFS.length) - 1];
