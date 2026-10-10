import { describe, expect, it } from 'vitest';
import { Combat, type CombatSetup } from '../../src/game/combat';
import { CONFIG, EXPIRE_POS } from '../../src/data/config';
import { ENEMIES } from '../../src/data/enemies';
import { HEROES } from '../../src/data/heroes';
import { COFFEE_EVERY, FORKLIFT_BLOCK, LUNCH_EVERY, STATUSES, TABS_EVERY } from '../../src/data/statuses';
import { CARDS, cardValsOf } from '../../src/data/cards';
import { applyCombat, combatSetup, newRun } from '../../src/game/run';
import type { CardInst } from '../../src/game/types';
import { deckOf, setup, run } from './helpers';

describe('workplace cards', () => {
  /** A quiet fight: the enemy never acts, lots of mana, the belt as the test sets it. */
  const quiet = (deck: string[], over: Partial<CombatSetup> = {}): Combat => {
    const c = setup({ deck: deckOf(deck), ...over });
    c.enemy.move = { id: 'wait', intent: 'defend', windup: 999 };
    c.enemy.hp = c.enemy.maxHp = 500;
    run(c, CONFIG.introTime + 0.01);
    c.hero.maxMana = c.hero.mana = 10;
    return c;
  };
  const play = (c: Combat, id: string): boolean => {
    c.addTempCard(id, 'belt');
    const b = c.belt.find((x) => x.card.id === id)!;
    b.card.passed = true;
    return c.playCard(b.card.uid);
  };

  it('a stunned hero cannot play cards or use the ability', () => {
    const c = quiet(['punch', 'punch']);
    expect(play(c, 'godfathersFavour')).toBe(true);
    expect(c.has('hero', 'stun')).toBe(true);
    expect(c.playCard(c.belt[0].card.uid)).toBe(false);
    expect(c.abilityReady()).toBe(false);
    run(c, 2.1);
    expect(c.playCard(c.belt[0].card.uid)).toBe(true);
  });

  it('Bare Minimum gains its Block every second, 1 more each second, until another card is played', () => {
    const c = quiet(['punch', 'punch']);
    play(c, 'bareMinimum');
    const start = CARDS.bareMinimum.vals[0];
    run(c, 3.01);
    // start + (start + 1) + (start + 2), less what the decay has taken meanwhile.
    expect(c.hero.block).toBeGreaterThanOrEqual(3 * start + 3 - 1);
    expect(c.hero.block).toBeLessThanOrEqual(3 * start + 3);
    c.playCard(c.belt[0].card.uid);
    expect(c.has('hero', 'bareMinimum')).toBe(false);
  });

  it('Grindset deals damage every second for its duration', () => {
    const c = quiet(['bobTheBuilder']);
    const hp = c.enemy.hp;
    play(c, 'grindset');
    run(c, 12.5);
    expect(hp - c.enemy.hp).toBe(3 * 12);
  });

  it('Priority Task holds its whole row; Lockout covers both rows ahead of it', () => {
    const c = quiet(new Array(10).fill('punch'));
    c.addTempCard('priorityTask', 'belt');
    const lock = c.belt.find((b) => b.card.id === 'priorityTask')!;
    const sameRow = c.belt.filter((b) => b !== lock && b.row === lock.row);
    const otherRow = c.belt.filter((b) => b.row !== lock.row);
    expect(sameRow.length).toBeGreaterThan(0);
    expect(sameRow.every((b) => c.isCovered(b.card.uid))).toBe(true);
    expect(otherRow.some((b) => c.isCovered(b.card.uid))).toBe(false);

    const d = quiet(new Array(10).fill('punch'));
    d.addTempCard('lockout', 'belt');
    run(d, 3);
    const gate = d.belt.find((b) => b.card.id === 'lockout')!;
    const ahead = d.belt.filter((b) => b.pos > gate.pos && b.pos - gate.pos < 2 * CONFIG.cardWidth);
    expect(new Set(ahead.map((b) => b.row)).size).toBe(2);
    expect(ahead.every((b) => d.isCovered(b.card.uid))).toBe(true);
  });

  it('Quiet Quitting exhausts the belt and hits once per card', () => {
    const c = quiet(new Array(10).fill('punch'));
    // The belt it exhausts doesn't include Quiet Quitting itself.
    const n = c.belt.length;
    const hp = c.enemy.hp;
    const discarded = c.discard.length;
    play(c, 'quietQuitting');
    expect(c.belt.length).toBe(0);
    expect(c.exhaust.length).toBeGreaterThanOrEqual(n);
    expect(c.discard.length).toBe(discarded);
    expect(hp - c.enemy.hp).toBe(CARDS.quietQuitting.vals[0] * n);
  });

  it('As Per My Last Email repeats the last card, Ctrl+C Ctrl+V copies it over the belt', () => {
    const c = quiet(new Array(8).fill('bobTheBuilder'));
    play(c, 'punch');
    const hp = c.enemy.hp;
    play(c, 'asPerMyLastEmail');
    expect(hp - c.enemy.hp).toBe(6);
    // A repeat doesn't count as the last card: a second one repeats the same Punch.
    play(c, 'asPerMyLastEmail');
    expect(hp - c.enemy.hp).toBe(12);
    play(c, 'ctrlCCtrlV');
    expect(c.belt.length).toBeGreaterThan(0);
    expect(c.belt.every((b) => b.card.id === 'punch' && b.card.temp)).toBe(true);
  });

  it('Not My Job skips the move being charged', () => {
    const c = setup({ enemy: ENEMIES.seniorBoomer });
    run(c, CONFIG.introTime + 1);
    c.hero.maxMana = c.hero.mana = 10;
    const before = c.enemy.moveCount;
    c.enemy.timer = 3;
    play(c, 'notMyJob');
    expect(c.enemy.timer).toBe(0);
    expect(c.enemy.moveCount).toBe(before);
  });

  it('Follow Up and Q1 put generated cards into the draw pile', () => {
    const c = quiet(['bobTheBuilder', 'bobTheBuilder']);
    play(c, 'followUp');
    expect(c.draw.filter((x) => x.id === 'alreadyDone').length).toBe(3);
    play(c, 'q1');
    expect(c.draw.some((x) => x.id === 'q2')).toBe(true);
  });

  it('a Drama that leaves the belt shuffles another one into the deck', () => {
    const c = quiet(['bobTheBuilder']);
    c.addTempCard('drama', 'belt');
    const dramas = (): number => [...c.draw, ...c.discard, ...c.belt.map((b) => b.card)].filter((x) => x.id === 'drama').length;
    expect(dramas()).toBe(1);
    run(c, (CONFIG.beltTime * EXPIRE_POS) / c.beltRate() + 0.5);
    expect(dramas()).toBe(2);
  });

  it('volatile office curses bite when they leave the belt', () => {
    const c = quiet(['bobTheBuilder']);
    c.addTempCard('officePlant', 'belt');
    c.addTempCard('pcLoadLetter', 'belt');
    c.hero.mana = 8;
    run(c, (CONFIG.beltTime * EXPIRE_POS) / c.beltRate() + 0.5);
    expect(c.has('hero', 'stun')).toBe(true);
    expect(c.hero.mana).toBeLessThan(8);
  });
});

