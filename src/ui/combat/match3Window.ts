import { sfx } from '../../audio/sfx';
import { t } from '../../core/i18n';
import { MatchThree, type Cells, type MoveResult, type Piece, type Round } from '../../game/match3';
import { icon } from '../art/icons';
import { cssMs, h, retrigger, setHtml, setText, toggle } from '../dom';
import { haptic } from '../fx/fx';
import { createTaskFrame } from './taskFrame';
import type { CombatView } from './view';

/** The icon of each kind of piece (the index is `Piece.kind`; `CONFIG.match3.kinds` of them), and of a copier. */
export const KIND_ICONS = ['stapler', 'coffee', 'envelope', 'pen', 'floppy'] as const;
const COPIER_ICON = 'copy';
/** How far a finger has to travel (in cells) for a drag to count as a swipe towards the next cell. */
const SWIPE = 0.3;

/**
 * The Supervisor's minigame (`EnemyDef.minigame` = 'match3'): the Backlog, a window over the belt, the mana bar and the sleeve (the stage, the enemy's move bar and your ability stay in view)
 * with a board of office stuff to swap. A swap is a tap on one piece and then on its neighbour, or a drag towards it; it goes to `Combat.matchSwap`, which has the move worked out whole
 * and takes the HP off the enemy at once, so what happens here after that is only the show: the window plays the rounds of the move a step at a time (`--dur-match` each)
 * and closing it mid-way only skips the rest. It draws `Combat.minigame` and never changes it.
 */
