import { describe, expect, it } from 'vitest';
import type { Combat } from '../../src/game/combat';
import { CONFIG } from '../../src/data/config';
import { ENEMIES } from '../../src/data/enemies';
import { FLICKER_EVERY, SMILE_HEAL, STATUSES } from '../../src/data/statuses';
import { CARDS, cardKeywordsOf } from '../../src/data/cards';
import { HEXES } from '../../src/data/hexes';
import { deckOf, plainBoomer, setup, run } from './helpers';

describe('On a Roll', () => {
  /** A quiet fight with an empty belt, to put the cards under test on it. */
  const quiet = (): Combat => {
    const c = setup({ deck: deckOf(new Array(8).fill('punch')) });
    c.enemy.move = { id: 'wait', intent: 'defend', windup: 999 };
    c.enemy.hp = c.enemy.maxHp = 500;
    c.hero.maxMana = c.hero.mana = 10;
    run(c, CONFIG.introTime + 0.01);
    c.belt.length = 0;
    return c;
  };
  const add = (c: Combat, id: string): number => {
    c.addTempCard(id, 'belt');
    return c.belt[c.belt.length - 1].card.uid;
  };

  it('plays every attack on the belt for free, and only the attacks', () => {
    const c = quiet();
    const roll = add(c, 'fordism');
    for (const id of ['punch', 'bobTheBuilder', 'punch', 'punch']) add(c, id);
    const mana = c.hero.mana;
    expect(c.playCard(roll)).toBe(true);
    expect(mana - c.hero.mana).toBe(CARDS.fordism.cost);
    expect(500 - c.enemy.hp).toBe(3 * CARDS.punch.vals[0]);
    expect(c.belt.map((b) => b.card.id)).toEqual(['bobTheBuilder']);
  });

  it('leaves alone an attack that cannot be played right now (hexed)', () => {
    const c = quiet();
    const roll = add(c, 'fordism');
    add(c, 'punch');
    const hexed = add(c, 'punch');
    c.belt.find((b) => b.card.uid === hexed)!.card.hex = { id: 'petrify', left: 2, t: 99 };
    c.playCard(roll);
    expect(500 - c.enemy.hp).toBe(CARDS.punch.vals[0]);
    expect(c.belt.some((b) => b.card.uid === hexed)).toBe(true);
  });
});