describe('pop culture cards', () => {
  /** A fight past the intro with a quiet enemy and plenty of mana; `id` is put on the belt and returned. */
  const ready = (id: string): { c: Combat; uid: number } => {
    const c = setup({ deck: deckOf(Array(6).fill('punch')) });
    c.enemy.move = { id: 'wait', intent: 'defend', windup: 999 };
    run(c, CONFIG.introTime + 0.01);
    c.hero.mana = c.hero.maxMana = 10;
    c.addTempCard(id, 'belt');
    return { c, uid: c.belt[c.belt.length - 1].card.uid };
  };

  it("Take Credit: Block for you, and all of the enemy's Block becomes yours", () => {
    const { c, uid } = ready('mrBurnsEmpire');
    c.enemy.block = 20;
    c.playCard(uid);
    expect(c.enemy.block).toBe(0);
    expect(c.hero.block).toBe(CARDS.mrBurnsEmpire.vals[0] + 20);
  });

  it('Team Change pins the cards on the belt where they are; new cards ride past them', () => {
    const { c, uid } = ready('teamChange');
    run(c, 4);
    const pinned = c.belt.filter((b) => b.card.uid !== uid).map((b) => ({ uid: b.card.uid, pos: b.pos }));
    expect(pinned.length).toBeGreaterThan(1);
    c.playCard(uid);
    run(c, 30);
    for (const p of pinned) expect(c.belt.find((b) => b.card.uid === p.uid)?.pos).toBe(p.pos);
    // Cards kept arriving meanwhile, and a pinned one can still be played.
    expect(c.belt.some((b) => !b.pinned)).toBe(true);
    expect(c.playCard(pinned[0].uid)).toBe(true);
  });

  it('Parkour!: dodge and a rushed belt, both wearing off', () => {
    const { c, uid } = ready('parkour');
    const base = c.beltRate();
    c.playCard(uid);
    expect(c.has('hero', 'dodge')).toBe(true);
    expect(c.beltRate()).toBeCloseTo(base * CONFIG.beltRush);
    run(c, CARDS.parkour.vals[1] + 0.5);
    expect(c.has('hero', 'dodge')).toBe(false);
    expect(c.beltRate()).toBeCloseTo(base);
  });

  /** Puts `n` more cards on the belt next to the ready one and returns their uids. */
  const crowd = (c: Combat, n: number): number[] => {
    const before = c.belt.length;
    for (let i = 0; i < n; i++) c.addTempCard('punch', 'belt');
    return c.belt.slice(before).map((b) => b.card.uid);
  };

  /** Puts a card on the belt and returns its uid. */
  const onBelt = (c: Combat, id: string): number => {
    c.addTempCard(id, 'belt');
    return c.belt[c.belt.length - 1].card.uid;
  };

  it('Work-Life Balance: for a while, every attack you play also gives Block (not skills, and not for ever)', () => {
    const { c, uid } = ready('workLifeBalance');
    const [dmg, block, time] = CARDS.workLifeBalance.vals;
    c.playCard(uid);
    expect(c.enemy.maxHp - c.enemy.hp).toBe(dmg);
    expect(c.hero.block).toBe(0);
    c.hero.block = 0;
    c.playCard(onBelt(c, 'bobTheBuilder'));
    expect(c.hero.block).toBe(CARDS.bobTheBuilder.vals[0]);
    c.hero.block = 0;
    c.playCard(onBelt(c, 'punch'));
    expect(c.hero.block).toBe(block);
    run(c, time + 0.5);
    c.hero.block = 0;
    c.playCard(onBelt(c, 'punch'));
    expect(c.hero.block).toBe(0);
  });

  it('Life-Work Balance: you gain Block, then every skill you play also deals damage (not attacks)', () => {
    const { c, uid } = ready('lifeWorkBalance');
    const [block, dmg] = CARDS.lifeWorkBalance.vals;
    c.playCard(uid);
    expect(c.hero.block).toBe(block);
    expect(c.enemy.hp).toBe(c.enemy.maxHp);
    c.playCard(onBelt(c, 'punch'));
    const afterPunch = c.enemy.hp;
    c.playCard(onBelt(c, 'bobTheBuilder'));
    expect(afterPunch - c.enemy.hp).toBe(dmg);
  });

  it('Mr. Roboto knocks cards off the belt (they are lost) and grows for each, up to its cap, then hits for it', () => {
    const { c, uid } = ready('mrRoboto');
    const [base, by, max] = CARDS.mrRoboto.vals;
    const victims = crowd(c, 12);
    const discarded = c.discard.length;
    expect(c.sweepCard(uid, victims[0])).toBe(true);
    expect(c.belt.some((b) => b.card.uid === victims[0])).toBe(false);
    expect(c.discard.length).toBe(discarded + 1);
    expect(c.belt.find((b) => b.card.uid === uid)!.card.bonus).toBe(by);
    for (const v of victims.slice(1)) c.sweepCard(uid, v);
    expect(c.belt.find((b) => b.card.uid === uid)!.card.bonus).toBe(max);
    c.playCard(uid);
    expect(c.enemy.maxHp - c.enemy.hp).toBe(base + max);
  });

  it('Mr. Roboto stays on the belt while it is held, even past the exit, and is lost once let go', () => {
    const { c, uid } = ready('mrRoboto');
    let lost = false;
    c.events.on((e) => {
      if (e.type === 'cardExpired' && e.card.uid === uid) lost = true;
    });
    c.startDrag(uid);
    run(c, CONFIG.beltTime * 2);
    expect(lost).toBe(false);
    expect(c.belt.some((b) => b.card.uid === uid)).toBe(true);
    c.endDrag();
    run(c, 1);
    expect(lost).toBe(true);
  });

  it("Mr. Roboto's bonus is gone as soon as it is played (or lost), and only a card on the belt can be swept", () => {
    const { c, uid } = ready('mrRoboto');
    const [victim] = crowd(c, 1);
    const roboto = c.belt.find((b) => b.card.uid === uid)!.card;
    c.sweepCard(uid, victim);
    expect(roboto.bonus).toBeGreaterThan(0);
    c.playCard(uid);
    expect(roboto.bonus).toBe(0);
    expect(c.sweepCard(uid, victim)).toBe(false);
    expect(c.sweepCard(victim, uid)).toBe(false);
  });

  it('Mr. Roboto cannot sweep a hexed or a pinned card, and a swept curse still bites as it falls', () => {
    const { c, uid } = ready('mrRoboto');
    const [hexed, pinned] = crowd(c, 2);
    c.belt.find((b) => b.card.uid === hexed)!.card.hex = { id: 'petrify', left: 2, t: 99 };
    c.belt.find((b) => b.card.uid === pinned)!.pinned = true;
    expect(c.sweepCard(uid, hexed)).toBe(false);
    expect(c.sweepCard(uid, pinned)).toBe(false);
    c.addTempCard('writeUp', 'belt');
    const writeUp = c.belt[c.belt.length - 1].card.uid;
    const hp = c.hero.hp;
    expect(c.sweepCard(uid, writeUp)).toBe(true);
    expect(hp - c.hero.hp).toBe(CARDS.writeUp.vals[0]);
  });

  it('Payday Loan hits hard, costs HP and shuffles a First Aid Kit in', () => {
    const { c, uid } = ready('paydayLoan');
    c.belt.find((b) => b.card.uid === uid)!.card.passed = true;
    c.hero.hp = c.hero.maxHp = 500;
    c.playCard(uid);
    expect(c.enemy.maxHp - c.enemy.hp).toBe(CARDS.paydayLoan.vals[0]);
    expect(500 - c.hero.hp).toBe(CARDS.paydayLoan.vals[1]);
    expect(c.draw.some((x) => x.id === 'firstAidKit')).toBe(true);
  });

  it('Debt bites harder every time it slips off the belt', () => {
    const { c } = ready('paydayLoan');
    c.hero.hp = c.hero.maxHp = 500;
    c.addTempCard('debt', 'draw');
    const debt = c.draw.find((x) => x.id === 'debt')!;
    const [bite, more] = CARDS.debt.vals;
    c.belt.length = 0;
    c.belt.push({ card: debt, pos: EXPIRE_POS, row: 0 });
    run(c, CONFIG.fallGrace + 0.05);
    expect(500 - c.hero.hp).toBe(bite);
    expect(c.cardVals(debt)[0]).toBe(bite + more);
    c.belt.push({ card: debt, pos: EXPIRE_POS, row: 0 });
    run(c, CONFIG.fallGrace + 0.05);
    expect(500 - c.hero.hp).toBe(bite + bite + more);
  });

  it('Workaholic: Strength that lasts only for a while', () => {
    const { c, uid } = ready('stakhanov');
    const dmg = (): number => c.previewHeroDamage(10, CARDS.punch);
    c.playCard(uid);
    expect(dmg()).toBe(10 + CARDS.stakhanov.vals[0]);
    run(c, CARDS.stakhanov.vals[1] + 0.5);
    expect(dmg()).toBe(10);
  });

  it('Brown Noser: mana refills twice as fast for a while', () => {
    const { c, uid } = ready('brownNoser');
    const gained = (seconds: number): number => {
      c.hero.mana = 0;
      c.hero.manaTimer = 0;
      run(c, seconds);
      return c.hero.mana;
    };
    const normal = gained(6);
    c.playCard(uid);
    c.hero.mana = 0;
    expect(gained(6)).toBeGreaterThan(normal * 1.8);
    run(c, CARDS.brownNoser.vals[0]);
    expect(gained(6)).toBe(normal);
  });

  it('Severance: Strength, then cards slipping off the belt play themselves for free', () => {
    const { c, uid } = ready('severance');
    c.playCard(uid);
    expect(c.stacks('hero', 'strength')).toBe(3);
    const hp = c.enemy.hp;
    const played = c.cardsPlayed;
    c.hero.mana = c.hero.maxMana = 0;
    run(c, 8.9);
    expect(c.cardsPlayed).toBeGreaterThan(played);
    expect(c.enemy.hp).toBeLessThan(hp);
  });

  it('Ctrl+Z heals back the HP lost in the last few seconds', () => {
    const { c, uid } = ready('ctrlZ');
    c.damage('enemy', 'hero', 10, { raw: true }, 'enemy');
    run(c, 6);
    c.damage('enemy', 'hero', 7, { raw: true }, 'enemy');
    const hp = c.hero.hp;
    c.playCard(uid);
    expect(c.hero.hp).toBe(hp + 7);
  });

  it('Unlimited PTO heals over time but stuns you meanwhile', () => {
    const { c, uid } = ready('unlimitedPto');
    c.hero.hp = 40;
    c.playCard(uid);
    expect(c.has('hero', 'stun')).toBe(true);
    expect(c.playCard(c.belt[0].card.uid)).toBe(false);
    run(c, 10);
    // Regeneration n heals n, n-1, … 1.
    const n = CARDS.unlimitedPto.vals[0];
    expect(c.hero.hp).toBe(40 + (n * (n + 1)) / 2);
  });

  it('Hide the Pain gains more Block the more HP you are missing', () => {
    const { c, uid } = ready('hideThePain');
    c.hero.hp = c.hero.maxHp - 20;
    c.playCard(uid);
    expect(c.hero.block).toBe(5 + 5);
  });

  it('You Shall Not Pass reflects damage for 5s, 8s once upgraded', () => {
    const { c, uid } = ready('youShallNotPass');
    c.playCard(uid);
    expect(c.hero.statuses.parry.t).toBeCloseTo(5, 1);
    expect(c.cardVals({ uid: 0, id: 'youShallNotPass', up: true })[2]).toBe(8);
  });

  it('Turn It Off stuns you for 3s and shuffles Turn It On into the deck, which gives 4 mana', () => {
    const { c, uid } = ready('turnItOff');
    c.playCard(uid);
    expect(c.has('hero', 'stun')).toBe(true);
    expect(c.hero.statuses.stun.t).toBeCloseTo(3, 1);
    const on = c.draw.find((x) => x.id === 'turnItOn');
    expect(on).toBeTruthy();
    run(c, 3.1);
    c.hero.mana = 0;
    c.hero.maxMana = 10;
    c.addTempCard('turnItOn', 'belt');
    c.playCard(c.belt[c.belt.length - 1].card.uid);
    expect(c.hero.mana).toBe(4);
  });

  it('sudo lets cards through any rule, even a stun', () => {
    const { c, uid } = ready('sudo');
    c.playCard(uid);
    c.applyStatus('hero', 'stun', 1, 5);
    expect(c.ruleBlock(c.belt[0].card)).toBeNull();
    expect(c.playCard(c.belt[0].card.uid)).toBe(true);
  });
});

