import type { Rng } from '../core/rng';
import { CONFIG } from '../data/config';
import type { Chore } from './chore';

/** The four steps of the pad; a call is one of them or a "freeze". */
export const STEPS = ['left', 'right', 'back', 'hop'] as const;
export type Step = (typeof STEPS)[number];
export type Call = Step | 'freeze';
/** `ok`: answered; `wrong`: the wrong button, or a touch during a freeze; `ignored`: nothing is asked now (between two calls, or once it is over): no penalty. */
export type SlideResult = 'ok' | 'wrong' | 'ignored';

/**
 * The Wedding DJ's chore (`MoveDef.task` = 'slide'): a call at a time is shouted, and the hero answers it on the pad before it times out. A "freeze" asks for nothing at all for a moment, and a touch
 * restarts it. A call that runs out is a mistake too (`lapses`). Pure state, driven by `Combat.slide` (which turns a `wrong` into lost seconds) and ticked by simulated time.
 */
export class SlideDance implements Chore {
  readonly id = 'slide' as const;
  readonly covers = true;
  phase: 'dance' | 'done' = 'dance';
  /** All the calls of the dance, and the one asked now (`index`; `null` call while the silence between two lasts). */
  readonly calls: Call[];
  index = 0;
  /** Seconds the current call has been up, and seconds of silence left before the next one. */
  t = 0;
  gap: number = CONFIG.slide.gap;
  errors = 0;
  /** Seconds the mistakes have cost so far. */
  fined = 0;
  /** Calls answered so far. */
  answered = 0;
  /** Seconds since the last call was answered. */
  private hold = 0;
  /** Calls that ran out since `lapses` was last asked. */
  private missed = 0;

  constructor(rng: Rng) {
    const c = CONFIG.slide;
    // Never the first call, and no two freezes in a row.
    const freezes = new Set<number>();
    for (const i of rng.shuffle(Array.from({ length: c.calls - 1 }, (_, k) => k + 1)))
      if (freezes.size < c.freezes && !freezes.has(i - 1) && !freezes.has(i + 1)) freezes.add(i);
    this.calls = [];
    for (let i = 0; i < c.calls; i++) {
      const last = this.calls[i - 1];
      this.calls.push(freezes.has(i) ? 'freeze' : rng.pick(STEPS.filter((s) => s !== last)));
    }
  }

  /** The call asked now, or null in the silence between two. */
  get call(): Call | null {
    return this.phase === 'dance' && this.gap <= 0 ? this.calls[this.index] : null;
  }

  /** Seconds the current call waits for its answer (the DJ speeds up as the dance goes on). */
  get window(): number {
    const [from, to] = CONFIG.slide.window;
    return from + (to - from) * (this.index / Math.max(1, this.calls.length - 1));
  }

  /** The pad is pressed. */
  press(step: Step): SlideResult {
    const call = this.call;
    if (!call) return 'ignored';
    if (call === 'freeze') {
      this.t = 0;
      return 'wrong';
    }
    if (call !== step) return 'wrong';
    this.next();
    return 'ok';
  }

  /** True once the finished dance has been shown long enough. */
  tick(dt: number): boolean {
    if (this.phase === 'done') {
      this.hold += dt;
      return this.hold >= CONFIG.slide.doneHold;
    }
    if (this.gap > 0) {
      this.gap -= dt;
      if (this.gap <= 0) this.t = 0;
      return false;
    }
    this.t += dt;
    if (this.calls[this.index] === 'freeze') {
      if (this.t >= CONFIG.slide.freeze) this.next();
    } else if (this.t >= this.window) {
      this.missed++;
      this.next();
    }
    return false;
  }

  lapses(): number {
    const n = this.missed;
    this.missed = 0;
    return n;
  }

  private next(): void {
    this.answered++;
    this.index++;
    this.t = 0;
    if (this.index >= this.calls.length) {
      this.phase = 'done';
      this.hold = 0;
    } else this.gap = CONFIG.slide.gap;
  }
}