describe('act 2 enemies', () => {
  const vs = (enemy: string, deck = new Array(12).fill('punch')): Combat => {
    const c = setup({ enemy: ENEMIES[enemy], deck: deckOf(deck), hp: 999, maxHp: 999 });
    run(c, CONFIG.introTime + 0.01);
    // The tests count from the start of the first move, not from the head start the hero gets (`CONFIG.enemyDelay`).
    c.enemy.timer = 0;
    c.hero.maxMana = Math.min(c.hero.maxMana, c.manaCap());
    return c;
  };

  it('Meticulous Colleague: two cards in a row from the same lane are refused', () => {
    const c = vs('meticulousColleague');
    c.hero.mana = c.hero.maxMana = 10;
    const first = c.belt.find((b) => b.row === 0)!;
    expect(c.playCard(first.card.uid)).toBe(true);
    const same = c.belt.find((b) => b.row === 0);
    const other = c.belt.find((b) => b.row === 1)!;
    if (same) expect(c.playCard(same.card.uid)).toBe(false);
    expect(c.playCard(other.card.uid)).toBe(true);
  });

  it('Wellness Coach: one card every 2 seconds', () => {
    const c = vs('wellnessCoach');
    c.hero.mana = c.hero.maxMana = 10;
    expect(c.playCard(c.belt[0].card.uid)).toBe(true);
    expect(c.playCard(c.belt[0].card.uid)).toBe(false);
    run(c, 2.05);
    c.hero.mana = 10;
    expect(c.playCard(c.belt[0].card.uid)).toBe(true);
  });

  it('Bean Counter: max mana is frozen at 3, crystals included', () => {
    const c = vs('beanCounter', ['italianEspresso', 'italianEspresso', 'punch']);
    expect(c.hero.maxMana).toBeLessThanOrEqual(3);
    c.hero.mana = 3;
    c.addManaCrystals(3);
    expect(c.hero.maxMana).toBe(3);
  });

  it('Micromanager: standing still for 3 seconds brings an instant hit', () => {
    const c = vs('micromanager');
    c.enemy.move = { id: 'wait', intent: 'defend', windup: 999 };
    const hp = c.hero.hp;
    run(c, 1.5);
    expect(c.enemyWarning()).toBeCloseTo(0.5, 1);
    expect(c.enemyAlarming()).toBe(false);
    run(c, 0.8);
    expect(c.enemyAlarming()).toBe(true);
    run(c, 0.8);
    expect(c.enemyWarning()).toBeLessThan(0.1);
    expect(c.hero.hp).toBeLessThan(hp);
    // Playing cards keeps him off your back.
    const after = c.hero.hp;
    for (let i = 0; i < 4; i++) {
      c.hero.mana = 10;
      c.playCard(c.belt[0].card.uid);
      run(c, 1);
    }
    expect(c.hero.hp).toBe(after);
  });

  it('The Printer stores the damage it takes while scanning and prints it back', () => {
    const c = vs('printer');
    c.enemy.block = 0;
    expect(c.enemy.move.absorb).toBe(true);
    c.hero.mana = c.hero.maxMana = 10;
    const hp = c.enemy.hp;
    c.playCard(c.belt[0].card.uid);
    expect(c.enemy.hp).toBe(hp);
    expect(c.enemy.stored).toBe(6);
    // Numbers from the data, so rebalancing the Printer doesn't break the rule being tested.
    const { main, specials } = ENEMIES.printer;
    const printOut = specials[0].dmg ?? 0;
    run(c, main.windup);
    expect(c.enemy.move.release).toBe(true);
    expect(c.intentDamage(c.enemy.move)).toBe(printOut + 6);
    const heroHp = c.hero.hp;
    run(c, specials[0].windup + 0.1);
    expect(heroHp - c.hero.hp).toBe(printOut + 6);
    expect(c.enemy.stored).toBe(0);
  });

  it('The Veteran inflates card costs until each card is played', () => {
    const c = vs('veteran');
    c.inflateCards(40);
    expect(c.belt.every((b) => c.cardCost(b.card) === 3)).toBe(true);
    c.hero.mana = c.hero.maxMana = 10;
    const card = c.belt[0].card;
    expect(c.playCard(card.uid)).toBe(true);
    expect(c.hero.mana).toBe(7);
    expect(c.cardCost(card)).toBe(2);
  });

  it('Dave idles three times, then hits hard and adds two different curses', () => {
    const c = vs('dave');
    const acts: string[] = [];
    c.events.on((e) => {
      if (e.type === 'enemyAct') acts.push(e.move.id);
    });
    const hp = c.hero.hp;
    run(c, 3 * 4 + 0.5);
    expect(acts).toEqual(['scrolling', 'scrolling', 'scrolling']);
    expect(c.hero.hp).toBe(hp);
    run(c, 3);
    expect(acts[3]).toBe('lastMinute');
    expect(c.hero.hp).toBeLessThan(hp);
    const everywhere = [...c.draw, ...c.discard, ...c.belt.map((b) => b.card)];
    expect(new Set(everywhere.filter((x) => CARDS[x.id].type === 'curse').map((x) => x.id)).size).toBe(2);
  });
});

describe('the Overthinker', () => {
  it('talks itself out of 1 damage of the move it charges for every hit it takes, and starts the next one whole', () => {
    const c = setup({ enemy: ENEMIES.overthinker, deck: deckOf(Array(6).fill('punch')) });
    run(c, CONFIG.introTime + 1);
    const full = c.intentDamage(c.enemy.move);
    c.damage('hero', 'enemy', 5, { raw: true }, 'hero');
    c.damage('hero', 'enemy', 5, { raw: true }, 'hero');
    expect(c.intentDamage(c.enemy.move)).toBe(full - 2);
    const hp = c.hero.hp;
    run(c, c.enemy.move.windup);
    expect(hp - c.hero.hp).toBe(full - 2);
    expect(c.intentDamage(c.enemy.move)).toBe(full);
  });
});