describe('cards that fill the classes out', () => {
  /** A fight where nothing happens by itself, the hero rich in mana. */
  const quiet = (over: Partial<CombatSetup> = {}): Combat => {
    const c = setup({ deck: deckOf(Array(6).fill('punch')), ...over });
    c.enemy.move = { id: 'wait', intent: 'defend', windup: 999 };
    run(c, CONFIG.introTime + 0.01);
    c.hero.mana = c.hero.maxMana = 10;
    return c;
  };
  /** Puts a card on the belt and plays it, free. */
  const cast = (c: Combat, id: string, up = false): void => {
    c.addTempCard(id, 'belt', up);
    expect(c.playCard(c.belt[c.belt.length - 1].card.uid, 'auto')).toBe(true);
  };

  it('Rivet Gun: Strength counts on every rivet', () => {
    const c = quiet();
    c.applyStatus('hero', 'strength', 2);
    const hp = c.enemy.hp;
    cast(c, 'releaseTheHounds');
    const [dmg, hits] = CARDS.releaseTheHounds.vals;
    expect(hp - c.enemy.hp).toBe((dmg + 2) * hits);
  });

  it('Barbed Wire: gives Block and Thorns, which hit back every enemy hit', () => {
    const c = quiet();
    cast(c, 'barbedWire');
    const [block, thorns] = CARDS.barbedWire.vals;
    expect(c.hero.block).toBe(block);
    expect(c.stacks('hero', 'thorns')).toBe(thorns);
    const hp = c.enemy.hp;
    c.damage('enemy', 'hero', 3, {}, 'enemy');
    c.damage('enemy', 'hero', 3, {}, 'enemy');
    expect(hp - c.enemy.hp).toBe(2 * thorns);
  });

  it('Blow Off Steam: all the Block goes, for damage times its value', () => {
    const c = quiet();
    c.gainBlock('hero', 10);
    const hp = c.enemy.hp;
    cast(c, 'blowOffSteam');
    expect(c.hero.block).toBe(0);
    expect(hp - c.enemy.hp).toBe(10 * CARDS.blowOffSteam.vals[0]);
  });

  it('Steel Toes: attacks give Block, other cards do not', () => {
    const c = quiet();
    cast(c, 'steelToes');
    const per = CARDS.steelToes.vals[0];
    expect(c.hero.block).toBe(0);
    cast(c, 'punch');
    expect(c.hero.block).toBe(per);
    cast(c, 'bobTheBuilder');
    expect(c.hero.block).toBe(per + CARDS.bobTheBuilder.vals[0]);
  });

  it('Safety Briefing multiplies Block, up to its cap', () => {
    const c = quiet();
    const [mul, cap] = CARDS.pyramidScheme.vals;
    c.gainBlock('hero', 10);
    cast(c, 'pyramidScheme');
    expect(c.hero.block).toBe(10 * mul);
    c.hero.block = 100;
    cast(c, 'pyramidScheme');
    expect(c.hero.block).toBe(100 + cap);
  });

  it('Good Vibes Only gives Thorns every time the hero loses HP', () => {
    const c = quiet();
    cast(c, 'goodVibesOnly');
    c.damage('enemy', 'hero', 5, { raw: true }, 'enemy');
    c.damage('enemy', 'hero', 5, { raw: true }, 'enemy');
    expect(c.stacks('hero', 'thorns')).toBe(2 * CARDS.goodVibesOnly.vals[0]);
  });

  it('Forklift Certified goes off once, the first time HP falls below half', () => {
    const c = quiet();
    cast(c, 'forkliftCertified');
    c.hero.mana = 0;
    c.hero.hp = c.hero.maxHp / 2 + 5;
    c.damage('enemy', 'hero', 4, { raw: true }, 'enemy');
    expect(c.hero.block).toBe(0);
    c.damage('enemy', 'hero', 4, { raw: true }, 'enemy');
    expect(c.hero.block).toBe(FORKLIFT_BLOCK);
    expect(c.stacks('hero', 'strength')).toBe(CARDS.forkliftCertified.vals[0]);
    expect(c.hero.mana).toBe(c.hero.maxMana);
    expect(c.has('hero', 'forkliftCertified')).toBe(false);
  });

  it('Forgotten Lunch poisons the enemy every few seconds', () => {
    const c = quiet();
    cast(c, 'forgottenLunch');
    run(c, LUNCH_EVERY - 0.5);
    expect(c.stacks('enemy', 'poison')).toBe(0);
    run(c, 0.6);
    expect(c.stacks('enemy', 'poison')).toBeGreaterThan(0);
  });

  it('Hot Desking turns Chill into Burn, and Cache Flush plays the sleeve for free', () => {
    const c = quiet();
    c.applyStatus('enemy', 'chill', 1, 6);
    cast(c, 'hotDesking');
    expect(c.has('enemy', 'chill')).toBe(false);
    expect(c.stacks('enemy', 'burn')).toBe(Math.ceil(6 / CARDS.hotDesking.vals[0]));

    c.addTempCard('bobTheBuilder', 'belt');
    expect(c.stash(c.belt[c.belt.length - 1].card.uid, 0)).toBe(true);
    c.hero.block = 0;
    const mana = c.hero.mana;
    c.addTempCard('crunchTime', 'belt');
    const crunch = c.belt[c.belt.length - 1].card;
    crunch.passed = true;
    expect(c.playCard(crunch.uid, 'auto')).toBe(true);
    expect(c.sleeve.every((x) => x === null)).toBe(true);
    expect(c.hero.block).toBe(CARDS.bobTheBuilder.vals[0]);
    expect(c.hero.mana).toBe(mana);
  });

  it('Quick Reboot gives mana and rushes the belt, Two-Factor Auth and Cloud Backup give Block', () => {
    const c = quiet();
    c.hero.mana = 0;
    cast(c, 'quickReboot');
    expect(c.hero.mana).toBe(CARDS.quickReboot.vals[0]);
    expect(c.has('hero', 'rush')).toBe(true);

    c.chargeMultitasking();
    c.chargeMultitasking();
    cast(c, 'twoFactorAuth');
    expect(c.hero.block).toBe(2 * CARDS.twoFactorAuth.vals[0]);

    c.hero.block = 0;
    cast(c, 'cloudBackup');
    const [base, per] = CARDS.cloudBackup.vals;
    expect(c.hero.block).toBe(base);
    c.addTempCard('punch', 'belt');
    expect(c.stash(c.belt[c.belt.length - 1].card.uid, 0)).toBe(true);
    c.hero.block = 0;
    cast(c, 'cloudBackup');
    expect(c.hero.block).toBe(base + per);
  });

  it('Jack of All Trades raises the cap of Multitasking charges, and playing it twice does not stack', () => {
    const c = quiet();
    for (let i = 0; i < 20; i++) c.chargeMultitasking();
    expect(c.stacks('hero', 'multitasking')).toBe(CONFIG.multitaskingMax);
    cast(c, 'jackOfAllTrades');
    cast(c, 'jackOfAllTrades');
    for (let i = 0; i < 20; i++) c.chargeMultitasking();
    expect(c.stacks('hero', 'multitasking')).toBe(CARDS.jackOfAllTrades.vals[0]);
  });
  it('Fire Exit gives Block when it leaves the belt unplayed, Lost Badge makes the next paid card free once', () => {
    const c = quiet();
    c.addTempCard('fireExit', 'belt');
    const exit = c.belt[c.belt.length - 1].card;
    c.hero.block = 0;
    c.belt[c.belt.length - 1].pos = EXPIRE_POS + 0.1;
    run(c, CONFIG.fallGrace + 0.1);
    expect(c.belt.some((b) => b.card.uid === exit.uid)).toBe(false);
    expect(c.hero.block).toBe(CARDS.fireExit.vals[1]);

    // Its attack twin hits instead.
    c.addTempCard('rageQuit', 'belt');
    const foe = c.enemy.hp + c.enemy.block;
    c.belt[c.belt.length - 1].pos = EXPIRE_POS + 0.1;
    run(c, CONFIG.fallGrace + 0.1);
    expect(c.enemy.hp + c.enemy.block).toBeLessThan(foe);

    c.hero.mana = 5;
    const hp = c.hero.hp;
    cast(c, 'lostBadge');
    expect(c.hero.hp).toBe(hp - CARDS.lostBadge.vals[0]);
    c.addTempCard('punch', 'belt');
    expect(c.playCard(c.belt[c.belt.length - 1].card.uid)).toBe(true);
    expect(c.hero.mana).toBe(5);
    expect(c.has('hero', 'lostBadge')).toBe(false);
    c.addTempCard('punch', 'belt');
    expect(c.playCard(c.belt[c.belt.length - 1].card.uid)).toBe(true);
    expect(c.hero.mana).toBeLessThan(5);
  });

  it('Dress Code shrinks with the belt, Skill Issue makes the enemy Vulnerable, Grudge Ledger chills when the hero is hurt', () => {
    const c = quiet();
    c.belt.length = 0;
    const [base, per] = CARDS.dressCode.vals;
    cast(c, 'dressCode');
    expect(c.hero.block).toBe(base);
    c.hero.block = 0;
    c.addTempCard('punch', 'belt');
    c.addTempCard('punch', 'belt');
    const onBelt = c.belt.length;
    cast(c, 'dressCode');
    expect(c.hero.block).toBe(Math.max(0, base - per * onBelt));

    cast(c, 'skillIssue');
    expect(c.has('enemy', 'vulnerable')).toBe(true);

    cast(c, 'grudgeLedger');
    expect(c.has('enemy', 'chill')).toBe(false);
    c.hero.block = 0;
    c.damage('enemy', 'hero', 5, { raw: true }, 'enemy');
    expect(c.has('enemy', 'chill')).toBe(true);
  });

  it('Sick Day gives Block and stuns the hero', () => {
    const c = quiet();
    cast(c, 'sickDay');
    expect(c.hero.block).toBe(CARDS.sickDay.vals[0]);
    expect(c.has('hero', 'stun')).toBe(true);
  });

  it('Inspector Gadget, Hold Music, Eye Roll and Bathroom Break pair a debuff with Block, damage or a dodge', () => {
    const c = quiet();
    cast(c, 'inspectorGadget');
    expect(c.hero.block).toBe(CARDS.inspectorGadget.vals[0]);
    expect(c.has('enemy', 'vulnerable')).toBe(true);
    cast(c, 'holdMusic');
    expect(c.has('enemy', 'weak')).toBe(true);
    c.removeStatus('enemy', 'weak');
    const hp = c.enemy.hp;
    cast(c, 'eyeRoll');
    expect(c.enemy.hp).toBeLessThan(hp);
    expect(c.has('enemy', 'weak')).toBe(true);
    cast(c, 'bathroomBreak');
    expect(c.has('hero', 'dodge')).toBe(true);
  });

  it('Fast Track rushes, Smoke Break burns and poisons, Sedative in the Coffee stuns the enemy and puts the hero to sleep', () => {
    const c = quiet();
    cast(c, 'fastTrack');
    expect(c.hero.block).toBe(CARDS.fastTrack.vals[0]);
    expect(c.has('hero', 'rush')).toBe(true);
    cast(c, 'smokeBreak');
    expect(c.stacks('enemy', 'burn')).toBe(CARDS.smokeBreak.vals[0]);
    expect(c.stacks('enemy', 'poison')).toBe(CARDS.smokeBreak.vals[1]);
    cast(c, 'sedativeInTheCoffee');
    expect(c.has('enemy', 'stun')).toBe(true);
    expect(c.has('hero', 'stun')).toBe(true);
    expect(c.stacks('enemy', 'poison')).toBeGreaterThan(CARDS.smokeBreak.vals[1]);
  });

  it('Spanish Inquisition hits harder on a vulnerable enemy, Paper Trail makes every attack leave the enemy vulnerable', () => {
    const c = quiet();
    let before = c.enemy.hp;
    cast(c, 'spanishInquisition');
    const plain = before - c.enemy.hp;
    c.applyStatus('enemy', 'vulnerable', 1, 5);
    before = c.enemy.hp;
    cast(c, 'spanishInquisition');
    expect(before - c.enemy.hp).toBeGreaterThan(plain * 1.5);

    const d = quiet();
    cast(d, 'paperTrail');
    expect(d.has('enemy', 'vulnerable')).toBe(false);
    cast(d, 'punch');
    expect(d.has('enemy', 'vulnerable')).toBe(true);
  });

  it('Overclocked turns Multitasking charges into Burn, Petty Cash into mana', () => {
    const c = quiet();
    c.chargeMultitasking();
    c.chargeMultitasking();
    c.chargeMultitasking();
    c.hero.mana = 0;
    cast(c, 'pettyCash');
    expect(c.hero.mana).toBeGreaterThanOrEqual(3 * CARDS.pettyCash.vals[1]);
    cast(c, 'overclocked');
    expect(c.stacks('enemy', 'burn')).toBe(3 * CARDS.overclocked.vals[0]);
    expect(c.stacks('hero', 'multitasking')).toBe(0);
  });

  it('Blue Collar Blues rushes the belt on every attack while it lasts', () => {
    const c = quiet();
    cast(c, 'blueCollarBlues');
    expect(c.has('hero', 'rush')).toBe(false);
    cast(c, 'punch');
    expect(c.has('hero', 'rush')).toBe(true);
    c.removeStatus('hero', 'rush');
    run(c, CARDS.blueCollarBlues.vals[0] + 1);
    cast(c, 'punch');
    expect(c.has('hero', 'rush')).toBe(false);
  });

  it('Leg Day adds Block per Strength, Pump Iron and Flesh Wound hit by what the hero has, Cactus on the Desk gives Block and Thorns', () => {
    const c = quiet();
    c.applyStatus('hero', 'strength', 2);
    cast(c, 'legDay');
    expect(c.hero.block).toBe(CARDS.legDay.vals[0] + 2 * CARDS.legDay.vals[1]);
    cast(c, 'cactusOnTheDesk');
    expect(c.stacks('hero', 'thorns')).toBe(CARDS.cactusOnTheDesk.vals[1]);

    const d = quiet();
    cast(d, 'pumpIron');
    expect(d.stacks('hero', 'strength')).toBe(CARDS.pumpIron.vals[1]);

    const e = quiet();
    e.hero.hp = e.hero.maxHp - 2 * CARDS.fleshWound.vals[1];
    const hp = e.enemy.hp;
    cast(e, 'fleshWound');
    expect(hp - e.enemy.hp).toBe(CARDS.fleshWound.vals[0] + 2);
  });

  it('Whistleblower doubles the Vulnerable time the enemy has left, Kick Him When He is Down needs a stunned enemy', () => {
    const c = quiet();
    cast(c, 'whistleblower');
    const first = c.fighter('enemy').statuses.vulnerable.t;
    expect(first).toBe(CARDS.whistleblower.vals[0]);
    cast(c, 'whistleblower');
    expect(c.fighter('enemy').statuses.vulnerable.t).toBe(2 * first);

    const d = quiet();
    let hp = d.enemy.hp;
    cast(d, 'kickHimWhenHesDown');
    const plain = hp - d.enemy.hp;
    d.applyStatus('enemy', 'stun', 1, 5);
    hp = d.enemy.hp;
    cast(d, 'kickHimWhenHesDown');
    expect(hp - d.enemy.hp).toBeGreaterThan(plain);
  });

  it('Spontaneous Combustion turns Poison into Burn, HR Mediation weakens first and then gives Block', () => {
    const c = quiet();
    c.applyStatus('enemy', 'poison', 9);
    cast(c, 'spontaneousCombustion');
    expect(c.has('enemy', 'poison')).toBe(false);
    expect(c.stacks('enemy', 'burn')).toBe(Math.ceil(9 / CARDS.spontaneousCombustion.vals[0]));

    const d = quiet();
    cast(d, 'hrMediation');
    expect(d.has('enemy', 'weak')).toBe(true);
    expect(d.hero.block).toBe(CARDS.hrMediation.vals[0] * CARDS.hrMediation.vals[1]);
  });

  it('Buy Now, Pay Later bills the enemy for a share of what it lost meanwhile, once the time is up', () => {
    const c = quiet();
    const [time, share] = CARDS.buyNowPayLater.vals;
    cast(c, 'buyNowPayLater');
    let hp = c.enemy.hp;
    cast(c, 'punch');
    const lost = hp - c.enemy.hp;
    hp = c.enemy.hp;
    run(c, time - 1);
    expect(c.enemy.hp).toBe(hp);
    run(c, 2);
    expect(hp - c.enemy.hp).toBe(Math.floor((lost * share) / 100));
  });

  it('Does It Spark Joy? makes every card cost the same for a while, but not an X card', () => {
    const c = quiet();
    const card = (id: string) => ({ uid: 999, id, up: false });
    cast(c, 'sparkJoy');
    const price = CARDS.sparkJoy.vals[1];
    expect(c.costOf(card('wallStreet'))).toBe(price);
    expect(c.costOf(card('staticShock'))).toBe(price);
    expect(c.costOf(card('declareBankruptcy'))).toBeLessThan(0);
    run(c, CARDS.sparkJoy.vals[0] + 1);
    expect(c.costOf(card('wallStreet'))).toBe(CARDS.wallStreet.cost);
  });

  it('Shredder gives Block for every card used up, but not for a power or a plain play', () => {
    const c = quiet();
    cast(c, 'shredder');
    expect(c.hero.block).toBe(0);
    cast(c, 'punch');
    expect(c.hero.block).toBe(0);
    cast(c, 'lunchBreak');
    expect(c.hero.block).toBe(CARDS.shredder.vals[0]);
    c.addTempCard('punch', 'belt');
    c.addTempCard('punch', 'belt');
    c.hero.block = 0;
    const n = c.exhaustBelt();
    expect(c.hero.block).toBe(n * CARDS.shredder.vals[0]);
  });

  it('Recycling Day brings exhausted cards back, Company Property hits and pockets a card from the discard pile', () => {
    const c = quiet();
    c.exhaust.push({ uid: 50, id: 'punch', up: false, bonus: 0, temp: false });
    cast(c, 'recyclingDay');
    expect(c.draw.some((x) => x.uid === 50)).toBe(true);
    expect(c.exhaust.some((x) => x.uid === 50)).toBe(false);

    const d = quiet();
    const hp = d.enemy.hp;
    cast(d, 'companyProperty');
    expect(d.enemy.hp).toBeLessThan(hp);
  });

  it('Lunch Break heals and stops the belt, Any% Speedrun pays for the Rush left, Fidget Spinner charges Multitasking', () => {
    const c = quiet();
    c.hero.hp = 40;
    cast(c, 'lunchBreak');
    expect(c.hero.hp).toBe(40 + CARDS.lunchBreak.vals[0]);
    expect(c.has('hero', 'stalled')).toBe(true);

    const d = quiet();
    d.rushBelt(4);
    const hp = d.enemy.hp;
    cast(d, 'speedrun');
    expect(hp - d.enemy.hp).toBe(CARDS.speedrun.vals[0] + 4 * CARDS.speedrun.vals[1]);

    const e = quiet();
    cast(e, 'fidgetSpinner');
    expect(e.stacks('hero', 'multitasking')).toBe(CARDS.fidgetSpinner.vals[0]);
  });

  it('Direct Deposit pays its Block a few seconds later, Company Retreat puts both sides to sleep and heals', () => {
    const c = quiet();
    const [now, later, wait] = CARDS.directDeposit.vals;
    cast(c, 'directDeposit');
    expect(c.hero.block).toBe(now);
    run(c, wait - 0.5);
    c.hero.block = 0;
    run(c, 1);
    expect(c.hero.block).toBeGreaterThanOrEqual(later - 1);
    c.hero.block = 0;
    cast(c, 'directDeposit');
    c.hero.block = 0;
    cast(c, 'directDeposit');
    expect(c.hero.block).toBe(now + later);

    const d = quiet();
    cast(d, 'companyRetreat');
    expect(d.has('enemy', 'stun')).toBe(true);
    expect(d.has('hero', 'stun')).toBe(true);
    expect(d.stacks('hero', 'regen')).toBe(CARDS.companyRetreat.vals[1]);
  });

  it("the heist cards loot other classes: crumpled, upgraded or cheaper by rarity, never the hero's own or neutral cards", () => {
    const c = setup({ hero: HEROES.rogue, deck: deckOf(Array(6).fill('borrowedStapler')) });
    c.enemy.move = { id: 'wait', intent: 'defend', windup: 999 };
    run(c, CONFIG.introTime + 0.01);
    c.hero.mana = c.hero.maxMana = 10;
    const before = c.draw.length;
    expect(c.loot('common', 3, { up: true, cheaper: 1, hex: 'crumple' })).toBe(3);
    const fresh = c.draw.filter((x) => x.temp && x.hex);
    expect(fresh).toHaveLength(3);
    expect(c.draw.length).toBe(before + 3);
    for (const card of fresh) {
      expect(card.up).toBe(true);
      expect(card.cut).toBe(1);
      expect(card.hex?.left).toBe(4);
      const def = CARDS[card.id];
      expect(def.rarity).toBe('common');
      expect(['warrior', 'mage', 'necromancer']).toContain(def.cls);
    }
    expect(c.loot('legendary', 2, { cheaper: 1, hex: 'crumple' })).toBe(2);
    const legends = c.draw.filter((x) => x.temp && CARDS[x.id].rarity === 'legendary');
    expect(legends).toHaveLength(2);
    expect(c.draw.length).toBe(before + 5);
  });

  it('a stolen Boris and Virulent Form still work for a hero who is not the Necromancer', () => {
    const c = quiet();
    cast(c, 'boris');
    cast(c, 'punch');
    expect(c.stacks('enemy', 'poison')).toBe(CARDS.boris.vals[0]);
    cast(c, 'classStruggle');
    expect(c.stacks('hero', 'virulence')).toBe(CARDS.classStruggle.vals[0]);
  });

  it('Matador stuns the enemy only when a hit is dodged, Ghost in the Machine stretches the Dodge with every card', () => {
    const c = quiet();
    cast(c, 'matador');
    expect(c.has('enemy', 'stun')).toBe(false);
    const hp = c.hero.hp;
    c.damage('enemy', 'hero', 10, { raw: true }, 'enemy');
    expect(c.hero.hp).toBe(hp);
    expect(c.has('enemy', 'stun')).toBe(true);
    expect(c.has('hero', 'matador')).toBe(false);

    const d = quiet();
    cast(d, 'ghostInTheMachine');
    const left = d.fighter('hero').statuses.dodge.t;
    cast(d, 'punch');
    expect(d.fighter('hero').statuses.dodge.t).toBeCloseTo(left + CARDS.ghostInTheMachine.vals[1]);
  });

  it("Cold Open chills on every attack, Forty Tabs Open charges Multitasking, Free Coffee pours mana, Workers' Comp blocks after a hurt", () => {
    const c = quiet();
    cast(c, 'coldOpen');
    expect(c.has('enemy', 'chill')).toBe(false);
    cast(c, 'punch');
    expect(c.has('enemy', 'chill')).toBe(true);

    cast(c, 'fortyTabs');
    expect(c.stacks('hero', 'multitasking')).toBe(0);
    run(c, TABS_EVERY + 0.1);
    expect(c.stacks('hero', 'multitasking')).toBe(1);

    cast(c, 'freeCoffee');
    c.hero.mana = 0;
    run(c, COFFEE_EVERY + 0.1);
    expect(c.hero.mana).toBeGreaterThanOrEqual(CARDS.freeCoffee.vals[0]);

    cast(c, 'workersComp');
    const hp = c.hero.hp;
    c.hero.block = 0;
    c.damage('enemy', 'hero', 5, {}, 'enemy');
    expect(c.hero.hp).toBe(hp - 5);
    expect(c.hero.block).toBe(CARDS.workersComp.vals[0]);
  });

  it('Overstock: Block for every mana spent', () => {
    const c = quiet();
    c.hero.mana = 4;
    cast(c, 'overstock');
    expect(c.hero.block).toBe(CARDS.overstock.vals[0] * 4);
  });

  it('Skeleton Crew hits and chills the enemy for a moment', () => {
    const c = quiet({ hero: HEROES.necromancer });
    const [dmg, chill] = CARDS.skeletonCrew.vals;
    cast(c, 'skeletonCrew');
    expect(c.enemy.maxHp - c.enemy.hp).toBe(dmg);
    expect(c.fighter('enemy').statuses.chill.t).toBeCloseTo(chill);
  });

  it('Thermal Shock: only a Chilled and Burning enemy takes the big hit, and the Chill is spent', () => {
    const c = quiet({ hero: HEROES.mage });
    const [small, big] = CARDS.thermalShock.vals;
    c.applyStatus('enemy', 'chill', 1, 20);
    let hp = c.enemy.hp;
    cast(c, 'thermalShock');
    expect(hp - c.enemy.hp).toBeLessThan(big);
    expect(c.has('enemy', 'chill')).toBe(true);
    c.applyStatus('enemy', 'burn', 1);
    hp = c.enemy.hp;
    cast(c, 'thermalShock');
    expect(hp - c.enemy.hp).toBeGreaterThanOrEqual(big);
    expect(hp - c.enemy.hp).toBeGreaterThan(small + 10);
    expect(c.has('enemy', 'chill')).toBe(false);
  });

  it('Cheap Shot hits harder on a Weak enemy, Hazmat Suit turns Poison into Block, Healthcare Plan regenerates', () => {
    const c = quiet({ hero: HEROES.necromancer });
    delete c.enemy.statuses.poison;
    let hp = c.enemy.hp;
    cast(c, 'rugPull');
    expect(hp - c.enemy.hp).toBe(CARDS.rugPull.vals[0]);
    c.applyStatus('enemy', 'weak', 1, 20);
    hp = c.enemy.hp;
    cast(c, 'rugPull');
    expect(hp - c.enemy.hp).toBe(CARDS.rugPull.vals[1]);
    c.applyStatus('enemy', 'poison', 9);
    cast(c, 'hazmatSuit');
    expect(c.hero.block).toBe(9);
    cast(c, 'healthcarePlan');
    expect(c.stacks('hero', 'regen')).toBe(CARDS.healthcarePlan.vals[0]);
  });

  it('an upgraded Step 1 brings an upgraded Step 2, and so on up the stairs', () => {
    const c = quiet();
    cast(c, 'step1', true);
    const next = c.draw.find((x) => x.id === 'step2');
    expect(next?.up).toBe(true);
    cast(c, 'step1');
    expect(c.draw.filter((x) => x.id === 'step2').some((x) => !x.up)).toBe(true);
  });

  it('Petri Dish: every attack played while it waits in the sleeve grows its Poison, spent when played', () => {
    const c = quiet({ hero: HEROES.necromancer });
    delete c.enemy.statuses.poison;
    c.addTempCard('petriDish', 'belt');
    c.stash(c.belt[c.belt.length - 1].card.uid, 0);
    const [base, grow] = CARDS.petriDish.vals;
    cast(c, 'skeletonCrew');
    cast(c, 'skeletonCrew');
    const dish = c.sleeve[0]!;
    expect(c.cardVals(dish)[0]).toBe(base + 2 * grow);
    c.playCard(dish.uid);
    expect(c.stacks('enemy', 'poison')).toBe(base + 2 * grow);
    expect(dish.bonus).toBe(0);
  });

  it('Rehire: brings exhausted cards back to the draw pile, never consumed ones', () => {
    const c = quiet({ hero: HEROES.necromancer });
    const exhausted = (id: string, uid: number): void => void c.exhaust.push({ uid, id, up: false, bonus: 0, temp: false });
    exhausted('coffee', 901);
    exhausted('walkout', 902);
    exhausted('firstAidKit', 903);
    c.consumed.push(903);
    cast(c, 'sisyphus');
    // What stays exhausted: the consumed potion and Rehire itself.
    expect(c.exhaust.map((x) => x.uid).sort()).toEqual([-1, 903]);
    expect(c.draw.map((x) => x.uid)).toEqual(expect.arrayContaining([901, 902]));
  });
});

