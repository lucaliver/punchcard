import { describe, expect, it } from 'vitest';
import { CONFIG } from '../src/data/config';
import { battle, hold, run, stage } from './helpers';

describe('oil and the hand', () => {
  it('regenerates oil and stops at the maximum', () => {
    const b = battle(['crane']);
    b.oil = 0;
    run(b, 2);
    expect(b.oil).toBeCloseTo(CONFIG.oil.regen * 2, 1);
    run(b, 60);
    expect(b.oil).toBe(b.maxOil);
  });

  it('refills the slot of a played card after a moment', () => {
    const b = battle(['crane', 'crane', 'crane', 'crane', 'crane', 'crane']);
    hold(b, 'crane', 0);
    expect(b.play(0, 2, 3)).toBe(true);
    expect(b.hand[0]).toBeNull();
    run(b, CONFIG.hand.drawDelay + 0.5);
    expect(b.hand[0]).not.toBeNull();
  });

  it('refuses a card it cannot pay for', () => {
    const b = battle(['kuzunoha']);
    hold(b, 'kuzunoha');
    b.oil = 1;
    expect(b.check(0, 2, 3)).toEqual({ ok: false, reason: 'oil' });
  });
});

describe('spirits', () => {
  it('sets a spirit on a free tile of the garden only', () => {
    const b = battle(['crane']);
    hold(b, 'crane');
    expect(b.check(0, 2, 0)).toEqual({ ok: false, reason: 'tile' });
    expect(b.check(0, 9, 3).ok).toBe(false);
    expect(b.play(0, 2, 3)).toBe(true);
    expect(b.unitAt(2, 3)?.cardId).toBe('crane');
  });

  it('merges a spirit onto its twin up to the maximum level', () => {
    const b = battle(['jizo']);
    for (let i = 0; i < CONFIG.maxLevel - 1; i++) {
      hold(b, 'jizo');
      expect(b.play(0, 1, 4)).toBe(true);
      if (i === 0) expect(b.unitAt(1, 4)?.level).toBe(1);
    }
    hold(b, 'jizo');
    expect(b.play(0, 1, 4)).toBe(true);
    expect(b.unitAt(1, 4)?.level).toBe(CONFIG.maxLevel);
    hold(b, 'jizo');
    expect(b.check(0, 1, 4)).toEqual({ ok: false, reason: 'merge' });
  });

  it('makes oil over time', () => {
    const b = battle(['kodama']);
    hold(b, 'kodama');
    b.play(0, 0, 6);
    b.oil = 0;
    run(b, 8.2);
    expect(b.oil).toBeGreaterThan(CONFIG.oil.regen * 8 + 0.9);
  });

  it('a shooter kills a foe walking down its lane', () => {
    const b = battle(['crane'], stage([{ t: 0.5, lane: 2, foe: 'karakasa' }]));
    hold(b, 'crane');
    b.play(0, 2, 5);
    run(b, 12);
    expect(b.stats.kills).toBe(1);
    expect(b.stats.leaks).toBe(0);
  });
});

describe('foes', () => {
  it('a foe that reaches the lantern costs flame', () => {
    const b = battle([], stage([{ t: 0.1, lane: 1, foe: 'karakasa' }]));
    run(b, 20);
    expect(b.flame).toBe(9);
    expect(b.stats.leaks).toBe(1);
  });

  it('a blocker stops a foe and takes its hits', () => {
    const b = battle(['jizo'], stage([{ t: 0.1, lane: 3, foe: 'kappa' }]));
    hold(b, 'jizo');
    b.play(0, 3, 3);
    run(b, 14);
    const jizo = b.unitAt(3, 3);
    expect(jizo).not.toBeNull();
    expect((jizo?.hp ?? 0) < (jizo?.maxHp ?? 0)).toBe(true);
    expect(b.flame).toBe(10);
  });

  it('a flier ignores blockers', () => {
    const b = battle(['jizo'], stage([{ t: 0.1, lane: 3, foe: 'karasu' }]));
    hold(b, 'jizo');
    b.play(0, 3, 3);
    run(b, 20);
    expect(b.stats.leaks).toBe(1);
  });

  it('armor takes a little off every hit', () => {
    const b = battle([], stage([{ t: 0.1, lane: 0, foe: 'kappa' }]));
    run(b, 0.3);
    const f = b.foes[0];
    const hp = f.hp;
    b.hurtFoe(f, 3, 'unit');
    expect(hp - f.hp).toBe(2);
  });

  it('a lost lantern ends the fight', () => {
    const b = battle([], stage(Array.from({ length: 12 }, (_, i) => ({ t: 0.1 + i * 0.2, lane: i % 5, foe: 'karakasa' }))));
    run(b, 30);
    expect(b.state).toBe('lost');
  });

  it('dawn comes and the fight is won with the lantern lit', () => {
    const b = battle([], stage([], { duration: 5 }));
    run(b, 7);
    expect(b.state).toBe('won');
  });

  it('a won fight ends early when the last foe falls', () => {
    const st = stage([{ t: 0.5, lane: 2, foe: 'zori' }], { duration: 90 });
    st.spawns.pop();
    const b = battle(['crane'], st);
    hold(b, 'crane');
    b.play(0, 2, 3);
    run(b, 20);
    expect(b.state).toBe('won');
    expect(b.time).toBeLessThan(40);
  });
});

