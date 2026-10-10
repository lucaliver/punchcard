import type { Rng } from '../core/rng';
import { CONFIG } from '../data/config';
import type { Minigame } from './minigame';

/** What a special piece does when it goes: a stamp clears its row or its column, a copier (`bomb`) every piece of the kind it was swapped with. */
export type Special = 'row' | 'col' | 'bomb';

/** The kind of a copier: it matches nothing, so it never goes in a line, only by a swap. */
export const WILD = -1;

/** One piece of the board. Its `id` follows it as it falls, so the window can tell which one is which. */
export interface Piece {
  readonly id: number;
  /** 0 to `CONFIG.match3.kinds - 1`, or `WILD`. */
  readonly kind: number;
  readonly special?: Special;
}

/** The board as a list of cells, row by row from the top; a cell is empty only while a move is being worked out. */
export type Cells = readonly (Piece | null)[];

/** One round of a move: the pieces that went, the specials it left behind, what it was worth and the board after the rest fell and new pieces came in. */
export interface Round {
  cleared: { cell: number; piece: Piece }[];
  /** The pieces that became a special in this round (four or five in a line): the same ids, new pieces. */
  made: Piece[];
  /** HP this round took off the enemy, cascades included. */
  hp: number;
  after: Cells;
}

/** What a swap did: the board right after the two pieces changed places, the rounds that followed, and what it was all worth. */
export interface MoveResult {
  a: number;
  b: number;
  start: Cells;
  rounds: Round[];
  /** Pieces that went, and the HP they took off the enemy. */
  tiles: number;
  hp: number;
  /** The board had no move left and was shuffled (`shuffled` is the new board, the same pieces in other cells). */
  shuffled: Cells | null;
}

/** Pieces in a line that clear it, that leave a stamp, and that leave a copier (the window's note and the handbook quote these). */
export const MATCH_LINE = 3;
export const STAMP_LINE = 4;
export const COPIER_LINE = 5;

/** Most rounds a move can run (a refill that keeps matching would otherwise never end). */
const MAX_ROUNDS = 30;
/** Tries at shuffling a board that has no move before it is dealt again. */
const SHUFFLE_TRIES = 40;

/**
 * The Supervisor's minigame (`EnemyDef.minigame` = 'match3'): a board of office stuff to swap two neighbours at a time until three or more of a kind line up. Pure and turn-based (no time at all, so
 * the window can be closed and opened whenever), seeded by its own `Rng`. A swap is worked out whole by `swap`: the lines go, what is above falls, new pieces come in, and so on until the board is
 * quiet; the rounds it went through are in the result so the window can play them. Four in a line (`STAMP_LINE`) leave a stamp (`row` or `col`, across the line), five (`COPIER_LINE`) a copier (`bomb`); a swap with a special
 * is always allowed and sets it off. The HP a move is worth is computed here (`CONFIG.match3`), and `Combat.matchSwap` takes it off the enemy.
 */
export class MatchThree implements Minigame {
  readonly id = 'match3' as const;
  readonly cols = CONFIG.match3.cols;
  readonly rows = CONFIG.match3.rows;
  cells: (Piece | null)[] = [];
  /** Moves made, pieces cleared and HP taken off the enemy so far. */
  moves = 0;
  tiles = 0;
  hp = 0;
  private nextId = 0;

  constructor(private readonly rng: Rng) {
    this.deal();
  }

  /** The cell at this column and row. */
  cell(col: number, row: number): number {
    return row * this.cols + col;
  }

  private col(cell: number): number {
    return cell % this.cols;
  }

  private row(cell: number): number {
    return Math.floor(cell / this.cols);
  }

  /** Whether two cells are neighbours (side by side or one above the other). */
  adjacent(a: number, b: number): boolean {
    return Math.abs(this.col(a) - this.col(b)) + Math.abs(this.row(a) - this.row(b)) === 1;
  }

