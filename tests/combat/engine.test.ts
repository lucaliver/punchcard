import { describe, expect, it } from 'vitest';
import { Combat } from '../../src/game/combat';
import { ANCHOR_POS, CONFIG, EXPIRE_POS } from '../../src/data/config';
import { ENEMIES } from '../../src/data/enemies';
import { HEROES, VIRULENCE_START, PICKET_BLOCK } from '../../src/data/heroes';
import { STATUSES } from '../../src/data/statuses';
import { CARD_LIST, CARDS } from '../../src/data/cards';
import { HEXES } from '../../src/data/hexes';
import { runHistory } from '../../src/game/meta';
import { applyCombat, tailorCrystal, combatSetup, newRun, abandonRun } from '../../src/game/run';
import { deckOf, plainBoomer, setup, run } from './helpers';

describe('combat engine', () => {
  it('a restructuring shuts a belt row and discards the cards riding it', () => {
    const c = setup({ enemy: ENEMIES.changeManager });
    run(c, 6);
    const onRow1 = c.belt.filter((b) => b.row === 1).map((b) => b.card.uid);
    expect(onRow1.length).toBeGreaterThan(0);
    c.closeBeltRows(1);
    expect(c.rowsOpen).toBe(1);
    expect(c.belt.every((b) => b.row === 0)).toBe(true);
    expect(c.discard.map((x) => x.uid)).toEqual(expect.arrayContaining(onRow1));
    run(c, 6);
    expect(c.belt.every((b) => b.row === 0)).toBe(true);
  });

  it('the Power Socket shuts the belt off and it then only moves when dragged', () => {
    const c = setup({ enemy: ENEMIES.powerSocket, hp: 999, maxHp: 999 });
    const seen: string[] = [];
    c.events.on((e) => void (e.type === 'beltDead' ? seen.push(e.type) : null));
    c.crankBelt(0.1);
    run(c, CONFIG.introTime + 9);
    expect(c.beltDead).toBe(false);
    run(c, 2);
    expect(seen).toEqual(['beltDead']);
    expect(c.beltRate()).toBe(0);
    const front = Math.max(...c.belt.map((b) => b.pos));
    run(c, 3);
    expect(Math.max(...c.belt.map((b) => b.pos))).toBe(front);
    expect(c.belt.length).toBeGreaterThan(0);
    // Half way to where the front card would fall off.
    const step = (EXPIRE_POS - front) / 2;
    c.crankBelt(step);
    expect(Math.max(...c.belt.map((b) => b.pos))).toBeCloseTo(front + step);
    expect(c.beltCranked).toBeCloseTo(step);
    // The crank only turns one way: a backward turn changes nothing.
    const rear = Math.min(...c.belt.map((b) => b.pos));
    c.crankBelt(-5);
    expect(Math.min(...c.belt.map((b) => b.pos))).toBe(rear);
    // Dragging the belt far deals new cards on both rows.
    for (let i = 0; i < 200; i++) c.crankBelt(0.01);
    expect(new Set(c.belt.map((b) => b.row)).size).toBe(2);
  });

  it('the Exaggerated Girl sinks the sleeve and the ability, then opens a third belt row', () => {
    const c = setup({ enemy: ENEMIES.exaggeratedGirl, hp: 999, maxHp: 999 });
    const seen: string[] = [];
    c.events.on((e) => void (e.type === 'lowerSink' || e.type === 'rowAdded' ? seen.push(e.type) : null));
    run(c, CONFIG.introTime + 4.5);
    c.hero.mana = c.abilityCost();
    expect(c.lowerHidden).toBe(false);
    expect(c.abilityReady()).toBe(true);
    run(c, 1);
    expect(c.lowerHidden).toBe(true);
    expect(c.beltRows).toBe(2);
    c.hero.mana = c.abilityCost();
    expect(c.abilityReady()).toBe(false);
    expect(c.stash(c.belt[0].card.uid)).toBe(false);
    run(c, CONFIG.sinkTime + 0.1);
    expect(seen).toEqual(['lowerSink', 'rowAdded']);
    expect(c.beltRows).toBe(3);
    expect(c.rowsOpen).toBe(3);
    run(c, 30);
    expect(c.belt.some((b) => b.row === 2)).toBe(true);
    expect(seen).toHaveLength(2);
  });

  it('prewarms only the right half of the belt and waits for the intro', () => {
    const c = setup();
    const pos = c.belt.map((b) => b.pos);
    expect(pos.length).toBeGreaterThanOrEqual(2);
    expect(Math.max(...pos)).toBeCloseTo(CONFIG.prewarm, 1);
    expect(Math.max(...pos)).toBeLessThanOrEqual(CONFIG.prewarm + 0.01);
    c.tick(CONFIG.introTime / 2);
    expect(c.time).toBe(0);
  });

  it('regenerates mana up to the cap', () => {
    const c = setup();
    run(c, CONFIG.introTime + 30);
    expect(c.hero.mana).toBe(c.hero.maxMana);
  });

  it('plays a card: spends mana, deals damage, discards it', () => {
    const c = setup({ deck: deckOf(['punch', 'punch']) });
    run(c, CONFIG.introTime + 0.01);
    c.gainMana(3);
    const card = c.belt[0].card;
    const hp = c.enemy.hp;
    expect(c.playCard(card.uid)).toBe(true);
    expect(c.enemy.hp).toBe(hp - 6);
    expect(c.hero.mana).toBe(3 - c.cardCost(card));
    expect(c.discard.map((x) => x.uid)).toContain(card.uid);
  });

  it('two-row belt (default): both rows fill up, each keeps its spacing, and the belt runs slower', () => {
    const c = setup({ deck: deckOf(Array(14).fill('punch')) });
    expect(c.belt.filter((b) => b.row === 1).length).toBeGreaterThan(0);
    run(c, CONFIG.introTime + 10);
    for (const row of [0, 1]) {
      const pos = c.belt
        .filter((b) => b.row === row)
        .map((b) => b.pos)
        .sort((a, b) => a - b);
      expect(pos.length).toBeGreaterThan(2);
      for (let i = 1; i < pos.length; i++) expect(pos[i] - pos[i - 1]).toBeGreaterThan(CONFIG.spacing * 0.9);
    }
    expect(c.beltRate()).toBeCloseTo(CONFIG.twoRowSpeed);
  });

  it('cards never overlap on a row, even while queued curses hold the other one back', () => {
    const c = setup({ deck: deckOf(Array(14).fill('punch')) });
    c.enemy.move = { id: 'wait', intent: 'defend', windup: 999 };
    run(c, CONFIG.introTime + 0.01);
    c.addTempCard('drama', 'belt', false, -0.3);
    run(c, 6);
    for (const row of [0, 1]) {
      const pos = c.belt
        .filter((b) => b.row === row)
        .map((b) => b.pos)
        .sort((a, b) => a - b);
      for (let i = 1; i < pos.length; i++) expect(pos[i] - pos[i - 1]).toBeGreaterThan(CONFIG.cardWidth);
    }
  });

  it('refuses unaffordable cards', () => {
    const c = setup({ deck: deckOf(['hydraulicPress', 'hydraulicPress']) });
    run(c, CONFIG.introTime + 0.01);
    expect(c.playCard(c.belt[0].card.uid)).toBe(false);
    expect(c.belt.length).toBe(2);
  });

  it('expires cards off the left edge and reshuffles the discard pile', () => {
    const c = setup({ deck: deckOf(['punch', 'bobTheBuilder', 'wrenchWhack']) });
    let reshuffled = false;
    c.events.on((e) => {
      if (e.type === 'reshuffle') reshuffled = true;
    });
    run(c, CONFIG.introTime + CONFIG.beltTime * EXPIRE_POS + 3);
    expect(reshuffled).toBe(true);
  });

  it('block absorbs damage and decays over time', () => {
    const c = setup();
    run(c, CONFIG.introTime + 0.01);
    c.gainBlock('hero', 10);
    c.damage('enemy', 'hero', 6, {}, 'enemy');
    expect(c.hero.block).toBe(4);
    expect(c.hero.hp).toBe(80);
    run(c, 10);
    expect(c.hero.block).toBe(0);
  });

  it("breakBlock strips a fighter's Block", () => {
    const c = setup();
    run(c, CONFIG.introTime + 0.01);
    c.gainBlock('enemy', 15);
    c.breakBlock('enemy');
    expect(c.enemy.block).toBe(0);
  });

  it('stun pauses the enemy timer, chill halves it', () => {
    const c = setup();
    run(c, CONFIG.introTime + 0.01);
    c.applyStatus('enemy', 'stun', 1, 2);
    const t0 = c.enemy.timer;
    run(c, 1);
    expect(c.enemy.timer).toBeCloseTo(t0, 5);
    run(c, 1.1);
    c.applyStatus('enemy', 'chill', 1, 5);
    const t1 = c.enemy.timer;
    run(c, 1);
    expect(c.enemy.timer - t1).toBeCloseTo(0.5, 1);
  });

  it('stashes cards in the sleeve and swaps when the slot is taken', () => {
    const c = setup();
    run(c, CONFIG.introTime + 0.01);
    const [a, b] = c.belt.map((x) => x.card);
    expect(c.stash(a.uid, 0)).toBe(true);
    expect(c.sleeve[0]?.uid).toBe(a.uid);
    expect(c.stash(b.uid, 0)).toBe(true);
    expect(c.sleeve[0]?.uid).toBe(b.uid);
    expect(c.belt.some((x) => x.card.uid === a.uid)).toBe(true);
  });

  it('the Work Wife fills the sleeve with Dunder Mifflin Boxes: stuck there, cheaper every second, cleared by paying', () => {
    const c = setup({ hero: HEROES.necromancer, enemy: ENEMIES.workWife });
    expect(c.sleeve.every((x) => x?.id === 'dunderMifflinBox')).toBe(true);
    const box = c.sleeve[0]!;
    expect(c.cardCost(box)).toBe(20);
    run(c, CONFIG.introTime + 0.01);
    expect(c.stash(c.belt[0].card.uid, 0)).toBe(false);
    run(c, 5);
    expect(c.cardCost(box)).toBe(15);
    run(c, 20);
    expect(c.cardCost(box)).toBe(0);
    expect(c.playCard(box.uid)).toBe(true);
    expect(c.sleeve[0]).toBe(null);
    // Unpacking it speeds the belt up.
    expect(c.has('hero', 'rush')).toBe(true);
    expect(c.hero.statuses.rush.t).toBeCloseTo(CARDS.dunderMifflinBox.vals[1], 1);
  });

  it('Kamikaze blows up in your face if it slips off the belt, but is safe in the sleeve', () => {
    const c = setup({ hp: 200, maxHp: 200, deck: deckOf(Array(6).fill('punch')) });
    c.enemy.move = { id: 'wait', intent: 'defend', windup: 999 };
    run(c, CONFIG.introTime + 0.01);
    c.addTempCard('kamikaze', 'belt');
    const kept = c.belt[c.belt.length - 1].card;
    expect(c.playCard(kept.uid)).toBe(false);
    expect(c.stash(kept.uid, 0)).toBe(true);
    c.addTempCard('kamikaze', 'belt');
    run(c, (CONFIG.beltTime * EXPIRE_POS) / c.beltRate() + 0.5);
    expect(c.sleeve[0]?.uid).toBe(kept.uid);
    expect(c.hero.hp).toBe(200 - CARDS.kamikaze.vals[1]);
  });

  it('enemy resolves its telegraphed move after the wind-up', () => {
    const c = setup({ enemy: ENEMIES.snitch });
    run(c, CONFIG.introTime + ENEMIES.snitch.main.windup + 0.05);
    expect(c.hero.hp).toBe(80);
    run(c, CONFIG.enemyDelay);
    expect(c.hero.hp).toBe(80 - ENEMIES.snitch.main.dmg!);
  });

  it('warrior Picket Line gives Block that does not fade', () => {
    const c = setup({ deck: deckOf(['punch', 'punch']) });
    run(c, CONFIG.introTime + 0.01);
    c.hero.maxMana = 10;
    c.hero.mana = 10;
    expect(c.useAbility()).toBe(true);
    expect(c.hero.mana).toBe(10 - HEROES.warrior.ability.cost);
    expect(c.hero.block).toBe(PICKET_BLOCK);
    run(c, 5);
    expect(c.hero.block).toBe(PICKET_BLOCK);
  });

  it('mage Time Theft stuns the enemy, which stops its timer', () => {
    const c = setup({ hero: HEROES.mage, deck: deckOf(HEROES.mage.startDeck) });
    run(c, CONFIG.introTime + 0.01);
    c.hero.maxMana = 10;
    c.hero.mana = 10;
    expect(c.useAbility()).toBe(true);
    expect(c.has('enemy', 'stun')).toBe(true);
    expect(c.enemyTimeRate()).toBe(0);
  });

  it('perks: innate puts a copy first on the belt, discount lowers its cost', () => {
    const deck = deckOf(new Array(10).fill('punch'));
    deck[9] = { ...deck[9], id: 'printerSmash', perks: ['fastTrack', 'budgetCut'] };
    const c = setup({ deck });
    const card = c.belt.find((b) => b.card.id === 'printerSmash')?.card;
    expect(card).toBeDefined();
    expect(c.cardCost(card!)).toBe(c.cardCost({ uid: 0, id: 'printerSmash', up: false }) - 1);
  });

  it('a hexed card needs its taps, then thaws, then plays normally', () => {
    const c = setup({ deck: deckOf(new Array(8).fill('punch')) });
    run(c, CONFIG.introTime + 0.01);
    c.gainMana(3);
    c.hexCards('petrify', 0.01);
    const card = c.belt.find((b) => b.card.hex)!.card;
    for (let i = 0; i < 5; i++) expect(c.playCard(card.uid)).toBe(false);
    expect(c.stash(card.uid)).toBe(false);
    expect(card.hex?.left).toBe(0);
    expect(c.playCard(card.uid)).toBe(false);
    run(c, 0.6);
    expect(card.hex).toBeUndefined();
    expect(c.playCard(card.uid)).toBe(true);
  });

  it('a crumpled card needs its 4 taps, one picture for each, then plays normally', () => {
    const c = setup({ deck: deckOf(new Array(8).fill('punch')) });
    run(c, CONFIG.introTime + 0.01);
    c.gainMana(3);
    c.hexCards('crumple', 0.01);
    const card = c.belt.find((b) => b.card.hex)!.card;
    expect(HEXES.crumple.stages).toHaveLength(HEXES.crumple.taps);
    for (let i = 0; i < HEXES.crumple.taps; i++) expect(c.playCard(card.uid)).toBe(false);
    run(c, HEXES.crumple.thaw + 0.1);
    expect(card.hex).toBeUndefined();
    expect(c.playCard(card.uid)).toBe(true);
  });

  it('a hexed card that landed in the sleeve still thaws once cracked, and plays', () => {
    const c = setup({ deck: deckOf(new Array(8).fill('punch')) });
    run(c, CONFIG.introTime + 0.01);
    c.gainMana(3);
    const card = c.belt[0].card;
    c.stash(card.uid);
    card.hex = { id: 'petrify', left: 1, t: 0.5 };
    expect(c.sleeveCards()).toContain(card);
    expect(c.playCard(card.uid)).toBe(false);
    run(c, 0.6);
    expect(card.hex).toBeUndefined();
    expect(c.playCard(card.uid)).toBe(true);
  });

  it('Gatekeeping covers the cards ahead of it until paid off', () => {
    const c = setup({ deck: deckOf(new Array(8).fill('punch')) });
    run(c, CONFIG.introTime + 1);
    c.hero.mana = 10;
    c.addTempCard('gatekeeping', 'belt');
    run(c, 1);
    const gate = c.belt.find((b) => b.card.id === 'gatekeeping')!;
    const under = c.belt.find((b) => b.card.id === 'punch' && b.pos > gate.pos && c.isCovered(b.card.uid));
    expect(under).toBeDefined();
    expect(c.playCard(under!.card.uid)).toBe(false);
    expect(c.playCard(gate.card.uid)).toBe(true);
    expect(c.playCard(under!.card.uid)).toBe(true);
  });

  it("the Senior Boomer's paper cuts deal 1 damage for every card that slips off the belt, at any HP", () => {
    const c = setup({ enemy: ENEMIES.seniorBoomer, deck: deckOf(new Array(8).fill('punch')) });
    run(c, CONFIG.introTime + 0.01);
    c.enemy.move = { id: 'wait', intent: 'defend', windup: 999 };
    const lost = (): number => {
      const hp = c.hero.hp;
      c.belt[0].pos = EXPIRE_POS;
      run(c, CONFIG.fallGrace + 0.05);
      return hp - c.hero.hp;
    };
    expect(lost()).toBe(1);
    c.damage('hero', 'enemy', Math.ceil(c.enemy.maxHp / 2), { raw: true }, 'hero');
    expect(lost()).toBe(1);
  });

  it('the Goblin Consultant stops the belt for a moment, then reverses it, for every quarter of its HP you take, cards keeping their place', () => {
    const c = setup({ enemy: ENEMIES.goblinConsultant });
    c.enemy.move = { id: 'wait', intent: 'defend', windup: 999 };
    run(c, CONFIG.introTime + 6);
    const turns: string[] = [];
    const said: string[] = [];
    c.events.on((e) => {
      if (e.type === 'beltReversed') turns.push(e.type);
      if (e.type === 'speech') said.push(e.key);
    });
    const posOf = (): string => c.belt.map((b) => `${b.card.uid}:${b.pos.toFixed(3)}`).join();
    const before = c.belt.map((b) => `${b.card.uid}:${(b.pos - CONFIG.cardWidth / 2).toFixed(2)}`);
    c.damage('hero', 'enemy', Math.ceil(c.enemy.maxHp / 4), { raw: true }, 'hero');
    expect(said).toEqual(['status.paradigmShift.speech']);
    // The belt stands still first…
    const still = posOf();
    run(c, CONFIG.beltTurnPause / 2);
    expect(posOf()).toBe(still);
    expect(turns).toHaveLength(0);
    // …then turns around: a card's middle is mirrored about the belt's middle (unless it was still sliding in).
    while (!turns.length) run(c, 1 / 60);
    const mid = (x: number): number => 1 - x;
    for (const b of c.belt) {
      const was = before.find((s) => s.startsWith(`${b.card.uid}:`));
      if (was && b.pos < CONFIG.reverseMaxPos) expect(b.pos - CONFIG.cardWidth / 2).toBeCloseTo(mid(Number(was.split(':')[1])), 1);
    }
    c.damage('hero', 'enemy', 1, { raw: true }, 'hero');
    run(c, 1);
    expect(turns).toHaveLength(1);
    // Two quarters at once: the two turns cancel out.
    c.damage('hero', 'enemy', Math.ceil(c.enemy.maxHp / 2), { raw: true }, 'hero');
    run(c, 1);
    expect(turns).toHaveLength(1);
  });

  it('Burn hits only when the enemy attacks with damage, for its full stacks every time', () => {
    const c = setup({ enemy: ENEMIES.snitch });
    c.enemy.hp = c.enemy.maxHp = 500;
    c.enemy.block = 50;
    c.enemy.move = { id: 'poke', intent: 'attack', windup: 2, dmg: 1 };
    run(c, CONFIG.introTime);
    c.applyStatus('enemy', 'burn', 10);
    // Idle time costs it nothing, and Block doesn't stop it.
    c.enemy.timer = 0;
    run(c, 1.5);
    expect(c.enemy.hp).toBe(500);
    run(c, 1);
    expect(c.enemy.hp).toBe(490);
    expect(c.stacks('enemy', 'burn')).toBe(10);
    c.enemy.move = { id: 'poke', intent: 'attack', windup: 2, dmg: 1 };
    c.enemy.timer = 0;
    run(c, 2.1);
    expect(c.enemy.hp).toBe(480);
    // A move that deals no damage doesn't set it off.
    c.enemy.move = { id: 'chat', intent: 'defend', windup: 1 };
    c.enemy.timer = 0;
    run(c, 1.1);
    expect(c.enemy.hp).toBe(480);
  });

  it('HR policy goes by the card colour: two defense cards clash, defense then utility is fine', () => {
    const c = setup({
      enemy: ENEMIES.hrBitch,
      deck: deckOf(['bobTheBuilder', 'bobTheBuilder', 'italianEspresso', 'bobTheBuilder', 'italianEspresso', 'bobTheBuilder']),
    });
    run(c, CONFIG.introTime + 0.01);
    c.hero.mana = c.hero.maxMana = 10;
    c.lastPlayed = CARDS.bobTheBuilder;
    c.lastPlayedAt = c.time;
    expect(c.ruleBlock({ uid: 0, id: 'bobTheBuilder', up: false })?.key).toBe('combat.policy');
    expect(c.ruleBlock({ uid: 0, id: 'italianEspresso', up: false })).toBeNull();
  });

  it('HR policy covers curses too: paying off two curses back to back is refused', () => {
    const c = setup({ enemy: ENEMIES.hrBitch });
    run(c, CONFIG.introTime + 0.01);
    c.lastPlayed = CARDS.writeUp;
    c.lastPlayedAt = c.time;
    expect(c.ruleBlock({ uid: 0, id: 'writeUp', up: false })?.key).toBe('combat.policy');
  });

  it('HR policy: no two cards of the same type in a row', () => {
    const c = setup({ enemy: ENEMIES.hrBitch, deck: deckOf(['punch', 'punch', 'punch', 'bobTheBuilder', 'bobTheBuilder', 'bobTheBuilder']) });
    run(c, CONFIG.introTime + 0.01);
    c.hero.mana = 10;
    const strikes = c.belt.filter((b) => b.card.id === 'punch');
    expect(c.playCard(strikes[0].card.uid)).toBe(true);
    if (strikes[1]) expect(c.playCard(strikes[1].card.uid)).toBe(false);
    const defend = c.belt.find((b) => b.card.id === 'bobTheBuilder');
    if (defend) expect(c.playCard(defend.card.uid)).toBe(true);
    // The policy only covers quick repeats: after a pause the same type is fine again.
    run(c, 3.1);
    const again = c.belt.find((b) => b.card.id === 'bobTheBuilder');
    if (again) expect(c.playCard(again.card.uid)).toBe(true);
  });

  it('Light Sleeper: every card played brings his hit 1s closer', () => {
    const c = setup({ enemy: ENEMIES.guyAsleep, deck: deckOf(new Array(8).fill('punch')) });
    run(c, CONFIG.introTime + 0.01);
    c.gainMana(3);
    const before = c.enemy.timer;
    c.playCard(c.belt[0].card.uid);
    expect(c.enemy.timer).toBeCloseTo(before + 1, 5);
  });

  it('New Hire crumples half the belt and half the rest of the deck at the start; a hex survives the piles until broken', () => {
    const c = setup({ enemy: ENEMIES.newHire, deck: deckOf(new Array(12).fill('punch')) });
    const onBelt = c.belt.length;
    const rest = c.draw.length + c.discard.length;
    expect(c.belt.filter((b) => b.card.hex).length).toBe(Math.ceil(onBelt / 2));
    expect([...c.draw, ...c.discard].filter((x) => x.hex).length).toBe(Math.ceil(rest / 2));
    // Left alone, hexed cards fall off the belt still hexed.
    run(c, CONFIG.beltTime * 1.5);
    const hexed = [...c.discard, ...c.draw, ...c.belt.map((b) => b.card)].filter((x) => x.hex);
    expect(hexed.length).toBe(Math.ceil(onBelt / 2) + Math.ceil(rest / 2));
  });

  it("the Boss's Son shows a target now and then; tapping it in time makes the next attack hit twice as hard, once", () => {
    const c = setup({ enemy: ENEMIES.bossSon, hp: 500, maxHp: 500 });
    run(c, CONFIG.introTime + 0.01);
    const waitSpot = (): void => {
      for (let i = 0; i < 200 && !c.weakSpot; i++) run(c, 0.1);
      expect(c.weakSpot).not.toBeNull();
    };
    expect(c.hitWeakSpot()).toBe(false);
    waitSpot();
    run(c, 2.1);
    expect(c.weakSpot).toBeNull();
    expect(c.has('hero', 'crit')).toBe(false);

    const punch = (): number => {
      c.hero.mana = c.hero.maxMana = 10;
      c.enemy.block = 0;
      c.addTempCard('punch', 'belt');
      const before = c.enemy.hp;
      c.playCard(c.belt[c.belt.length - 1].card.uid);
      return before - c.enemy.hp;
    };
    const plain = punch();
    waitSpot();
    expect(c.hitWeakSpot()).toBe(true);
    expect(c.has('hero', 'crit')).toBe(true);
    expect(punch()).toBe(plain * CONFIG.critMult);
    expect(c.has('hero', 'crit')).toBe(false);
    expect(punch()).toBe(plain);
  });

  it('a virus costs 1 more, infects the card behind it after a second (once), and playing the card cures it', () => {
    const c = setup({ hp: 500, maxHp: 500, deck: deckOf(new Array(12).fill('punch')) });
    run(c, CONFIG.introTime + 0.01);
    const [front, behind] = [...c.belt].sort((a, b) => b.pos - a.pos);
    front.card.virus = { t: 0, spread: false };
    expect(c.cardCost(front.card)).toBe(CARDS.punch.cost + 1);
    run(c, CONFIG.virusDelay / 2);
    expect(behind.card.virus).toBeUndefined();
    run(c, CONFIG.virusDelay);
    expect(behind.card.virus).toBeDefined();
    expect(front.card.virus?.spread).toBe(true);
    c.hero.mana = c.hero.maxMana = 10;
    expect(c.playCard(front.card.uid)).toBe(true);
    expect(front.card.virus).toBeUndefined();
    expect(c.cardCost(front.card)).toBe(CARDS.punch.cost);
  });

  it('rust spots land on the belt, the belt slows down along an ease-in-out sine until they stop it, and scrubbing a spot takes it off', () => {
    const c = setup({ enemy: ENEMIES.nightJanitor, hp: 900, maxHp: 900 });
    const { every, max, warn } = STATUSES.deferredMaintenance.rust!;
    const said: string[] = [];
    c.events.on((e) => {
      if (e.type === 'speech') said.push(e.key);
    });
    expect(c.rustsBelt).toBe(true);
    expect(setup().rustsBelt).toBe(false);
    run(c, CONFIG.introTime + 0.01);
    const base = c.beltRate();
    run(c, every + 0.1);
    expect(c.rustSpots).toHaveLength(1);
    expect(c.beltRate()).toBeCloseTo(base * ((1 + Math.cos(Math.PI / max)) / 2));
    expect(c.hero.statuses.rustedBelt?.v).toBe(1);
    const [spot] = c.rustSpots;
    c.scrubRust(spot.id, 0.6);
    expect(c.rustSpots).toHaveLength(1);
    expect(spot.grime).toBeCloseTo(0.4);
    c.scrubRust(spot.id, 0.5);
    expect(c.rustSpots).toHaveLength(0);
    expect(c.beltRate()).toBeCloseTo(base);
    expect(c.hero.statuses.rustedBelt).toBeUndefined();
    // Left alone, the spots pile up, slowing the belt more and more, until it stops dead.
    run(c, every * (max / 2 + 0.5));
    expect(c.beltRate() / base).toBeCloseTo((1 + Math.cos((Math.PI * c.rustSpots.length) / max)) / 2);
    expect(c.rustAlarm).toBe(false);
    run(c, every * (max * warn - c.rustSpots.length));
    expect(c.rustAlarm).toBe(true);
    run(c, every * (max + 2));
    expect(c.rustSpots.length).toBe(max);
    expect(said).toEqual(['status.deferredMaintenance.speech']);
    expect(c.beltRate()).toBe(0);
  });

  it("the Nerd's update window covers the belt; Postpone brings it back in a few seconds, Update runs the fake bar and patches him", () => {
    // His own attacks off, so the only Strength he can gain is the patch.
    const c = setup({ enemy: { ...ENEMIES.theNerd, main: { id: 'scan', intent: 'idle', windup: 9999 } }, hp: 900, maxHp: 900 });
    const def = STATUSES.updateNeeded.popup!;
    const phases: string[] = [];
    const said: string[] = [];
    c.events.on((e) => {
      if (e.type === 'popup') phases.push(e.phase);
      if (e.type === 'speech') said.push(e.key);
    });
    run(c, CONFIG.introTime + def.first - 0.1);
    expect(c.popup).toBeNull();
    run(c, 0.2);
    expect(c.popup?.phase).toBe('ask');
    // The window is over the whole belt; its buttons wake up a moment later.
    const card = c.belt[0].card;
    c.hero.mana = c.hero.maxMana = 10;
    expect(c.isCovered(card.uid)).toBe(true);
    expect(c.playCard(card.uid)).toBe(false);
    expect(c.postponeUpdate()).toBe(false);
    expect(c.startUpdate()).toBe(false);
    run(c, CONFIG.popupArm);
    expect(c.canAnswerUpdate()).toBe(true);
    // Postpone: gone, and back after a random wait inside the range.
    expect(c.postponeUpdate()).toBe(true);
    expect(c.popup).toBeNull();
    expect(c.isCovered(card.uid)).toBe(false);
    run(c, def.postpone[0] - 0.1);
    expect(c.popup).toBeNull();
    run(c, def.postpone[1] - def.postpone[0] + 0.2);
    expect(c.popup?.phase).toBe('ask');
    // Update: 90% after `install` seconds, the rest as many seconds later, then the enemy is patched and the window stays away for a while.
    run(c, CONFIG.popupArm);
    expect(c.startUpdate()).toBe(true);
    expect(c.updateProgress()).toBe(0);
    // Each leg eases out (cubic): most of it comes early.
    run(c, def.install / 2);
    expect(c.updateProgress()).toBeCloseTo(90 * (1 - 0.5 ** 3), 0);
    run(c, def.install / 2);
    expect(c.updateProgress()).toBeCloseTo(90, 0);
    run(c, def.install / 2);
    expect(c.updateProgress()).toBeCloseTo(90 + 10 * (1 - 0.5 ** 3), 0);
    expect(c.popup?.phase).toBe('install');
    expect(c.isCovered(c.belt[0].card.uid)).toBe(true);
    expect(c.enemy.statuses.strength).toBeUndefined();
    run(c, def.install / 2 + 0.1);
    expect(c.popup).toBeNull();
    expect(c.enemy.statuses.strength?.v).toBe(def.patch.v);
    expect(said).toEqual(['status.updateNeeded.speech']);
    run(c, def.every - 0.4);
    expect(c.popup).toBeNull();
    run(c, 0.5);
    expect(c.popup?.phase).toBe('ask');
    expect(phases).toEqual(['open', 'close', 'open', 'install', 'close', 'open']);
    // Having updated once, Postpone keeps it away `postponeMul` times longer.
    run(c, CONFIG.popupArm);
    expect(c.postponeUpdate()).toBe(true);
    run(c, def.postpone[0] * def.postponeMul - 0.1);
    expect(c.popup).toBeNull();
  });

  it('sleeve slots come from the hero', () => {
    expect(setup({ hero: HEROES.warrior }).sleeve.length).toBe(1);
    expect(setup({ hero: HEROES.necromancer }).sleeve.length).toBe(3);
  });

  it('mana crystals raise the cap empty', () => {
    const c = setup({ deck: deckOf(['italianEspresso', 'punch']) });
    run(c, CONFIG.introTime + 0.01);
    c.gainMana(3);
    const max = c.hero.maxMana;
    const card = c.belt.find((b) => b.card.id === 'italianEspresso')!.card;
    const mana = c.hero.mana;
    c.playCard(card.uid);
    expect(c.hero.maxMana).toBe(max + 2);
    expect(c.hero.mana).toBe(mana - 2);
  });

  it('mage Multitasking adds damage to chained attacks', () => {
    const c = setup({ hero: HEROES.mage, hp: 70, maxHp: 70, deck: deckOf(['clippy', 'clippy']), enemy: ENEMIES.toxicCoworker });
    run(c, CONFIG.introTime + 0.01);
    c.hero.maxMana = c.hero.mana = 10;
    const hp = c.enemy.hp;
    c.playCard(c.belt[0].card.uid);
    c.playCard(c.belt[0].card.uid);
    expect(hp - c.enemy.hp).toBe(3 + 4);
  });

  it('Wellness Seminar gives Regeneration for each Multitasking charge', () => {
    const c = setup({ hero: HEROES.mage, hp: 40, maxHp: 70, deck: deckOf(['wellnessSeminar']), enemy: ENEMIES.toxicCoworker });
    run(c, CONFIG.introTime + 0.01);
    c.hero.maxMana = c.hero.mana = 10;
    for (let i = 0; i < 3; i++) c.chargeMultitasking();
    c.playCard(c.belt[0].card.uid);
    expect(c.stacks('hero', 'regen')).toBe(CARDS.wellnessSeminar.vals[0] * 3);
  });

  it('played cards are never replaced in place: new cards always enter from the right', () => {
    // One row, so the spacing check below reads a single line of cards.
    const c = setup({ beltRows: 1, deck: deckOf(['punch', 'punch', 'punch', 'punch', 'punch', 'punch']) });
    c.hero.maxMana = 10;
    run(c, CONFIG.introTime + 3);
    const spawnPositions: number[] = [];
    c.events.on((e) => {
      if (e.type === 'cardSpawn') spawnPositions.push(c.belt.find((b) => b.card.uid === e.card.uid)!.pos);
    });
    for (let i = 0; i < 20; i++) {
      c.hero.mana = 10;
      if (c.belt[0]) c.playCard(c.belt[0].card.uid);
      run(c, 0.3);
    }
    expect(spawnPositions.length).toBeGreaterThan(1);
    expect(spawnPositions.every((p) => p === 0)).toBe(true);
    // Cards keep their spacing (no overlap from the entry boost).
    const sorted = c.belt.map((b) => b.pos).sort((a, b) => a - b);
    for (let i = 1; i < sorted.length; i++) expect(sorted[i] - sorted[i - 1]).toBeGreaterThanOrEqual(CONFIG.minGap - 1e-9);
  });

  it('draw cadence is fixed: playing fast never draws extra cards', () => {
    const spawnsWith = (spam: boolean): number => {
      const c = setup({ deck: deckOf(new Array(12).fill('punch')), enemy: ENEMIES.seniorBoomer });
      c.enemy.hp = 9999;
      c.hero.hp = 9999;
      let n = 0;
      c.events.on((e) => {
        if (e.type === 'cardSpawn') n++;
      });
      for (let t = 0; t < CONFIG.introTime + 20; t += 1 / 60) {
        c.tick(1 / 60);
        if (spam && c.belt.length) {
          c.hero.mana = 10;
          c.playCard(c.belt[c.belt.length - 1].card.uid);
        }
      }
      return n;
    };
    expect(spawnsWith(true)).toBe(spawnsWith(false));
  });

  it('necromancer: the enemy starts the fight with Poison (Virulence), other heroes do not', () => {
    const enemy = ENEMIES.seniorBoomer;
    const necro = setup({ hero: HEROES.necromancer, hp: 50, maxHp: 50, deck: deckOf(['karoshi', 'karoshi']), enemy });
    expect(necro.stacks('enemy', 'poison')).toBe(VIRULENCE_START);
    expect(setup({ deck: deckOf(['punch']), enemy }).stacks('enemy', 'poison')).toBe(0);
  });

  it('sudo lifts every rule and rushes the belt for the time shown on the card', () => {
    const c = setup({ hero: HEROES.mage, deck: deckOf(['sudo', 'sudo']) });
    run(c, CONFIG.introTime + 0.01);
    c.hero.mana = 3;
    c.playCard(c.belt.find((b) => b.card.id === 'sudo')!.card.uid);
    expect(c.has('hero', 'rootAccess')).toBe(true);
    expect(c.has('hero', 'rush')).toBe(true);
    expect(c.hero.statuses.rush.t).toBeCloseTo(c.cardVals({ uid: 0, id: 'sudo', up: false })[1], 1);
  });

  it('a bomb that reaches the end of the belt explodes on the hero', () => {
    const c = setup({ deck: deckOf(['punch']) });
    c.enemy.move = { id: 'wait', intent: 'defend', windup: 999 };
    run(c, CONFIG.introTime + 0.01);
    c.addTempCard('deadline', 'belt');
    run(c, (CONFIG.beltTime * EXPIRE_POS) / c.beltRate() + 0.5);
    expect(c.hero.hp).toBe(80 - 10);
  });

  it('enemies use their main attack, then a special every N attacks', () => {
    const c = setup({ enemy: ENEMIES.seniorBoomer, hp: 999, maxHp: 999 });
    const seen: string[] = [];
    c.events.on((e) => {
      if (e.type === 'enemyAct') seen.push(e.move.id);
    });
    const { main, specials } = ENEMIES.seniorBoomer;
    run(c, CONFIG.introTime + 4 * main.windup + specials[0].windup + specials[1].windup + 1);
    // Specials rotate: Seniority, then Gatekeep.
    expect(seen.slice(0, 6)).toEqual(['boxCutter', 'boxCutter', 'seniority', 'boxCutter', 'boxCutter', 'gatekeep']);
  });

  it('abilities cost mana and cannot be used without it', () => {
    const c = setup();
    run(c, CONFIG.introTime + 0.01);
    c.hero.mana = HEROES.warrior.ability.cost - 1;
    expect(c.useAbility()).toBe(false);
  });

  it('synergy cards: Fortified Block holds, Counterstrike reads Block, Contagion reads Poison', () => {
    const c = setup({ deck: deckOf(['safetyRegs', 'grievance']) });
    c.enemy.move = { id: 'wait', intent: 'defend', windup: 999 };
    run(c, CONFIG.introTime + 0.01);
    c.hero.maxMana = 10;
    c.hero.mana = 10;
    c.playCard(c.belt.find((b) => b.card.id === 'safetyRegs')!.card.uid);
    const block = c.hero.block;
    run(c, 3);
    expect(c.hero.block).toBe(block);
    const hp = c.enemy.hp;
    c.hero.mana = 10;
    c.playCard(c.belt.find((b) => b.card.id === 'grievance')!.card.uid);
    expect(hp - c.enemy.hp).toBe(CARDS.grievance.vals[1]);

    const n = setup({ hero: HEROES.necromancer, hp: 62, maxHp: 62, deck: deckOf(['wordOfMouth', 'wordOfMouth']) });
    // Virulence's starting Poison is not what this checks.
    delete n.enemy.statuses.poison;
    run(n, CONFIG.introTime + 0.01);
    n.hero.mana = 6;
    n.playCard(n.belt[0].card.uid);
    n.playCard(n.belt[0].card.uid);
    expect(n.stacks('enemy', 'poison')).toBe(2 + 5);
  });

  it('rushing the belt makes cards arrive faster', () => {
    const count = (rush: boolean): number => {
      const c = setup({ deck: deckOf(new Array(20).fill('punch')) });
      c.enemy.move = { id: 'wait', intent: 'defend', windup: 999 };
      let n = 0;
      c.events.on((e) => {
        if (e.type === 'cardSpawn') n++;
      });
      run(c, CONFIG.introTime + 0.01);
      if (rush) {
        c.rushBelt(6);
        expect(c.has('hero', 'rush')).toBe(true);
      }
      run(c, 6);
      return n;
    };
    expect(count(true)).toBeGreaterThan(count(false));
  });

  it('temp curses never collide with deck uids', () => {
    const c = setup({ enemy: ENEMIES.toxicCoworker });
    c.addTempCard('drama', 'discard');
    expect(c.discard[0].uid).toBeLessThan(0);
  });

  it('Meeting Table takes two places on the belt: the next card comes one place later, and it covers nothing', () => {
    const c = setup({ beltRows: 1, deck: deckOf(Array(8).fill('punch')) });
    c.enemy.move = { id: 'wait', intent: 'defend', windup: 999 };
    c.belt.length = 0;
    c.addTempCard('meetingTable', 'belt');
    c.addTempCard('punch', 'belt', false, 0.4);
    expect(c.isCovered(c.belt[1].card.uid)).toBe(false);
    c.belt.pop();
    const table = c.belt[0];
    run(c, CONFIG.introTime + 0.01);
    while (c.belt.length < 2) run(c, 0.05);
    const next = c.belt.find((b) => b !== table)!;
    expect(table.pos - next.pos).toBeGreaterThanOrEqual(CONFIG.minGap + CONFIG.spacing - 0.02);
  });

  it('every card has a play or expire effect (or is plain unplayable) and valid numbers', () => {
    for (const d of CARD_LIST) {
      expect(d.play || d.onExpire || d.keywords?.includes('unplayable'), d.id).toBeTruthy();
      if (d.upVals) expect(d.upVals.length, d.id).toBe(d.vals.length);
    }
  });

  it('a Pending card can only be played after its first full ride along the belt', () => {
    const c = setup({ beltRows: 1, deck: deckOf(['blastFurnace']) });
    c.enemy.move = { id: 'wait', intent: 'defend', windup: 999 };
    run(c, CONFIG.introTime + 0.01);
    c.hero.maxMana = c.hero.mana = 10;
    const card = c.belt[0].card;
    expect(c.playCard(card.uid)).toBe(false);
    expect(c.stash(card.uid, 1)).toBe(false);
    // Off the edge, reshuffled, back on the belt: now it's approved.
    run(c, (CONFIG.beltTime * EXPIRE_POS) / c.beltRate() + 3);
    const back = c.belt.find((b) => b.card.uid === card.uid);
    expect(back).toBeTruthy();
    c.hero.mana = 10;
    expect(c.playCard(card.uid)).toBe(true);
    // Played, it must be approved again.
    expect(card.passed).toBeFalsy();
  });

  it('a card held at the end of the belt is kept for the grace time, then falls off', () => {
    const c = setup({ beltRows: 1, deck: deckOf(['punch', 'punch']) });
    c.enemy.move = { id: 'wait', intent: 'defend', windup: 999 };
    const expired: number[] = [];
    c.events.on((e) => {
      if (e.type === 'cardExpired') expired.push(e.card.uid);
    });
    run(c, CONFIG.introTime + 0.01);
    const uid = c.belt[0].card.uid;
    c.startDrag(uid);
    run(c, CONFIG.beltTime);
    expect(expired).not.toContain(uid);
    run(c, CONFIG.dragGrace + CONFIG.fallGrace + 0.2);
    expect(expired).toContain(uid);
  });

  it('the Security Monitor raises 30 Block the first time it falls under half HP', () => {
    const c = setup({ enemy: ENEMIES.securityMonitor });
    run(c, CONFIG.introTime + 0.01);
    c.enemy.block = 0;
    c.damage('hero', 'enemy', Math.ceil(c.enemy.maxHp / 2), { raw: true }, 'hero');
    expect(c.enemy.block).toBe(30);
  });

  it('the Snitch hurries the belt for the rest of the fight once under half HP', () => {
    const c = setup({ enemy: ENEMIES.snitch });
    run(c, CONFIG.introTime + 0.01);
    const base = c.beltRate();
    c.damage('hero', 'enemy', Math.ceil(c.enemy.maxHp / 2), { raw: true }, 'hero');
    expect(c.beltRate()).toBeCloseTo(base * CONFIG.beltHurry);
    run(c, 30);
    expect(c.has('hero', 'hurry')).toBe(true);
  });

  it("the CEO's emergency button stops the belt dead for 8s once he is under half HP", () => {
    const c = setup({ enemy: ENEMIES.slavesCeo });
    run(c, CONFIG.introTime + 0.01);
    c.enemy.block = 0;
    c.damage('hero', 'enemy', Math.ceil(c.enemy.maxHp / 2), { raw: true }, 'hero');
    expect(c.beltRate()).toBe(0);
    const pos = c.belt.map((b) => b.pos);
    run(c, 7);
    expect(c.belt.map((b) => b.pos)).toEqual(pos);
    run(c, 1.5);
    expect(c.beltRate()).toBeGreaterThan(0);
  });

  it('Crunch doubles the belt speed, then it wears off; the CEO casts it', () => {
    expect(ENEMIES.slavesCeo.specials.find((m) => m.id === 'crunchTime')?.status?.[0]).toMatchObject({ id: 'crunch', t: 10 });
    const c = setup({ enemy: ENEMIES.slavesCeo });
    run(c, CONFIG.introTime + 0.01);
    const base = c.beltRate();
    c.applyStatus('hero', 'crunch', 1, 10);
    expect(c.beltRate()).toBeCloseTo(base * CONFIG.beltCrunch);
    run(c, 10.5);
    expect(c.beltRate()).toBeCloseTo(base);
  });
});

