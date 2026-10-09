import { h, retrigger, toggle } from '../dom';
import type { CombatView } from './view';

/** Frames after which a window that is leaving is closed even if its animation never ended. */
const LEAVE_FRAMES = 90;

export interface TaskFrame {
  el: HTMLElement;
  /** An element of the window, by selector. */
  q<T extends HTMLElement>(sel: string): T;
  /**
   * One frame of the window's life; the caller passes whether a chore is on (and whether the hero has done it) and draws its contents when this is true.
   * A done chore sends the window off with an animation (the engine has let go of the belt already); anything else closes it at once.
   */
  sync(active: boolean, served: boolean): boolean;
  /** Measures the window over the belt, the mana bar and the sleeve (the layout doesn't move mid-fight, so this is done when the window opens). */
  place(): void;
}

/**
 * The window every chore (`MoveDef.task`) shares: a title bar with the step, a body the chore fills, the open/leave life cycle and the place over the belt.
 * The chore's own file draws what is inside (`coffeeWindow.ts`, `shellWindow.ts`).
 */
export function createTaskFrame(v: CombatView, opts: { cls?: string; title: string; body: string }): TaskFrame {
  const { combat, r } = v;
  const el = h('div', { class: `task-window${opts.cls ? ` ${opts.cls}` : ''}`, role: 'dialog', 'aria-label': opts.title });
  el.innerHTML = `
    <div class="tk-bar"><span>${opts.title}</span><b class="tk-step"></b></div>
    <div class="tk-body">${opts.body}</div>`;
  v.el.append(el);

  /** Whether the window is up, whether the chore was done, and whether it is on its way out. */
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

  return {
    el,
    q: <T extends HTMLElement>(sel: string): T => el.querySelector<T>(sel)!,
    sync(active, done) {
      if (!active) {
        if (on && !leaving) {
          if (served && !combat.isOver) {
            leaving = true;
            leaveFrames = 0;
            el.classList.add('leaving');
          } else hide();
        }
        // The animation's end closes it; this is only for a tab whose animations don't run.
        else if (leaving && ++leaveFrames > LEAVE_FRAMES) hide();
        return false;
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
      served = done;
      toggle(el, 'served', served);
      return true;
    },
    place() {
      const base = v.el.getBoundingClientRect();
      const ability = r.ability.getBoundingClientRect();
      const bottom = Math.max(ability.bottom, r.sleeve.getBoundingClientRect().bottom);
      el.style.top = `${Math.round(r.belt.getBoundingClientRect().top - base.top)}px`;
      el.style.bottom = `${Math.round(base.bottom - bottom)}px`;
      el.style.setProperty('--tk-gap', `${Math.round(base.right - ability.left)}px`);
    },
  };
}
