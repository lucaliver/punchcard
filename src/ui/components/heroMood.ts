import type { HeroId } from '../../game/types';
import { creature } from '../art/creatures';
import { type Mood, MOODS, moodId } from '../art/heroMoods';

/** The hero's drawing and, stacked on it and hidden, one drawing per mood (`art/heroMoods.ts`): `data-mood` on the portrait says which one shows. */
export const heroFaces = (hero: HeroId): string => creature(hero) + MOODS.map((m) => creature(moodId(hero, m), `mood mood-${m}`)).join('');

/** Seconds a blink lasts, and the range of seconds between two. */
const BLINK = 0.14;
const BLINK_GAP: [number, number] = [2.4, 5.6];

export interface HeroMood {
  /** Shows a mood for `seconds` (for good with `Infinity`): a hit, a cast, the end of the fight. A new one replaces the one on. */
  flash(mood: Mood, seconds: number): void;
  /** Low on HP: the hero looks battered whenever nothing else is on its face. */
  setLow(low: boolean): void;
  /** Runs the clocks (a blink every few seconds). */
  frame(dt: number): void;
}

/** What the hero's face does in a fight: an idle blink, a wince when hit, a shout when it casts, a grin when it wins; battered while low on HP. */
export function createHeroMood(portrait: HTMLElement): HeroMood {
  let low = false;
  let on: Mood | null = null;
  let left = 0;
  let blink = BLINK_GAP[1];
  let blinking = 0;
  const show = (): void => {
    const mood = on ?? (low ? 'tired' : blinking > 0 ? 'blink' : null);
    if (mood) portrait.dataset.mood = mood;
    else delete portrait.dataset.mood;
  };
  return {
    flash(mood, seconds) {
      on = mood;
      left = seconds;
      show();
    },
    setLow(value) {
      if (low === value) return;
      low = value;
      show();
    },
    frame(dt) {
      if (on && left !== Number.POSITIVE_INFINITY) {
        left -= dt;
        if (left <= 0) {
          on = null;
          show();
        }
      }
      if (blinking > 0) {
        blinking -= dt;
        if (blinking <= 0) show();
        return;
      }
      blink -= dt;
      if (blink <= 0) {
        blink = BLINK_GAP[0] + Math.random() * (BLINK_GAP[1] - BLINK_GAP[0]);
        blinking = BLINK;
        show();
      }
    },
  };
}
