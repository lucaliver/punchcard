import { describe, expect, it } from 'vitest';
import { INTERCOM, cuesOf, pickIntercom } from '../../src/data/intercom';
import { MAIN_ACTS } from '../../src/data/acts';
import { newRun } from '../../src/game/run';
import en from '../../src/i18n/en';

describe('the Intercom', () => {
  it('has every line written, and a few for each act', () => {
    for (const l of INTERCOM) expect(en, l.id).toHaveProperty(`intercom.${l.id}`);
    for (let act = 1; act <= MAIN_ACTS + 1; act++)
      expect(INTERCOM.filter((l) => !l.cue && l.acts && l.acts[0] <= act && act <= l.acts[1]).length).toBeGreaterThanOrEqual(4);
  });

  it('reads the same line in the same room, and another when asked', () => {
    const run = newRun('warrior', 11);
    expect(pickIntercom(run, 1)).toBe(pickIntercom(run, 1));
    const lines = new Set(Array.from({ length: 12 }, (_, salt) => pickIntercom(run, 1, salt)));
    expect(lines.size).toBeGreaterThan(1);
  });

  it('notices what the run is going through', () => {
    const run = newRun('warrior', 11);
    expect(cuesOf(run).has('start')).toBe(true);
    run.hp = 1;
    expect(cuesOf(run).has('lowHp')).toBe(true);
    run.hp = run.maxHp;
    expect(cuesOf(run).has('fullHp')).toBe(true);
    run.money = 9999;
    expect(cuesOf(run).has('rich')).toBe(true);
  });
});
