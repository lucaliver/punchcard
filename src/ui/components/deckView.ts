import { t } from '../../core/i18n';
import { card } from '../../data/cards';
import { CONFIG } from '../../data/config';
import type { CardInst } from '../../game/types';
import { openModal } from '../app';
import { h } from '../dom';
import { openCardDetail } from './cardShow';
import { cardView } from './cardView';

export interface DeckOpts {
  title: string;
  cards: readonly CardInst[];
  /** Cards that cannot be picked are shown dimmed. */
  pickable?: (c: CardInst) => boolean;
  /** Called with the card picked (the view closes). Without it the deck is only to look at. */
  onPick?: (c: CardInst) => void;
  /** The label of the button that confirms a pick. */
  confirm?: string;
  /** Shown under the title. */
  hint?: string;
  onClose?: () => void;
}

const ORDER = { spirit: 0, charm: 1 } as const;

/** The deck laid out on the table: a grid of cards. Tap one to look at it; when picking, tap to choose and confirm. */
export function openDeck(o: DeckOpts): () => void {
  const sorted = [...o.cards].sort(
    (a, b) => ORDER[card(a.id).kind] - ORDER[card(b.id).kind] || card(a.id).cost - card(b.id).cost || a.id.localeCompare(b.id),
  );
  let chosen: CardInst | null = null;
  const confirmBtn = h('button', { class: 'btn red small', disabled: true }, o.confirm ?? t('ui.choose'));
  const grid = h('div', { class: 'deck-grid' });
  const cells = new Map<number, HTMLElement>();
  let close = (): void => {};
  for (const c of sorted) {
    const ok = o.pickable ? o.pickable(c) : true;
    const cell = h('button', { class: `deck-cell ${ok ? '' : 'dim'}`.trim() }, cardView(c, { width: 74 }));
    cell.addEventListener('click', () => {
      if (!o.onPick || !ok) {
        openCardDetail(c);
        return;
      }
      chosen = c;
      for (const [uid, e] of cells) e.classList.toggle('chosen', uid === c.uid);
      confirmBtn.disabled = false;
    });
    let timer = 0;
    cell.addEventListener('pointerdown', () => {
      timer = window.setTimeout(() => {
        timer = -1;
        openCardDetail(c);
      }, CONFIG.longPressMs);
    });
    for (const ev of ['pointerup', 'pointerleave', 'pointercancel']) cell.addEventListener(ev, () => clearTimeout(timer));
    cell.addEventListener('click', (e) => {
      if (timer === -1) e.stopImmediatePropagation();
      timer = 0;
    });
    cells.set(c.uid, cell);
    grid.append(cell);
  }
  confirmBtn.addEventListener('click', () => {
    if (!chosen) return;
    const pick = chosen;
    close();
    o.onPick?.(pick);
  });
  const body = h(
    'div',
    { class: 'deck-view' },
    o.hint ? h('div', { class: 'deck-hint' }, o.hint) : null,
    h('div', { class: 'deck-scroll scroll' }, grid),
    h('div', { class: 'deck-count' }, t('ui.deckCount', { n: o.cards.length })),
  );
  close = openModal({
    title: o.title,
    body,
    cls: 'deck-modal',
    actions: [...(o.onPick ? [] : []), { label: o.onPick ? t('ui.cancel') : t('ui.close'), cls: 'paper' }],
    onClose: o.onClose,
  });
  if (o.onPick) {
    const actions = body.closest('.modal')?.querySelector('.actions');
    actions?.prepend(confirmBtn);
  }
  return close;
}