describe('Fine Print and the Golden Parachute', () => {
  const vs = (enemy: string): Combat => {
    const c = setup({ enemy: ENEMIES[enemy], deck: deckOf(Array(6).fill('punch')), hp: 999, maxHp: 999 });
    c.enemy.move = { id: 'wait', intent: 'defend', windup: 999 };
    run(c, CONFIG.introTime + 0.01);
    return c;
  };

  it('Contract Lawyer: every hit of a card loses the Fine Print, Poison and Burn go through whole', () => {
    const c = vs('contractLawyer');
    const cut = c.stacks('enemy', 'finePrint');
    expect(cut).toBeGreaterThan(0);
    expect(c.previewHeroDamage(6, CARDS.punch)).toBe(6 - cut);
    const hp = c.enemy.hp;
    c.hit(6, { hits: 3 });
    expect(hp - c.enemy.hp).toBe(3 * (6 - cut));
    c.applyStatus('enemy', 'poison', 4);
    const before = c.enemy.hp;
    run(c, CONFIG.dotInterval + 0.05);
    expect(before - c.enemy.hp).toBe(2);
    // A hit smaller than the cut deals nothing, never heals.
    const now = c.enemy.hp;
    c.hit(1);
    expect(c.enemy.hp).toBe(now);
  });

  it('Outgoing VP: the first lethal hit only retires him, the second one wins', () => {
    const c = vs('outgoingVp');
    expect(c.has('enemy', 'goldenParachute')).toBe(true);
    c.enemy.block = 0;
    const revived: string[] = [];
    c.events.on((e) => void (e.type === 'revive' && revived.push(e.type)));
    c.damage('hero', 'enemy', 999, { raw: true }, 'hero');
    expect(c.result).toBeNull();
    expect(revived).toHaveLength(1);
    expect(c.has('enemy', 'goldenParachute')).toBe(false);
    expect(c.enemy.hp).toBe(Math.round(c.enemy.maxHp * 0.4));
    expect(c.enemy.block).toBeGreaterThan(0);
    expect(c.stacks('enemy', 'strength')).toBeGreaterThan(0);
    c.enemy.block = 0;
    c.damage('hero', 'enemy', 999, { raw: true }, 'hero');
    expect(c.result).toBe('win');
  });
});

describe('Factory Siren', () => {
  it('her song ties your hands (stashing still works), and the belt plays the cards that slip off, for free', () => {
    const c = setup({ enemy: ENEMIES.factorySiren, deck: deckOf(['punch', 'punch', 'punch', 'punch', 'punch', 'punch']) });
    run(c, CONFIG.introTime + 0.01);
    c.applyStatus('hero', 'stun', 1, 8);
    c.applyStatus('hero', 'autopilot', 1, 8);
    const first = c.belt[0].card.uid;
    expect(c.playCard(first)).toBe(false);
    expect(c.stash(c.belt[c.belt.length - 1].card.uid, 0)).toBe(true);
    const hp = c.enemy.hp;
    run(c, 8);
    expect(c.hero.mana).toBeLessThanOrEqual(c.hero.maxMana);
    expect(c.enemy.hp).toBeLessThan(hp);
  });
});

describe('VIP Client', () => {
  it('takes a critical hit from an attack dragged onto the stage, not from a tapped one', () => {
    const hit = (dragged: boolean): number => {
      const c = setup({ enemy: { ...ENEMIES.vipClient, hp: 9999 }, deck: deckOf(['punch', 'punch']) });
      run(c, CONFIG.introTime + 0.01);
      c.gainMana(3);
      const before = c.enemy.hp;
      expect(c.playCard(c.belt[0].card.uid, dragged ? 'drag' : 'tap')).toBe(true);
      return before - c.enemy.hp;
    };
    expect(hit(true)).toBe(hit(false) * CONFIG.critMult);
  });
});

describe('act 3 rules', () => {
  it('Rate Limit caps every hit of the hero, but not the small ones', () => {
    const c = setup({ enemy: ENEMIES.rateLimiter });
    expect(c.previewHeroDamage(30, null)).toBe(4);
    expect(c.previewHeroDamage(3, null)).toBe(3);
  });

  it('Microsleep: the enemy dozes off after its awake spell, stunned and vulnerable', () => {
    const c = setup({ enemy: { ...ENEMIES.graveyardIntern, main: { ...ENEMIES.graveyardIntern.main, windup: 999 } } });
    run(c, CONFIG.introTime + 3);
    expect(c.has('enemy', 'stun')).toBe(false);
    run(c, 5);
    expect(c.has('enemy', 'stun')).toBe(true);
    expect(c.has('enemy', 'vulnerable')).toBe(true);
    run(c, 4);
    expect(c.has('enemy', 'stun')).toBe(false);
  });

  it('the Assembly Line only lets a card be played once it has passed the middle of the belt', () => {
    const c = setup({ enemy: ENEMIES.lineLead });
    run(c, 8);
    const early = c.belt.filter((b) => b.pos < 0.5);
    const late = c.belt.filter((b) => b.pos >= 0.5);
    expect(early.length).toBeGreaterThan(0);
    expect(late.length).toBeGreaterThan(0);
    for (const b of early) expect(c.ruleBlock(b.card)?.status).toBe('assemblyLine');
    for (const b of late) expect(c.ruleBlock(b.card)).toBeNull();
  });

  it('Machine Learning: every third card you let slip makes the enemy stronger', () => {
    const c = setup({ enemy: { ...ENEMIES.helpdeskChatbot, main: { ...ENEMIES.helpdeskChatbot.main, windup: 999 } } });
    expect(c.stacks('enemy', 'strength')).toBe(0);
    run(c, 60);
    expect(c.stacks('enemy', 'strength')).toBeGreaterThan(0);
  });
});

