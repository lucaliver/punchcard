import { t } from '../../core/i18n';
import { sfx } from '../../audio/sfx';
import { CONFIG } from '../../data/config';
import type { CoffeeAction, CoffeePhase, CoffeeResult, CoffeeTask } from '../../game/coffee';
import { icon } from '../art/icons';
import { h, retrigger, setText, toggle } from '../dom';
import { haptic } from '../fx/fx';
import type { CombatView } from './view';

/** Pixels a touch has to travel before it counts as a drag and not a tap. */
const DRAG_PX = 8;
/** How far (px) past a drop target's edge a drop still counts. */
const DROP_SLACK = 14;
/** Steps of the cup filling up (motion is stepped). */
const FILL_STEPS = 12;
/** The window's three steps, in order (the pour and the served cup are still the third). */
const STEPS: Record<CoffeePhase, number> = { coins: 1, code: 2, prep: 3, brew: 3, done: 3 };
const PAD = Array.from({ length: CONFIG.coffee.keys }, (_, i) => i + 1);

/**
 * The Coffee Machine's chore (`MoveDef.task`): a window over the belt and the sleeve (the enemy, its move bar and your ability stay in view).
 * It only draws `Combat.task` and sends the hand's moves to `Combat.coffee`; coins and the cup can be dragged to their place or just tapped.
 */