describe('charms', () => {
  it('Ofuda stuns the lane', () => {
    const b = battle(['ofuda'], stage([{ t: 0.1, lane: 2, foe: 'karakasa' }]));
    run(b, 1);
    hold(b, 'ofuda');
    b.play(0, 2);
    expect(b.foes[0].fx.stun).toBeGreaterThan(2);
  });

  it('Gust pushes foes back', () => {
    const b = battle(['gust'], stage([{ t: 0.1, lane: 1, foe: 'chochin' }]));
    run(b, 6);
    const y = b.foes[0].y;
    hold(b, 'gust');
    b.play(0, 1);
    expect(b.foes[0].y).toBeLessThan(y - 1.5);
  });

  it('a vanishing charm is gone for the fight', () => {
    const b = battle(['oilJar', 'crane', 'crane', 'crane', 'crane']);
    hold(b, 'oilJar');
    b.oil = 0.9;
    expect(b.check(0).ok).toBe(false);
    b.oil = 5;
    b.play(0);
    expect(b.vanished.length).toBe(1);
  });

  it('Henge copies the last spirit played', () => {
    const b = battle(['crane', 'henge']);
    hold(b, 'crane', 0);
    b.play(0, 0, 3);
    hold(b, 'henge', 1);
    expect(b.play(1, 4, 3)).toBe(true);
    expect(b.unitAt(4, 3)?.cardId).toBe('crane');
  });

  it('the keeper ability is on a cooldown', () => {
    const b = battle(['crane']);
    expect(b.useAbility()).toBe(false);
    run(b, 40);
    expect(b.useAbility()).toBe(true);
    expect(b.useAbility()).toBe(false);
  });
});

describe('determinism', () => {
  it('the same seed plays the same fight', () => {
    const a = battle(['crane', 'jizo', 'kodama', 'mochi', 'wisp'], stage([{ t: 1, lane: 1, foe: 'karakasa' }]));
    const c = battle(['crane', 'jizo', 'kodama', 'mochi', 'wisp'], stage([{ t: 1, lane: 1, foe: 'karakasa' }]));
    expect(a.hand.map((x) => x?.id)).toEqual(c.hand.map((x) => x?.id));
    run(a, 10);
    run(c, 10);
    expect(a.foes.map((f) => f.y)).toEqual(c.foes.map((f) => f.y));
  });
});

describe('recall', () => {
  it('takes a spirit back for half of what it cost, levels included', () => {
    const b = battle(['kuzunoha']);
    hold(b, 'kuzunoha');
    b.play(0, 2, 4);
    b.oil = 0;
    const u = b.unitAt(2, 4);
    expect(b.recallValue(u as never)).toBe(2);
    expect(b.recall((u as { uid: number }).uid)).toBe(2);
    expect(b.oil).toBe(2);
    expect(b.units.length).toBe(0);
  });

  it('a summoned decoy has nothing to give back', () => {
    const b = battle(['parade']);
    hold(b, 'parade');
    b.play(0);
    const decoy = b.units[0];
    expect(b.recall(decoy.uid)).toBe(-1);
  });
});
