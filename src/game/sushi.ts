import type { Rng } from '../core/rng';
import { CARDS } from '../data/cards';
import { CONFIG } from '../data/config';
import type { Chore } from './chore';

/** Every piece of sushi that can be part of an order, and every plate that never is (the cards with `CardDef.sushi`). */
const PIECES = Object.keys(CARDS).filter((id) => CARDS[id].sushi === 'piece');
const TRAPS = Object.keys(CARDS).filter((id) => CARDS[id].sushi === 'trap');

/** `ignored`: not the moment to eat (nothing happens, no penalty). */
export type SushiResult = 'ok' | 'wrong' | 'ignored';

/**
 * The Sushi Chef's chore (`MoveDef.task` = 'sushi'): an order of pieces to eat off the belt, in that order. It covers nothing: the belt serves sushi instead of the deck
 * (`serve`), your own cards on it and in the sleeve stay in reach. A piece that rides off the belt is simply dealt again.
 * Pure state, driven by `Combat.eat` (which turns a `wrong` into lost seconds) and ticked by simulated time.
 */
export class SushiOrder implements Chore {
  readonly id = 'sushi' as const;
  readonly covers = false;
  phase: 'eat' | 'done' = 'eat';
  /** The card id of each piece, in the order they have to be eaten. */
  readonly order: string[];
  /** How many of them are eaten already. */
  eaten = 0;
  errors = 0;
  /** Seconds the mistakes have cost so far. */
  fined = 0;
  private t = 0;

  constructor(private readonly rng: Rng) {
    this.order = Array.from({ length: CONFIG.sushi.length }, () => rng.pick(PIECES));
  }

  /** The piece to eat now. */
  get next(): string {
    return this.order[this.eaten];
  }

  /** Eats a piece: right if it is the next one in the order. */
  eat(id: string): SushiResult {
    if (this.phase !== 'eat') return 'ignored';
    if (id !== this.next) return 'wrong';
    if (++this.eaten === this.order.length) {
      this.phase = 'done';
      this.t = 0;
    }
    return 'ok';
  }

  /**
   * The next plate the belt deals (a card id) while the order is on, given the plates already riding it: mostly a piece the order still wants and the belt hasn't got
   * (the one wanted soonest twice as likely), otherwise a random piece or, now and then, a trap; the more is eaten, the more the belt fills with those.
   */
  serve(onBelt: string[]): string | null {
    if (this.phase !== 'eat') return null;
    const missing = this.order.slice(this.eaten);
    for (const id of onBelt) {
      const i = missing.indexOf(id);
      if (i >= 0) missing.splice(i, 1);
    }
    const c = CONFIG.sushi;
    if (!missing.length || this.rng.chance(Math.min(c.decoyMax, c.decoy + c.decoyRamp * this.eaten)))
      return this.rng.chance(c.fugu) ? this.rng.pick(TRAPS) : this.rng.pick(PIECES);
    return this.rng.pick([...missing, missing[0]]);
  }

  /** True once the finished order has been shown long enough. */
  tick(dt: number): boolean {
    if (this.phase !== 'done') return false;
    this.t += dt;
    return this.t >= CONFIG.sushi.doneHold;
  }
}
