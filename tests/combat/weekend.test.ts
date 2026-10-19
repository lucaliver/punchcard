import { describe, expect, it } from 'vitest';
import { CONFIG } from '../../src/data/config';
import { ENEMIES, ENEMY_LIST, HALF, MONDAY_BLOCK } from '../../src/data/enemies';
import { BLOW_EVERY, PANEL_EVERY, PLATE_HEAL, POSE_EVERY, POSE_TIME, STATUSES } from '../../src/data/statuses';
import { CARDS } from '../../src/data/cards';
import { STAGE_IDS, stageArt } from '../../src/ui/art/stageArt';
import { RELIC_LIST, RELICS, REMOTE_STUN } from '../../src/data/relics';
import { canGiftRelic, giftRelic, newRun, rollRelics } from '../../src/game/run';
import { coffeeOf, badgeOf, run, setup } from './helpers';

/** The weekend (act 4): its enemies and what each one does. A fight with the enemy's own moves out of the way (its attack never lands), to look at its passives alone. */
const alone = (id: string) => setup({ enemy: { ...ENEMIES[id], main: { ...ENEMIES[id].main, windup: 9999 }, specials: [], every: 0 } });

describe('the weekend: normal enemies', () => {
  it('the Brunch Influencer strikes a pose every few seconds, and a pose takes no damage', () => {
    const c = alone('brunchInfluencer');
    run(c, CONFIG.introTime + POSE_EVERY - 1);
    expect(c.has('enemy', 'dodge')).toBe(false);
    run(c, 1.5);
    expect(c.has('enemy', 'dodge')).toBe(true);
    const hp = c.enemy.hp;
    c.hit(20);
    expect(c.enemy.hp).toBe(hp);
    run(c, POSE_TIME + 0.5);
    expect(c.has('enemy', 'dodge')).toBe(false);
  });

  it('the Leaf Blower Neighbour blows the belt back the other way every so often', () => {
    const c = alone('leafBlowerNeighbour');
    const turns: string[] = [];
    c.events.on((e) => void (e.type === 'beltReversed' ? turns.push(e.type) : null));
    run(c, CONFIG.introTime + BLOW_EVERY - 1);
    expect(turns).toHaveLength(0);
    run(c, 1 + CONFIG.beltTurnPause + 0.5);
    expect(turns).toHaveLength(1);
    run(c, BLOW_EVERY);
    expect(turns).toHaveLength(2);
  });

  it("the Gym Bro's skin shrugs off the small hits", () => {
    const c = alone('gymBro');
    run(c, CONFIG.introTime);
    c.enemy.block = 0;
    const cut = c.stacks('enemy', 'swole');
    expect(STATUSES.swole.cutsHits).toBe(true);
    const hp = c.enemy.hp;
    c.hit(cut + 4);
    expect(hp - c.enemy.hp).toBe(4);
  });

  it("the Couch's Block does not fade", () => {
    const c = alone('theCouch');
    const block = c.enemy.block;
    run(c, CONFIG.introTime + 30);
    expect(c.enemy.block).toBe(block);
  });

  it('the Dog is stunned by the squirrel at half HP, and never attacks while it is', () => {
    const c = setup({ enemy: { ...ENEMIES.offLeashDog, block: 0 } });
    run(c, CONFIG.introTime);
    expect(c.has('enemy', 'haste')).toBe(true);
    c.enemy.hp = Math.floor(c.enemy.maxHp / 2) + 1;
    c.hit(10);
    run(c, 0.1);
    expect(c.has('enemy', 'stun')).toBe(true);
    run(c, HALF.squirrelStun + 0.5);
    expect(c.has('enemy', 'stun')).toBe(false);
  });
});