describe('Necromancer: the exhaust pile', () => {
  const quiet = (): Combat => {
    const c = setup({ hero: HEROES.necromancer, deck: deckOf(Array(6).fill('skeletonCrew')) });
    c.enemy.move = { id: 'wait', intent: 'defend', windup: 999 };
    c.enemy.hp = c.enemy.maxHp = 999;
    run(c, CONFIG.introTime + 0.01);
    c.hero.mana = c.hero.maxMana = 10;
    c.enemy.block = 0;
    c.enemy.statuses = {};
    return c;
  };
  const cast = (c: Combat, id: string, up = false): void => {
    c.addTempCard(id, 'belt', up);
    expect(c.playCard(c.belt[c.belt.length - 1].card.uid, 'auto')).toBe(true);
  };
  const exhausted = (c: Combat, id: string, uid: number): void => void c.exhaust.push({ uid, id, up: false, bonus: 0, temp: false });

  it('Open Casket poisons the enemy for every card used up, falls of fleeting cards included', () => {
    const c = quiet();
    cast(c, 'openCasket');
    expect(c.stacks('enemy', 'poison')).toBe(0);
    cast(c, 'coffee');
    expect(c.stacks('enemy', 'poison')).toBe(CARDS.openCasket.vals[0]);
    c.addTempCard('loompa', 'belt');
    c.dropBelt();
    expect(c.exhaust.some((x) => x.id === 'loompa')).toBe(true);
    expect(c.stacks('enemy', 'poison')).toBe(2 * CARDS.openCasket.vals[0]);
  });

  it('Exhumation plays an exhausted card for free and it is exhausted again, never a power or a consumed card', () => {
    const c = quiet();
    exhausted(c, 'punch', 901);
    exhausted(c, 'picketDrums', 902);
    exhausted(c, 'molotov', 903);
    c.consumed.push(903);
    c.hero.mana = 5;
    const hp = c.enemy.hp;
    cast(c, 'exhumation');
    expect(hp - c.enemy.hp).toBe(CARDS.punch.vals[0]);
    expect(c.hero.mana).toBe(5);
    expect(c.exhaust.map((x) => x.uid)).toEqual(expect.arrayContaining([901, 902, 903]));
    expect(c.discard.some((x) => x.uid === 901)).toBe(false);
    // Nothing left to dig up: it does nothing.
    c.exhaust.splice(
      c.exhaust.findIndex((x) => x.uid === 901),
      1,
    );
    expect(c.exhume()).toBeNull();
  });

  it('Mass Grave deals damage for every card in the exhaust pile', () => {
    const c = quiet();
    for (let i = 0; i < 4; i++) exhausted(c, 'punch', 910 + i);
    const hp = c.enemy.hp;
    const before = c.exhaust.length;
    cast(c, 'massGrave');
    expect(hp - c.enemy.hp).toBe(before * CARDS.massGrave.vals[0]);
  });

  it('Sign Here gives mana and Block and shuffles a common curse into the draw pile', () => {
    const c = quiet();
    c.hero.mana = 2;
    const drawn = c.draw.length;
    cast(c, 'signHere');
    expect(c.hero.mana).toBe(2 + CARDS.signHere.vals[0]);
    expect(c.hero.block).toBe(CARDS.signHere.vals[1]);
    const added = c.draw.filter((x) => CARDS[x.id].type === 'curse');
    expect(c.draw.length).toBe(drawn + 1);
    expect(added).toHaveLength(1);
    expect(CARDS[added[0].id].rarity).toBe('common');
  });
});