describe('statuses that work through their data', () => {
  const fight = (): Combat => {
    const c = setup();
    run(c, CONFIG.introTime + 0.1);
    return c;
  };

  it('Dodge makes its carrier immune to damage', () => {
    const c = fight();
    c.applyStatus('hero', 'dodge', 1, 5);
    const hp = c.hero.hp;
    c.damage('enemy', 'hero', 20, {}, 'enemy');
    expect(c.hero.hp).toBe(hp);
    c.removeStatus('hero', 'dodge');
    c.damage('enemy', 'hero', 20, {}, 'enemy');
    expect(c.hero.hp).toBe(hp - 20);
  });

  it('Weak lowers the damage dealt and Vulnerable raises the damage taken', () => {
    const c = fight();
    const base = c.previewHeroDamage(20, null);
    c.applyStatus('hero', 'weak', 1, 5);
    expect(c.previewHeroDamage(20, null)).toBe(Math.floor(base * 0.75));
    c.applyStatus('enemy', 'vulnerable', 1, 5);
    expect(c.previewHeroDamage(20, null)).toBe(Math.floor(base * 0.75 * 1.5));
  });

  it('a stunned, chilled or hasty enemy runs its clock slower, at a halt or faster', () => {
    const c = fight();
    expect(c.enemyTimeRate()).toBe(1);
    c.applyStatus('enemy', 'chill', 1, 5);
    expect(c.enemyTimeRate()).toBe(0.5);
    c.applyStatus('enemy', 'haste', 1, 5);
    expect(c.enemyTimeRate()).toBe(0.75);
    c.applyStatus('enemy', 'stun', 1, 5);
    expect(c.enemyTimeRate()).toBe(0);
  });

  it('belt statuses multiply its speed, and Stalled stops it', () => {
    const c = fight();
    const base = c.beltBoost();
    c.applyStatus('hero', 'rush', 1, 5);
    c.applyStatus('hero', 'slowdown', 1, 5);
    expect(c.beltBoost()).toBeCloseTo(base * CONFIG.beltRush * CONFIG.beltSlow);
    c.applyStatus('hero', 'stalled', 1, 5);
    expect(c.beltBoost()).toBe(0);
  });

  it('Fortified holds the Block that would decay', () => {
    const c = fight();
    c.gainBlock('hero', 30);
    c.applyStatus('hero', 'fortified', 1, 30);
    run(c, 10);
    expect(c.hero.block).toBe(30);
  });

  it('Autopilot plays, for free, a card slipping off the belt', () => {
    const c = fight();
    c.applyStatus('hero', 'autopilot', 1, 60);
    c.hero.mana = 0;
    run(c, 20);
    expect(c.cardsPlayed).toBeGreaterThan(0);
  });

  it('Root Access ignores the card rules an enemy sets', () => {
    const c = setup({ enemy: { ...plainBoomer, start: [{ id: 'chillOut' }] } });
    run(c, CONFIG.introTime + 0.1);
    c.hero.mana = c.hero.maxMana = 10;
    expect(c.playCard(c.belt[0].card.uid)).toBe(true);
    expect(c.playCard(c.belt[0].card.uid)).toBe(false);
    c.applyStatus('hero', 'rootAccess', 1, 10);
    expect(c.playCard(c.belt[0].card.uid)).toBe(true);
  });

  it('Regen heals and Poison hurts, a stack less each time', () => {
    const c = fight();
    c.hero.hp = 50;
    c.applyStatus('hero', 'regen', 3);
    c.applyStatus('enemy', 'poison', 3);
    const hp = c.enemy.hp;
    run(c, CONFIG.dotInterval + 0.1);
    expect(c.hero.hp).toBe(53);
    expect(c.enemy.hp).toBe(hp - 2);
    expect(c.stacks('hero', 'regen')).toBe(2);
    expect(c.stacks('enemy', 'poison')).toBe(2);
  });
});

