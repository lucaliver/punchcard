import { sfx } from '../../audio/sfx';
import { t } from '../../core/i18n';
import { CONFIG } from '../../data/config';
import { type RewardOffer, type RunState, takeCard, takeRelic } from '../../game/run';
import type { CardInst } from '../../game/types';
import { type Screen, pico } from '../app';
import { openCardDetail } from '../components/cardShow';
import { cardView } from '../components/cardView';
import { h, setText } from '../dom';
import { relicTile } from './rooms';

export interface RewardOpts {
  run: RunState;
  offer: RewardOffer;
  onDone(): void;
  /** Called after each choice, so the run is saved with it. */
  onChange(): void;
}

/** After a won fight: the receipt, a trinket if one is owed, and a card to take or skip. */
export function rewardScreen(o: RewardOpts): Screen {
  const { run, offer } = o;
  const kindName = t(`reward.${offer.kind}`);
  const base = offer.mon - offer.bonus;
  const monShown = h('span', { class: 'num' }, '0');
  const receipt = h(
    'div',
    { class: 'receipt panel' },
    h('div', { class: 'rc-line' }, h('span', {}, kindName), h('span', { class: 'num' }, `+${base}`)),
    offer.bonus > 0 ? h('div', { class: 'rc-line' }, h('span', {}, t('reward.bonus')), h('span', { class: 'num' }, `+${offer.bonus}`)) : null,
    h('div', { class: 'rc-total' }, pico('coin'), monShown, h('span', {}, t('reward.mon'))),
  );

  // count the mon up, a tick at a time
  const target = offer.mon;
  let shown = 0;
  const tick = setInterval(() => {
    shown = Math.min(target, shown + Math.max(1, Math.round(target / 18)));
    setText(monShown, shown);
    if (shown % 3 === 0) sfx('coin');
    if (shown >= target) clearInterval(tick);
  }, 45);

  const foot = h('div', { class: 'foot-slot' });
  const cardsRow = h('div', { class: 'reward-cards' });
  const relicsBox = h('div', { class: 'reward-relics' });
  let relicDone = offer.relics.length === 0;
  let cardDone = offer.taken;
  let chosen: CardInst | null = null;
  const refreshFoot = (): void => {
    foot.replaceChildren(
      cardDone && relicDone
        ? h(
            'button',
            {
              class: 'btn big',
              onclick: () => {
                clearInterval(tick);
                o.onDone();
              },
            },
            t('ui.continue'),
          )
        : h('div', { class: 'reward-wait' }, !relicDone ? t('reward.pickRelic') : t('reward.pickCard')),
    );
  };

  // trinkets: an elite leaves one, a boss lets the keeper pick among three
  if (offer.relics.length) {
    const many = offer.relics.length > 1;
    relicsBox.append(h('div', { class: 'rw-head title-font' }, many ? t('reward.relicsHead') : t('reward.relicHead')));
    const row = h('div', { class: 'relic-row' });
    for (const id of offer.relics) {
      row.append(
        relicTile(id, () => {
          takeRelic(run, id);
          offer.relics = [];
          o.onChange();
          sfx('buy');
          relicDone = true;
          row.replaceChildren(h('div', { class: 'room-result panel' }, t('treasure.took', { name: t(`relic.${id}.name`) })));
          refreshFoot();
        }),
      );
    }
    relicsBox.append(row);
  }

  // cards
  const takeBtn = h('button', { class: 'btn gold', disabled: true }, t('reward.take'));
  const skipBtn = h('button', { class: 'btn paper small' }, t('reward.skip', { n: CONFIG.run.skipPay }));
  const elems = new Map<number, HTMLElement>();
  if (!offer.taken) {
    for (const c of offer.cards) {
      const el = cardView(c, { width: 96, full: true });
      el.classList.add('reward-card');
      let timer = 0;
      let held = false;
      el.addEventListener('pointerdown', () => {
        held = false;
        timer = window.setTimeout(() => {
          held = true;
          openCardDetail(c);
        }, CONFIG.longPressMs);
      });
      for (const ev of ['pointerup', 'pointerleave', 'pointercancel']) el.addEventListener(ev, () => clearTimeout(timer));
      el.addEventListener('click', () => {
        if (held) return;
        chosen = c;
        sfx('pick');
        for (const [uid, e] of elems) e.classList.toggle('chosen', uid === c.uid);
        takeBtn.disabled = false;
      });
      elems.set(c.uid, el);
      cardsRow.append(el);
    }
    takeBtn.addEventListener('click', () => {
      if (!chosen) return;
      takeCard(run, chosen);
      offer.taken = true;
      o.onChange();
      cardDone = true;
      sfx('buy');
      cardsRow.replaceChildren(h('div', { class: 'room-result panel' }, t('reward.took', { name: t(`card.${chosen.id}.name`) })));
      actions.remove();
      refreshFoot();
    });
    skipBtn.addEventListener('click', () => {
      run.mon += CONFIG.run.skipPay;
      offer.taken = true;
      o.onChange();
      cardDone = true;
      sfx('coin');
      cardsRow.replaceChildren(h('div', { class: 'room-result panel' }, t('reward.skipped', { n: CONFIG.run.skipPay })));
      actions.remove();
      refreshFoot();
    });
  } else {
    cardsRow.append(h('div', { class: 'room-result panel' }, t('reward.alreadyTaken')));
  }
  const actions = h('div', { class: 'reward-actions' }, takeBtn, skipBtn);
  refreshFoot();

  const el = h(
    'div',
    { class: 'screen room reward', 'data-act': run.act },
    h(
      'div',
      { class: 'room-head' },
      h('div', { class: 'room-title title-font' }, t('reward.title')),
      h('div', { class: 'room-sub' }, t('reward.sub')),
    ),
    h(
      'div',
      { class: 'room-body scroll' },
      receipt,
      relicsBox,
      h('div', { class: 'rw-head title-font' }, t('reward.cardsHead')),
      cardsRow,
      offer.taken ? null : actions,
    ),
    h('div', { class: 'room-foot' }, foot),
  );
  return {
    el,
    leave() {
      clearInterval(tick);
    },
  };
}
