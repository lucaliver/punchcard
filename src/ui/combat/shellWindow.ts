import { sfx } from '../../audio/sfx';
import { t } from '../../core/i18n';
import type { ShellGame } from '../../game/shells';
import { icon } from '../art/icons';
import { h, retrigger, setText, toggle } from '../dom';
import { haptic } from '../fx/fx';
import type { CombatView } from './view';

/** Frames after which a window that is leaving is closed even if its animation never ended. */
const LEAVE_FRAMES = 90;
/** Steps a swap is drawn in (motion is stepped). */
const SWAP_STEPS = 6;
/** How far (in card heights) a card lifts while it swaps places, so the two pass over each other. */
const LIFT = 0.18;

/**
 * The Board's chore (`MoveDef.task` = 'shells'): a window over the belt and the sleeve with covered cards that swap places.
 * It only draws `Combat.shells` and sends the picks to `Combat.pickShell`.
 */
export function createShellWindow(v: CombatView): { render(): void } {
  const { combat, state, r } = v;
  const el = h('div', { class: 'task-window shell-window', role: 'dialog', 'aria-label': t('task.shells.title') });
  el.innerHTML = `
    <div class="tk-bar"><span>${t('task.shells.title')}</span><b class="tk-step"></b></div>
    <div class="tk-body">
      <div class="tk-machine">
        <div class="tk-lcd"><span class="tk-msg"></span><b class="tk-val"></b></div>
        <div class="tk-stage"><div class="sh-table"></div></div>
      </div>
    </div>`;
  v.el.append(el);
  const q = <T extends HTMLElement>(sel: string): T => el.querySelector<T>(sel)!;
  const refs = { step: q('.tk-step'), msg: q('.tk-msg'), val: q('.tk-val'), table: q('.sh-table') };

  /** The game the cards were built for, and one button per card id. */
  let shown: ShellGame | null = null;
  let cards: HTMLButtonElement[] = [];

  /** Whether the window is up, whether the right card was found, and whether it is on its way out. */
  let on = false;
  let served = false;
  let leaving = false;
  let leaveFrames = 0;
  const hide = (): void => {
    on = false;
    served = false;
    leaving = false;
    el.classList.remove('leaving', 'served');
    toggle(el, 'on', false);
    toggle(v.el, 'tasking', false);
  };
  el.addEventListener('animationend', (ev) => {
    if (ev.target === el && leaving) hide();
  });

  const pick = (id: number): void => {
    if (state.paused || state.waiting || state.ended || !shown) return;
    const res = combat.pickShell(shown.slots.indexOf(id));
    if (res === 'wrong') {
      retrigger(cards[id], 'bounce');
      retrigger(el, 'jolt');
    } else if (res === 'ok') {
      sfx('served');
      haptic('tap');
    }
  };

  const build = (game: ShellGame): void => {
    shown = game;
    cards = game.slots.map((_, id) => {
      const prize = id === game.prize;
      const b = h(
        'button',
        { class: 'sh-card', 'aria-label': t('task.shells.card') },
        h(
          'span',
          { class: 'sh-in' },
          h('span', { class: 'sh-back', html: icon('gavel') }),
          h('span', {
            class: 'sh-front',
            'data-prize': prize ? '1' : '0',
            html: `${icon(prize ? 'coinStack' : 'envelope')}<small>${t(prize ? 'task.shells.raise' : 'task.shells.slip')}</small>`,
          }),
        ),
      );
      b.addEventListener('click', () => pick(id));
      return b;
    });
    refs.table.replaceChildren(...cards);
    place();
  };

  /** The window covers the belt, the mana bar and the sleeve (measured when it opens: the layout doesn't move mid-fight); the ability button stays on top of its corner. */
  const place = (): void => {
    const base = v.el.getBoundingClientRect();
    const ability = r.ability.getBoundingClientRect();
    const bottom = Math.max(ability.bottom, r.sleeve.getBoundingClientRect().bottom);
    el.style.top = `${Math.round(r.belt.getBoundingClientRect().top - base.top)}px`;
    el.style.bottom = `${Math.round(base.bottom - bottom)}px`;
    el.style.setProperty('--tk-gap', `${Math.round(base.right - ability.left)}px`);
  };

  /** Where each card stands (in places from the left, fractional while it swaps), and how high it is lifted. */
  const drawCards = (game: ShellGame): void => {
    const sw = game.swap;
    const u = sw ? Math.floor(Math.min(1, sw.u) * SWAP_STEPS) / SWAP_STEPS : 0;
    const faceUp = (id: number): boolean =>
      game.phase === 'show' || (game.phase === 'done' && id === game.prize) || (game.phase === 'reveal' && game.slots[game.picked] === id);
    game.slots.forEach((id, place) => {
      let pos = place;
      let lift = 0;
      if (sw && (place === sw.a || place === sw.b)) {
        pos = place === sw.a ? sw.a + (sw.b - sw.a) * u : sw.b + (sw.a - sw.b) * u;
        lift = Math.sin(Math.PI * u) * (place === sw.a ? 1 : -1) * LIFT;
      }
      const b = cards[id];
      b.style.setProperty('--pos', pos.toFixed(3));
      b.style.setProperty('--lift', lift.toFixed(3));
      toggle(b, 'up', faceUp(id));
      toggle(b, 'prize', game.phase === 'done' && id === game.prize);
      b.disabled = game.phase !== 'pick';
    });
  };

  return {
    render() {
      const game = combat.isOver ? null : combat.shells;
      if (!game) {
        shown = null;
        // The right card sends the window off with an animation (the engine has let go of the belt already); anything else closes it at once.
        if (on && !leaving) {
          if (served && !combat.isOver) {
            leaving = true;
            leaveFrames = 0;
            el.classList.add('leaving');
          } else hide();
        } else if (leaving && ++leaveFrames > LEAVE_FRAMES) hide();
        return;
      }
      if (leaving) {
        leaving = false;
        el.classList.remove('leaving');
      }
      if (!on) {
        on = true;
        toggle(el, 'on', true);
        toggle(v.el, 'tasking', true);
        retrigger(el, 'entering');
      }
      if (shown !== game) build(game);
      served = game.phase === 'done';
      toggle(el, 'served', served);
      setText(refs.step, t('task.shells.round', { n: game.round + 1 }));
      setText(refs.msg, t(`task.shells.step.${game.phase}`));
      setText(refs.val, game.errors ? t('task.shells.fined', { n: game.errors }) : '');
      drawCards(game);
    },
  };
}
