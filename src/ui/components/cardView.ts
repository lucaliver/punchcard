import { t } from '../../core/i18n';
import { card } from '../../data/cards';
import type { CardInst } from '../../game/types';
import { artUrl } from '../art/sprites';
import { h } from '../dom';
import { cardChips, costText } from './cardText';

export interface CardViewOpts {
  /** Width in px (sets `--cw`); leave out to let the stylesheet's `--cw` decide. */
  width?: number;
  /** Show every chip, not just the first few. */
  full?: boolean;
  /** The cost to show (a keeper's discount), when it is not the card's own. */
  cost?: number;
}

/** The picture a card shows: the spirit's own drawing, or the charm's. */
export const cardArtId = (id: string): string => {
  const def = card(id);
  return def.kind === 'spirit' ? (def.spirit?.(false).art ?? id) : (def.art ?? id);
};

/**
 * A card, drawn as a paper talisman: a seal with the oil it costs, the picture, the name on a brush strip and the few numbers it plays with.
 * The element carries `data-kind`/`data-rarity`/`data-up`, and the screens toggle `.unaffordable`, `.armed`, `.lifting`.
 */
export function cardView(c: CardInst, opts: CardViewOpts = {}): HTMLElement {
  const def = card(c.id);
  const chips = cardChips(c, opts.full ? 6 : 3);
  const el = h(
    'div',
    {
      class: 'card',
      'data-kind': def.kind,
      'data-rarity': def.rarity,
      'data-up': c.up ? '1' : '0',
      'data-card': c.id,
      style: opts.width ? { '--cw': `${opts.width}px` } : undefined,
    },
    h('div', { class: 'c-art' }, h('img', { class: 'c-sprite', src: artUrl(cardArtId(c.id)), alt: '', draggable: 'false' })),
    h('div', { class: 'c-cost num' }, opts.cost !== undefined ? String(opts.cost) : costText(c)),
    h('div', { class: 'c-name' }, t(`card.${c.id}.name`)),
    h(
      'div',
      { class: 'c-chips' },
      ...chips.map((ch) => h('span', { class: 'c-chip num' }, h('img', { class: 'pico', src: artUrl(ch.icon), alt: '' }), ch.text)),
    ),
    c.up ? h('div', { class: 'c-up num' }, '+') : null,
    h('div', { class: 'c-gem' }),
  );
  return el;
}
