import type { Rng } from '../core/rng';
import { CONFIG } from '../data/config';

/**
 * The cards show their faces (`show`), turn over and swap places (`shuffle`), then wait to be picked (`pick`).
 * A wrong pick turns that card over for a moment (`reveal`) and the round starts again; the right one is celebrated (`done`).
 */
export type ShellPhase = 'show' | 'shuffle' | 'pick' | 'reveal' | 'done';

/** `ignored`: not the moment to pick (nothing happens, no penalty). */
export type ShellResult = 'ok' | 'wrong' | 'ignored';

/**
 * The Board's chore (`MoveDef.task` = 'shells'): three covered cards, one of them the Pay Raise. Watch where it is, follow it through the swaps, pick it.
 * Pure state, driven by `Combat.pick` (which turns a `wrong` into lost seconds) and ticked by simulated time.
 */
export class ShellGame {
  phase: ShellPhase = 'show';
  /** The card (an id from 0) that is the Pay Raise. */
  readonly prize: number;
  /** The card id in each place, left to right. */
  slots: number[];
  /** The two places swapping right now and how far along they are (0–1), or null between swaps. */
  swap: { a: number; b: number; u: number } | null = null;
  /** The place the last wrong pick turned over. */
  picked = -1;
  /** Seconds in the current phase. */
  t = 0;
  round = 0;
  errors = 0;
  /** Seconds the mistakes have cost so far. */
  fined = 0;
  private plan: [number, number][] = [];
  private done = 0;

  constructor(private readonly rng: Rng) {
    const n = CONFIG.shells.cards;
    this.slots = Array.from({ length: n }, (_, i) => i);
    this.prize = rng.int(0, n - 1);
  }

  /** Picks the card in this place. */
  pick(place: number): ShellResult {
    if (this.phase !== 'pick' || place < 0 || place >= this.slots.length) return 'ignored';
    this.t = 0;
    if (this.slots[place] === this.prize) {
      this.phase = 'done';
      return 'ok';
    }
    this.phase = 'reveal';
    this.picked = place;
    return 'wrong';
  }

  /** The place the Pay Raise is in now. */
  get prizePlace(): number {
    return this.slots.indexOf(this.prize);
  }

  /** True once the right card has been shown off long enough. */
  tick(dt: number): boolean {
    const c = CONFIG.shells;
    this.t += dt;
    if (this.phase === 'show' && this.t >= c.showTime) {
      this.phase = 'shuffle';
      this.t = 0;
      this.done = 0;
      this.plan = Array.from({ length: c.swaps }, () => this.pair());
    } else if (this.phase === 'shuffle') {
      // A swap each `swapTime`: the places change hands as it ends, `swap.u` is how far along the one under way is.
      while (this.done < this.plan.length && this.t >= (this.done + 1) * c.swapTime) {
        const [a, b] = this.plan[this.done++];
        [this.slots[a], this.slots[b]] = [this.slots[b], this.slots[a]];
      }
      if (this.done >= this.plan.length) {
        this.phase = 'pick';
        this.swap = null;
        this.t = 0;
      } else {
        const [a, b] = this.plan[this.done];
        this.swap = { a, b, u: this.t / c.swapTime - this.done };
      }
    } else if (this.phase === 'reveal' && this.t >= c.revealTime) {
      this.phase = 'show';
      this.picked = -1;
      this.round++;
      this.t = 0;
    }
    return this.phase === 'done' && this.t >= c.doneHold;
  }

  /** Two different places, never the same pair twice in a row (that would be no swap at all). */
  private pair(): [number, number] {
    const n = this.slots.length;
    const last = this.plan[this.plan.length - 1];
    for (;;) {
      const a = this.rng.int(0, n - 1);
      const b = this.rng.int(0, n - 1);
      if (a !== b && !(last && last[0] === Math.min(a, b) && last[1] === Math.max(a, b))) return [Math.min(a, b), Math.max(a, b)];
    }
  }
}
