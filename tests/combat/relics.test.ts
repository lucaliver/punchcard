import { describe, expect, it } from 'vitest';
import type { Combat } from '../../src/game/combat';
import { CONFIG } from '../../src/data/config';
import { HEROES } from '../../src/data/heroes';
import { CARDS } from '../../src/data/cards';
import { RELICS, REVENGE_MAX, STOCK_HP, abilityCostWith, relicSum } from '../../src/data/relics';
import { combatSetup, currentNode, rewardChoices, rollRewards, gainRelic, hasRelic, newRun } from '../../src/game/run';
import { deckOf, plainBoomer, setup, run } from './helpers';

describe('relics', () => {
  it('a Stress Ball starts the fight with Block and Cargo Pants add a sleeve slot', () => {
    const c = setup({ relics: ['stressBall', 'cargoPants'] });
    expect(c.hero.block).toBe(RELICS.stressBall.n);
    expect(c.sleeve).toHaveLength(HEROES.warrior.sleeve + 1);
  });

  it('the Wall Clock gives Block on a timer and the Coffee Mug gives mana back on every 5th card', () => {
    const c = setup({ relics: ['wallClock'] });
    let chimes = 0;
    c.events.on((e) => {
      if (e.type === 'relic') chimes++;
    });
    run(c, 3);
    expect(chimes).toBe(0);
    run(c, RELICS.wallClock.n + 3);
    expect(chimes).toBe(1);

    const m = setup({ relics: ['coffeeMug'] });
    m.hero.mana = 0;
    const events: string[] = [];
    m.events.on((e) => {
      if (e.type === 'relic') events.push(e.id);
    });
    const { card } = m.belt[0];
    for (let i = 0; i < RELICS.coffeeMug.n; i++) RELICS.coffeeMug.hooks?.onCardPlayed?.(m, card, CARDS[card.id]);
    expect(events).toEqual(['coffeeMug']);
    expect(m.hero.mana).toBeGreaterThan(0);
  });

  it('Inbox Zero opens the fight with the mana full', () => {
    const c = setup({ relics: ['inboxZero'] });
    expect(c.hero.maxMana).toBe(setup().hero.maxMana);
    expect(c.hero.mana).toBe(c.hero.maxMana);
  });

  it('a Paper Clip starts Pending cards already approved', () => {
    const deck = deckOf(['macGyver', 'macGyver', 'macGyver', 'macGyver']);
    const all = (c: Combat) => [...c.draw, ...c.belt.map((b) => b.card)];
    expect(all(setup({ deck })).some((card) => card.passed)).toBe(false);
    const c = setup({ deck, relics: ['paperClip'] });
    expect(all(c).every((card) => card.passed)).toBe(true);
    expect(all(c).some((card) => c.isPending(card))).toBe(false);
  });

  it('Sticky Notes fill the belt, a Lanyard speeds it up and a Company Card adds a reward card', () => {
    expect(setup({ relics: ['stickyNotes'] }).belt.length).toBeGreaterThan(setup().belt.length + 3);
    expect(setup({ relics: ['lanyard'] }).beltRate()).toBeCloseTo(setup().beltRate() * 1.15);
    const r = newRun('warrior', 3);
    gainRelic(r, 'companyCard');
    expect(rewardChoices(r, 'fight')).toBe(4);
    expect(rewardChoices(r, 'boss')).toBe(5);
    expect(rollRewards(r, 'fight')).toHaveLength(4);
    expect(rollRewards(r, 'boss')).toHaveLength(5);
  });

  it('the Statuette petrifies cards at the start of a fight and upgrades them for that fight only', () => {
    const c = setup({ relics: ['statuette'] });
    const all = [...c.draw, ...c.belt.map((b) => b.card)];
    const stone = all.filter((card) => card.hex);
    expect(stone).toHaveLength(RELICS.statuette.n);
    for (const card of stone) expect(card.up).toBe(true);
  });

  it('the Rubber Duck gives Block once per fight when HP falls under half, and the Shredder for every card lost', () => {
    const c = setup({ relics: ['rubberDuck', 'paperShredder'] });
    run(c, CONFIG.introTime + 0.1);
    expect(c.hero.block).toBe(0);
    c.loseHp(50);
    run(c, 0.1);
    expect(c.hero.block).toBe(RELICS.rubberDuck.n);
    c.loseHp(1);
    c.hero.block = 0;
    run(c, 0.1);
    expect(c.hero.block).toBe(0);
    run(c, 40);
    expect(c.hero.block).toBeGreaterThan(0);
  });

  it('the Highlighter doubles the first attack of a fight only, the Rubber Stamp makes the first paid card free', () => {
    const plain = setup({ enemy: { ...plainBoomer, block: undefined } });
    const lit = setup({ relics: ['highlighter', 'rubberStamp'], enemy: { ...plainBoomer, block: undefined } });
    for (const c of [plain, lit]) {
      c.enemy.move = { id: 'wait', intent: 'defend', windup: 999 };
      run(c, CONFIG.introTime + 0.01);
      c.belt.length = 0;
      c.addTempCard('punch', 'belt');
      c.addTempCard('punch', 'belt');
    }
    const dealt = (c: Combat): number => {
      const before = c.enemy.hp;
      const mana = c.hero.mana;
      c.playCard(c.belt[0].card.uid);
      return before - c.enemy.hp + (mana - c.hero.mana) * 1000;
    };
    const base = dealt(plain);
    const first = dealt(lit);
    expect(first).toBeGreaterThanOrEqual((base % 1000) * 2 - 1);
    expect(first).toBeLessThan(1000);
    const second = dealt(lit);
    expect(second % 1000).toBe(base % 1000);
  });

  it('the Hole Punch hurts the enemy for every card that slips off, the Name Tag opens the fight Vulnerable', () => {
    const c = setup({ relics: ['holePunch', 'nameTag'] });
    c.enemy.move = { id: 'wait', intent: 'defend', windup: 999 };
    expect(c.has('enemy', 'vulnerable')).toBe(true);
    run(c, CONFIG.introTime + 0.01);
    const hp = c.enemy.hp;
    run(c, 40);
    expect(c.enemy.hp).toBeLessThan(hp);
  });

  it('the Fire Drill Bell stuns the enemy every 30 HP the hero loses', () => {
    const c = setup({ relics: ['fireDrillBell'], hp: 200, maxHp: 200 });
    c.enemy.move = { id: 'wait', intent: 'defend', windup: 999 };
    run(c, CONFIG.introTime + 0.01);
    c.loseHp(20);
    run(c, 0.1);
    expect(c.has('enemy', 'stun')).toBe(false);
    c.loseHp(20);
    run(c, 0.1);
    expect(c.has('enemy', 'stun')).toBe(true);
    delete c.enemy.statuses.stun;
    c.loseHp(10);
    run(c, 0.1);
    expect(c.has('enemy', 'stun')).toBe(false);
    c.loseHp(10);
    run(c, 0.1);
    expect(c.has('enemy', 'stun')).toBe(true);
  });

  it('the Out-of-Office Sign cancels the first big hit of a fight, never a small one, and only once', () => {
    const c = setup({ relics: ['outOfOffice'], hp: 200, maxHp: 200 });
    run(c, CONFIG.introTime + 0.01);
    c.damage('enemy', 'hero', 5, { raw: true }, 'enemy');
    expect(c.hero.hp).toBe(195);
    c.damage('enemy', 'hero', 40, { raw: true }, 'enemy');
    expect(c.hero.hp).toBe(195);
    c.damage('enemy', 'hero', 40, { raw: true }, 'enemy');
    expect(c.hero.hp).toBe(155);
  });

  it('the Correction Fluid wipes the first curse an enemy deals in a fight, and only that one', () => {
    const curses = (c: Combat): number => [...c.belt.map((b) => b.card), ...c.draw, ...c.discard].filter((x) => CARDS[x.id].type === 'curse').length;
    const move = { id: 'gossip', intent: 'curse' as const, windup: 5, curse: [{ id: 'gatekeeping', n: 2, to: 'draw' as const }] };
    const plain = setup();
    plain['resolveMove'](move);
    expect(curses(plain)).toBe(2);
    const c = setup({ relics: ['correctionFluid'] });
    const chimes: string[] = [];
    c.events.on((e) => {
      if (e.type === 'relic') chimes.push(e.id);
    });
    c['resolveMove'](move);
    expect(curses(c)).toBe(1);
    expect(chimes).toEqual(['correctionFluid']);
    c['resolveMove'](move);
    expect(curses(c)).toBe(3);
  });

  it('the Desk Plant heals now and then', () => {
    const c = setup({ relics: ['deskPlant'] });
    c.enemy.move = { id: 'wait', intent: 'defend', windup: 999 };
    run(c, CONFIG.introTime + 0.01);
    c.loseHp(10);
    run(c, 16);
    expect(c.hero.hp).toBe(80 - 10 + 2);
  });

  it('the Emergency Exit saves you once per run, then never again', () => {
    const flags: Record<string, number> = {};
    const c = setup({ relics: ['emergencyExit'], relicFlags: flags });
    c.loseHp(999);
    expect(c.result).toBeNull();
    expect(c.hero.hp).toBeGreaterThan(0);
    expect(flags.emergencyExit).toBe(1);
    const again = setup({ relics: ['emergencyExit'], relicFlags: flags });
    again.loseHp(999);
    expect(again.result).toBe('lose');
  });

  it('a relic is taken once, and a saved run drops relics that no longer exist', () => {
    const r = newRun('warrior', 5);
    gainRelic(r, 'thermos');
    gainRelic(r, 'thermos');
    expect(r.relics).toEqual(['thermos']);
    expect(hasRelic(r, 'thermos')).toBe(true);
  });

  it("the Cheat Sheet takes a mana off the hero's ability", () => {
    expect(setup().abilityCost()).toBe(HEROES.warrior.ability.cost);
    expect(setup({ relics: ['cheatSheet'] }).abilityCost()).toBe(HEROES.warrior.ability.cost - 1);
    expect(abilityCostWith(1, ['cheatSheet', 'cheatSheet'])).toBe(1);
  });
});

