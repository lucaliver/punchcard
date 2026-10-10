import { t } from '../../core/i18n';
import { sfx } from '../../audio/sfx';
import { CONFIG } from '../../data/config';
import { canPullStrings, canRestructure, payRestructure, restructureCard, rollRestructure, type RunState } from '../../game/run';
import type { CardInst } from '../../game/types';
import type { Screen } from '../app';
import { h } from '../dom';
import { icon } from '../art/icons';
import { CARD_SHOW_MS, playCardChange } from '../components/cardShow';
import { openDeck } from '../components/modals';
import { closeRoom, roomOption, roomScene } from '../components/room';
import { runHud } from './journey';

/**
 * Restructuring: up to `restructureCards` deck cards are repositioned, each into another card of its rarity, from scratch.
 * Lateral Move is free and random; Pull Strings costs HP (once) and lets the player pick each new card out of a few.
 */
export function restructuringScreen(run: RunState, onDone: () => void): Screen {
  /** The cards this visit already moved: they stay where they landed. */
  const moved = new Set<number>();
  let left = CONFIG.restructureCards;
  let timer = 0;
  let hud = runHud(run);
  const options = h('div', { class: 'rest-options' });
  const movable = (): number => run.deck.filter((c) => !moved.has(c.uid) && canRestructure(run, c)).length;

  /** The card turns into `id`; the paid way takes its HP with the first card. */
  function move(card: CardInst, id: string, paid: boolean): void {
    if (paid && left === CONFIG.restructureCards) {
      payRestructure(run);
      const fresh = runHud(run);
      hud.replaceWith(fresh);
      hud = fresh;
    }
    const before = { ...card };
    const after = restructureCard(run, card.uid, id);
    if (!after) return;
    moved.add(after.uid);
    left--;
    playCardChange(el, before, { ...after }, t('restructure.moved'), { start: 'reshuffle', end: 'deckAdd' });
    if (!left || !movable()) {
      closeRoom(el, onDone, CARD_SHOW_MS);
      return;
    }
    options.querySelectorAll('button').forEach((b) => {
      b.disabled = true;
    });
    timer = window.setTimeout(() => next(paid), CARD_SHOW_MS);
  }

  /** The player picked the card to move: a random card takes its place, or a few are laid out to pick from. */
  function picked(card: CardInst, paid: boolean): void {
    if (!paid) {
      const [def] = rollRestructure(run, card.uid, 1);
      if (def) move(card, def.id, false);
      return;
    }
    const offer = rollRestructure(run, card.uid, CONFIG.restructureChoices).map((def, i): CardInst => ({ uid: -100 - i, id: def.id, up: false }));
    // Tapping outside leaves the card where it is: nothing is paid until a card has moved.
    openDeck(offer, { title: t('restructure.choose'), confirmLabel: t('restructure.take'), onPick: (c) => move(card, c.id, true) });
  }

  function pick(paid: boolean): void {
    sfx('tap');
    openDeck(run.deck, {
      title: t('restructure.pick'),
      confirmLabel: t('restructure.confirm'),
      filter: (c) => !moved.has(c.uid) && canRestructure(run, c),
      onPick: (c) => picked(c, paid),
    });
  }

  /** The two ways in. */
  function menu(): void {
    const free = movable() > 0;
    const paid = movable() >= CONFIG.restructureCards && canPullStrings(run);
    const paidDesc = !canPullStrings(run) ? t('restructure.weak') : t('restructure.none');
    options.replaceChildren(
      roomOption(
        icon('swap'),
        t('restructure.lateral'),
        free ? t('restructure.lateralDesc', { n: CONFIG.restructureCards }) : t('restructure.none'),
        !free,
        () => pick(false),
      ),
      roomOption(
        icon('bloodMoney'),
        t('restructure.strings'),
        paid ? t('restructure.stringsDesc', { hp: CONFIG.restructureHp, n: CONFIG.restructureCards, k: CONFIG.restructureChoices }) : paidDesc,
        !paid,
        () => pick(true),
      ),
    );
  }

  /** After the first card: the next one (the free way may stop here, the paid one is already paid for). */
  function next(paid: boolean): void {
    options.replaceChildren(
      roomOption(icon('swap'), t('restructure.next'), t('restructure.nextDesc'), false, () => pick(paid)),
      ...(paid ? [] : [roomOption(icon('check'), t('restructure.done'), t('restructure.doneDesc'), false, () => closeRoom(el, onDone, 0))]),
    );
  }

  const el = h(
    'div',
    { class: 'screen' },
    hud,
    h('h1', { class: 'h1', style: { marginTop: '12px' } }, t('restructure.title')),
    h('p', { class: 'sub' }, t('restructure.desc')),
    roomScene('restructuring'),
    options,
  );
  menu();
  return { el, leave: () => window.clearTimeout(timer) };
}
