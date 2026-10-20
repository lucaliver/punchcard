import { sfx } from '../../audio/sfx';
import { t } from '../../core/i18n';
import { CONFIG } from '../../data/config';
import { heal, removeCard, removePrice, type RunState, stockShop, takeCard, takeRelic } from '../../game/run';
import { type Screen, pico, toast } from '../app';
import { artUrl } from '../art/sprites';
import { openCardDetail } from '../components/cardShow';
import { cardView } from '../components/cardView';
import { openDeck } from '../components/deckView';
import { choice, leaveBtn, roomShell } from '../components/roomShell';
import { h } from '../dom';
import { relicTile } from './rooms';

export interface MarketOpts {
  run: RunState;
  onDone(): void;
  /** Called after any purchase so the run is saved. */
  onChange(): void;
}

/** The tanuki's market: five cards, two trinkets, a way to lose a card and a way to mend. */
export function marketScreen(o: MarketOpts): Screen {
  const { run } = o;
  const shop = run.shop ?? stockShop(run);
  const root = h('div', { class: 'market-body' });
  const wallet = h('span', { class: 'num' }, String(run.mon));

  const afford = (price: number): boolean => {
    if (run.mon >= price) return true;
    sfx('deny');
    toast(t('market.poor'));
    return false;
  };
  const spend = (price: number): void => {
    run.mon -= price;
    wallet.textContent = String(run.mon);
    sfx('buy');
    o.onChange();
  };

  const paint = (): void => {
    const cards = h(
      'div',
      { class: 'shop-cards' },
      ...shop.cards.map((sc) => {
        const cv = cardView(sc.card, { width: 82, full: true });
        const slot = h(
          'button',
          { class: `shop-card ${sc.sold ? 'sold' : ''}`.trim() },
          cv,
          sc.sold
            ? h('div', { class: 'sold-stamp title-font' }, t('market.sold'))
            : h('div', { class: `price ${run.mon < sc.price ? 'dear' : ''}`.trim() }, pico('coin'), String(sc.price)),
        );
        slot.addEventListener('click', () => {
          if (sc.sold) return;
          openCardDetail(sc.card, undefined, [
            {
              label: t('market.buy', { n: sc.price }),
              cls: 'gold',
              onClick: () => {
                if (!afford(sc.price)) return false;
                spend(sc.price);
                takeCard(run, sc.card);
                sc.sold = true;
                paint();
              },
            },
            { label: t('ui.close'), cls: 'paper' },
          ]);
        });
        return slot;
      }),
    );
    const relics = h(
      'div',
      { class: 'relic-row' },
      ...shop.relics.map((sr) =>
        sr.sold
          ? h('div', { class: 'relic-tile panel sold' }, h('div', { class: 'sold-stamp title-font' }, t('market.sold')))
          : relicTile(
              sr.id,
              () => {
                if (!afford(sr.price)) return;
                spend(sr.price);
                takeRelic(run, sr.id);
                sr.sold = true;
                paint();
              },
              sr.price,
            ),
      ),
    );
    const removeCost = removePrice(run);
    const services = h(
      'div',
      { class: 'choices' },
      choice({
        icon: 'jizo',
        name: t('market.remove'),
        text: t('market.removeText'),
        disabled: run.deck.length <= CONFIG.run.minDeck,
        note: `${removeCost} mon`,
        onClick: () => {
          if (!afford(removeCost)) return;
          openDeck({
            title: t('market.remove'),
            cards: run.deck,
            confirm: t('market.removeGo', { n: removeCost }),
            onPick: (c) => {
              if (!afford(removeCost)) return;
              if (removeCard(run, c.uid)) {
                spend(removeCost);
                sfx('burn');
                shop.removeCost = removePrice(run);
                paint();
              }
            },
          });
        },
      }),
      choice({
        icon: 'riceBall',
        name: t('market.mend'),
        text: t('market.mendText'),
        disabled: shop.healed || run.flame >= run.maxFlame,
        note: shop.healed ? t('market.sold') : `${shop.healCost} mon`,
        onClick: () => {
          if (!afford(shop.healCost)) return;
          spend(shop.healCost);
          heal(run, Math.ceil(run.maxFlame * 0.5));
          shop.healed = true;
          sfx('heal');
          paint();
        },
      }),
    );
    root.replaceChildren(
      h('div', { class: 'rw-head title-font' }, t('market.cards')),
      cards,
      h('div', { class: 'rw-head title-font' }, t('market.relics')),
      relics,
      h('div', { class: 'rw-head title-font' }, t('market.services')),
      services,
    );
  };
  paint();

  const scene = h(
    'div',
    { class: 'market-scene' },
    h('img', { class: 'merchant', src: artUrl('tanuki'), alt: '' }),
    h('div', { class: 'bubble' }, t('market.greeting')),
    h('div', { class: 'counter' }, h('span', { class: 'chip' }, pico('coin'), wallet)),
  );
  const el = roomShell({
    run,
    room: 'market',
    title: t('node.market'),
    sub: t('market.sub'),
    scene,
    body: root,
    foot: leaveBtn(o.onDone, t('market.leave')),
  });
  return { el };
}
