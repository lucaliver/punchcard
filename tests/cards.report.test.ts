import { it } from 'vitest';
import { CARDS } from '../src/data/cards';
import { KEEPERS } from '../src/data/keepers';
import { winRate } from './sim';

/** A rough power report: the starter deck with two copies of a card added, against a mid-game night. Prints a table; asserts nothing. */
it('card power report', () => {
  const rows: { id: string; cost: number; r: string; win: number; flame: number }[] = [];
  for (const c of Object.values(CARDS)) {
    if (c.starter) continue;
    const keeper = c.keeper === 'any' ? 'miko' : c.keeper;
    const deck = [...KEEPERS[keeper].deck, c.id, c.id];
    const r = winRate(keeper, deck, 3, 5, 'elite', 40);
    rows.push({ id: c.id, cost: c.cost, r: c.rarity, win: r.win, flame: r.flameLeft });
  }
  const base = (k: 'miko' | 'ronin' | 'tanuki'): string => {
    const r = winRate(k, KEEPERS[k].deck, 3, 5, 'elite', 40);
    return `${k} ${(r.win * 100).toFixed(0)}%/${r.flameLeft.toFixed(1)}`;
  };
  console.log(`BASE: ${base('miko')}  ${base('ronin')}  ${base('tanuki')}`);
  rows.sort((a, b) => b.win - a.win || b.flame - a.flame);
  console.log(
    rows.map((x) => `${x.id.padEnd(14)} c${x.cost} ${x.r.padEnd(6)} ${(x.win * 100).toFixed(0).padStart(3)}% flame ${x.flame.toFixed(1)}`).join('\n'),
  );
}, 600000);