describe('Complaint Box', () => {
  it('grows by 1 for every second of overflowing mana, even in the draw pile', () => {
    const c = setup({ deck: deckOf(['punch', 'punch', 'complaintBox']) });
    run(c, CONFIG.introTime + 0.01);
    c.hero.mana = c.abilityCost();
    run(c, 3.05);
    const box = [...c.draw, ...c.discard, ...c.belt.map((b) => b.card)].find((x) => x.id === 'complaintBox')!;
    expect(c.cardVals(box)[0]).toBeGreaterThanOrEqual(1 + 3);
  });
});

describe("Eight Hours, Krusty Krab, It's-a Me, Tip Jar, Raise Denied, CC the Boss, Meal Voucher, Oompa Loompa", () => {
  /** A fight with a quiet enemy, lots of HP and mana, and a fresh sleeve: cards are put in slot 0 and played from there. */
  const quiet = (over: Partial<CombatSetup> = {}): Combat => {
    const c = setup({ hp: 80, maxHp: 80, deck: deckOf(Array(6).fill('punch')), ...over });
    c.enemy.move = { id: 'wait', intent: 'defend', windup: 999 };
    c.enemy.hp = c.enemy.maxHp = 999;
    run(c, CONFIG.introTime + 0.01);
    c.hero.maxMana = c.hero.mana = 10;
    return c;
  };
  let tempId = 0;
  const give = (c: Combat, id: string, up = false): number => {
    const card = { uid: 9000 + ++tempId, id, up, bonus: 0, temp: true };
    c.sleeve[0] = card;
    return card.uid;
  };
  const play = (c: Combat, id: string, up = false): boolean => c.playCard(give(c, id, up));

  it('Eight Hours plays every 8th card twice, and its chip counts them', () => {
    const c = quiet();
    expect(play(c, 'eightHours')).toBe(true);
    expect(c.stacks('hero', 'eightHours')).toBe(CARDS.eightHours.vals[0]);
    const damage = (): number => c.enemy.maxHp - c.enemy.hp;
    for (let i = 0; i < 7; i++) {
      c.hero.mana = c.hero.maxMana;
      play(c, 'redStapler');
    }
    expect(damage()).toBe(7 * CARDS.redStapler.vals[0]);
    expect(STATUSES.eightHours.progress?.(c, 'hero', c.hero.statuses.eightHours)).toBeCloseTo(7 / 8);
    expect(STATUSES.eightHours.imminent?.(c.hero.statuses.eightHours)).toBe(true);
    c.hero.mana = c.hero.maxMana;
    play(c, 'redStapler');
    expect(damage()).toBe(9 * CARDS.redStapler.vals[0]);
    // The count starts over, and the upgrade shortens the shift.
    expect(c.hero.statuses.eightHours.e).toBe(0);
    play(c, 'eightHours', true);
    expect(c.stacks('hero', 'eightHours')).toBe(CARDS.eightHours.upVals![0]);
  });

  it('Krusty Krab leaves a fleeting copy of the next card in the draw pile, once', () => {
    const c = quiet();
    play(c, 'krustyKrab');
    expect(c.stacks('hero', 'krustyKrab')).toBe(1);
    const before = c.draw.length;
    play(c, 'punch', true);
    expect(c.has('hero', 'krustyKrab')).toBe(false);
    expect(c.draw).toHaveLength(before + 1);
    const copy = c.draw.find((x) => x.temp && x.id === 'punch')!;
    expect(copy.up).toBe(true);
    expect(c.keywords(copy)).toContain('fleeting');
    play(c, 'punch');
    expect(c.draw).toHaveLength(before + 1);
  });

  it("It's-a Me! raises max HP and HP for the fight, and is fleeting", () => {
    const c = quiet();
    c.hero.hp = 50;
    play(c, 'itsAMe');
    expect(c.hero.maxHp).toBe(80 + CARDS.itsAMe.vals[0]);
    expect(c.hero.hp).toBe(50 + CARDS.itsAMe.vals[0]);
    expect(CARDS.itsAMe.keywords).toContain('fleeting');
  });

  it('Tip Jar saves the mana that goes to waste, and is emptied when played', () => {
    const c = quiet();
    const uid = give(c, 'tipJar');
    run(c, 3.1);
    const jar = c.sleeve[0]!;
    expect(jar.bonus).toBe(3);
    c.hero.mana = 0;
    expect(c.playCard(uid)).toBe(true);
    expect(c.hero.mana).toBe(CARDS.tipJar.vals[0] + 3);
    expect(jar.bonus).toBe(0);
  });

  it('Raise Denied strips Block and buffs (not traits) first, then hits for each', () => {
    const c = quiet();
    c.enemy.block = 20;
    c.applyStatus('enemy', 'strength', 2);
    c.applyStatus('enemy', 'lightSleeper', 1);
    c.applyStatus('enemy', 'weak', 1, 5);
    const [base, each] = CARDS.raiseDenied.vals;
    play(c, 'raiseDenied');
    expect(c.enemy.block).toBe(0);
    expect(c.has('enemy', 'strength')).toBe(false);
    expect(c.has('enemy', 'lightSleeper')).toBe(true);
    expect(c.has('enemy', 'weak')).toBe(true);
    expect(c.enemy.maxHp - c.enemy.hp).toBe(base + each * 2);
  });

  it("CC the Boss hands the hero's debuffs to the enemy, and keeps what only hurts the belt", () => {
    const c = quiet();
    c.applyStatus('hero', 'poison', 3);
    c.applyStatus('hero', 'weak', 1, 5);
    c.applyStatus('hero', 'hurry', 1, 5);
    c.applyStatus('hero', 'strength', 2);
    play(c, 'ccTheBoss');
    expect(c.has('hero', 'poison')).toBe(false);
    expect(c.has('hero', 'weak')).toBe(false);
    expect(c.stacks('enemy', 'poison')).toBe(3);
    expect(c.enemy.statuses.weak.t).toBeCloseTo(5, 0);
    expect(c.has('hero', 'hurry')).toBe(true);
    expect(c.stacks('hero', 'strength')).toBe(2);
  });

  it('Meal Voucher removes every curse from the belt, the sleeve and both piles, and hits for each', () => {
    const c = quiet({ deck: deckOf(['punch', 'punch', 'drama']) });
    c.addTempCard('tpsReport', 'belt');
    c.addTempCard('drama', 'draw');
    c.addTempCard('drama', 'discard');
    c.sleeve[1] = { uid: 9990, id: 'writeUp', up: false, bonus: 0, temp: true };
    const every = [...c.belt.map((b) => b.card), ...c.draw, ...c.discard, ...c.sleeve].filter((x) => x && CARDS[x.id].type === 'curse');
    const deckCurse = every.find((x) => !x!.temp)!;
    expect(every.length).toBeGreaterThanOrEqual(5);
    play(c, 'mealVoucher');
    const left = [...c.belt.map((b) => b.card), ...c.draw, ...c.discard, ...c.sleeve].filter((x) => x && CARDS[x.id].type === 'curse');
    expect(left).toHaveLength(0);
    expect(c.enemy.maxHp - c.enemy.hp).toBe(CARDS.mealVoucher.vals[0] * every.length);
    // The one that belonged to the run's deck is gone from it for good.
    expect(c.consumed).toContain(deckCurse.uid);
  });

  it('Oompa Loompa shuffles Loompas into the deck; one that slips off the belt heals and is gone', () => {
    const c = quiet();
    const before = c.draw.length;
    play(c, 'oompaLoompa', true);
    const loompas = c.draw.filter((x) => x.id === 'loompa');
    expect(loompas).toHaveLength(CARDS.oompaLoompa.vals[0]);
    expect(loompas.every((x) => x.up)).toBe(true);
    expect(c.draw.length).toBe(before + loompas.length);
    c.hero.hp = 50;
    c.addTempCard('loompa', 'belt', true);
    const lost = c.belt[c.belt.length - 1].card;
    run(c, (CONFIG.beltTime * EXPIRE_POS) / c.beltRate() + 0.5);
    expect(c.hero.hp).toBe(50 + CARDS.loompa.upVals![1]);
    expect(c.exhaust.some((x) => x.uid === lost.uid)).toBe(true);
  });
});

