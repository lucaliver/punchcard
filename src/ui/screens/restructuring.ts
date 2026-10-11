import { t } from '../../core/i18n';
import { sfx } from '../../audio/sfx';
import { CONFIG } from '../../data/config';
import { canGiftRelic, canRestructure, giftRelic, restructure, type RunState } from '../../game/run';
import type { Screen } from '../app';
import { h } from '../dom';
import { icon } from '../art/icons';
import { CARD_SHOW_MS, playCardChange, playRelic } from '../components/cardShow';
import { openDeck } from '../components/modals';
import { closeRoom, roomOption, roomScene } from '../components/room';
import { runHud } from './journey';

/**
 * Restructuring: pick `restructureCards` deck cards and they turn into random cards of any rarity, from scratch,
 * or take a random stationery and leave the deck as it is.
 */
export function restructuringScreen(run: RunState, onDone: () => void): Screen {
  const timers: number[] = [];
  const movable = run.deck.filter((c) => canRestructure(run, c)).length;
  const options = h('div', { class: 'rest-options' });

  /** The picked cards turn into other ones, shown one after the other. */
  function transform(uids: number[]): void {
    const moved = restructure(run, uids);
    moved.forEach(({ before, after }, i) => {
      const show = (): void => playCardChange(el, before, { ...after }, t('restructure.moved'), { start: 'reshuffle', end: 'deckAdd' });
      if (i) timers.push(window.setTimeout(show, i * CARD_SHOW_MS));
      else show();
    });
    closeRoom(el, onDone, Math.max(1, moved.length) * CARD_SHOW_MS);
  }

  function pickCards(): void {
    sfx('tap');
    openDeck(run.deck, {
      title: t('restructure.pick', { n: Math.min(CONFIG.restructureCards, movable) }),
      confirmLabel: t('restructure.confirm'),
      filter: (c) => canRestructure(run, c),
      count: CONFIG.restructureCards,
      onPickMany: (cards) => transform(cards.map((c) => c.uid)),
    });
  }

  function gift(): void {
    sfx('tap');
    const id = giftRelic(run);
    if (!id) return;
    playRelic(el, id, { start: 'chomp', end: 'jingle' });
    closeRoom(el, onDone, CARD_SHOW_MS);
  }

  options.append(
    roomOption(
      icon('swap'),
      t('restructure.lateral'),
      movable ? t('restructure.lateralDesc', { n: Math.min(CONFIG.restructureCards, movable) }) : t('restructure.none'),
      !movable,
      pickCards,
    ),
    roomOption(
      icon('stapler'),
      t('restructure.gift'),
      canGiftRelic(run) ? t('restructure.giftDesc') : t('restructure.giftNone'),
      !canGiftRelic(run),
      gift,
    ),
  );

  const el = h(
    'div',
    { class: 'screen' },
    runHud(run),
    h('h1', { class: 'h1', style: { marginTop: '12px' } }, t('restructure.title')),
    h('p', { class: 'sub' }, t('restructure.desc')),
    roomScene('restructuring'),
    options,
  );
  return {
    el,
    leave: () => {
      for (const id of timers) window.clearTimeout(id);
    },
  };
}
