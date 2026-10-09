import { describe, expect, it } from 'vitest';
import type { Combat } from '../../src/game/combat';
import { CONFIG } from '../../src/data/config';
import { HEROES } from '../../src/data/heroes';
import { CARDS, cardCostOf } from '../../src/data/cards';
import { deckOf, setup, run } from './helpers';

describe('the Rogue', () => {
  /** A Rogue fight with an empty belt and a still enemy: cards are put on the belt by hand and made to fall with `dropBelt`. */
  const rogueFight = (deck: string[] = ['borrowedStapler']): Combat => {
    const c = setup({ hero: HEROES.rogue, hp: 50, maxHp: 50, deck: deckOf(deck), beltRows: 1 });
    c.enemy.move = { id: 'wait', intent: 'defend', windup: 999 };
    run(c, CONFIG.introTime + 0.01);
    c.belt.length = 0;
    c.hero.mana = c.hero.maxMana;
    return c;
  };
  const onBelt = (c: Combat, id: string): number => {
    c.addTempCard(id, 'belt');
    return c.belt[c.belt.length - 1].card.uid;
  };
  /** Puts a card straight into a sleeve slot. */
  const inSleeve = (c: Combat, id: string, slot = c.sleeve.indexOf(null)): number => {
    c.sleeve[slot] = { uid: -100 - slot, id, up: false, bonus: 0, temp: true };
    return -100 - slot;
  };

  it('has three sleeve slots; a falling card does not land in it', () => {
    const c = rogueFight();
    expect(c.sleeve).toHaveLength(3);
    onBelt(c, 'borrowedStapler');
    onBelt(c, 'gatekeeping');
    c.dropBelt();
    expect(c.sleeve.every((x) => x === null)).toBe(true);
    expect(c.discard.map((x) => x.id)).toEqual(['borrowedStapler', 'gatekeeping']);
  });

  it('every fall cuts one random card of the sleeve by 1, never below 0, until the card is played', () => {
    const c = rogueFight();
    for (const id of ['borrowedStapler', 'hideTheEvidence', 'shoplifting']) inSleeve(c, id);
    const total = (): number => c.sleeve.reduce((n, x) => n + (x ? c.cardCost(x) : 0), 0);
    expect(total()).toBe(9);
    onBelt(c, 'punch');
    c.dropBelt();
    expect(total()).toBe(8);
    for (let i = 0; i < 12; i++) {
      onBelt(c, 'punch');
      c.dropBelt();
    }
    expect(total()).toBe(0);
    // Played, a card is back at its own cost.
    const first = c.sleeve[0]!;
    expect(c.playCard(first.uid)).toBe(true);
    expect(cardCostOf(first)).toBe(3);
  });

  it('Light Fingers makes the cut deeper', () => {
    const c = rogueFight();
    inSleeve(c, 'borrowedStapler');
    c.applyStatus('hero', 'lightFingers', 1);
    onBelt(c, 'punch');
    c.dropBelt();
    expect(c.cardCost(c.sleeve[0]!)).toBe(1);
  });

  it('Stocktake drops the whole belt: each card that falls cheapens a card in the sleeve', () => {
    const c = rogueFight();
    inSleeve(c, 'borrowedStapler');
    for (let i = 0; i < 2; i++) onBelt(c, 'punch');
    c.hero.mana = c.abilityCost();
    c.hero.maxMana = Math.max(c.hero.maxMana, c.abilityCost());
    c.hero.mana = c.abilityCost();
    expect(c.useAbility()).toBe(true);
    expect(c.belt).toHaveLength(0);
    expect(c.cardCost(c.sleeve[0]!)).toBe(1);
    expect(c.discard).toHaveLength(2);
  });

  it('a card On Credit costs no mana, and stops the mana from coming back for as many seconds as it costs', () => {
    const c = rogueFight(['borrowedStapler']);
    const uid = onBelt(c, 'hushMoney');
    c.hero.mana = 0;
    expect(c.canAfford(c.belt[0].card)).toBe(true);
    expect(c.playCard(uid)).toBe(true);
    expect(c.hero.block).toBe(CARDS.hushMoney.vals[0]);
    expect(c.hero.mana).toBe(0);
    expect(c.hero.statuses.overdrawn.t).toBeCloseTo(CARDS.hushMoney.cost);
    run(c, 2);
    expect(c.hero.mana).toBe(0);
    run(c, 1.1);
    run(c, c.hero.regen + 0.1);
    expect(c.hero.mana).toBe(1);
  });

  it('a card On Credit owes what it costs now: the sleeve discount lowers the debt', () => {
    const c = rogueFight();
    const uid = inSleeve(c, 'inventoryShrinkage');
    c.sleeve[0]!.disc = 2;
    c.hero.mana = 0;
    expect(c.playCard(uid)).toBe(true);
    expect(c.hero.statuses.overdrawn.t).toBeCloseTo(CARDS.inventoryShrinkage.cost - 2);
  });

  it('Fire Sale uses up the sleeve and deals damage by the original costs, discounts ignored', () => {
    const c = rogueFight(['borrowedStapler']);
    inSleeve(c, 'borrowedStapler');
    inSleeve(c, 'hideTheEvidence');
    inSleeve(c, 'fenceIt');
    onBelt(c, 'punch');
    for (const x of c.sleeve) if (x) x.disc = 1;
    c.sleeve[0]!.disc = 3;
    const uid = onBelt(c, 'fireSale');
    const worth = 3 + 3 + 2;
    expect(CARDS.fireSale.shown?.(c, CARDS.fireSale.vals, c.belt.find((b) => b.card.uid === uid)!.card)[0]).toBe(CARDS.fireSale.vals[0] * worth);
    const hp = c.enemy.hp;
    c.enemy.block = 0;
    expect(c.playCard(uid)).toBe(true);
    expect(hp - c.enemy.hp).toBe(CARDS.fireSale.vals[0] * worth);
    expect(c.sleeve.every((x) => x === null)).toBe(true);
    expect(c.exhaust.map((x) => x.id)).toEqual(expect.arrayContaining(['borrowedStapler', 'hideTheEvidence', 'fenceIt', 'fireSale']));
  });

  it('Fence It sells a random card of the sleeve for its original cost', () => {
    const c = rogueFight(['borrowedStapler']);
    inSleeve(c, 'hideTheEvidence');
    c.sleeve[0]!.disc = 2;
    c.hero.maxMana = 6;
    c.hero.mana = 2;
    const uid = onBelt(c, 'fenceIt');
    expect(c.playCard(uid)).toBe(true);
    expect(c.sleeve.every((x) => x === null)).toBe(true);
    // Paid 2 for Fence It, got 3 for the card.
    expect(c.hero.mana).toBe(3);
  });

  it('Restructuring shuffles the draw pile and sorts it so the dearest cards are drawn first', () => {
    const c = rogueFight();
    c.draw = ['borrowedStapler', 'hideTheEvidence', 'fenceIt', 'coffee', 'inventoryShrinkage', 'shoplifting', 'lostProperty'].map((id, i) => ({
      uid: 900 + i,
      id,
      up: false,
      bonus: 0,
      temp: false,
    }));
    c.sortDrawByCost();
    const order: number[] = [];
    while (c.draw.length) order.push(cardCostOf(c.draw.pop()!));
    expect(order).toEqual([...order].sort((a, b) => b - a));
    expect(order[0]).toBe(5);
    expect(order).toHaveLength(7);
  });

  it('Lost & Found Box adds a sleeve slot', () => {
    const c = rogueFight();
    const seen: string[] = [];
    c.events.on((e) => void (e.type === 'sleeveGrew' ? seen.push(e.type) : null));
    expect(c.playCard(onBelt(c, 'lostAndFound'))).toBe(true);
    expect(c.sleeve).toHaveLength(4);
    expect(seen).toEqual(['sleeveGrew']);
  });

  it('Inside Job plays the next card of the belt for free and keeps a copy in the sleeve', () => {
    const c = rogueFight();
    const stapler = onBelt(c, 'borrowedStapler');
    c.belt[0].pos = 0.5;
    const job = onBelt(c, 'insideJob');
    c.hero.mana = 4;
    c.hero.maxMana = 4;
    const hp = c.enemy.hp;
    expect(c.playCard(job)).toBe(true);
    expect(c.enemy.hp).toBe(hp - CARDS.borrowedStapler.vals[0]);
    expect(c.hero.mana).toBe(0);
    expect(c.belt.some((b) => b.card.uid === stapler)).toBe(false);
    expect(c.sleeve.filter((x) => x?.id === 'borrowedStapler')).toHaveLength(1);
  });

  it('Lost Property and Dumpster Dive bring cards back from the discard pile, never a curse', () => {
    const c = rogueFight();
    for (const id of ['borrowedStapler', 'hideTheEvidence', 'gatekeeping', 'shoplifting'])
      c.discard.push({ uid: c.discard.length + 500, id, up: false, bonus: 0, temp: false });
    expect(c.retrieve(2, 'sleeve')).toBe(2);
    expect(c.sleeve.filter((x) => x).every((x) => CARDS[x!.id].type !== 'curse')).toBe(true);
    expect(c.discard).toHaveLength(2);
    expect(c.retrieve(5, 'belt')).toBe(1);
    expect(c.belt).toHaveLength(1);
    expect(c.discard.map((x) => x.id)).toEqual(['gatekeeping']);
  });

  it('Employee Discount hurts the Rogue and makes the sleeve cheaper', () => {
    const c = rogueFight();
    inSleeve(c, 'hideTheEvidence');
    inSleeve(c, 'shoplifting');
    c.hero.maxMana = 4;
    c.hero.mana = 4;
    const uid = onBelt(c, 'employeeDiscount');
    expect(c.playCard(uid)).toBe(true);
    expect(c.hero.hp).toBe(50 - CARDS.employeeDiscount.vals[1]);
    expect(c.sleeve.slice(0, 2).map((x) => c.cardCost(x!))).toEqual([1, 1]);
  });

  it('Shoplifting and Plausible Deniability count the other cards of the sleeve', () => {
    const c = rogueFight();
    inSleeve(c, 'hideTheEvidence');
    inSleeve(c, 'fenceIt');
    c.enemy.block = 0;
    const hp = c.enemy.hp;
    expect(c.playCard(onBelt(c, 'shoplifting'))).toBe(true);
    expect(hp - c.enemy.hp).toBe(CARDS.shoplifting.vals[0] * 2);
    c.hero.mana = c.hero.maxMana;
    expect(c.playCard(onBelt(c, 'plausibleDeniability'))).toBe(true);
    expect(c.hero.block).toBe(CARDS.plausibleDeniability.vals[0] * 2);
  });

  it('Pocket Lint and Clean Getaway answer every card that falls', () => {
    const c = rogueFight();
    c.applyStatus('hero', 'pocketLint', 3);
    c.applyStatus('hero', 'cleanGetaway', 2);
    c.enemy.block = 0;
    const hp = c.enemy.hp;
    onBelt(c, 'borrowedStapler');
    onBelt(c, 'hideTheEvidence');
    c.dropBelt();
    expect(hp - c.enemy.hp).toBe(6);
    expect(c.hero.block).toBe(4);
  });

  it("Identity Theft does the enemy's move to it, and the enemy loses it", () => {
    const c = rogueFight();
    c.enemy.move = { id: 'smash', intent: 'attack', windup: 5, dmg: 7, block: 4 };
    c.enemy.dmgScale = 1;
    c.enemy.block = 0;
    const hp = c.enemy.hp;
    c.hero.maxMana = 4;
    c.hero.mana = 4;
    expect(c.playCard(onBelt(c, 'identityTheft'))).toBe(true);
    expect(hp - c.enemy.hp).toBe(7);
    expect(c.hero.block).toBe(4);
    expect(c.enemy.move.id).not.toBe('smash');
  });

  it("Grand Larceny takes the enemy's Block and buffs", () => {
    const c = rogueFight();
    c.enemy.block = 12;
    c.applyStatus('enemy', 'strength', 3);
    expect(c.playCard(onBelt(c, 'grandLarceny'))).toBe(true);
    expect(c.enemy.block).toBe(0);
    expect(c.hero.block).toBe(12);
    expect(c.stacks('enemy', 'strength')).toBe(0);
    expect(c.stacks('hero', 'strength')).toBe(3);
  });
});