describe('cards that change on the belt', () => {
  const onBelt = (id: string): { c: Combat; uid: number } => {
    const c = setup({ deck: deckOf(Array(6).fill('punch')) });
    c.enemy.move = { id: 'wait', intent: 'defend', windup: 999 };
    run(c, CONFIG.introTime + 0.01);
    c.hero.mana = c.hero.maxMana = 10;
    c.addTempCard(id, 'belt');
    return { c, uid: c.belt[c.belt.length - 1].card.uid };
  };
  const card = (c: Combat, uid: number) => [...c.belt.map((b) => b.card), ...c.sleeve].find((x) => x?.uid === uid)!;

  it('Unpaid Overtime hits harder for every second it rides the belt, up to its cap', () => {
    const { c, uid } = onBelt('unpaidOvertime');
    const [start, step] = CARDS.unpaidOvertime.vals;
    expect(c.cardVals(card(c, uid))[0]).toBe(start);
    run(c, 3.05);
    expect(c.cardVals(card(c, uid))[0]).toBe(start + 3 * step);
    const hp = c.enemy.hp;
    c.playCard(uid);
    expect(hp - c.enemy.hp).toBe(start + 3 * step);
  });

  it('Patience gives less Block the longer it rides, never below its floor, and the sleeve freezes it', () => {
    const { c, uid } = onBelt('patience');
    const [start, step, floor] = CARDS.patience.vals;
    run(c, 2.05);
    expect(c.cardVals(card(c, uid))[0]).toBe(start - 2 * step);
    c.stash(uid, 0);
    run(c, 5);
    expect(c.cardVals(card(c, uid))[0]).toBe(start - 2 * step);
    c.playCard(uid);
    expect(c.hero.block).toBe(start - 2 * step);
    const late = { uid: 999, id: 'patience', up: false, age: 60 };
    expect(c.cardVals(late)[0]).toBe(floor);
  });
});