  /** Every swap that is allowed now, as pairs of neighbouring cells: the ones that make a line, and any with a special in them. */
  swaps(): [number, number][] {
    const out: [number, number][] = [];
    for (let a = 0; a < this.cells.length; a++) {
      for (const b of [this.col(a) + 1 < this.cols ? a + 1 : -1, this.row(a) + 1 < this.rows ? a + this.cols : -1])
        if (b >= 0 && this.allowed(a, b)) out.push([a, b]);
    }
    return out;
  }

  /** Whether swapping these two would be a move: they are neighbours and either one is a special or the swap puts three in a line. */
  allowed(a: number, b: number): boolean {
    const pa = this.cells[a];
    const pb = this.cells[b];
    if (!pa || !pb || !this.adjacent(a, b)) return false;
    if (pa.special || pb.special) return true;
    this.exchange(a, b);
    const ok = this.lines().length > 0;
    this.exchange(a, b);
    return ok;
  }

  /**
   * Swaps two neighbouring pieces and works the whole move out. Null (the board is untouched) when the swap isn't allowed. The HP is the pieces that went times `CONFIG.match3.tileHp`,
   * each cascade after the first worth `combo` more than the one before.
   */
  swap(a: number, b: number): MoveResult | null {
    if (!this.allowed(a, b)) return null;
    this.exchange(a, b);
    const start = [...this.cells];
    const rounds: Round[] = [];
    let forced = this.setOff(a, b);
    let tiles = 0;
    let hp = 0;
    for (let level = 0; level < MAX_ROUNDS; level++) {
      const lines = this.lines();
      if (!lines.length && !forced.size) break;
      const round = this.clear(lines, forced, level === 0 ? [a, b] : [], level);
      forced = new Set();
      rounds.push(round);
      tiles += round.cleared.length;
      hp += round.hp;
    }
    this.moves++;
    this.tiles += tiles;
    this.hp += hp;
    return { a, b, start, rounds, tiles, hp, shuffled: this.swaps().length ? null : this.shuffle() };
  }

  /** The cells a swap sets off by itself: a stamp goes where it landed, a copier takes every piece of the kind it was swapped with. */
  private setOff(a: number, b: number): Set<number> {
    const out = new Set<number>();
    for (const [cell, other] of [
      [a, b],
      [b, a],
    ]) {
      const p = this.cells[cell];
      const o = this.cells[other];
      if (!p?.special || !o) continue;
      out.add(cell);
      if (p.special !== 'bomb') continue;
      for (let i = 0; i < this.cells.length; i++) if (o.kind === WILD || this.cells[i]?.kind === o.kind) out.add(i);
    }
    return out;
  }

  /**
   * One round: the lines (and the cells already set off) go, the specials among them go off too, four or five in a line leave a special where the swap was (or in the middle of the line),
   * then what is above falls and new pieces come in from the top.
   */
  private clear(lines: Line[], forced: Set<number>, swapped: number[], level: number): Round {
    const gone = new Set<number>(forced);
    const survivors = new Map<number, Special>();
    for (const line of lines) {
      for (const c of line.cells) gone.add(c);
      if (line.cells.length < STAMP_LINE) continue;
      const at = line.cells.find((c) => swapped.includes(c)) ?? line.cells[Math.floor(line.cells.length / 2)];
      if (!survivors.has(at)) survivors.set(at, line.cells.length >= COPIER_LINE ? 'bomb' : line.dir === 'row' ? 'col' : 'row');
    }
    for (const at of survivors.keys()) gone.delete(at);
    this.expand(gone);
    for (const at of survivors.keys()) if (gone.has(at)) survivors.delete(at);

    const cleared = [...gone].sort((p, q) => p - q).map((cell) => ({ cell, piece: this.cells[cell]! }));
    const made: Piece[] = [];
    for (const [at, special] of survivors) {
      const old = this.cells[at]!;
      const piece: Piece = { id: old.id, kind: special === 'bomb' ? WILD : old.kind, special };
      this.cells[at] = piece;
      made.push(piece);
    }
    for (const c of gone) this.cells[c] = null;
    this.fall();
    this.fill();
    const hp = Math.round(cleared.length * CONFIG.match3.tileHp * (1 + level * CONFIG.match3.combo));
    return { cleared, made, hp, after: [...this.cells] };
  }

