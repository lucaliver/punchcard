import { t, hasKey } from '../../core/i18n';
import { card } from '../../data/cards';
import { KEEPERS } from '../../data/keepers';
import { RELICS } from '../../data/relics';
import { CONFIG } from '../../data/config';
import type { CardInst, FoeDef, KeeperId, SpiritDef } from '../../game/types';
import { artUrl } from '../art/sprites';
import { cardView } from './cardView';
import { cardLines, effectLine, fmt, foeLines, rich, spiritLines } from './cardText';
import { type ModalAction, openModal } from '../app';
import { h } from '../dom';

/** The detail view of a card: the card itself, large, and what it does in words. */
export function openCardDetail(c: CardInst, onClose?: () => void, actions?: ModalAction[]): () => void {
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
  return openModal({ body, onClose, cls: 'detail-modal', actions });
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

/** A spirit on the field: what it is and what state it is in. */
export function openUnitDetail(
  cardId: string,
  def: SpiritDef,
  level: number,
  hp: number,
  maxHp: number,
  onClose?: () => void,
  actions?: ModalAction[],
): () => void {
  const lines = spiritLines(def).map((l) => h('li', { html: rich(l) }));
  if (level > 1) lines.unshift(h('li', { html: rich(t('stat.level', { n: level, pct: `${Math.round(CONFIG.levelGrowth * (level - 1) * 100)}%` })) }));
  const body = h(
    'div',
    { class: 'detail' },
    h('div', { class: 'detail-foe' }, h('img', { src: artUrl(def.art), alt: '' })),
    h('div', { class: 'detail-kind' }, `${t('stat.hp', { n: `${fmt(Math.ceil(hp))}/${fmt(maxHp)}` })}`),
    h('ul', { class: 'detail-lines' }, ...lines),
  );
  return openModal({ title: t(`card.${cardId}.name`), body, onClose, cls: 'detail-modal', actions });
}

/** The keeper's ability: what it does and how long it takes to come back. */
export function openAbilityDetail(id: KeeperId, cd: number, onClose?: () => void): () => void {
  const k = KEEPERS[id];
  const body = h(
    'div',
    { class: 'detail' },
    h('div', { class: 'detail-foe' }, h('img', { src: artUrl(id), alt: '' })),
    h(
      'ul',
      { class: 'detail-lines' },
      ...k.ability.fx.map((fx) => h('li', { html: rich(effectLine(fx)) })),
      h('li', {}, t('keepers.cooldown', { secs: fmt(Math.round(cd)) })),
    ),
  );
  return openModal({ title: t(`keeper.${id}.ability`), body, onClose, cls: 'detail-modal' });
}
