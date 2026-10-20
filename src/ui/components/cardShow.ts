import { t, hasKey } from '../../core/i18n';
import { card } from '../../data/cards';
import { RELICS } from '../../data/relics';
import { FOES } from '../../data/foes';
import type { CardInst, FoeDef } from '../../game/types';
import { artUrl } from '../art/sprites';
import { cardArtId, cardView } from './cardView';
import { cardLines, foeLines, rich } from './cardText';
import { openModal } from '../app';
import { h } from '../dom';

/** The detail view of a card: the card itself, large, and what it does in words. */
export function openCardDetail(c: CardInst, onClose?: () => void): () => void {
  const def = card(c.id);
  const big = cardView(c, { width: 150, full: true });
  const lines = cardLines(c).map((l) => h('li', { html: rich(l) }));
  const flavor = hasKey(`card.${c.id}.flavor`) ? h('p', { class: 'flavor' }, t(`card.${c.id}.flavor`)) : null;
  const body = h(
    'div',
    { class: 'detail' },
    h('div', { class: 'detail-card' }, big),
    h('div', { class: 'detail-kind' }, `${t(`kind.${def.kind}`)} · ${t(`rarity.${def.rarity}`)}`),
    h('ul', { class: 'detail-lines' }, ...lines),
    flavor,
  );
  return openModal({ body, onClose, cls: 'detail-modal' });
}

/** A foe's page: its picture and what it does. */
export function openFoeDetail(def: FoeDef, hpMul = 1, onClose?: () => void): () => void {
  const body = h(
    'div',
    { class: 'detail' },
    h('div', { class: 'detail-foe' }, h('img', { src: artUrl(def.art), alt: '' })),
    h('div', { class: 'detail-kind' }, t(`tier.${def.tier}`)),
    h('ul', { class: 'detail-lines' }, ...foeLines(def, hpMul).map((l) => h('li', { html: rich(l) }))),
    hasKey(`foe.${def.id}.lore`) ? h('p', { class: 'flavor' }, t(`foe.${def.id}.lore`)) : null,
  );
  return openModal({ title: t(`foe.${def.id}.name`), body, onClose, cls: 'detail-modal' });
}

export function openRelicDetail(id: string, onClose?: () => void): () => void {
  const def = RELICS[id];
  const body = h(
    'div',
    { class: 'detail' },
    h('div', { class: 'detail-foe' }, h('img', { src: artUrl(def.art), alt: '' })),
    h('div', { class: 'detail-kind' }, t(`rarity.${def.rarity}`)),
    h('p', { html: rich(t(`relic.${id}.d`, { n: def.n })) }),
  );
  return openModal({ title: t(`relic.${id}.name`), body, onClose, cls: 'detail-modal' });
}

export { cardArtId, FOES };
