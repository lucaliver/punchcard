import { describe, expect, it } from 'vitest';
import { Rng } from '../../src/core/rng';
import { CONFIG } from '../../src/data/config';
import { ENEMIES } from '../../src/data/enemies';
import { MatchThree, WILD, type Piece, type Special } from '../../src/game/match3';
import { matchOf, run, setup } from './helpers';

const { cols, rows, tileHp, combo } = CONFIG.match3;

/** A board with no line and no move to make: a kind per cell that never repeats within reach (the same kind is a whole row apart). */
const quiet = (c: number, r: number): number => (c + 2 * r) % CONFIG.match3.kinds;

/** A board made of that pattern, with a few cells changed (`[col, row, kind]`), and ids that tell the cells apart. */
function board(changes: [number, number, number][] = [], specials: [number, number, Special][] = [], seed = 7): MatchThree {
  const game = new MatchThree(new Rng(seed));
  const kinds = Array.from({ length: cols * rows }, (_, i) => quiet(i % cols, Math.floor(i / cols)));
  for (const [c, r, kind] of changes) kinds[r * cols + c] = kind;
  game.cells = kinds.map((kind, i): Piece => ({ id: 1000 + i, kind }));
  for (const [c, r, special] of specials) {
    const i = r * cols + c;
    game.cells[i] = { id: 1000 + i, kind: special === 'bomb' ? WILD : game.cells[i]!.kind, special };
  }
  return game;
}

/** Row 0 of the pattern with the gap at column 2 filled by a piece that is not part of the line, and the missing piece waiting under it. */
const line3 = (seed = 7): MatchThree =>
  board(
    [
      [0, 0, 0],
      [1, 0, 0],
      [2, 0, 3],
      [3, 0, 0],
    ],
    [],
    seed,
  );

describe('the Supervisor’s match-3', () => {
  it('deals a full board with no line yet and a swap to make, the same one for the same seed', () => {
    for (let seed = 1; seed <= 20; seed++) {
      const game = new MatchThree(new Rng(seed));
      expect(game.cells).toHaveLength(cols * rows);
      expect(game.cells.every((p) => p && p.kind >= 0 && p.kind < CONFIG.match3.kinds)).toBe(true);
      expect(game.swaps().length).toBeGreaterThan(0);
      const again = new MatchThree(new Rng(seed));
      expect(again.cells.map((p) => p?.kind)).toEqual(game.cells.map((p) => p?.kind));
    }
  });

  it('only swaps neighbours, and only when the swap makes a line (or has a special in it); anything else leaves the board as it was', () => {
    const game = board();
    const before = [...game.cells];
    expect(game.swaps()).toEqual([]);
    expect(game.swap(0, 1)).toBeNull();
    expect(game.swap(0, 7)).toBeNull();
    expect(game.swap(0, 2)).toBeNull();
    expect(game.cells).toEqual(before);
    expect(game.moves).toBe(0);
  });

  it('a line of three goes, pays tileHp a piece, and what is above falls and new pieces fill the board', () => {
    const game = line3();
    expect(game.allowed(2, 3)).toBe(true);
    const res = game.swap(2, 3)!;
    expect(res).not.toBeNull();
    const [first] = res.rounds;
    expect(first.cleared.map((c) => c.cell)).toEqual([0, 1, 2]);
    expect(first.hp).toBe(3 * tileHp);
    expect(first.made).toEqual([]);
    expect(res.tiles).toBeGreaterThanOrEqual(3);
    expect(res.hp).toBeGreaterThanOrEqual(3 * tileHp);
    expect(game.cells.every((p) => p)).toBe(true);
    // The quiet board has nothing else to clear, so the pieces that came in were the only chance of a cascade.
    expect(game.tiles).toBe(res.tiles);
    expect(game.hp).toBe(res.hp);
    expect(game.moves).toBe(1);
  });

  it('every cascade after the first pays `combo` more', () => {
    // Search for a seed whose refill cascades; its second round has to pay (1 + combo) a piece.
    for (let seed = 1; seed < 400; seed++) {
      const game = line3(seed);
      const res = game.swap(2, 3)!;
      if (res.rounds.length < 2) continue;
      expect(res.rounds[1].hp).toBe(Math.round(res.rounds[1].cleared.length * tileHp * (1 + combo)));
      expect(res.hp).toBe(res.rounds.reduce((n, r) => n + r.hp, 0));
      return;
    }
    throw new Error('no seed cascades');
  });

  it('four in a line leave a stamp that clears across the line; five leave a copier', () => {
    const four = board([
      [0, 0, 0],
      [1, 0, 0],
      [3, 0, 0],
      [2, 1, 0],
    ]);
    const r4 = four.swap(2, 8)!;
    expect(r4.rounds[0].cleared).toHaveLength(3);
    expect(r4.rounds[0].made).toHaveLength(1);
    expect(r4.rounds[0].made[0].special).toBe('col');
    expect(r4.rounds[0].made[0].kind).toBe(0);

    const five = board([
      [0, 0, 0],
      [1, 0, 0],
      [3, 0, 0],
      [4, 0, 0],
      [5, 0, 1],
      [2, 1, 0],
    ]);
    const r5 = five.swap(2, 8)!;
    expect(r5.rounds[0].cleared).toHaveLength(4);
    expect(r5.rounds[0].made[0].special).toBe('bomb');
    expect(r5.rounds[0].made[0].kind).toBe(WILD);
  });

  it('a stamp goes off when it is swapped or lined up, taking its whole row or column; a copier takes every piece of the kind it was swapped with', () => {
    const stamp = board([], [[2, 2, 'row']]);
    const rs = stamp.swap(14, 15)!;
    expect(rs.rounds[0].cleared.map((c) => c.cell)).toEqual([12, 13, 14, 15, 16, 17]);
    expect(rs.rounds[0].hp).toBe(cols * tileHp);

    const upright = board([], [[3, 2, 'col']]);
    const ru = upright.swap(15, 16)!;
    expect(ru.rounds[0].cleared.map((c) => c.cell)).toEqual([4, 10, 16, 22, 28, 34]);

    const copier = board([], [[0, 0, 'bomb']]);
    const kind = copier.cells[1]!.kind;
    const same = copier.cells.filter((p) => p?.kind === kind).length;
    const rc = copier.swap(0, 1)!;
    expect(rc.rounds[0].cleared).toHaveLength(same + 1);
    expect(rc.rounds[0].cleared.every((c) => c.piece.kind === kind || c.piece.kind === WILD)).toBe(true);
  });

  it('a stamp that is part of a line goes off with it', () => {
    const game = board(
      [
        [0, 0, 0],
        [1, 0, 0],
        [2, 0, 3],
        [3, 0, 0],
      ],
      [[0, 0, 'col']],
    );
    const res = game.swap(2, 3)!;
    // The line is cols 0-2; the stamp in column 0 takes the whole column with it.
    const cells = res.rounds[0].cleared.map((c) => c.cell);
    for (let r = 0; r < rows; r++) expect(cells).toContain(r * cols);
  });

  it('keeps a piece’s id as it falls, and a made special keeps the id of the piece it was made of', () => {
    const game = board([
      [0, 0, 0],
      [1, 0, 0],
      [3, 0, 0],
      [2, 1, 0],
    ]);
    const keep = game.cells[2 + cols]!;
    const res = game.swap(2, 2 + cols)!;
    expect(res.rounds[0].made[0].id).toBe(keep.id);
    const after = res.rounds[0].after;
    expect(after.filter((p) => p?.id === keep.id)).toHaveLength(1);
  });
});