describe('the stationery of the second batch', () => {
  const punches = (n = 12) => deckOf(Array(n).fill('punch'));

  it('Flexitime hands out a Lost Badge every so often and waits until it is used', () => {
    const c = setup({ relics: ['flexitime'] });
    run(c, CONFIG.introTime + RELICS.flexitime.n + 0.5);
    expect(c.stacks('hero', 'lostBadge')).toBe(1);
    run(c, 2 * RELICS.flexitime.n);
    expect(c.stacks('hero', 'lostBadge')).toBe(1);
  });

  it('Just-in-Time Delivery halves a cost (rounded up) only in the last stretch of the belt', () => {
    const c = setup({ relics: ['justInTime'], deck: deckOf(['printerSmash', 'punch', 'coffee', 'printerSmash', 'punch', 'coffee']) });
    run(c, CONFIG.introTime + 0.1);
    const costs = (pos: number): number[] => {
      for (const b of c.belt) b.pos = pos;
      return c.belt.map((b) => c.costOf(b.card));
    };
    const full = costs(0.5);
    const late = costs(0.8);
    expect(late).toEqual(full.map((n) => (n < 2 ? n : Math.ceil(n / 2))));
    expect(late).not.toEqual(full);
    const { card } = c.belt[0];
    const price = c.costOf(card);
    c.hero.mana = 5;
    expect(c.playCard(card.uid)).toBe(true);
    expect(c.hero.mana).toBe(5 - price);
  });

  it('Stock Options give mana for good and take a share of the max HP when they are taken', () => {
    const r = newRun('warrior', 3);
    const before = r.maxHp;
    gainRelic(r, 'stockOptions');
    expect(r.maxHp).toBe(before - Math.round(before * STOCK_HP));
    expect(r.hp).toBe(r.maxHp);
    expect(setup({ relics: ['stockOptions'] }).hero.maxMana).toBe(setup().hero.maxMana + RELICS.stockOptions.n);
  });

  it('a Safety Net pins the first cards of a fight that reach the end of the belt, and the rest fall', () => {
    const fight = (relics: string[]) => {
      const c = setup({ relics, deck: punches(20), hp: 900, maxHp: 900 });
      run(c, 50);
      return c;
    };
    const bare = fight([]);
    expect(bare.belt.some((b) => b.pinned)).toBe(false);
    const c = fight(['safetyNet']);
    expect(c.belt.filter((b) => b.pinned)).toHaveLength(RELICS.safetyNet.n);
    expect(c.stats.cardsLost).toBeGreaterThan(0);
  });

  it('a Safety Net lets a curse fall', () => {
    const c = setup({ relics: ['safetyNet'], deck: punches(12), hp: 900, maxHp: 900 });
    c.addTempCard('gossip', 'belt', false, 0.99);
    run(c, 4);
    expect(c.belt.some((b) => b.pinned && CARDS[b.card.id].type === 'curse')).toBe(false);
  });

  it('a Locker Key keeps a fallen card cheaper for the rest of the fight', () => {
    const c = setup({ relics: ['lockerKey'], deck: punches() });
    const card = c.dropOldest()!;
    expect(c.costOf(card)).toBe(CARDS.punch.cost - RELICS.lockerKey.n);
    expect(setup({ deck: punches() }).dropOldest()).not.toBeNull();
  });

  it('the Bulletproof Cardigan pays mana only when Block takes a whole hit', () => {
    const c = setup({ relics: ['bulletproofCardigan'] });
    run(c, CONFIG.introTime + 0.1);
    c.hero.mana = 0;
    c.hero.block = 4;
    c.damage('enemy', 'hero', 10, { raw: true }, 'enemy');
    expect(c.hero.mana).toBe(0);
    c.hero.block = 50;
    c.damage('enemy', 'hero', 10, { raw: true }, 'enemy');
    expect(c.hero.mana).toBe(RELICS.bulletproofCardigan.n);
  });

  it('the Revenge Spreadsheet turns every curse into Strength, up to a cap', () => {
    const nagging = {
      ...plainBoomer,
      main: { id: 'gripe', intent: 'curse' as const, windup: 1, curse: [{ id: 'gossip', n: 2, to: 'draw' as const }] },
      specials: [],
    };
    const c = setup({ enemy: nagging, relics: ['revengeSpreadsheet'], hp: 900, maxHp: 900 });
    run(c, 4);
    expect(c.stacks('hero', 'strength')).toBeGreaterThanOrEqual(2);
    run(c, 40);
    expect(c.stacks('hero', 'strength')).toBe(REVENGE_MAX);
  });

  it('the Assorted Biscuit Tin hits the enemy for the size of the deck as the fight starts', () => {
    const c = setup({ relics: ['assortedBiscuitTin'] });
    const hp = c.enemy.hp;
    expect(c.deckSize()).toBe(HEROES.warrior.startDeck.length);
    run(c, CONFIG.introTime + 0.2);
    expect(c.enemy.hp).toBe(hp - HEROES.warrior.startDeck.length);
    run(c, 3);
    expect(c.enemy.hp).toBe(hp - HEROES.warrior.startDeck.length);
  });

  it('the Gold Watch gives the ability back at every fight', () => {
    const r = newRun('warrior', 3);
    r.abilityAct = currentNode(r).act;
    expect(combatSetup(r).abilitySpent).toBe(true);
    gainRelic(r, 'goldWatch');
    expect(combatSetup(r).abilitySpent).toBe(false);
    expect(setup({ relics: ['goldWatch'] }).abilityEveryFight).toBe(true);
    expect(setup().abilityEveryFight).toBe(false);
  });

  it('the Floor Plan sees further on the map', () => {
    expect(relicSum([], 'vision')).toBe(0);
    expect(relicSum(['floorPlan'], 'vision')).toBe(RELICS.floorPlan.n);
  });
});
