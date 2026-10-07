import type { Rng } from '../core/rng';
import { COFFEE_COINS, COFFEE_DRINKS, type CoffeeDrink } from '../data/coffee';
import { CONFIG } from '../data/config';

/** The three steps (pay, key in the code, prepare), then the machine pours (`brew`) and the cup is served (`done`). */
export type CoffeePhase = 'coins' | 'code' | 'prep' | 'brew' | 'done';

export type CoffeeAction =
  | { kind: 'coin'; id: number }
  | { kind: 'key'; key: number }
  | { kind: 'cup' }
  | { kind: 'sugar'; by: 1 | -1 }
  | { kind: 'start' };

/** `ignored`: not something that step asks for (nothing happens, no penalty). */
export type CoffeeResult = 'ok' | 'wrong' | 'ignored';

export interface CoffeeCoin {
  id: number;
  value: number;
  /** Already in the slot. */
  used: boolean;
}

/** Whether some of the values add up to exactly `sum`. */
const reaches = (values: number[], sum: number): boolean =>
  sum === 0 || values.some((v, i) => v <= sum && reaches([...values.slice(0, i), ...values.slice(i + 1)], sum - v));

/**
 * One order of the Boss's coffee: pay the price with the right coins, key in the drink's code, put a cup under the spout, dial the sugar and press start.
 * Pure state, driven by `Combat.coffee` (which turns a `wrong` into lost seconds) and ticked by simulated time.
 */
export class CoffeeTask {
  phase: CoffeePhase = 'coins';
  readonly drink: CoffeeDrink;
  readonly sugar: number;
  readonly price: number;
  readonly code: number[];
  readonly coins: CoffeeCoin[];
  paid = 0;
  /** Keys of the code pressed right so far. */
  keysDone = 0;
  cup = false;
  dial = 0;
  /** Seconds in the current `brew` or `done` phase. */
  t = 0;
  errors = 0;
  /** Seconds the mistakes have cost so far. */
  fined = 0;

  constructor(rng: Rng) {
    const c = CONFIG.coffee;
    const pay = Array.from({ length: rng.int(c.payCoins[0], c.payCoins[1]) }, () => rng.pick(COFFEE_COINS));
    const decoys = Array.from({ length: c.decoys }, () => rng.pick(COFFEE_COINS));
    this.price = pay.reduce((a, b) => a + b, 0);
    this.coins = rng.shuffle([...pay, ...decoys]).map((value, id) => ({ id, value, used: false }));
    this.drink = rng.pick(COFFEE_DRINKS);
    this.sugar = rng.int(c.sugar[0], c.sugar[1]);
    this.code = Array.from({ length: c.codeLength }, () => rng.int(1, c.keys));
  }

  act(a: CoffeeAction): CoffeeResult {
    switch (a.kind) {
      case 'coin':
        return this.phase === 'coins' ? this.insert(a.id) : 'ignored';
      case 'key':
        if (this.phase !== 'code') return 'ignored';
        if (a.key !== this.code[this.keysDone]) return 'wrong';
        if (++this.keysDone === this.code.length) this.phase = 'prep';
        return 'ok';
      case 'cup':
        if (this.phase !== 'prep') return 'ignored';
        this.cup = true;
        return 'ok';
      case 'sugar':
        if (this.phase !== 'prep') return 'ignored';
        this.dial = Math.max(0, Math.min(CONFIG.coffee.maxSugar, this.dial + a.by));
        return 'ok';
      case 'start':
        if (this.phase !== 'prep') return 'ignored';
        if (!this.cup || this.dial !== this.sugar) return 'wrong';
        this.phase = 'brew';
        return 'ok';
    }
  }

  /** Whether the slot takes this coin: it fits the price and the purse can still make up the rest with what is left (otherwise it bounces). */
  fits(coin: CoffeeCoin): boolean {
    const rest = this.price - this.paid - coin.value;
    return (
      rest >= 0 &&
      reaches(
        this.coins.filter((x) => !x.used && x !== coin).map((x) => x.value),
        rest,
      )
    );
  }

  private insert(id: number): CoffeeResult {
    const coin = this.coins.find((x) => x.id === id && !x.used);
    if (!coin) return 'ignored';
    if (!this.fits(coin)) return 'wrong';
    coin.used = true;
    this.paid += coin.value;
    if (this.paid === this.price) this.phase = 'code';
    return 'ok';
  }

  /** True once the cup has been served and held up long enough. */
  tick(dt: number): boolean {
    if (this.phase !== 'brew' && this.phase !== 'done') return false;
    this.t += dt;
    if (this.phase === 'brew' && this.t >= CONFIG.coffee.brewTime) {
      this.phase = 'done';
      this.t = 0;
    }
    return this.phase === 'done' && this.t >= CONFIG.coffee.doneHold;
  }

  /** How far the pour has got, 0 to 1. */
  get brewed(): number {
    return this.phase === 'brew' ? this.t / CONFIG.coffee.brewTime : this.phase === 'done' ? 1 : 0;
  }
}
