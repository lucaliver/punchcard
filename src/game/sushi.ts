import type { Rng } from '../core/rng';
import { CARDS } from '../data/cards';
import { CONFIG } from '../data/config';
import type { Chore } from './chore';
import type { CombatCard, Plate } from './types';

/** Every dish that can be part of an order, every plate that never is (the cards with `CardDef.sushi`), and the colours a dish comes on. */
const DISHES = Object.keys(CARDS).filter((id) => CARDS[id].sushi === 'piece');
const TRAPS = Object.keys(CARDS).filter((id) => CARDS[id].sushi === 'trap');
export const PLATES: readonly Plate[] = ['pink', 'blue', 'yellow'];

/** What a slip asks for: a dish (a card id) on a plate. */
export interface Piece {
  id: string;
  plate: Plate;
}

const same = (a: { id: string; plate?: Plate }, b: { id: string; plate?: Plate }): boolean => a.id === b.id && a.plate === b.plate;

/** `ignored`: not the moment to eat (nothing happens, no penalty). */
export type SushiResult = 'ok' | 'wrong' | 'ignored';

/**
 * The Sushi Chef's chore (`MoveDef.task` = 'sushi'): two slips, each an order of pieces (a dish on a plate) to eat off the belt, in the slip's order; a piece can serve either slip.
 * It covers nothing: the belt serves sushi instead of the deck (`serve`) and speeds up with every piece eaten (`beltMul`); your own cards on it and in the sleeve stay in reach.
 * A piece that rides off the belt is simply dealt again. Pure state, driven by `Combat.eat` (which turns a `wrong` into lost seconds) and ticked by simulated time.
 */
export class SushiOrder implements Chore {
  readonly id = 'sushi' as const;
  readonly covers = false;
  phase: 'eat' | 'done' = 'eat';
  /** The pieces of each slip, in the order they have to be eaten. */
  readonly slips: Piece[][];
  /** How many pieces of each slip are eaten already. */
  readonly eaten: number[];
  errors = 0;
  /** Seconds the mistakes have cost so far. */
  fined = 0;
  private t = 0;

  constructor(private readonly rng: Rng) {
    const c = CONFIG.sushi;
    this.slips = Array.from({ length: c.slips }, () => Array.from({ length: c.length }, () => ({ id: rng.pick(DISHES), plate: rng.pick(PLATES) })));
    this.eaten = this.slips.map(() => 0);
  }

  /** Pieces eaten so far, over every slip, and how many the slips hold. */
  get eatenCount(): number {
    return this.eaten.reduce((a, b) => a + b, 0);
  }
  get total(): number {
    return this.slips.length * CONFIG.sushi.length;
  }

  /** The piece each unfinished slip asks for now. */
  get wanted(): Piece[] {
    return this.slips.flatMap((s, i) => (this.eaten[i] < s.length ? [s[this.eaten[i]]] : []));
  }

  /** Whether a slip asks for this plate now. */
  wants(card: { id: string; plate?: Plate }): boolean {
    return this.wanted.some((w) => same(w, card));
  }

  /** Eats a plate: right if a slip asks for it now (the first one that does), wrong otherwise. */
  eat(id: string, plate?: Plate): SushiResult {
    if (this.phase !== 'eat') return 'ignored';
    const slip = this.slips.findIndex((s, i) => this.eaten[i] < s.length && same(s[this.eaten[i]], { id, plate }));
    if (slip < 0) return 'wrong';
    this.eaten[slip]++;
    if (this.eatenCount === this.total) {
      this.phase = 'done';
      this.t = 0;
    }
    return 'ok';
  }

  /** The belt runs faster with every piece eaten, from `beltFrom` to `beltTo` times its speed. */
  get beltMul(): number {
    const c = CONFIG.sushi;
    return this.phase === 'eat' ? c.beltFrom + ((c.beltTo - c.beltFrom) * this.eatenCount) / this.total : 1;
  }

  /**
   * The next plate the belt deals while the order is on, given the cards already riding it: mostly a piece the slips still want and the belt hasn't got (the ones asked for now
   * twice as likely), otherwise a random dish on a random plate or, now and then, a trap; the more is eaten, the more the belt fills with those.
   */
  serve(onBelt: readonly CombatCard[]): { id: string; plate?: Plate } | null {
    if (this.phase !== 'eat') return null;
    const missing = this.slips.flatMap((s, i) => s.slice(this.eaten[i]));
    for (const card of onBelt) {
      const i = missing.findIndex((m) => same(m, card));
      if (i >= 0) missing.splice(i, 1);
    }
    const c = CONFIG.sushi;
    if (!missing.length || this.rng.chance(Math.min(c.decoyMax, c.decoy + c.decoyRamp * this.eatenCount))) {
      return this.rng.chance(c.fugu) ? { id: this.rng.pick(TRAPS) } : { id: this.rng.pick(DISHES), plate: this.rng.pick(PLATES) };
    }
    return this.rng.pick([...missing, ...this.wanted.filter((w) => missing.some((m) => same(m, w)))]);
  }

  /** True once the finished order has been shown long enough. */
  tick(dt: number): boolean {
    if (this.phase !== 'done') return false;
    this.t += dt;
    return this.t >= CONFIG.sushi.doneHold;
  }
}
