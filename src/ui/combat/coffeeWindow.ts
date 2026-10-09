import { getLocale, t } from '../../core/i18n';
import { sfx } from '../../audio/sfx';
import { COFFEE_ITEMS, type CoffeeItem } from '../../data/coffee';
import { CONFIG } from '../../data/config';
import { CoffeeTask, type CoffeeAction, type CoffeePhase, type CoffeeResult } from '../../game/coffee';
import { icon } from '../art/icons';
import { h, retrigger, setText, toggle } from '../dom';
import { haptic } from '../fx/fx';
import { createTaskFrame } from './taskFrame';
import type { CombatView } from './view';

/** Pixels a touch has to travel before it counts as a drag and not a tap. */
const DRAG_PX = 8;
/** How far (px) past a drop target's edge a drop still counts. */
const DROP_SLACK = 14;
/** Steps of the cup filling up (motion is stepped). */
const FILL_STEPS = 20;
/** Sparks that fly off the served cup. */
const SPARKS = 8;
/** The window's four steps, in order (the pour and the served cup are still the fourth). */
const STEPS: Record<CoffeePhase, number> = { coins: 1, code: 2, place: 3, sugar: 4, brew: 4, done: 4 };
const STEP_COUNT = 4;
/** The icon of each thing on the tray. */
const ITEM_ICON: Record<CoffeeItem, string> = { cup: 'paperCup', spoon: 'spoon', fork: 'fork' };

/** Euro cents as the player's currency format (1.85). */
const money = (cents: number): string => new Intl.NumberFormat(getLocale(), { style: 'currency', currency: 'EUR' }).format(cents / 100);
/** What a coin's face says: the number, and `c` (cent) or the euro sign under it. */
const coinFace = (cents: number): string => (cents < 100 ? `<b>${cents}</b><small>c</small>` : `<b>${cents / 100}</b><small>€</small>`);
const PAD = Array.from({ length: CONFIG.coffee.keys }, (_, i) => i + 1);

/**
 * The Coffee Machine's chore (`MoveDef.task`): a window over the belt and the sleeve (the enemy, its move bar and your ability stay in view).
 * It only draws `Combat.chore` and sends the hand's moves to `Combat.coffee`; coins and the things on the tray can be dragged to their place or just tapped.
 */
