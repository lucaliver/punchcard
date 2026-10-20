import { describe, expect, it } from 'vitest';
import { KEEPERS, KEEPER_IDS } from '../src/data/keepers';
import { winRate } from './sim';

describe('balance (bot, starter decks)', () => {
  for (const k of KEEPER_IDS) {
    it(`${k} starter deck`, () => {
      const rows: string[] = [];
      for (const [act, floor, kind] of [
        [1, 0, 'watch'],
        [1, 4, 'watch'],
        [1, 5, 'elite'],
        [1, 6, 'boss'],
        [2, 2, 'watch'],
        [2, 5, 'elite'],
        [3, 2, 'watch'],
      ] as const) {
        const r = winRate(k, KEEPERS[k].deck, act, floor, kind, 20);
        rows.push(`a${act}f${floor}${kind[0]}: ${(r.win * 100).toFixed(0)}%/${r.flameLeft.toFixed(1)}`);
      }
      console.log(k.padEnd(7), rows.join('  '));
      expect(true).toBe(true);
    });
  }
});
