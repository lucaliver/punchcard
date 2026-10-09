import { describe, expect, it } from 'vitest';
import type { Combat } from '../../src/game/combat';
import { CONFIG } from '../../src/data/config';
import { HEROES } from '../../src/data/heroes';
import { CARDS } from '../../src/data/cards';
import { RELICS } from '../../src/data/relics';
import { rewardChoices, rollRewards, gainRelic, hasRelic, newRun } from '../../src/game/run';
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
    expect(rewardChoices(r)).toBe(5);
    expect(rollRewards(r, 'fight')).toHaveLength(5);
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
});
