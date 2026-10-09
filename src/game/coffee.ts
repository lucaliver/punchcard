import type { Rng } from '../core/rng';
import { COFFEE_COINS, COFFEE_DRINKS, COFFEE_SERVICE, type CoffeeDrink, type CoffeeItem } from '../data/coffee';
import { CONFIG } from '../data/config';

/** The four steps (pay, key in the code, put the cup and the spoon under the spout, dial the sugar and start), then the machine pours (`brew`) and the cup is served (`done`). */
export type CoffeePhase = 'coins' | 'code' | 'place' | 'sugar' | 'brew' | 'done';

export type CoffeeAction =
  | { kind: 'coin'; id: number }
  | { kind: 'key'; key: number }
  | { kind: 'item'; item: CoffeeItem }
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

/** The fewest coins of the purse that add up to exactly `sum` (Infinity when none do). */
const fewest = (values: number[], sum: number): number =>
  sum === 0
    ? 0
    : Math.min(...values.map((v, i) => (v <= sum ? 1 + fewest([...values.slice(0, i), ...values.slice(i + 1)], sum - v) : Infinity)), Infinity);

/**
 * One order of the Boss's coffee: pay the price with the right coins, key in the drink's code, put the cup and the spoon (not the fork) under the spout, dial the sugar and press start.
 * Pure state, driven by `Combat.coffee` (which turns a `wrong` into lost seconds) and ticked by simulated time.
 */
export class CoffeeTask {
  readonly id = 'coffee' as const;
  readonly covers = true;
  phase: CoffeePhase = 'coins';
  readonly drink: CoffeeDrink;
  readonly sugar: number;
  readonly price: number;
  readonly code: number[];
  readonly coins: CoffeeCoin[];
  paid = 0;
  /** Keys of the code pressed right so far. */
  keysDone = 0;
  /** What is under the spout so far. */
  readonly placed: CoffeeItem[] = [];
  dial = 0;
  /** Seconds in the current `brew` or `done` phase. */
  t = 0;
  errors = 0;
  /** Seconds the mistakes have cost so far. */
  fined = 0;

  constructor(rng: Rng) {
    const c = CONFIG.coffee;
    // A believable price, and a purse where no handful of coins fewer than `minCoins` makes it (a few tries, then a sure purse).
    let values: number[] = [100, 50, 20, 10, 5, 5, 20];
    let pay = 4;
    for (let i = 0; i < 100; i++) {
      const tryPay = Array.from({ length: rng.int(c.payCoins[0], c.payCoins[1]) }, () => rng.pick(COFFEE_COINS));
      const sum = tryPay.reduce((a, b) => a + b, 0);
      if (sum < c.price[0] || sum > c.price[1]) continue;
      const purse = [...tryPay, ...Array.from({ length: c.decoys }, () => rng.pick(COFFEE_COINS))];
      if (fewest(purse, sum) < c.minCoins) continue;
      values = purse;
      pay = tryPay.length;
      break;
    }
    this.price = values.slice(0, pay).reduce((a, b) => a + b, 0);
    this.coins = rng.shuffle(values).map((value, id) => ({ id, value, used: false }));
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
        if (++this.keysDone === this.code.length) this.phase = 'place';
        return 'ok';
      case 'item':
        if (this.phase !== 'place' || this.placed.includes(a.item)) return 'ignored';
        if (!COFFEE_SERVICE.includes(a.item)) return 'wrong';
        this.placed.push(a.item);
        if (COFFEE_SERVICE.every((x) => this.placed.includes(x))) this.phase = 'sugar';
        return 'ok';
      case 'sugar':
        if (this.phase !== 'sugar') return 'ignored';
        this.dial = Math.max(0, Math.min(CONFIG.coffee.maxSugar, this.dial + a.by));
        return 'ok';
      case 'start':
        if (this.phase !== 'sugar') return 'ignored';
        if (this.dial !== this.sugar) return 'wrong';
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
