/** What the Boss can order from the Coffee Machine (`drink.<id>` strings) and the coins in the purse (their face values). */
export const COFFEE_DRINKS = ['espresso', 'latte', 'decaf', 'tea', 'cocoa'] as const;
export type CoffeeDrink = (typeof COFFEE_DRINKS)[number];

export const COFFEE_COINS = [5, 10, 20, 50, 100] as const;
