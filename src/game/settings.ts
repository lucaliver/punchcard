import { detectLocale, setLocale } from '../core/i18n';
import { load, store } from '../core/save';

export interface Settings {
  /** 0..1 */
  music: number;
  /** 0..1 */
  sfx: number;
  locale: string;
  vibrate: boolean;
  reduceMotion: boolean;
  /** Screen shake on a leak. */
  shake: boolean;
  /** The very first fight has had its tour. */
  seenTour: boolean;
  /** The language screen of a first launch was answered. */
  localeChosen: boolean;
  debug: boolean;
}

const defaults: Settings = {
  music: 0.6,
  sfx: 0.8,
  locale: 'en',
  vibrate: true,
  reduceMotion: false,
  shake: true,
  seenTour: false,
  localeChosen: false,
  debug: false,
};

const clamp01 = (v: unknown, fallback: number): number => (typeof v === 'number' && Number.isFinite(v) ? Math.max(0, Math.min(1, v)) : fallback);
const flag = (v: unknown, fallback: boolean): boolean => (typeof v === 'boolean' ? v : fallback);

/** Saved settings are untrusted: every field is checked and a wrong one falls back to its default. */
function validate(raw: Partial<Record<keyof Settings, unknown>>): Settings {
  return {
    music: clamp01(raw.music, defaults.music),
    sfx: clamp01(raw.sfx, defaults.sfx),
    locale: typeof raw.locale === 'string' ? raw.locale : detectLocale(),
    vibrate: flag(raw.vibrate, defaults.vibrate),
    reduceMotion: flag(raw.reduceMotion, defaults.reduceMotion),
    shake: flag(raw.shake, defaults.shake),
    seenTour: flag(raw.seenTour, defaults.seenTour),
    localeChosen: flag(raw.localeChosen, defaults.localeChosen),
    debug: flag(raw.debug, defaults.debug),
  };
}

export const settings: Settings = validate(load<Partial<Record<keyof Settings, unknown>>>('settings', {}));

export function saveSettings(): void {
  store('settings', settings);
}

/** Applies what the settings say to the page (language, reduced motion). */
export function applySettings(): void {
  setLocale(settings.locale);
  document.documentElement.classList.toggle('reduce-motion', settings.reduceMotion);
}