describe('the Supervisor', () => {
  /** A quiet fight with the Supervisor: his moves never land, and his board is the pattern of the tests above. */
  const fight = () => {
    const idle = { id: 'wait', intent: 'idle', windup: 99999 } as const;
    const c = setup({ enemy: { ...ENEMIES.supervisor, main: idle, specials: [], every: 1 } });
    run(c, CONFIG.introTime + 0.01);
    return c;
  };

  it('has a backlog of 1000 HP and a minigame', () => {
    const c = fight();
    expect(c.enemy.maxHp).toBe(1000);
    expect(c.minigame).toBeInstanceOf(MatchThree);
    expect(c.minigameOpen).toBe(false);
  });

  it('a swap does nothing while the window is shut; open, what it clears takes HP off him at once', () => {
    const c = fight();
    const [a, b] = matchOf(c).swaps()[0];
    expect(c.matchSwap(a, b)).toBeNull();
    expect(c.enemy.hp).toBe(1000);
    expect(c.openMinigame(true)).toBe(true);
    const res = c.matchSwap(a, b)!;
    expect(res.hp).toBeGreaterThan(0);
    expect(1000 - c.enemy.hp).toBe(res.hp);
    // A swap that is not allowed costs nothing.
    const hp = c.enemy.hp;
    expect(c.matchSwap(0, cols * rows - 1)).toBeNull();
    expect(c.enemy.hp).toBe(hp);
  });

  it('a tougher floor makes each piece worth a share of his HP, so every floor asks for the same moves', () => {
    const idle = { id: 'wait', intent: 'idle', windup: 99999 } as const;
    const c = setup({ enemy: { ...ENEMIES.supervisor, main: idle, specials: [], every: 1 }, scale: { hp: 2, dmg: 1 } });
    run(c, CONFIG.introTime + 0.01);
    c.openMinigame(true);
    const [a, b] = matchOf(c).swaps()[0];
    const res = c.matchSwap(a, b)!;
    expect(c.enemy.maxHp).toBe(2000);
    expect(2000 - c.enemy.hp).toBe(res.hp * 2);
  });

  it('the open window covers the belt and the sleeve like a chore’s; closing it gives them back and the fight never waits', () => {
    const c = fight();
    c.addTempCard('punch', 'belt');
    const uid = c.belt[c.belt.length - 1].card.uid;
    expect(c.isCovered(uid)).toBe(false);
    c.openMinigame(true);
    expect(c.isCovered(uid)).toBe(true);
    expect(c.playCard(uid)).toBe(false);
    const time = c.time;
    run(c, 1);
    expect(c.time).toBeGreaterThan(time);
    c.openMinigame(false);
    expect(c.isCovered(uid)).toBe(false);
  });

  it('only opens during the fight, and only for an enemy that has a minigame', () => {
    const c = setup();
    expect(c.minigame).toBeNull();
    expect(c.openMinigame(true)).toBe(false);
    const s = fight();
    s.result = 'win';
    expect(s.openMinigame(true)).toBe(false);
  });

  it('the cards deal the same whether or not the minigame is played: it has a stream of its own', () => {
    const idle = { id: 'wait', intent: 'idle', windup: 99999 } as const;
    const enemy = { ...ENEMIES.supervisor, main: idle, specials: [], every: 1 };
    const played = setup({ enemy, seed: 5 });
    const left = setup({ enemy, seed: 5 });
    run(played, CONFIG.introTime + 0.01);
    run(left, CONFIG.introTime + 0.01);
    played.openMinigame(true);
    for (let i = 0; i < 5; i++) {
      const [a, b] = matchOf(played).swaps()[0];
      played.matchSwap(a, b);
    }
    played.openMinigame(false);
    run(played, 5);
    run(left, 5);
    expect(played.belt.map((b) => b.card.id)).toEqual(left.belt.map((b) => b.card.id));
  });
});