export function createTaskWindow(v: CombatView): { render(): void } {
  const { combat, state, r } = v;
  const el = h('div', { class: 'task-window', role: 'dialog', 'aria-label': t('task.coffee.title') });
  el.innerHTML = `
    <div class="tk-bar"><span>${t('task.coffee.title')}</span><b class="tk-step"></b></div>
    <div class="tk-body">
      <div class="tk-note">
        <small>${t('task.coffee.order')}</small>
        <b class="tk-drink"></b>
        <span class="tk-sugar"></span>
        <span class="tk-pay"></span>
        <span class="tk-code"></span>
      </div>
      <div class="tk-machine">
        <div class="tk-lcd"><span class="tk-msg"></span><b class="tk-val"></b></div>
        <div class="tk-stage"></div>
      </div>
    </div>`;
  v.el.append(el);
  const q = <T extends HTMLElement>(sel: string): T => el.querySelector<T>(sel)!;
  const refs = {
    step: q('.tk-step'),
    drink: q('.tk-drink'),
    sugar: q('.tk-sugar'),
    pay: q('.tk-pay'),
    code: q('.tk-code'),
    msg: q('.tk-msg'),
    val: q('.tk-val'),
    stage: q('.tk-stage'),
  };

  /** The task and phase the stage was built for, and what lives on it. */
  let shown: CoffeeTask | null = null;
  let built: CoffeePhase | null = null;
  const coinEls = new Map<number, HTMLElement>();
  let slot: HTMLElement | null = null;
  let cup: HTMLButtonElement | null = null;
  let spot: HTMLElement | null = null;
  let dialNum: HTMLElement | null = null;
  let glass: HTMLElement | null = null;

  const blocked = (): boolean => state.paused || state.waiting || state.ended;
  const send = (a: CoffeeAction, from: HTMLElement): CoffeeResult | null => {
    if (blocked()) return null;
    const res = combat.coffee(a);
    if (res === 'wrong') {
      retrigger(from, 'bounce');
      retrigger(el, 'jolt');
    } else if (res === 'ok') haptic('tap');
    return res;
  };

  /** Makes `item` draggable onto `target` (or a plain tap): both do the same, `act`. */
  const bindDrag = (item: HTMLElement, target: () => HTMLElement | null, act: () => void): void => {
    item.addEventListener('pointerdown', (ev) => {
      if (blocked()) return;
      const x0 = ev.clientX;
      const y0 = ev.clientY;
      let moved = false;
      try {
        item.setPointerCapture(ev.pointerId);
      } catch {
        /* synthetic events (tests) have no active pointer */
      }
      const over = (e: PointerEvent): boolean => {
        const rc = target()?.getBoundingClientRect();
        return (
          !!rc &&
          e.clientX > rc.left - DROP_SLACK &&
          e.clientX < rc.right + DROP_SLACK &&
          e.clientY > rc.top - DROP_SLACK &&
          e.clientY < rc.bottom + DROP_SLACK
        );
      };
      const move = (e: PointerEvent): void => {
        const dx = e.clientX - x0;
        const dy = e.clientY - y0;
        if (!moved && Math.hypot(dx, dy) < DRAG_PX) return;
        moved = true;
        item.classList.add('dragging');
        item.style.transform = `translate(${dx}px, ${dy}px)`;
        const tg = target();
        if (tg) toggle(tg, 'hot', over(e));
      };
      const done = (e: PointerEvent, drop: boolean): void => {
        item.removeEventListener('pointermove', move);
        item.removeEventListener('pointerup', up);
        item.removeEventListener('pointercancel', cancel);
        item.classList.remove('dragging');
        item.style.transform = '';
        const tg = target();
        if (tg) toggle(tg, 'hot', false);
        if (drop && (!moved || over(e))) act();
      };
      const up = (e: PointerEvent): void => done(e, true);
      const cancel = (e: PointerEvent): void => done(e, false);
      item.addEventListener('pointermove', move);
      item.addEventListener('pointerup', up);
      item.addEventListener('pointercancel', cancel);
    });
    // Keyboard and assistive tech click without a pointer stream.
    item.addEventListener('click', (ev) => {
      if (ev.detail === 0) act();
    });
  };

  const buildCoins = (task: CoffeeTask): void => {
    coinEls.clear();
    slot = h('div', { class: 'tk-slot', 'aria-label': t('task.coffee.slot') }, h('i'));
    const purse = h('div', { class: 'tk-purse' });
    for (const coin of task.coins) {
      const b = h('button', { class: 'tk-coin', 'data-v': coin.value, 'aria-label': String(coin.value) }, h('b', null, coin.value));
      bindDrag(
        b,
        () => slot,
        () => {
          if (send({ kind: 'coin', id: coin.id }, b) === 'ok') sfx('coin');
        },
      );
      coinEls.set(coin.id, b);
      purse.append(b);
    }
    refs.stage.replaceChildren(h('div', { class: 'tk-coins' }, purse, slot));
  };

  const buildCode = (): void => {
    const keys = PAD.map((n) => {
      const b = h('button', { class: 'tk-key' }, h('b', null, n));
      b.addEventListener('click', () => {
        if (send({ kind: 'key', key: n }, b) !== 'ok') return;
        sfx('key');
        retrigger(b, 'press');
      });
      return b;
    });
    refs.stage.replaceChildren(h('div', { class: 'tk-pad' }, ...keys));
  };

  const buildPrep = (): void => {
    spot = h('div', { class: 'tk-spot' }, h('i'));
    cup = h('button', { class: 'tk-cup', 'aria-label': t('task.coffee.cup') }, h('span', { html: icon('coffee') }));
    bindDrag(
      cup,
      () => spot,
      () => {
        if (send({ kind: 'cup' }, cup!) === 'ok') sfx('cup');
      },
    );
    const bay = h('div', { class: 'tk-bay' }, spot, h('div', { class: 'tk-tray' }, cup));
    dialNum = h('b', { class: 'tk-n' }, '0');
    const step = (by: 1 | -1, label: string): HTMLElement => {
      const b = h('button', { class: 'tk-step-btn', 'aria-label': label }, h('b', null, label));
      b.addEventListener('click', () => {
        if (send({ kind: 'sugar', by }, b) === 'ok') sfx('key');
      });
      return b;
    };
    const dial = h('div', { class: 'tk-dial' }, h('small', null, t('task.coffee.dial')), h('div', null, step(-1, '-'), dialNum, step(1, '+')));
    const start = h('button', { class: 'btn small tk-start' }, t('task.coffee.start'));
    start.addEventListener('click', () => {
      if (send({ kind: 'start' }, start) === 'ok') sfx('brew');
    });
    refs.stage.replaceChildren(h('div', { class: 'tk-prep' }, bay, h('div', { class: 'tk-side' }, dial, start)));
  };

  const buildBrew = (): void => {
    glass = h('div', { class: 'tk-glass' }, h('i', { class: 'tk-pour' }), h('i', { class: 'tk-liquid' }));
    refs.stage.replaceChildren(h('div', { class: 'tk-brew' }, glass));
  };

  /** Rebuilds the stage when the task or its phase changed (a phase only ever moves forward). */
  const sync = (task: CoffeeTask): void => {
    if (shown !== task) {
      shown = task;
      built = null;
      refs.drink.textContent = t(`drink.${task.drink}`);
      refs.sugar.textContent = t('task.coffee.sugar', { n: task.sugar });
      refs.pay.textContent = t('task.coffee.pay', { n: task.price });
      refs.code.textContent = t('task.coffee.code', { code: task.code.join('-') });
      place();
    }
    if (built === task.phase) return;
    const was = built;
    built = task.phase;
    if (task.phase === 'coins') buildCoins(task);
    else if (task.phase === 'code') buildCode();
    else if (task.phase === 'prep') buildPrep();
    else if (task.phase === 'brew') buildBrew();
    else if (task.phase === 'done' && was !== 'brew') buildBrew();
    if (task.phase === 'done') sfx('ding');
  };

  /**
   * The window covers the belt, the mana bar and the sleeve; the ability button stays on top of its corner and the stage keeps clear of it
   * (the layout doesn't move mid-fight, so this is measured when the window opens).
   */
  const place = (): void => {
    const base = v.el.getBoundingClientRect();
    const ability = r.ability.getBoundingClientRect();
    const bottom = Math.max(ability.bottom, r.sleeve.getBoundingClientRect().bottom);
    el.style.top = `${Math.round(r.belt.getBoundingClientRect().top - base.top)}px`;
    el.style.bottom = `${Math.round(base.bottom - bottom)}px`;
    el.style.setProperty('--tk-gap', `${Math.round(base.right - ability.left)}px`);
  };

  return {
    render() {
      const task = combat.isOver ? null : combat.task;
      toggle(el, 'on', !!task);
      toggle(v.el, 'tasking', !!task);
      if (!task) {
        shown = null;
        built = null;
        return;
      }
      sync(task);
      const phase = task.phase;
      setText(refs.step, `${STEPS[phase]}/3`);
      setText(refs.msg, t(`task.coffee.step.${phase}`));
      toggle(refs.pay, 'cur', phase === 'coins');
      toggle(refs.code, 'cur', phase === 'code');
      toggle(refs.sugar, 'cur', phase === 'prep');
      if (phase === 'coins') {
        setText(refs.val, `${task.paid}/${task.price}`);
        for (const c of task.coins) coinEls.get(c.id)?.classList.toggle('gone', c.used);
      } else if (phase === 'code') {
        setText(refs.val, task.code.map((n, i) => (i < task.keysDone ? n : '_')).join(' '));
      } else if (phase === 'prep') {
        setText(refs.val, '');
        if (dialNum) setText(dialNum, task.dial);
        if (cup && spot) {
          toggle(cup, 'placed', task.cup);
          if (task.cup && cup.parentElement !== spot) spot.append(cup);
          cup.disabled = task.cup;
        }
      } else {
        const pct = Math.floor(task.brewed * 100);
        setText(refs.val, `${pct}%`);
        glass?.style.setProperty('--fill', (Math.ceil(task.brewed * FILL_STEPS) / FILL_STEPS).toFixed(3));
        if (glass) toggle(glass, 'pouring', phase === 'brew');
      }
    },
  };
}