describe('sleeve cards', () => {
  const held = (id: string): Combat => {
    const c = setup({ deck: deckOf(Array(6).fill('punch')) });
    c.enemy.move = { id: 'wait', intent: 'defend', windup: 999 };
    run(c, CONFIG.introTime + 0.01);
    c.hero.mana = c.hero.maxMana = 10;
    c.addTempCard(id, 'belt');
    c.stash(c.belt[c.belt.length - 1].card.uid, 0);
    expect(c.sleeve[0]?.id).toBe(id);
    return c;
  };

  it('Tool Belt: attacks deal more while it waits in the sleeve', () => {
    const c = held('toolBelt');
    const hp = c.enemy.hp;
    c.playCard(c.belt[0].card.uid);
    expect(hp - c.enemy.hp).toBe(6 + 1);
    c.playCard(c.sleeve[0]!.uid);
    expect(c.hero.block).toBe(4);
  });

  it('Cache: every attack played while it waits is cached into its damage, spent when played', () => {
    const c = held('clearCache');
    c.addTempCard('clippy', 'belt');
    c.playCard(c.belt[c.belt.length - 1].card.uid);
    const [base, grow] = CARDS.clearCache.vals;
    expect(c.cardVals(c.sleeve[0]!)[0]).toBe(base + grow);
    const cache = c.sleeve[0]!;
    const hp = c.enemy.hp;
    c.playCard(cache.uid);
    expect(hp - c.enemy.hp).toBeGreaterThanOrEqual(base + grow);
    expect(cache.bonus).toBe(0);
  });

  it('Cache: what it cached is lost when a swap sends it back to the belt', () => {
    const c = held('clearCache');
    const cache = c.sleeve[0]!;
    c.addTempCard('clippy', 'belt');
    c.playCard(c.belt[c.belt.length - 1].card.uid);
    expect(cache.bonus).toBe(CARDS.clearCache.vals[1]);
    c.addTempCard('clippy', 'belt');
    c.stash(c.belt[c.belt.length - 1].card.uid, 0);
    expect(c.belt.some((b) => b.card === cache)).toBe(true);
    expect(cache.bonus).toBe(0);
  });

  it('Burn Book: every hit you take while it waits adds Poison to the card, spent when played', () => {
    const c = held('burnBook');
    const [base, grow] = CARDS.burnBook.vals;
    c.damage('enemy', 'hero', 5, {}, 'enemy');
    c.damage('enemy', 'hero', 5, {}, 'enemy');
    expect(c.cardVals(c.sleeve[0]!)[0]).toBe(base + 2 * grow);
    const book = c.sleeve[0]!;
    c.playCard(book.uid);
    expect(c.stacks('enemy', 'poison')).toBe(base + 2 * grow);
    expect(book.bonus).toBe(0);
  });
});

