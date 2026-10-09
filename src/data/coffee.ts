/** What the Boss can order from the coffee machine (`drink.<id>` strings), the coins in the purse (euro cents) and what lies on the tray (`task.coffee.<item>` strings: the cup and the spoon go under the spout, the fork doesn't). */
export const COFFEE_DRINKS = ['espresso', 'latte', 'decaf', 'tea', 'cocoa'] as const;
export type CoffeeDrink = (typeof COFFEE_DRINKS)[number];

export const COFFEE_COINS = [5, 10, 20, 50, 100, 200] as const;

export const COFFEE_ITEMS = ['cup', 'spoon', 'fork'] as const;
export type CoffeeItem = (typeof COFFEE_ITEMS)[number];
/** What goes under the spout. */
export const COFFEE_SERVICE: readonly CoffeeItem[] = ['cup', 'spoon'];
