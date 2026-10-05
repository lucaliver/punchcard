import { t } from '../../core/i18n';
import { sfx } from '../../audio/sfx';
import { RELICS } from '../../data/relics';
import type { RunLog } from '../../game/types';
import type { ModalHandle } from '../app';
import { openModal } from '../app';
import { creature } from '../art/creatures';
import { relicArt } from '../art/relics';
import { h, onPress, stagger } from '../dom';
import { cardView } from './cardView';
import { groupCopies, openCardDetail, sortCards } from './modals';
import { slipRows } from './shareSlip';

/** A run of the handbook's history, opened: its payslip, the stationery it had and the deck it ended with. */
export function openRunDetail(r: RunLog): ModalHandle {
  sfx('tap');
  const rows = slipRows({ floor: r.floor, kills: r.kills, elites: r.elites, cards: r.cards, memos: r.memos, pay: r.pay, damage: r.damageTaken });
  const hero = t(`hero.${r.hero}.name`);
  const slip = h(
    'div',
    { class: 'payslip run-slip' },
    h('div', { class: 'slip-head' }, h('b', null, t('end.slip.title')), h('span', null, t('end.slip.company'))),
    h('div', { class: 'slip-sub' }, t('end.slip.employee', { hero, a: r.act, n: r.floor })),
    ...rows.map((row) =>
      h('div', { class: `slip-row ${row.kind === 'row' ? '' : `slip-${row.kind}`}` }, h('span', null, row.label), h('b', null, row.value)),
    ),
    h('div', { class: 'slip-stamp' }, r.result === 'win' ? t('end.slip.paid') : t('end.slip.void')),
  );
  const relics = r.relics.map((id) =>
    h('div', { class: 'hero-feature', html: `${relicArt(id)}<div><b>${t(`relic.${id}.name`)}</b>${t(`relic.${id}.d`, { n: RELICS[id].n })}</div>` }),
  );
  const deck = groupCopies(sortCards(r.deck.map((c, i) => ({ ...c, uid: i }))));
  const grid = h(
    'div',
    { class: 'deck-grid' },
    ...stagger(
      deck.map(({ card, n }) => {
        const el = cardView(card);
        if (n > 1) el.append(h('span', { class: 'copies' }, t('deck.copies', { n })));
        onPress(el, () => {
          sfx('tap');
          openCardDetail(card);
        });
        return el;
      }),
    ),
  );
  return openModal({
    body: h(
      'div',
      { class: 'run-detail' },
      h('div', {
        class: 'sheet-head',
        html: `<div class="sheet-art">${creature(r.hero)}</div><div><h3>${hero}</h3><span>${t(`history.${r.result}`)}</span></div>`,
      }),
      slip,
      ...(relics.length ? [h('h4', { class: 'sheet-relics' }, t('hero.relics')), h('div', { class: 'hero-features' }, ...relics)] : []),
      h('h4', { class: 'sheet-relics' }, t('history.deck', { n: r.deck.length })),
      grid,
    ),
    actions: [{ label: t('common.close'), cls: 'secondary' }],
  });
}
