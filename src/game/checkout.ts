import type { Rng } from '../core/rng';
import { CONFIG } from '../data/config';
import type { Chore } from './chore';

/** What can be in the basket (each has its icon, `grocery.<id>`). */
export const GROCERIES = ['bread', 'milk', 'apple', 'cheese', 'soup'] as const;
export type Grocery = (typeof GROCERIES)[number];

/** `ignored`: nothing to do with that now (no penalty). */
export type CheckoutResult = 'ok' | 'wrong' | 'ignored';
export type CheckoutAction = { kind: 'scan'; item: number } | { kind: 'lift' };

/**
 * The Self-Checkout's chore (`MoveDef.task` = 'checkout'): scan the groceries in the basket, one at a time, into the bagging area. After some of the scans the machine
 * complains about an unexpected item in the bagging area (nothing is unexpected): the item has to be lifted out again, and then the machine asks for assistance, which takes a few seconds
 * in which touching anything is a mistake. Done when the basket is empty. Pure state, driven by `Combat.checkout` (which turns a `wrong` into lost seconds) and ticked by simulated time.
 */
export class CheckoutLane implements Chore {
  readonly id = 'checkout' as const;
  readonly covers = true;
  phase: 'scan' | 'unexpected' | 'assist' | 'done' = 'scan';
  /** The groceries still to scan, and the ones in the bagging area (the last one is the one the machine objects to). */
  readonly basket: Grocery[];
  readonly bagged: Grocery[] = [];
  readonly total: number;
  /** Seconds of assistance still to wait. */
  wait = 0;
  /** Scans so far (a lifted item that is scanned again counts again). */
  scans = 0;
  errors = 0;
  /** Seconds the mistakes have cost so far. */
  fined = 0;
  /** Seconds since the basket was emptied. */
  private t = 0;
  /** The scans after which the machine complains (counted over the first `items` scans). */
  private readonly trips: Set<number>;

  constructor(rng: Rng) {
    const c = CONFIG.checkout;
    this.total = c.items;
    this.basket = Array.from({ length: c.items }, () => rng.pick(GROCERIES));
    this.trips = new Set(rng.shuffle(Array.from({ length: c.items }, (_, i) => i + 1)).slice(0, rng.int(c.trips[0], c.trips[1])));
  }

  /** The item in this place of the basket goes through the scanner into the bagging area. */
  scan(item: number): CheckoutResult {
    if (this.phase === 'done') return 'ignored';
    if (this.phase !== 'scan') return 'wrong';
    if (item < 0 || item >= this.basket.length) return 'ignored';
    this.bagged.push(...this.basket.splice(item, 1));
    this.scans++;
    if (this.trips.has(this.scans)) this.phase = 'unexpected';
    else if (!this.basket.length) this.finish();
    return 'ok';
  }

  /** The last item is lifted out of the bagging area, back to the basket: the machine then calls for assistance. */
  lift(): CheckoutResult {
    if (this.phase === 'done' || (this.phase === 'scan' && !this.bagged.length)) return 'ignored';
    if (this.phase !== 'unexpected') return 'wrong';
    this.basket.push(this.bagged.pop()!);
    this.phase = 'assist';
    this.wait = CONFIG.checkout.assist;
    return 'ok';
  }

  /** The assistant arrives; true once the finished basket has been shown long enough. */
  tick(dt: number): boolean {
    if (this.phase === 'assist') {
      this.wait = Math.max(0, this.wait - dt);
      if (!this.wait) this.phase = 'scan';
    } else if (this.phase === 'done') {
      this.t += dt;
      return this.t >= CONFIG.checkout.doneHold;
    }
    return false;
  }

  private finish(): void {
    this.phase = 'done';
    this.t = 0;
  }
}
