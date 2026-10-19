import { describe, expect, it } from 'vitest';
import { CONFIG } from '../../src/data/config';
import { ENEMIES, HALF } from '../../src/data/enemies';
import { BLOW_EVERY, PANEL_EVERY, PLATE_HEAL, POSE_EVERY, POSE_TIME, STATUSES } from '../../src/data/statuses';
import { CARDS } from '../../src/data/cards';
import { run, setup } from './helpers';

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