export function createTaskWindow(v: CombatView): { render(): void } {
  const { combat, state } = v;
  const frame = createTaskFrame(v, {
    title: t('task.coffee.title'),
    body: `
      <div class="tk-note">
        <small>${t('task.coffee.order')}</small>
        <b class="tk-drink"></b>
        <span class="tk-pay"></span>
        <span class="tk-code"></span>
        <span class="tk-sugar"></span>
      </div>
      <div class="tk-machine">
        <div class="tk-lcd"><span class="tk-msg"></span><b class="tk-val"></b></div>
        <div class="tk-stage"></div>
      </div>`,
  });
  const { el, q } = frame;
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
  const itemEls = new Map<CoffeeItem, HTMLButtonElement>();
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
      const b = h('button', { class: 'tk-coin', 'data-v': coin.value, 'aria-label': money(coin.value), html: coinFace(coin.value) });
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

  /** The niche under the spout: whatever has been put there so far. */
  const buildNiche = (): HTMLElement => {
    spot = h('div', { class: 'tk-spot' });
    return h('div', { class: 'tk-niche' }, h('i', { class: 'tk-spout' }), spot);
  };

  const buildPlace = (): void => {
    const niche = buildNiche();
    itemEls.clear();
    const tray = h('div', { class: 'tk-tray' });
    for (const item of COFFEE_ITEMS) {
      const b = h('button', { class: 'tk-item', 'data-item': item, 'aria-label': t(`task.coffee.${item}`), html: icon(ITEM_ICON[item]) });
      bindDrag(
        b,
        () => spot,
        () => {
          if (send({ kind: 'item', item }, b) === 'ok') sfx('cup');
        },
      );
      itemEls.set(item, b);
      tray.append(b);
    }
    refs.stage.replaceChildren(h('div', { class: 'tk-place' }, niche, tray));
  };

  const buildSugar = (task: CoffeeTask): void => {
    const niche = buildNiche();
    spot!.append(...task.placed.map((item) => h('span', { class: 'tk-placed', html: icon(ITEM_ICON[item]) })));
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
    refs.stage.replaceChildren(h('div', { class: 'tk-sugar-step' }, niche, h('div', { class: 'tk-side' }, dial, start)));
  };

  /** The pour: a stream falls from the spout into the cup, which fills up in steps (the spoon sticks out of it); when it is served, steam rises. */
  const buildBrew = (): void => {
    glass = h(
      'div',
      { class: 'tk-brew' },
      h('i', { class: 'tk-spout' }),
      h('i', { class: 'tk-pour' }),
      h('div', { class: 'tk-cupbig' }, h('div', { class: 'tk-cupin' }, h('i', { class: 'tk-liquid' }))),
      h('span', { class: 'tk-spoon', html: icon('spoon') }),
      h('div', { class: 'tk-steam' }, h('i'), h('i'), h('i')),
      h('div', { class: 'tk-sparks' }, ...Array.from({ length: SPARKS }, (_, i) => h('i', { style: { '--a': `${(i * 360) / SPARKS}deg` } }))),
    );
    refs.stage.replaceChildren(glass);
  };

  /** Rebuilds the stage when the task or its phase changed (a phase only ever moves forward). */
  const sync = (task: CoffeeTask): void => {
    if (shown !== task) {
      shown = task;
      built = null;
      refs.drink.textContent = t(`drink.${task.drink}`);
      refs.sugar.textContent = t('task.coffee.sugar', { n: task.sugar });
      refs.pay.textContent = t('task.coffee.pay', { n: money(task.price) });
      refs.code.textContent = t('task.coffee.code', { code: task.code.join('-') });
      frame.place();
    }
    if (built === task.phase) return;
    const was = built;
    built = task.phase;
    if (task.phase === 'coins') buildCoins(task);
    else if (task.phase === 'code') buildCode();
    else if (task.phase === 'place') buildPlace();
    else if (task.phase === 'sugar') buildSugar(task);
    else if (task.phase === 'brew') buildBrew();
    else if (task.phase === 'done' && was !== 'brew') buildBrew();
    if (task.phase === 'done') sfx('served');
  };

  return {
    render() {
      const task = !combat.isOver && combat.chore instanceof CoffeeTask ? combat.chore : null;
      if (!frame.sync(!!task, task?.phase === 'done') || !task) {
        shown = null;
        built = null;
        return;
      }
      sync(task);
      const phase = task.phase;
      setText(refs.step, `${STEPS[phase]}/${STEP_COUNT}`);
      setText(refs.msg, t(`task.coffee.step.${phase}`));
      toggle(refs.pay, 'cur', phase === 'coins');
      toggle(refs.code, 'cur', phase === 'code');
      toggle(refs.sugar, 'cur', phase === 'sugar');
      if (phase === 'coins') {
        setText(refs.val, `${money(task.paid)} / ${money(task.price)}`);
        for (const c of task.coins) coinEls.get(c.id)?.classList.toggle('gone', c.used);
      } else if (phase === 'code') {
        setText(refs.val, task.code.map((n, i) => (i < task.keysDone ? n : '_')).join(' '));
      } else if (phase === 'place') {
        setText(refs.val, '');
        for (const [item, b] of itemEls) {
          const put = task.placed.includes(item);
          toggle(b, 'placed', put);
          b.disabled = put;
          if (put && b.parentElement !== spot) spot?.append(b);
        }
      } else if (phase === 'sugar') {
        setText(refs.val, '');
        if (dialNum) setText(dialNum, task.dial);
      } else {
        const pct = Math.floor(task.brewed * 100);
        setText(refs.val, `${pct}%`);
        glass?.style.setProperty('--fill', (Math.ceil(task.brewed * FILL_STEPS) / FILL_STEPS).toFixed(3));
        if (glass) {
          toggle(glass, 'pouring', phase === 'brew');
          toggle(glass, 'served', phase === 'done');
        }
      }
    },
  };
}