describe('Rise and Grind, Seniority, Tenure, Life Insurance, Nervous Breakdown', () => {
  const quiet = (over: Partial<CombatSetup> = {}): Combat => {
    const c = setup({ deck: deckOf(Array(8).fill('punch')), ...over });
    c.enemy.move = { id: 'wait', intent: 'defend', windup: 999 };
    c.enemy.hp = c.enemy.maxHp = 500;
    run(c, CONFIG.introTime + 0.01);
    c.hero.mana = c.hero.maxMana = 10;
    c.belt.length = 0;
    return c;
  };
  const lethal = (c: Combat): void => void c.damage('enemy', 'hero', 999, { raw: true }, 'enemy');

  it('Rise and Grind stays on the belt: every tap costs HP and gives Strength', () => {
    const c = quiet();
    c.addTempCard('riseAndGrind', 'belt');
    const uid = c.belt[0].card.uid;
    const [hp, str] = CARDS.riseAndGrind.vals;
    expect(c.playCard(uid, 'auto')).toBe(true);
    expect(c.playCard(uid, 'auto')).toBe(true);
    expect(c.belt.some((b) => b.card.uid === uid)).toBe(true);
    expect(c.hero.hp).toBe(80 - 2 * hp);
    expect(c.stacks('hero', 'strength')).toBe(2 * str);
  });

  it('Nervous Breakdown spends every Multitasking charge in one blow, then the hero falls asleep', () => {
    const c = quiet();
    for (let i = 0; i < 3; i++) c.chargeMultitasking();
    const hp = c.enemy.hp;
    c.addTempCard('nervousBreakdown', 'belt');
    expect(c.playCard(c.belt[0].card.uid, 'auto')).toBe(true);
    const [dmg, sleep] = CARDS.nervousBreakdown.vals;
    expect(hp - c.enemy.hp).toBe(3 * dmg);
    expect(c.stacks('hero', 'multitasking')).toBe(0);
    expect(c.has('hero', 'stun')).toBe(true);
    expect(c.hero.statuses.stun.t).toBeCloseTo(sleep);
  });

  it('Seniority and Tenure grow with every play, in every fight of the run, up to their cap', () => {
    for (const id of ['seniority', 'tenure']) {
      const [base, step, cap] = CARDS[id].vals;
      const copy = (tenure: number): CardInst => ({ uid: 1, id, up: false, tenure });
      expect(cardValsOf(copy(0))[0]).toBe(base);
      expect(cardValsOf(copy(3))[0]).toBe(base + 3 * step);
      expect(cardValsOf(copy(99))[0]).toBe(cap);
    }
    const r = newRun('warrior', 3);
    r.deck = Array.from({ length: 6 }, (_, i) => ({ uid: 900 + i, id: 'seniority', up: false }));
    const c = new Combat({ ...combatSetup(r), hp: 80, maxHp: 80 });
    c.enemy.move = { id: 'wait', intent: 'defend', windup: 999 };
    c.enemy.block = 0;
    run(c, CONFIG.introTime + 0.01);
    c.hero.mana = c.hero.maxMana = 10;
    const card = c.belt.find((b) => b.card.id === 'seniority' && !b.card.hex)?.card;
    expect(card).toBeDefined();
    const hp = c.enemy.hp;
    c.playCard(card?.uid ?? 0, 'auto');
    expect(hp - c.enemy.hp).toBe(CARDS.seniority.vals[0]);
    applyCombat(r, c);
    const played = r.deck.find((x) => x.uid === card?.uid);
    expect(played?.tenure).toBe(1);
    // The next fight starts from where it left off.
    expect(cardValsOf(played as CardInst)[0]).toBe(CARDS.seniority.vals[0] + CARDS.seniority.vals[1]);
  });

  it('Life Insurance pays out the first lethal hit once; the second one is final', () => {
    const c = quiet({ hero: HEROES.necromancer, hp: 50, maxHp: 50 });
    c.addTempCard('lifeInsurance', 'belt');
    expect(c.playCard(c.belt[0].card.uid, 'auto')).toBe(true);
    const [heal, slots] = CARDS.lifeInsurance.vals;
    expect(c.stacks('hero', 'lifeInsurance')).toBe(heal);
    lethal(c);
    expect(c.result).toBeNull();
    expect(c.hero.hp).toBe(heal);
    expect(c.has('hero', 'lifeInsurance')).toBe(false);
    expect(c.sleeveLost).toBe(slots);
    // A card the fight made up has no deck copy to lose.
    expect(c.consumed).toEqual([]);
    lethal(c);
    expect(c.result).toBe('lose');
  });

  it('Life Insurance tears its own card out of the deck, and the sleeve stays smaller for the next fights', () => {
    const r = newRun('necromancer', 5);
    r.deck = Array.from({ length: 6 }, (_, i) => ({ uid: 901 + i, id: 'lifeInsurance', up: false }));
    const first = new Combat({ ...combatSetup(r), hp: 50, maxHp: 50 });
    first.enemy.move = { id: 'wait', intent: 'defend', windup: 999 };
    first.enemy.hp = first.enemy.maxHp = 500;
    const slots = first.sleeve.length;
    run(first, CONFIG.introTime + 0.01);
    first.hero.mana = first.hero.maxMana = 10;
    const policy = first.belt.find((b) => b.card.id === 'lifeInsurance' && !b.card.hex)?.card;
    expect(policy).toBeDefined();
    expect(first.playCard(policy?.uid ?? 0, 'auto')).toBe(true);
    lethal(first);
    expect(first.consumed).toEqual([policy?.uid]);
    applyCombat(r, first);
    expect(r.deck).toHaveLength(5);
    expect(r.deck.some((c) => c.uid === policy?.uid)).toBe(false);
    expect(r.sleeveLost).toBe(CARDS.lifeInsurance.vals[1]);
    expect(new Combat(combatSetup(r)).sleeve.length).toBe(slots - CARDS.lifeInsurance.vals[1]);
  });

  it('a hero with a single slot never loses it', () => {
    const r = newRun('warrior', 5);
    const c = new Combat(combatSetup(r));
    c.loseSleeveSlots(3);
    applyCombat(r, c);
    expect(r.sleeveLost).toBe(0);
    expect(new Combat(combatSetup(r)).sleeve.length).toBe(HEROES.warrior.sleeve);
  });
});
