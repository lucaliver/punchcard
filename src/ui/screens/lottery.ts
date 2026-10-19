import { sfx } from '../../audio/sfx';
import { Rng, randomSeed } from '../../core/rng';
import { t } from '../../core/i18n';
import { canScratch, finishLottery, type RunState, type ScratchKind, type ScratchResult, scratchCost, scratchCard } from '../../game/run';
import type { Screen } from '../app';
import { icon } from '../art/icons';
import { CARD_SHOW_MS, playCardChange, playRelic } from '../components/cardShow';
import { closeRoom, roomOption, roomScene } from '../components/room';
import { h, setText } from '../dom';
import { haptic } from '../fx/fx';
import { runHud } from './journey';
import { HEAL_ANIM_MS, playHealing } from './rest';

/** The three symbols a card shows under its silver: three alike is a prize (which one says what), anything else is nothing. */
const SYMBOLS: Record<ScratchKind, [string, string, string]> = {
  jackpot: ['star', 'star', 'star'],
  upgrade: ['upgrade', 'upgrade', 'upgrade'],
  heal: ['heart', 'heart', 'heart'],
  blank: ['skull', 'heart', 'star'],
};
/** Milliseconds between two cells scratched off, and the wait before the result is acted on. */
const CELL_MS = 380;
const SETTLE_MS = 500;

/**
 * The weekend's Corner Shop: a pack of scratch cards, the first one free and each one after it paid for in blood. What is under the silver comes from `scratchCard` (the engine decides, the picture follows).
 * Nothing is saved until the room ends, like the other rooms.
 */
export function lotteryScreen(run: RunState, onDone: () => void): Screen {
  const timers: number[] = [];
  let scratched = 0;
  let busy = false;

  const cells = [0, 1, 2].map(() => h('i', { class: 'sc-cell covered' }));
  const card = h('div', { class: 'sc-card' }, h('b', { class: 'sc-title' }, t('lottery.card')), h('div', { class: 'sc-row' }, ...cells));
  const verdict = h('p', { class: 'sub sc-verdict' }, t('lottery.ready'));

  const buy: HTMLButtonElement = roomOption(icon('scratchCard'), '', '', false, () => scratch());
  const label = (): void => {
    const cost = scratchCost(run, scratched);
    buy.querySelector('b')!.textContent = scratched ? t('lottery.again') : t('lottery.first');
    buy.querySelector('span')!.textContent = cost ? t('lottery.cost', { n: cost, left: 3 - scratched }) : t('lottery.free');
    buy.disabled = busy || !canScratch(run, scratched);
  };
  const leave = h(
    'button',
    {
      class: 'secondary',
      onclick: () => {
        finishLottery(run);
        closeRoom(el, onDone, 200);
      },
    },
    t('lottery.leave'),
  );

  const later = (fn: () => void, ms: number): void => void timers.push(window.setTimeout(fn, ms));

  /** What the card brought, said and shown. */
  const award = (res: ScratchResult): number => {
    switch (res.kind) {
      case 'jackpot':
        if (res.relic) playRelic(el, res.relic, { start: 'chomp', end: 'jingle' });
        return CARD_SHOW_MS;
      case 'upgrade':
        (res.upgraded ?? []).forEach(({ before, after }, i) => {
          const show = (): void => playCardChange(el, before, after, t('rest.upgraded'), { start: 'anvil', end: 'levelUp' });
          if (i) later(show, i * CARD_SHOW_MS);
          else show();
        });
        return Math.max(1, res.upgraded?.length ?? 1) * CARD_SHOW_MS;
      case 'heal':
        playHealing(el, res.healed ?? 0);
        return HEAL_ANIM_MS;
      case 'blank':
        sfx('denied');
        return 400;
    }
  };

  function scratch(): void {
    if (busy || !canScratch(run, scratched)) return;
    busy = true;
    const res = scratchCard(run, scratched, new Rng(randomSeed()));
    scratched++;
    label();
    for (const c of cells) c.className = 'sc-cell covered';
    setText(verdict, t('lottery.scratching'));
    cells.forEach((c, i) => {
      later(() => {
        c.className = `sc-cell ${i === 2 && res.kind !== 'blank' ? 'win' : ''}`;
        c.innerHTML = icon(SYMBOLS[res.kind][i]);
        sfx('scrub');
        haptic('tap');
      }, i * CELL_MS);
    });
    later(
      () => {
        setText(verdict, `${t(`lottery.${res.kind}`)} ${t(`lottery.${res.kind}.d`, { n: res.upgraded?.length ?? res.healed ?? 0 })}`);
        const ms = award(res);
        later(() => {
          busy = false;
          label();
          // The pack is used up, or the hero couldn't pay for another card: the shop closes behind them.
          if (!canScratch(run, scratched)) leave.click();
        }, ms);
      },
      cells.length * CELL_MS + SETTLE_MS,
    );
  }
  label();

  const el = h(
    'div',
    { class: 'screen' },
    runHud(run),
    h('h1', { class: 'h1', style: { marginTop: '12px' } }, t('lottery.title')),
    h('p', { class: 'sub' }, t('lottery.desc')),
    roomScene('lottery'),
    card,
    verdict,
    h('div', { class: 'rest-options' }, buy),
    leave,
  );
  return {
    el,
    leave: () => {
      for (const id of timers) window.clearTimeout(id);
    },
  };
}