  /** Adds the lines of every stamp that is going (a stamp set off by another goes off too, and so on). */
  private expand(gone: Set<number>): void {
    const done = new Set<number>();
    for (const queue = [...gone]; queue.length; ) {
      const cell = queue.pop()!;
      const special = this.cells[cell]?.special;
      if (!special || done.has(cell)) continue;
      done.add(cell);
      if (special === 'bomb') continue;
      for (let i = 0; i < (special === 'row' ? this.cols : this.rows); i++) {
        const c = special === 'row' ? this.cell(i, this.row(cell)) : this.cell(this.col(cell), i);
        if (!gone.has(c)) {
          gone.add(c);
          queue.push(c);
        }
      }
    }
  }

  /** Every run of three or more pieces of one kind, side by side or one above the other (a copier is of no kind, so it is in none). */
  private lines(): Line[] {
    const out: Line[] = [];
    for (const dir of ['row', 'col'] as const) {
      const [outer, inner] = dir === 'row' ? [this.rows, this.cols] : [this.cols, this.rows];
      for (let o = 0; o < outer; o++) {
        let run: number[] = [];
        let runKind = WILD;
        // One step past the end closes the last run.
        for (let i = 0; i <= inner; i++) {
          const cell = i === inner ? -1 : dir === 'row' ? this.cell(i, o) : this.cell(o, i);
          const kind = cell < 0 ? WILD : (this.cells[cell]?.kind ?? WILD);
          if (run.length && kind === runKind) run.push(cell);
          else {
            if (run.length >= MATCH_LINE) out.push({ cells: run, dir });
            run = kind === WILD ? [] : [cell];
            runKind = kind;
          }
        }
      }
    }
    return out;
  }

  private exchange(a: number, b: number): void {
    [this.cells[a], this.cells[b]] = [this.cells[b], this.cells[a]];
  }

  /** What is above an empty cell falls into it. */
  private fall(): void {
    for (let c = 0; c < this.cols; c++) {
      let to = this.rows - 1;
      for (let r = this.rows - 1; r >= 0; r--) {
        const p = this.cells[this.cell(c, r)];
        if (!p) continue;
        this.cells[this.cell(c, r)] = null;
        this.cells[this.cell(c, to--)] = p;
      }
    }
  }

  /** New pieces come in at the top of every column that has room. */
  private fill(): void {
    for (let i = 0; i < this.cells.length; i++) if (!this.cells[i]) this.cells[i] = this.fresh();
  }

  private fresh(avoid: number[] = []): Piece {
    const kinds = Array.from({ length: CONFIG.match3.kinds }, (_, k) => k).filter((k) => !avoid.includes(k));
    return { id: this.nextId++, kind: this.rng.pick(kinds.length ? kinds : [0]) };
  }

  /** A first board: no line yet and at least one swap to make. */
  private deal(): void {
    do {
      this.cells = new Array<Piece | null>(this.cols * this.rows).fill(null);
      for (let i = 0; i < this.cells.length; i++) {
        // A piece that would complete a line with the two before it, side by side or above, is not dealt.
        const avoid: number[] = [];
        for (const step of [1, this.cols]) {
          const x = this.cells[i - step];
          const y = this.cells[i - 2 * step];
          const fits = step === 1 ? this.col(i) >= 2 : this.row(i) >= 2;
          if (fits && x && y && x.kind === y.kind) avoid.push(x.kind);
        }
        this.cells[i] = this.fresh(avoid);
      }
    } while (!this.swaps().length);
  }

  /** The same pieces in other cells, with no line and a swap to make (a fresh deal if none of the shuffles gets there); returns the new board. */
  private shuffle(): Cells {
    const pieces = this.cells.filter((p): p is Piece => !!p);
    for (let i = 0; i < SHUFFLE_TRIES; i++) {
      this.cells = this.rng.shuffle([...pieces]);
      if (!this.lines().length && this.swaps().length) return [...this.cells];
    }
    this.deal();
    return [...this.cells];
  }
}

interface Line {
  cells: number[];
  dir: 'row' | 'col';
}
