import type { Rng } from '../core/rng';
import { CONFIG } from '../data/config';
import type { Chore } from './chore';

/** `raw`: not done on this side yet; `ready`: the moment to act; `burnt`: too late. */
export type PattyState = 'raw' | 'ready' | 'burnt';
/** `flip`: the first side was ready and is turned; `serve`: the second one was ready and the burger goes to the plate; `raw`: a mistake; `binned`: a burnt patty thrown away (the mistake was the burning); `ignored`: nothing to do there (no penalty). */
export type GrillResult = 'flip' | 'serve' | 'raw' | 'binned' | 'ignored';

export interface Patty {
  /** The side on the fire now, and which sides are done. */
  side: 0 | 1;
  done: [boolean, boolean];
  /** Whether the burning of this side was already counted as a mistake. */
  charred: boolean;
  /** Seconds on this side (negative: still to be put on the fire, it counts as raw), and how long this side takes to be ready. */
  t: number;
  cook: number;
}

/**
 * The Barbecue Dad's chore (`MoveDef.task` = 'grill'): burgers on a grill, each cooked on both sides. Tap a patty while its side is ready to flip it (or serve it, if it is the second side); too early or too late
 * is a mistake (a patty left to burn is one too, `lapses`), and a burnt one is thrown away and replaced. Done when `patties` have been served. Pure state, driven by `Combat.grill` (which turns a mistake into lost seconds) and ticked by simulated time.
 */
export class GrillLine implements Chore {
  readonly id = 'grill' as const;
  readonly covers = true;
  phase: 'grill' | 'done' = 'grill';
  /** The grate: a patty or an empty place. */
  readonly slots: (Patty | null)[];
  readonly total: number;
  served = 0;
  errors = 0;
  /** Seconds the mistakes have cost so far. */
  fined = 0;
  /** Seconds since the last burger was served. */
  private t = 0;
  /** Patties that burnt since `lapses` was last asked. */
  private burnt = 0;

  constructor(private readonly rng: Rng) {
    const c = CONFIG.grill;
    this.total = c.patties;
    this.slots = Array.from({ length: c.slots }, (_, i) => this.fresh(-i * c.stagger));
  }

  /** The state of a patty's current side. */
  stateOf(p: Patty): PattyState {
    return p.t < p.cook ? 'raw' : p.t < p.cook + CONFIG.grill.window ? 'ready' : 'burnt';
  }

  /** The patty in this place of the grate is tapped. */
  flip(slot: number): GrillResult {
    const p = this.slots[slot];
    if (this.phase === 'done' || !p) return 'ignored';
    const state = this.stateOf(p);
    if (state === 'raw') return 'raw';
    if (state === 'burnt') {
      // Into the bin, and a fresh one in its place.
      this.slots[slot] = this.fresh(0);
      return 'binned';
    }
    p.done[p.side] = true;
    if (!p.done[1 - p.side]) {
      p.side = (1 - p.side) as 0 | 1;
      p.t = 0;
      p.charred = false;
      p.cook = this.cookTime();
      return 'flip';
    }
    this.served++;
    this.slots[slot] = this.served + this.slots.filter(Boolean).length - 1 < this.total ? this.fresh(0) : null;
    if (this.served >= this.total) {
      this.phase = 'done';
      this.t = 0;
    }
    return 'serve';
  }

  /** True once the plate has been shown long enough. */
  tick(dt: number): boolean {
    if (this.phase === 'done') {
      this.t += dt;
      return this.t >= CONFIG.grill.doneHold;
    }
    for (const p of this.slots) {
      if (!p) continue;
      p.t += dt;
      if (!p.charred && this.stateOf(p) === 'burnt') {
        p.charred = true;
        this.burnt++;
      }
    }
    return false;
  }

  lapses(): number {
    const n = this.burnt;
    this.burnt = 0;
    return n;
  }

  private cookTime(): number {
    const [lo, hi] = CONFIG.grill.cook;
    return lo + this.rng.next() * (hi - lo);
  }

  private fresh(t: number): Patty {
    return { side: 0, done: [false, false], charred: false, t, cook: this.cookTime() };
  }
}
