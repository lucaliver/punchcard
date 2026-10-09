import { t } from '../../core/i18n';
import { CARDS } from '../../data/cards';
import { SushiOrder } from '../../game/sushi';
import { icon } from '../art/icons';
import { h, retrigger, toggle } from '../dom';
import type { CombatView } from './view';

/**
 * The Sushi Chef's chore (`MoveDef.task` = 'sushi'): a kitchen slip over the stage's corner with the pieces to eat, in turn. Unlike the other chores it covers nothing:
 * the pieces ride the belt (`Combat.eat` is a tap on one), so it only draws `Combat.chore` and flashes on a mistake.
 */
export function createSushiSlip(v: CombatView): { render(): void } {
  const { combat, r } = v;
  const el = h(
    'div',
    { class: 'sushi-slip', role: 'status', 'aria-label': t('task.sushi.title') },
    h('b', { class: 'ss-bar' }, t('task.sushi.title')),
  );
  r.stage.append(el);

  /** The order the pieces were built for, one element per piece, and the mistakes already shown. */
  let shown: SushiOrder | null = null;
  let pieces: HTMLElement[] = [];
  let errors = 0;

  const build = (order: SushiOrder): void => {
    shown = order;
    errors = 0;
    pieces = order.order.map((id) => h('span', { class: 'ss-piece', title: t(`card.${id}.name`), html: icon(CARDS[id].art) }));
    el.replaceChildren(el.firstElementChild!, ...pieces);
    retrigger(el, 'entering');
  };

  return {
    render() {
      const order = !combat.isOver && combat.chore instanceof SushiOrder ? combat.chore : null;
      toggle(el, 'on', !!order);
      if (!order) {
        shown = null;
        return;
      }
      if (shown !== order) build(order);
      if (order.errors > errors) retrigger(el, 'jolt');
      errors = order.errors;
      toggle(el, 'served', order.phase === 'done');
      pieces.forEach((p, i) => {
        toggle(p, 'eaten', i < order.eaten);
        toggle(p, 'next', i === order.eaten);
      });
    },
  };
}