describe('assorted rules and cards', () => {
  it('Thick Skin: Block under the threshold fades slower, a bigger one at the normal pace', () => {
    const fade = (block: number, hero = HEROES.warrior): number => {
      const c = setup({ hero });
      c.enemy.move = { id: 'wait', intent: 'defend', windup: 999 };
      run(c, CONFIG.introTime + 0.01);
      c.hero.block = block;
      c.hero.blockTimer = 0;
      run(c, hero.blockDecay * 1.1);
      return block - c.hero.block;
    };
    // Under the threshold the first step takes longer than the base pace; over it, not.
    expect(fade(5)).toBe(0);
    expect(fade(40)).toBeGreaterThan(0);
  });

  it('Voodoo Pin petrifies cards of the piles, never one on the belt', () => {
    const c = setup({ deck: deckOf(new Array(12).fill('punch')) });
    c.enemy.move = { id: 'wait', intent: 'defend', windup: 999 };
    run(c, CONFIG.introTime + 0.01);
    c.pinCards('petrify', 20, 0, { deckOnly: true });
    expect(c.belt.some((b) => b.card.hex)).toBe(false);
    expect([...c.draw, ...c.discard].some((x) => x.hex)).toBe(true);
  });

  it("HP gained in a fight (It's-a Me) never leaves the run above its max HP", () => {
    const run1 = newRun('warrior', 3);
    const c = setup({ hp: run1.hp, maxHp: run1.maxHp });
    c.gainMaxHp(8);
    applyCombat(run1, c);
    expect(run1.hp).toBeLessThanOrEqual(run1.maxHp);
  });

  it('Dress Code and Raise Denied show what they would do right now', () => {
    const c = setup({ deck: deckOf(['dressCode', 'punch', 'punch', 'punch']) });
    c.enemy.move = { id: 'wait', intent: 'defend', windup: 999 };
    run(c, CONFIG.introTime + 0.01);
    c.belt.length = 0;
    c.addTempCard('punch', 'belt');
    c.addTempCard('dressCode', 'belt');
    const dress = c.belt[c.belt.length - 1].card;
    const [block, shrink] = CARDS.dressCode.vals;
    expect(c.shownVals(dress)[0]).toBe(block - shrink);
    c.enemy.block = 10;
    c.applyStatus('enemy', 'strength', 2);
    c.addTempCard('raiseDenied', 'belt');
    const raise = c.belt[c.belt.length - 1].card;
    const [base, per] = CARDS.raiseDenied.vals;
    expect(c.shownVals(raise)[0]).toBe(base + per * c.strippable().length);
  });

  it('a card about to be stolen is marked for the last half second of the wind-up', () => {
    const c = setup();
    run(c, CONFIG.introTime + 3);
    c.enemy.move = { id: 'grab', intent: 'steal', windup: 10, steal: 1 };
    c.enemy.timer = 10 - CONFIG.stealWarn - 0.1;
    expect(c.stealTarget()).toBeNull();
    c.enemy.timer = 10 - CONFIG.stealWarn + 0.05;
    const first = c.belt.reduce((a, b) => (b.pos > a.pos ? b : a));
    expect(c.stealTarget()?.uid).toBe(first.card.uid);
  });

  it('a card that slipped off the end can still be stashed while it tips over, then it is lost', () => {
    const c = setup({ beltRows: 1, deck: deckOf(['punch', 'punch', 'punch']) });
    c.enemy.move = { id: 'wait', intent: 'defend', windup: 999 };
    const expired: number[] = [];
    c.events.on((e) => {
      if (e.type === 'cardExpired') expired.push(e.card.uid);
    });
    run(c, CONFIG.introTime + CONFIG.beltTime * 0.6);
    const [first, second] = [...c.belt].sort((a, b) => b.pos - a.pos);
    first.pos = EXPIRE_POS + 0.01;
    second.pos = EXPIRE_POS + 0.01;
    run(c, CONFIG.fallGrace / 2);
    expect(first.falling).toBeDefined();
    expect(expired).toEqual([]);
    expect(c.stash(first.card.uid, 0)).toBe(true);
    run(c, CONFIG.fallGrace);
    expect(expired).toEqual([second.card.uid]);
    expect(c.sleeve[0]?.uid).toBe(first.card.uid);
  });

  it('a run in the history keeps its deck and stationery for the detail', () => {
    const r = newRun('warrior', 4);
    abandonRun(r);
    const log = runHistory()[0];
    expect(log.deck).toHaveLength(r.deck.length);
    expect(log.relics).toEqual(r.relics);
  });

  it('Hot Potato and Pass the Buck bring each other back into the draw pile, upgrades kept', () => {
    const c = setup({ deck: deckOf(['punch', 'punch']) });
    c.enemy.move = { id: 'wait', intent: 'defend', windup: 999 };
    c.enemy.hp = c.enemy.maxHp = 500;
    run(c, CONFIG.introTime + 0.01);
    c.hero.mana = c.hero.maxMana = 10;
    const play = (id: string, up: boolean): void => {
      c.addTempCard(id, 'belt', up);
      expect(c.playCard(c.belt[c.belt.length - 1].card.uid, 'auto')).toBe(true);
    };
    play('hotPotato', true);
    const buck = c.draw.find((x) => x.id === 'passTheBuck');
    expect(buck?.up).toBe(true);
    c.hero.block = 0;
    play('passTheBuck', true);
    expect(c.hero.block).toBe(CARDS.passTheBuck.upVals![0]);
    expect(c.draw.some((x) => x.id === 'hotPotato' && x.up)).toBe(true);
    expect(c.exhaust.filter((x) => x.id === 'hotPotato' || x.id === 'passTheBuck')).toHaveLength(2);
  });

  it('May 1st stuns the enemy and heals the hero', () => {
    const c = setup({ deck: deckOf(['punch', 'punch']) });
    c.enemy.move = { id: 'wait', intent: 'defend', windup: 999 };
    run(c, CONFIG.introTime + 0.01);
    c.hero.hp = 10;
    c.addTempCard('mayFirst', 'belt');
    expect(c.playCard(c.belt[c.belt.length - 1].card.uid, 'auto')).toBe(true);
    expect(c.has('enemy', 'stun')).toBe(true);
    expect(c.hero.hp).toBe(10 + CARDS.mayFirst.vals[1]);
  });

  it('an Echo card is played again and again and stays on the belt', () => {
    const def = CARDS.punch;
    const saved = def.keywords;
    def.keywords = ['echo'];
    try {
      const c = setup({ beltRows: 1, deck: deckOf(['punch', 'punch']) });
      c.enemy.move = { id: 'wait', intent: 'defend', windup: 999 };
      c.enemy.hp = c.enemy.maxHp = 500;
      run(c, CONFIG.introTime + 0.01);
      c.hero.mana = c.hero.maxMana = 10;
      const card = c.belt[0].card;
      const hp = c.enemy.hp;
      expect(c.playCard(card.uid)).toBe(true);
      expect(c.playCard(card.uid)).toBe(true);
      expect(c.belt.some((b) => b.card.uid === card.uid)).toBe(true);
      expect(c.discard).not.toContain(card);
      expect(hp - c.enemy.hp).toBe(2 * CARDS.punch.vals[0]);
    } finally {
      def.keywords = saved;
    }
  });

  it('an Echo card played from the sleeve is spent as usual', () => {
    const def = CARDS.punch;
    const saved = def.keywords;
    def.keywords = ['echo'];
    try {
      const c = setup({ beltRows: 1, deck: deckOf(['punch', 'punch']) });
      c.enemy.move = { id: 'wait', intent: 'defend', windup: 999 };
      run(c, CONFIG.introTime + 0.01);
      c.hero.mana = c.hero.maxMana = 10;
      const card = { uid: 9100, id: 'punch', up: false, bonus: 0, temp: false };
      c.sleeve[0] = card;
      expect(c.playCard(card.uid)).toBe(true);
      expect(c.sleeve[0]).toBeNull();
      expect(c.playCard(card.uid)).toBe(false);
    } finally {
      def.keywords = saved;
    }
  });

  it('an Anchor card stops pinned at the end of the belt and never falls', () => {
    const def = CARDS.bobTheBuilder;
    const saved = def.keywords;
    def.keywords = ['anchor'];
    try {
      const c = setup({ beltRows: 1, deck: deckOf(['bobTheBuilder', 'punch', 'punch']) });
      c.enemy.move = { id: 'wait', intent: 'defend', windup: 999 };
      run(c, CONFIG.introTime + 0.01);
      c.addTempCard('bobTheBuilder', 'belt');
      const anchored = c.belt[c.belt.length - 1];
      anchored.pos = ANCHOR_POS - 0.01;
      run(c, CONFIG.beltTime);
      expect(anchored.pinned).toBe(true);
      expect(anchored.card.passed).toBe(true);
      expect(anchored.pos).toBe(ANCHOR_POS);
      expect(c.belt).toContain(anchored);
      expect(c.discard).not.toContain(anchored.card);
    } finally {
      def.keywords = saved;
    }
  });

  it('the Tailor shows up once in a whole run', () => {
    for (let seed = 1; seed <= 20; seed++) {
      expect(newRun('warrior', seed).nodes.filter((n) => n.type === 'tailor').length).toBeLessThanOrEqual(1);
    }
  });
  it('the Tailor sews in a mana crystal that every later fight starts with', () => {
    const r = newRun('warrior', 3);
    const before = new Combat(combatSetup(r)).hero.maxMana;
    tailorCrystal(r);
    expect(new Combat(combatSetup(r)).hero.maxMana).toBe(before + CONFIG.tailorCrystals);
  });
});