export function createMatch3Window(v: CombatView): { render(): void } {
  const { combat, state, r } = v;
  const frame = createTaskFrame(v, {
    cls: 'm3-window',
    title: t('task.match3.title'),
    body: `
      <div class="tk-stage"><div class="m3-board" role="grid" aria-label="${t('task.match3.title')}"></div><p class="m3-hint">${t('task.match3.hint')}</p></div>`,
  });
  const refs = { step: frame.q('.tk-step'), stage: frame.q('.tk-stage'), board: frame.q('.m3-board'), hint: frame.q('.m3-hint') };
  const button = r.minigame;
  const labels = { open: t('combat.minigame'), close: t('combat.minigame.close') };

  /** One element per piece on the board, by `Piece.id`, and the board as it is drawn now (what a tap is read against). */
  const els = new Map<number, HTMLElement>();
  let shown: Cells = [];
  let game: MatchThree | null = null;
  let open = false;
  /** The steps of the move being played (the first one runs at once), and when the next one is due. */
  let queue: (() => void)[] = [];
  let nextAt = 0;
  let selected = -1;
  /** Where the finger went down, and on which cell. */
  let drag: { cell: number; x: number; y: number } | null = null;

  const locked = (): boolean => state.paused || state.waiting || state.ended || !game;

  const paint = (el: HTMLElement, p: Piece): void => {
    el.dataset.kind = String(p.kind);
    el.dataset.special = p.special ?? '';
    setHtml(el, icon(p.special === 'bomb' ? COPIER_ICON : KIND_ICONS[p.kind]));
  };

  /** Draws the board: every piece goes to its cell (a new one drops in from above the board), and a piece that is not on it any more is taken away. */
  const place = (cells: Cells): void => {
    if (!game) return;
    const { cols, rows } = game;
    const alive = new Set<number>();
    cells.forEach((p, i) => {
      if (!p) return;
      alive.add(p.id);
      let el = els.get(p.id);
      if (!el) {
        el = h('div', { class: 'm3-piece', role: 'gridcell', 'aria-label': t('task.match3.piece'), 'data-id': String(p.id) });
        el.style.setProperty('--x', String(i % cols));
        el.style.setProperty('--y', String(Math.floor(i / cols) - rows));
        refs.board.append(el);
        els.set(p.id, el);
        // The first position is taken before the real one is set, so the piece travels.
        void el.offsetWidth;
      }
      paint(el, p);
      el.style.setProperty('--x', String(i % cols));
      el.style.setProperty('--y', String(Math.floor(i / cols)));
    });
    for (const [id, el] of els)
      if (!alive.has(id)) {
        el.remove();
        els.delete(id);
      }
    shown = cells;
  };

  /** The board as it stands in the engine, with no animation: when the window opens, and when a move is cut short. */
  const settle = (): void => {
    if (!game) return;
    queue = [];
    // Dealt in one go, without the pieces travelling.
    refs.board.classList.add('still');
    place(game.cells);
    void refs.board.offsetWidth;
    refs.board.classList.remove('still');
    deselect();
  };

  const deselect = (): void => {
    if (selected >= 0) for (const el of els.values()) el.classList.remove('sel');
    selected = -1;
  };

  const select = (cell: number): void => {
    deselect();
    const piece = shown[cell];
    if (!piece) return;
    selected = cell;
    els.get(piece.id)?.classList.add('sel');
    sfx('tap');
  };

  /** What a round was worth, printed where its pieces went. */
  const showHp = (round: Round): void => {
    const g = game;
    if (!g || !round.cleared.length) return;
    const n = round.cleared.length;
    const x = round.cleared.reduce((sum, c) => sum + (c.cell % g.cols), 0) / n;
    const y = round.cleared.reduce((sum, c) => sum + Math.floor(c.cell / g.cols), 0) / n;
    const tag = h('b', { class: 'm3-hp' }, `-${round.hp}`);
    tag.style.setProperty('--x', String(x));
    tag.style.setProperty('--y', String(y));
    tag.addEventListener('animationend', () => tag.remove());
    refs.board.append(tag);
  };

  /** The steps of a move: the two pieces change places, then for every round the lines pop and the rest falls; a shuffled board comes last. */
  const play = (res: MoveResult): void => {
    queue = [() => place(res.start)];
    for (const round of res.rounds) {
      queue.push(() => {
        for (const { piece } of round.cleared) els.get(piece.id)?.classList.add('pop');
        showHp(round);
        sfx(round.made.length ? 'stamp' : 'ding');
      });
      queue.push(() => {
        for (const { piece } of round.cleared) {
          els.get(piece.id)?.remove();
          els.delete(piece.id);
        }
        place(round.after);
        for (const piece of round.made) {
          const el = els.get(piece.id);
          if (el) retrigger(el, 'made');
        }
      });
    }
    const shuffled = res.shuffled;
    if (shuffled)
      queue.push(() => {
        sfx('reshuffle');
        place(shuffled);
      });
    nextAt = 0;
  };

  const attempt = (a: number, b: number): void => {
    if (locked() || queue.length) return;
    const res = combat.matchSwap(a, b);
    deselect();
    if (!res) {
      for (const cell of [a, b]) {
        const p = shown[cell];
        const el = p ? els.get(p.id) : undefined;
        if (el) retrigger(el, 'nope');
      }
      sfx('error');
      return;
    }
    haptic('tap');
    play(res);
  };

  const tap = (cell: number): void => {
    if (selected < 0 || selected === cell) {
      if (selected === cell) deselect();
      else select(cell);
    } else if (game?.adjacent(selected, cell)) attempt(selected, cell);
    else select(cell);
  };

  const cellOf = (target: EventTarget | null): number => {
    const id = (target as HTMLElement | null)?.closest<HTMLElement>('.m3-piece')?.dataset.id;
    return id === undefined ? -1 : shown.findIndex((p) => p?.id === Number(id));
  };

  refs.board.addEventListener('pointerdown', (ev) => {
    const cell = cellOf(ev.target);
    if (locked() || queue.length || cell < 0) return;
    refs.board.setPointerCapture(ev.pointerId);
    drag = { cell, x: ev.clientX, y: ev.clientY };
  });
  refs.board.addEventListener('pointermove', (ev) => {
    if (!drag || !game) return;
    const size = refs.board.clientWidth / game.cols;
    const dx = ev.clientX - drag.x;
    const dy = ev.clientY - drag.y;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < size * SWIPE) return;
    // A swipe: towards the neighbour the finger went to, if the board has one there.
    const horizontal = Math.abs(dx) > Math.abs(dy);
    const col = (drag.cell % game.cols) + (horizontal ? Math.sign(dx) : 0);
    const row = Math.floor(drag.cell / game.cols) + (horizontal ? 0 : Math.sign(dy));
    const from = drag.cell;
    drag = null;
    if (col >= 0 && col < game.cols && row >= 0 && row < game.rows) attempt(from, game.cell(col, row));
  });
  refs.board.addEventListener('pointerup', () => {
    if (!drag) return;
    const { cell } = drag;
    drag = null;
    if (!locked() && !queue.length) tap(cell);
  });
  refs.board.addEventListener('pointercancel', () => {
    drag = null;
  });

  /** The board takes the room the stage leaves (measured when the window opens: the layout doesn't move mid-fight). */
  const measure = (g: MatchThree): void => {
    const css = getComputedStyle(refs.stage);
    const w = refs.stage.clientWidth - Number.parseFloat(css.paddingLeft) - Number.parseFloat(css.paddingRight);
    const hgt = refs.stage.clientHeight - Number.parseFloat(css.paddingTop) - Number.parseFloat(css.paddingBottom);
    const cell = Math.max(1, Math.floor(Math.min(w / g.cols, hgt / g.rows)));
    refs.board.style.setProperty('--cell', `${cell}px`);
    refs.board.style.setProperty('--cols', String(g.cols));
    refs.board.style.setProperty('--rows', String(g.rows));
  };

  return {
    render() {
      game = !combat.isOver && combat.minigameOpen && combat.minigame instanceof MatchThree ? combat.minigame : null;
      if (button) {
        toggle(button, 'open', !!game);
        const label = game ? labels.close : labels.open;
        if (button.getAttribute('aria-label') !== label) button.setAttribute('aria-label', label);
      }
      if (!frame.sync(!!game, false) || !game) {
        if (open) {
          open = false;
          queue = [];
          drag = null;
        }
        return;
      }
      if (!open) {
        open = true;
        frame.place();
        measure(game);
        settle();
      }
      setText(refs.step, t('task.match3.cleared', { n: game.tiles }));
      const now = performance.now();
      if (queue.length && now >= nextAt) {
        queue.shift()?.();
        nextAt = now + cssMs('--dur-match');
      }
    },
  };
}
