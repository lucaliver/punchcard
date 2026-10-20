import { describe, expect, it } from 'vitest';
import { KEEPER_IDS } from '../src/data/keepers';
import { playRun } from './runbot';

/** Whole runs by the bot: how far a plain player gets with each keeper. Prints a table; asserts only that it is neither hopeless nor trivial. */
describe('balance (whole runs, bot)', () => {
  it('prints how far each keeper gets', () => {
    const N = Number(process.env.RUNS ?? 30);
    const lines: string[] = [];
    let total = 0;
    let wins = 0;
    for (const k of KEEPER_IDS) {
      const byAct = [0, 0, 0, 0];
      let w = 0;
      for (let i = 0; i < N; i++) {
        const r = playRun(k, 5000 + i * 13);
        byAct[r.won ? 3 : r.act - 1]++;
        if (r.won) w++;
      }
      total += N;
      wins += w;
      lines.push(`${k.padEnd(7)} fell on night 1: ${byAct[0]}  night 2: ${byAct[1]}  night 3: ${byAct[2]}  won: ${w}/${N}`);
    }
    console.log(`\n${lines.join('\n')}`);
    expect(wins / total).toBeLessThan(0.97);
    expect(wins / total).toBeGreaterThan(0.01);
  }, 300000);
});
