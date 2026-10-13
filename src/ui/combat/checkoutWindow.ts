import { sfx } from '../../audio/sfx';
import { type TKey, t } from '../../core/i18n';
import { CONFIG } from '../../data/config';
import { CheckoutLane, type Grocery } from '../../game/checkout';
import { icon } from '../art/icons';
import { h, retrigger, setText, toggle } from '../dom';
import { haptic } from '../fx/fx';
import { createTaskFrame } from './taskFrame';
import type { CombatView } from './view';

const ITEM_ICON: Record<Grocery, string> = {
  bread: 'groceryBread',
  milk: 'groceryMilk',
  apple: 'groceryApple',
  cheese: 'groceryCheese',
  soup: 'grocerySoup',
};
const ITEM_NAME: Record<Grocery, TKey> = {
  bread: 'task.checkout.item.bread',
  milk: 'task.checkout.item.milk',
  apple: 'task.checkout.item.apple',
  cheese: 'task.checkout.item.cheese',
  soup: 'task.checkout.item.soup',
};
/** What the machine says in each of its phases. */
const VOICE: Record<CheckoutLane['phase'], TKey> = {
  scan: 'task.checkout.scan',
  unexpected: 'task.checkout.unexpected',
  assist: 'task.checkout.assist',
  done: 'task.checkout.done',
};

/**
 * The Self-Checkout's chore (`MoveDef.task` = 'checkout'): a window over the belt and the sleeve with the basket, the bagging area and the machine's voice.
 * A tap on a grocery scans it into the bag; a tap on the bag lifts the last item out when the machine objects to it. It only draws `Combat.chore` and sends the taps to `Combat.checkout`.
 */
export function createCheckoutWindow(v: CombatView): { render(): void } {
  const { combat, state } = v;
  const frame = createTaskFrame(v, {
    cls: 'checkout-window',
    title: t('task.checkout.title'),
    body: `
      <div class="tk-machine">
        <div class="tk-lcd"><span class="tk-msg"></span><b class="tk-val"></b></div>
        <div class="tk-stage ck-stage">
          <div class="ck-alert"></div>
          <div class="ck-basket"></div>
          <i class="ck-wait"></i>
          <button class="ck-bag" aria-label="${t('task.checkout.bag')}"><small>${t('task.checkout.bag')}</small><span class="ck-bagged"></span></button>
        </div>
      </div>`,
  });
  const { el, q } = frame;
  const refs = {
    step: q('.tk-step'),
    msg: q('.tk-msg'),
    val: q('.tk-val'),
    alert: q('.ck-alert'),
    basket: q('.ck-basket'),
    wait: q('.ck-wait'),
    bag: q('.ck-bag'),
    bagged: q('.ck-bagged'),
  };

  /** The lane the window was built for, what the basket and the bag show now, and whether the receipt has been celebrated. */
  let shown: CheckoutLane | null = null;
  let basketKey = '';
  let bagKey = '';
  let celebrated = false;

  const blocked = (): boolean => state.paused || state.waiting || state.ended;
  const react = (res: ReturnType<typeof combat.checkout>): void => {
    if (res === 'ok') {
      sfx('tap');
      haptic('tap');
    } else if (res === 'wrong') {
      sfx('denied');
      retrigger(el, 'jolt');
    }
  };
  refs.basket.addEventListener('click', (ev) => {
    const item = (ev.target as HTMLElement).closest<HTMLElement>('.ck-item');
    if (item && !blocked()) react(combat.checkout({ kind: 'scan', item: Number(item.dataset.i) }));
  });
  refs.bag.addEventListener('click', () => {
    if (!blocked()) react(combat.checkout({ kind: 'lift' }));
  });

  const build = (lane: CheckoutLane): void => {
    shown = lane;
    basketKey = '';
    bagKey = '';
    celebrated = false;
    frame.place();
  };

  return {
    render() {
      const lane = !combat.isOver && combat.chore instanceof CheckoutLane ? combat.chore : null;
      if (!frame.sync(!!lane, lane?.phase === 'done') || !lane) {
        shown = null;
        return;
      }
      if (shown !== lane) build(lane);
      el.dataset.phase = lane.phase;
      if (lane.phase === 'done' && !celebrated) {
        celebrated = true;
        sfx('served');
        haptic('proc');
      }
      const key = lane.basket.join();
      if (key !== basketKey) {
        basketKey = key;
        refs.basket.replaceChildren(
          ...lane.basket.map((g, i) =>
            h('button', { class: 'ck-item', 'data-i': String(i), 'aria-label': t(ITEM_NAME[g]), html: icon(ITEM_ICON[g]) }),
          ),
        );
      }
      // The last item bagged is the one the machine objects to.
      const bagged = `${lane.bagged.join()}${lane.phase === 'unexpected' ? '!' : ''}`;
      if (bagged !== bagKey) {
        bagKey = bagged;
        refs.bagged.replaceChildren(
          ...lane.bagged.map((g, i) =>
            h('span', { class: `ck-in${lane.phase === 'unexpected' && i === lane.bagged.length - 1 ? ' flag' : ''}`, html: icon(ITEM_ICON[g]) }),
          ),
        );
      }
      setText(refs.step, t('task.checkout.step', { n: lane.bagged.length, total: lane.total }));
      setText(refs.msg, lane.phase === 'unexpected' ? t('task.checkout.lift') : t('task.checkout.basket'));
      setText(refs.val, String(lane.basket.length));
      setText(refs.alert, t(VOICE[lane.phase]));
      refs.wait.style.setProperty('--wait', String(lane.phase === 'assist' ? lane.wait / CONFIG.checkout.assist : 0));
      toggle(refs.bag, 'lift', lane.phase === 'unexpected');
    },
  };
}
