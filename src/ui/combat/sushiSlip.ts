import { t } from '../../core/i18n';
import { CARDS } from '../../data/cards';
import { SushiOrder } from '../../game/sushi';
import { icon } from '../art/icons';
import { h, retrigger, toggle } from '../dom';
import type { CombatView } from './view';

/** The letter on top of each slip: one per corner of the stage (`CONFIG.sushi.slips` is two). */
const SLIP_NAMES = ['A', 'B'];

/**
 * The Sushi Chef's chore (`MoveDef.task` = 'sushi'): his slips pinned over the stage's corners, each with the pieces (a dish on a coloured plate) to eat, in turn. Unlike the other chores
 * it covers nothing: the pieces ride the belt (`Combat.eat` is a tap on one), so it only draws `Combat.chore` and flashes on a mistake.
 */
export function createSushiSlip(v: CombatView): { render(): void } {
  const { combat, r } = v;
  const slips: HTMLElement[] = SLIP_NAMES.map((name, i) =>
    h('div', { class: `sushi-slip s${i}`, role: 'status', 'aria-label': t('task.sushi.title') }, h('b', { class: 'ss-bar' }, name)),
  );
  r.stage.append(...slips);

  /** The order the pieces were built for, one element per piece of each slip, and the mistakes already shown. */
  let shown: SushiOrder | null = null;
  let pieces: HTMLElement[][] = [];
  let errors = 0;

  const build = (order: SushiOrder): void => {
    shown = order;
    errors = 0;
    pieces = order.slips.map((slip) =>
      slip.map((p) => h('span', { class: 'ss-piece', 'data-plate': p.plate, title: t(`card.${p.id}.name`), html: icon(CARDS[p.id].art) })),
    );
    slips.forEach((el, i) => {
      if (pieces[i]) {
        el.replaceChildren(el.firstElementChild!, ...pieces[i]);
        retrigger(el, 'entering');
      }
    });
  };

  return {
    render() {
      const order = !combat.isOver && combat.chore instanceof SushiOrder ? combat.chore : null;
      slips.forEach((el, i) => {
        toggle(el, 'on', !!order && i < order.slips.length);
      });
      if (!order) {
        shown = null;
        return;
      }
      if (shown !== order) build(order);
      if (order.errors > errors) for (const el of slips) retrigger(el, 'jolt');
      errors = order.errors;
      slips.forEach((el, i) => {
        toggle(el, 'served', order.phase === 'done');
        pieces[i]?.forEach((p, k) => {
          toggle(p, 'eaten', k < order.eaten[i]);
          toggle(p, 'next', k === order.eaten[i]);
        });
      });
    },
  };
}