describe('the weekend: the other normal enemy and the elites', () => {
  it('the Flat-Pack Wardrobe adds a panel of Block every few seconds', () => {
    const c = alone('flatPackWardrobe');
    const block = c.enemy.block;
    run(c, CONFIG.introTime + PANEL_EVERY + 0.5);
    expect(c.enemy.block).toBeGreaterThan(block);
    expect(c.stacks('enemy', 'flatPack')).toBe(10);
  });

  it('the Mother-in-Law heals for every card that slips off the belt, and only then (and only hers)', () => {
    const c = alone('motherInLaw');
    run(c, CONFIG.introTime);
    c.enemy.hp -= 40;
    const hp = c.enemy.hp;
    STATUSES.cleanPlate.onExpire?.(c, 'enemy', { v: 1, t: 0 });
    expect(c.enemy.hp).toBe(hp + PLATE_HEAL);
    const before = c.enemy.hp;
    STATUSES.cleanPlate.onExpire?.(c, 'hero', { v: 1, t: 0 });
    expect(c.enemy.hp).toBe(before);
  });

  it('a card that slips off the belt feeds the Mother-in-Law', () => {
    const c = setup({ enemy: { ...ENEMIES.motherInLaw, main: { ...ENEMIES.motherInLaw.main, windup: 9999 }, specials: [], every: 0 } });
    c.enemy.maxHp = c.enemy.hp = 500;
    c.enemy.hp -= 100;
    const hp = c.enemy.hp;
    run(c, CONFIG.introTime + 60);
    expect(c.enemy.hp).toBeGreaterThan(hp);
  });

  it('the Leftovers curse weakens you when it slips off the belt; Spare Parts and the Press Conference only clog it', () => {
    const c = alone('motherInLaw');
    CARDS.leftovers.onExpire?.(c, [8], { uid: 1, id: 'leftovers', up: false, bonus: 0, temp: true });
    expect(c.has('hero', 'weak')).toBe(true);
    expect(CARDS.spareParts.keywords).toContain('bulky');
    expect(CARDS.pressConference.keywords).toEqual(['unplayable', 'fleeting']);
  });

  it('every weekend elite starts armoured, and the half-HP moves do what their texts say', () => {
    for (const id of ['motherInLaw', 'ribbonMayor', 'weddingDj']) expect(ENEMIES[id].tier).toBe('elite');
    const mother = setup({
      enemy: { ...ENEMIES.motherInLaw, block: 0, main: { ...ENEMIES.motherInLaw.main, windup: 9999 }, specials: [], every: 0 },
    });
    mother.enemy.hp = Math.floor(mother.enemy.maxHp / 2) + 1;
    run(mother, CONFIG.introTime);
    mother.hit(10);
    run(mother, 0.1);
    expect(mother.enemy.block).toBeGreaterThanOrEqual(HALF.motherBlock - 5);
    expect(mother.stacks('enemy', 'strength')).toBe(HALF.motherStrength);
    const dj = setup({ enemy: { ...ENEMIES.weddingDj, block: 0, main: { ...ENEMIES.weddingDj.main, windup: 9999 }, specials: [], every: 0 } });
    dj.enemy.hp = Math.floor(dj.enemy.maxHp / 2) + 1;
    run(dj, CONFIG.introTime);
    dj.hit(10);
    run(dj, 0.1);
    expect(dj.has('hero', 'hurry')).toBe(true);
  });
});

describe('Monday, the weekend boss', () => {
  const idle = { id: 'wait', intent: 'idle', windup: 9999 } as const;
  const monday = ENEMIES.monday;
  const quiet = () =>
    setup({ enemy: { ...monday, main: idle, specials: [], phases: monday.phases!.map((p) => ({ ...p, main: idle, specials: [] })) } });
  const hit = (c: ReturnType<typeof quiet>, n: number): void => void c.damage('hero', 'enemy', n, { raw: true }, 'hero');

  it('is the weekend boss: three phases of one alarm clock, each with its sprite, its belt and its Block', () => {
    expect(monday.tier).toBe('boss');
    expect(monday.act).toBe(4);
    expect(monday.phases).toHaveLength(2);
    const c = quiet();
    run(c, CONFIG.introTime);
    expect(c.enemy.maxHp).toBe(monday.hp);
    const slow = c.beltRate();
    c.enemy.block = 0;
    hit(c, Math.ceil(c.enemy.maxHp / 3) + 1);
    expect(c.enemy.phase).toBe(1);
    expect(c.enemy.block).toBe(MONDAY_BLOCK);
    const fast = c.beltRate();
    expect(fast).toBeGreaterThan(slow);
    c.enemy.block = 0;
    hit(c, Math.ceil(c.enemy.maxHp / 3));
    expect(c.enemy.phase).toBe(2);
    expect(c.enemy.block).toBe(MONDAY_BLOCK);
    expect(c.beltRate()).toBeGreaterThan(fast);
  });

  it("brings back the earlier shifts' chores: the Boss's coffee in the second phase, the badge reader in the third", () => {
    const chore = (phase: number, task: 'coffee' | 'badge') => {
      const move = monday.phases![phase - 1].specials.find((m) => m.task === task)!;
      expect(move, `${task} in phase ${phase + 1}`).toBeTruthy();
      const c = setup({
        enemy: {
          ...monday,
          block: 0,
          main: idle,
          specials: [],
          phases: monday.phases!.map((p) => ({ ...p, main: idle, specials: [move], every: 1 })),
        },
      });
      run(c, CONFIG.introTime + 0.1);
      c.enemy.block = 0;
      c.damage('hero', 'enemy', c.enemy.maxHp * (phase === 1 ? 0.4 : 0.7), { raw: true }, 'hero');
      expect(c.enemy.phase).toBe(phase);
      c.enemy.move = move;
      c.enemy.timer = 0;
      run(c, 0.2);
      return c;
    };
    expect(coffeeOf(chore(1, 'coffee')).phase).toBe('code');
    expect(badgeOf(chore(2, 'badge')).phase).toBe('swipe');
  });

  it('shuffles the Sunday Scaries into the deck in the first phase, and they stop your belt when they slip off', () => {
    const scare = monday.specials.find((m) => m.curse?.some((x) => x.id === 'sundayScaries'))!;
    expect(scare.curse![0].n).toBe(2);
    const c = quiet();
    CARDS.sundayScaries.onExpire?.(c, [3], { uid: 1, id: 'sundayScaries', up: false, bonus: 0, temp: true });
    expect(c.has('hero', 'stalled')).toBe(true);
  });
});

