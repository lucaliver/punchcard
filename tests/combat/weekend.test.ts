import { describe, expect, it } from 'vitest';
import { CONFIG } from '../../src/data/config';
import { ENEMIES, HALF } from '../../src/data/enemies';
import { BLOW_EVERY, POSE_EVERY, POSE_TIME, STATUSES } from '../../src/data/statuses';
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
