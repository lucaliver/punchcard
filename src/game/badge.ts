import type { Rng } from '../core/rng';
import { CONFIG } from '../data/config';
import type { Chore } from './chore';

/** The excuses a reader gives for turning down a swipe that was fine (each one has its `task.badge.glitch.<id>` line). */
export const GLITCHES = ['readError', 'otherWay', 'upsideDown', 'demagnetised', 'teapot', 'offAndOn', 'cloud'] as const;
export type Glitch = (typeof GLITCHES)[number];

/** `ok`: read; `slow` / `fast`: the speed was outside the zone; `glitch`: the speed was right and the reader refused it anyway. `ignored`: nothing to swipe now (no penalty). */
export type BadgeVerdict = 'ok' | 'slow' | 'fast' | 'glitch';
export type BadgeResult = BadgeVerdict | 'ignored';

/**
 * The Punch Clock's chore (`MoveDef.task` = 'badge'): drag the badge through the reader, not too slow and not too fast. A swipe is judged by its speed alone (`swipe`, the UI measures it
 * in shares of the track per second); the zone that is accepted drifts after every refusal, and the first `glitches` swipes that would have passed are refused anyway, so it never works first time.
 * Pure state, driven by `Combat.swipeBadge` (which turns a refusal into lost seconds) and ticked by simulated time.
 */
export class BadgeSwipe implements Chore {
  readonly id = 'badge' as const;
  readonly covers = true;
  phase: 'swipe' | 'done' = 'swipe';
  /** The speeds (tracks per second) the reader accepts right now. */
  min = 0;
  max = 0;
  /** Swipes so far, and the last one's verdict, its speed and (for a glitch) the excuse. */
  attempts = 0;
  last: { kind: BadgeVerdict; speed: number; glitch?: Glitch } | null = null;
  errors = 0;
  /** Seconds the refusals have cost so far. */
  fined = 0;
  /** Seconds since the badge was read. */
  private t = 0;
  /** Where the zone is centred, and how many good swipes are still to be refused. */
  private centre: number;
  private glitches: number;

  constructor(private readonly rng: Rng) {
    const c = CONFIG.badge;
    this.centre = c.target[0] + rng.next() * (c.target[1] - c.target[0]);
    this.glitches = rng.int(c.glitches[0], c.glitches[1]);
    this.setZone();
  }

  /** The swipe of a badge at this speed (tracks per second). */
  swipe(speed: number): BadgeResult {
    if (this.phase !== 'swipe') return 'ignored';
    this.attempts++;
    let kind: BadgeVerdict;
    let glitch: Glitch | undefined;
    if (speed < this.min) kind = 'slow';
    else if (speed > this.max) kind = 'fast';
    else if (this.glitches > 0) {
      this.glitches--;
      kind = 'glitch';
      glitch = this.rng.pick(GLITCHES);
    } else kind = 'ok';
    this.last = { kind, speed, glitch };
    if (kind === 'ok') {
      this.phase = 'done';
      this.t = 0;
    } else this.drift();
    return kind;
  }

  /** True once the read badge has been shown off long enough. */
  tick(dt: number): boolean {
    this.t += dt;
    return this.phase === 'done' && this.t >= CONFIG.badge.doneHold;
  }

  /** The reader recalibrates itself after every refusal: the zone slides, so the speed that was right a moment ago may not be. */
  private drift(): void {
    const c = CONFIG.badge;
    this.centre = Math.min(c.target[1], Math.max(c.target[0], this.centre * (1 + (this.rng.next() * 2 - 1) * c.drift)));
    this.setZone();
  }

  private setZone(): void {
    this.min = this.centre * (1 - CONFIG.badge.tolerance);
    this.max = this.centre * (1 + CONFIG.badge.tolerance);
  }
}