describe('act 3 rules, second batch', () => {
  it('Overtime Creep makes the enemy a little stronger every ten seconds', () => {
    const c = setup({ enemy: { ...ENEMIES.punchClock, main: { ...ENEMIES.punchClock.main, windup: 999 } } });
    run(c, CONFIG.introTime + 9);
    expect(c.stacks('enemy', 'strength')).toBe(0);
    run(c, 2);
    expect(c.stacks('enemy', 'strength')).toBe(1);
  });

  it('Low Battery: a chirp drains the hero a mana', () => {
    const c = setup({ enemy: { ...ENEMIES.smokeDetector, main: { ...ENEMIES.smokeDetector.main, windup: 999 } } });
    c.hero.mana = c.hero.maxMana = 5;
    run(c, CONFIG.introTime + 4);
    expect(c.hero.mana).toBe(5);
    run(c, 2);
    expect(c.hero.mana).toBeLessThan(5);
  });

  it("Flickering Lights: the hero's cards go dark on their own now and then", () => {
    const c = setup({ enemy: { ...ENEMIES.facilitiesManager, main: { ...ENEMIES.facilitiesManager.main, windup: 999 } } });
    run(c, CONFIG.introTime + FLICKER_EVERY - 2);
    expect(c.has('hero', 'blackout')).toBe(false);
    run(c, 3);
    expect(c.has('hero', 'blackout')).toBe(true);
  });

  it('Forced Smile heals the enemy every second', () => {
    const c = setup({ enemy: { ...ENEMIES.happinessOfficer, main: { ...ENEMIES.happinessOfficer.main, windup: 999 } } });
    c.enemy.hp -= 10;
    const hp = c.enemy.hp;
    run(c, CONFIG.introTime + 3.5);
    expect(c.enemy.hp).toBe(hp + 3 * SMILE_HEAL);
  });

  it('the Withered Ficus stings back when an attack card hits it', () => {
    const c = setup({ enemy: ENEMIES.witheredFicus });
    expect(c.stacks('enemy', 'thorns')).toBe(1);
  });
});

