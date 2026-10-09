import { load, store } from '../core/save';
import { GAME_SPEEDS } from '../data/config';

export interface Settings {
  /** Volumes from 0 (off) to 1. */
  sfxVolume: number;
  musicVolume: number;
  speed: number;
  reduceMotion: boolean;
  haptics: boolean;
  locale: string;
  /** The language screen of the first launch has been answered. */
  localeChosen: boolean;
  seenTutorial: boolean;
  /** Cards whose first-time tip (`CardDef.tip`) has been shown. */
  seenTips: string[];
  /** Shows the floating debug buttons (title, fight, map). */
  debugMenus: boolean;
  /** Debug: shows the cards' own paintings (`art/cardArt.ts`) in place of their icons, where a card has one. */
  cardArt: boolean;
  /** Sends anonymous play counters (`src/analytics/`). */
  analytics: boolean;
}

const defaults: Settings = {
  sfxVolume: 0.5,
  musicVolume: 0.5,
  speed: 1,
  reduceMotion: typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches,
  haptics: true,
  locale: 'en',
  localeChosen: false,
  seenTutorial: false,
  seenTips: [],
  debugMenus: false,
  cardArt: false,
  analytics: true,
};

export const settings: Settings = load('settings', defaults);
// Saved data is untrusted: volumes must be numbers in range.
for (const k of ['sfxVolume', 'musicVolume'] as const) {
  const v = settings[k];
  settings[k] = typeof v === 'number' && Number.isFinite(v) ? Math.min(1, Math.max(0, v)) : defaults[k];
}

for (const k of ['reduceMotion', 'haptics', 'localeChosen', 'seenTutorial', 'debugMenus', 'cardArt', 'analytics'] as const)
  if (typeof settings[k] !== 'boolean') settings[k] = defaults[k];
if (!GAME_SPEEDS.some((s) => s === settings.speed)) settings.speed = defaults.speed;
if (typeof settings.locale !== 'string') settings.locale = defaults.locale;
if (!Array.isArray(settings.seenTips) || settings.seenTips.some((id) => typeof id !== 'string')) settings.seenTips = [];

export function saveSettings(): void {
  store('settings', settings);
}