describe('the weekend: where the jobs are met', () => {
  it('every place is drawn, differently, and every weekend job stands in one of them (the aisle when it names none)', () => {
    const scenes = STAGE_IDS.map((id) => stageArt(4, id));
    for (const scene of scenes) expect(scene).toContain('<rect');
    expect(new Set(scenes).size).toBe(STAGE_IDS.length);
    const weekend = ENEMY_LIST.filter((e) => e.act === 4);
    for (const e of weekend) if (e.stage) expect(STAGE_IDS, e.id).toContain(e.stage);
    // Most of them have a place of their own: a weekend is not spent in one supermarket.
    expect(new Set(weekend.map((e) => e.stage ?? 'aisle')).size).toBeGreaterThanOrEqual(8);
  });

  it('the boss is met in the bedroom, in the small hours', () => {
    expect(ENEMIES.monday.stage).toBe('bedroom');
  });
});

describe("the weekend's stationery", () => {
  const weekendIds = RELIC_LIST.filter((r) => r.weekend).map((r) => r.id);

  it('five of them, dealt only in the weekend (Lost & Found, gifts, prizes) and never before it', () => {
    expect(weekendIds).toHaveLength(5);
    for (let seed = 1; seed <= 15; seed++) {
      const early = newRun('warrior', seed);
      for (let i = 0; i < 60 && canGiftRelic(early); i++) giftRelic(early);
      for (const id of weekendIds) expect(early.relics, `${id}, seed ${seed}`).not.toContain(id);
    }
    const dealt = new Set<string>();
    for (let seed = 1; seed <= 40; seed++) {
      const r = newRun('warrior', seed, [], [], 4);
      r.current = r.nodes.find((n) => n.act === 4)!.id;
      for (const id of rollRelics(r, 40)) dealt.add(id);
    }
    for (const id of weekendIds) expect(dealt, id).toContain(id);
  });

  it('the Garden Gnome and the Reserved Sunbed open the fight with Thorns and with Block that does not fade', () => {
    const gnome = setup({ relics: ['gardenGnome'] });
    expect(gnome.stacks('hero', 'thorns')).toBe(RELICS.gardenGnome.n);
    const sunbed = setup({ relics: ['reservedSunbed'] });
    expect(sunbed.hero.block).toBe(RELICS.reservedSunbed.n);
    expect(sunbed.has('hero', 'fortified')).toBe(true);
  });

  it('the Doggy Bag heals after an elite or a boss, not after a plain job', () => {
    const fight = (id: string) => {
      const c = setup({ relics: ['doggyBag'], enemy: { ...ENEMIES[id], block: 0 }, hp: 40, maxHp: 80 });
      run(c, CONFIG.introTime);
      c.hit(9999);
      return c;
    };
    expect(fight('weddingDj').hero.hp).toBe(40 + Math.round((80 * RELICS.doggyBag.n) / 100));
    expect(fight('monday').hero.hp).toBe(40 + Math.round((80 * RELICS.doggyBag.n) / 100));
    expect(fight('theCouch').hero.hp).toBe(40);
  });

  it('the Remote Control presses pause once a fight when you drop under the line: the move is cancelled and the enemy stunned', () => {
    const c = setup({ relics: ['remoteControl'], hp: 80, maxHp: 80 });
    run(c, CONFIG.introTime + 0.5);
    expect(c.has('enemy', 'stun')).toBe(false);
    c.hero.hp = Math.floor(80 * (RELICS.remoteControl.n / 100)) - 1;
    run(c, 0.1);
    expect(c.has('enemy', 'stun')).toBe(true);
    expect(c.enemy.statuses.stun.t).toBeGreaterThan(REMOTE_STUN - 1);
    c.removeStatus('enemy', 'stun');
    c.hero.hp = 5;
    run(c, 0.2);
    expect(c.has('enemy', 'stun')).toBe(false);
  });

  it('the Lottery Ticket gives some of the mana back now and then, and never costs anything', () => {
    const c = setup({ relics: ['lotteryTicket'] });
    c.hero.maxMana = 10;
    let refunds = 0;
    c.events.on((e) => {
      if (e.type === 'relic' && e.id === 'lotteryTicket') refunds++;
    });
    const { card } = c.belt[0];
    for (let i = 0; i < 400; i++) RELICS.lotteryTicket.hooks?.onCardPlayed?.(c, { ...card, id: 'punch' }, CARDS.punch);
    expect(refunds).toBeGreaterThan(20);
    expect(refunds).toBeLessThan(90);
  });
});