describe('act 3 elites and boss', () => {
  it('Conveyor Sis cuts the mana regeneration after 5 seconds; the button gives it back a tap at a time', () => {
    const c = setup({ enemy: { ...ENEMIES.conveyorSis, main: { ...ENEMIES.conveyorSis.main, windup: 999 } } });
    c.hero.mana = 0;
    run(c, CONFIG.introTime + 4);
    expect(c.manaTapOn).toBe(false);
    expect(c.hero.mana).toBeGreaterThan(0);
    run(c, 1.5);
    expect(c.manaTapOn).toBe(true);
    c.hero.mana = 0;
    c.hero.manaTimer = 0;
    run(c, 10);
    expect(c.hero.mana).toBe(0);
    const taps = Math.ceil(1 / CONFIG.manaTapAmount);
    for (let i = 0; i < taps; i++) c.tapMana();
    expect(c.hero.mana).toBe(1);
  });

  it('the Tourist hands out large luggage: suitcases to tap open, then the cards play as usual', () => {
    const c = setup({ enemy: { ...ENEMIES.tourist, main: { ...ENEMIES.tourist.main, windup: 999 } }, deck: deckOf(Array(4).fill('punch')) });
    run(c, CONFIG.introTime + 0.1);
    const luggage = ENEMIES.tourist.specials[0];
    c.enemy.move = luggage;
    c.enemy.timer = 0;
    run(c, luggage.windup + 0.1);
    const cards = [...c.draw, ...c.discard, ...c.belt.map((b) => b.card)].filter((x) => x.hex?.id === 'suitcase');
    expect(cards.map((x) => x.id).sort()).toEqual(['carryOn', 'dutyFree', 'snowGlobe']);
    for (const card of cards) {
      expect(cardKeywordsOf(card)).toContain('large');
      expect(card.hex?.left).toBe(HEXES.suitcase.taps);
    }
  });

  it('Flow State keeps Multitasking up, Cold Sweat chills with every Poison, Voodoo Pin petrifies and discounts', () => {
    const c = setup({ deck: deckOf(['punch', 'punch', 'punch', 'punch']) });
    run(c, CONFIG.introTime);
    const dummy = { uid: 99, id: 'flowState', up: false, bonus: 0, temp: true };
    c.chargeMultitasking();
    CARDS.flowState.play!(c, [8], dummy);
    run(c, CONFIG.multitaskingWindow * 2);
    expect(c.stacks('hero', 'multitasking')).toBe(1);
    run(c, 8);
    expect(c.has('hero', 'multitasking')).toBe(false);

    c.applyStatus('hero', 'coldSweat', 2);
    c.applyStatus('enemy', 'poison', 3);
    expect(c.has('enemy', 'chill')).toBe(true);

    const cards = [...c.draw, ...c.discard, ...c.belt.map((b) => b.card)].filter((x) => c.cardCost(x) > 0);
    const costs = new Map(cards.map((x) => [x.uid, c.cardCost(x)]));
    c.pinCards('petrify', 2, 1);
    const pinned = cards.filter((x) => x.hex);
    expect(pinned).toHaveLength(2);
    for (const x of pinned) expect(c.cardCost(x)).toBe(costs.get(x.uid)! - 1);
  });

  it('Diminishing Returns shrinks to nothing, Roomba sweeps Block, Credit Card shuffles in a Debt', () => {
    const c = setup({ deck: deckOf(['roomba', 'punch', 'punch']) });
    run(c, CONFIG.introTime + 0.01);
    const dr = { uid: 98, id: 'diminishingReturns', up: false, bonus: 0, temp: true };
    for (let i = 0; i < 6; i++) CARDS.diminishingReturns.play!(c, c.cardVals(dr), dr);
    expect(c.cardVals(dr)[0]).toBe(0);

    const roomba = c.belt.find((b) => b.card.id === 'roomba')!.card;
    const victim = c.belt.find((b) => b.card.id === 'punch')!.card;
    expect(c.sweepCard(roomba.uid, victim.uid)).toBe(true);
    expect(c.cardVals(roomba)[0]).toBe(CARDS.roomba.vals[0] + CARDS.roomba.vals[1]);

    const hp = c.hero.hp;
    const cc = { uid: 97, id: 'creditCard', up: false, bonus: 0, temp: true };
    CARDS.creditCard.play!(c, c.cardVals(cc), cc);
    expect(c.hero.hp).toBe(hp - 15);
    expect(c.hero.block).toBeGreaterThanOrEqual(30);
    expect([...c.draw, ...c.discard].some((x) => x.id === 'debt')).toBe(true);
  });
  it('a status with a trigger fills its bar up to it and cues when it goes off', () => {
    const c = setup({ enemy: { ...plainBoomer, start: [{ id: 'lowBattery', v: 1 }] } });
    const cues: string[] = [];
    c.events.on((e) => void (e.type === 'cue' ? cues.push(e.id) : null));
    const bar = (): number => STATUSES.lowBattery.progress!(c, 'enemy', c.enemy.statuses.lowBattery);
    run(c, CONFIG.introTime + 0.01);
    run(c, 2.5);
    expect(bar()).toBeCloseTo(0.5, 1);
    expect(cues).toEqual([]);
    run(c, 2.6);
    expect(cues).toEqual(['lowBattery']);
    expect(bar()).toBeLessThan(0.2);
  });
  it('Beg to stay: the first defeat waits for an answer, then the hero is back; a second defeat is final', () => {
    const flags: Record<string, number> = {};
    const c = setup({ canBeg: true, relicFlags: flags });
    run(c, CONFIG.introTime + 0.01);
    c.hero.mana = 0;
    const crystals = c.hero.maxMana;
    c.applyStatus('hero', 'poison', 3);
    c.damage('enemy', 'hero', 999, { raw: true }, 'enemy');
    expect(c.begging).toBe(true);
    expect(c.result).toBeNull();
    const time = c.time;
    run(c, 1);
    expect(c.time).toBe(time);
    c.beg(true);
    expect(c.hero.hp).toBe(c.hero.maxHp);
    expect(c.hero.maxMana).toBe(crystals + CONFIG.beg.crystals);
    expect(c.stacks('hero', 'poison')).toBe(0);
    expect(c.hero.mana).toBe(c.hero.maxMana);
    expect(c.stacks('hero', 'strength')).toBe(CONFIG.beg.strength);
    expect(c.has('hero', 'dodge')).toBe(true);
    expect(flags.begToStay).toBe(1);
    delete c.hero.statuses.dodge;
    c.damage('enemy', 'hero', 999, { raw: true, ignoreBlock: true }, 'enemy');
    expect(c.result).toBe('lose');
  });

  it('Beg to stay: declining loses the fight', () => {
    const c = setup({ canBeg: true });
    run(c, CONFIG.introTime + 0.01);
    c.damage('enemy', 'hero', 999, { raw: true }, 'enemy');
    c.beg(false);
    expect(c.result).toBe('lose');
  });
});
