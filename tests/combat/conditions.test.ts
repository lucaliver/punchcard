import { describe, expect, it } from 'vitest';
import { CONDITIONS, conditionAmount, rollCondition } from '../../src/data/conditions';
import { CONFIG } from '../../src/data/config';
import { ENEMIES } from '../../src/data/enemies';
import { applyCombat, combatSetup, conditionFor, newRun } from '../../src/game/run';
import { Combat } from '../../src/game/combat';
import { STATUSES } from '../../src/data/statuses';
import { ICONS } from '../../src/ui/art/icons';
import en from '../../src/i18n/en';
import { run, setup } from './helpers';

const find = (id: string) => CONDITIONS.find((c) => c.id === id)!;

describe('office conditions', () => {
  it('have their name and text written, and every status they hand out exists', () => {
    for (const c of CONDITIONS) {
      expect(en, c.id).toHaveProperty(`condition.${c.id}.name`);
      expect(en, c.id).toHaveProperty(`condition.${c.id}.d`);
      expect(conditionAmount(c)).toBeGreaterThan(0);
      expect(c.hero || c.enemy).toBeTruthy();
      expect(ICONS[c.icon], `${c.id}: icon ${c.icon}`).toBeTruthy();
      for (const st of [...(c.hero ?? []), ...(c.enemy ?? [])]) expect(STATUSES[st.id], `${c.id}: status ${st.id}`).toBeTruthy();
    }
  });

  it('deal the same one to the same room, to roughly the share of fights the config says, and respect the act', () => {
    expect(rollCondition(5, 3, 1)?.id).toBe(rollCondition(5, 3, 1)?.id);
    const rolled = Array.from({ length: 2000 }, (_, i) => rollCondition(i, 4, 1));
    expect(rolled.filter(Boolean).length / rolled.length).toBeCloseTo(CONFIG.condition.chance, 1);
    expect(Array.from({ length: 2000 }, (_, i) => rollCondition(i, 4, 3)).some((c) => c?.id === 'wellnessWeek')).toBe(false);
  });

  it('are for ordinary fights only, and never the teaching run', () => {
    for (let seed = 2; seed < 40; seed++) {
      const r = newRun('warrior', seed);
      for (const n of r.nodes) if (n.type !== 'fight') expect(conditionFor(r, n)).toBeUndefined();
      expect(r.nodes.some((n) => n.type === 'fight' && conditionFor(r, n))).toBe(true);
    }
    const first = newRun('warrior', 7, [1]);
    for (const n of first.nodes) expect(conditionFor(first, n)).toBeUndefined();
  });

  it('start each side with the statuses they name', () => {
    const c = setup({ condition: find('casualFriday') });
    expect(c.stacks('hero', 'strength')).toBe(2);
    const d = setup({ condition: find('understaffed') });
    expect(d.stacks('enemy', 'strength')).toBe(2);
    expect(d.stacks('hero', 'strength')).toBe(0);
  });

  it('change the pay of the fight by their share', () => {
    const pay = (id?: string): number => {
      const r = newRun('warrior', 7);
      r.current = r.nodes.find((n) => n.type === 'fight')!.id;
      r.money = 0;
      const c = new Combat({ ...combatSetup(r), enemy: ENEMIES.seniorBoomer, condition: id ? find(id) : undefined });
      c.damage('hero', 'enemy', 9999, { raw: true }, 'hero');
      run(c, 0.1);
      applyCombat(r, c);
      return r.money;
    };
    expect(pay('understaffed')).toBeGreaterThan(pay());
    expect(pay('casualFriday')).toBe(pay());
  });

  it("the Free Coffee Day's cups arrive on time", () => {
    const c = setup({ condition: find('freeCoffeeDay') });
    c.hero.maxMana = 10;
    c.hero.mana = 0;
    let free = 0;
    c.hero.manaTimer = -1e9;
    c.events.on((e) => {
      if (e.type === 'mana') free += e.amount;
    });
    run(c, 20);
    expect(free).toBeGreaterThanOrEqual(2);
  });
});
