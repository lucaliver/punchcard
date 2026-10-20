import { sfx } from '../../audio/sfx';
import { t } from '../../core/i18n';
import { CONFIG } from '../../data/config';
import { RELICS } from '../../data/relics';
import { canUpgrade, heal, restHeal, removeCard, type RunState, takeRelic, transformCard, upgradeCard, rollRelics } from '../../game/run';
import { type Screen, pico, toast } from '../app';
import { artUrl } from '../art/sprites';
import { openRelicDetail } from '../components/cardShow';
import { cardView } from '../components/cardView';
import { openDeck } from '../components/deckView';
import { choice, leaveBtn, roomShell } from '../components/roomShell';
import { h } from '../dom';

export interface RoomOpts {
  run: RunState;
  /** Saves the run and returns to the map. */
  onDone(): void;
}

/** A picture with the keeper in it, for the scenes. */
const keeperSprite = (run: RunState): HTMLElement => h('img', { class: 'scene-keeper', src: artUrl(run.keeper), alt: '' });

// ——— the campfire ———

export function restScreen(o: RoomOpts): Screen {
  const run = o.run;
  const body = h('div', { class: 'choices' });
  const foot = h('div', { class: 'foot-slot' });
  let used = false;
  const finish = (msg: string): void => {
    used = true;
    body.replaceChildren(h('div', { class: 'room-result panel' }, msg));
    foot.replaceChildren(leaveBtn(o.onDone));
    sfx('heal');
  };
  const heals = restHeal(run);
  body.append(
    choice({
      icon: 'teapot',
      name: t('rest.warm'),
      text: t('rest.warmText', { n: heals }),
      disabled: run.flame >= run.maxFlame,
      note: run.flame >= run.maxFlame ? t('rest.full') : undefined,
      onClick: () => {
        if (used) return;
        const n = heal(run, heals);
        finish(t('rest.warmDone', { n }));
      },
    }),
    choice({
      icon: 'whetstone',
      name: t('rest.sharpen'),
      text: t('rest.sharpenText'),
      disabled: !canUpgrade(run),
      onClick: () => {
        if (used) return;
        openDeck({
          title: t('rest.sharpen'),
          hint: t('rest.sharpenHint'),
          cards: run.deck,
          pickable: (c) => !c.up,
          confirm: t('rest.sharpenGo'),
          onPick: (c) => {
            if (upgradeCard(run, c.uid)) finish(t('rest.sharpenDone', { name: t(`card.${c.id}.name`) }));
          },
        });
      },
    }),
  );
  const scene = h(
    'div',
    { class: 'fire-scene' },
    h('div', { class: 'fire-glow' }),
    h('div', { class: 'fire' }, pico('flame', 'f1'), pico('flame', 'f2'), pico('flame', 'f3')),
    h('div', { class: 'logs' }),
    keeperSprite(run),
    h('div', { class: 'sparks' }, ...Array.from({ length: 8 }, (_, i) => h('i', { style: { '--i': String(i) } }))),
  );
  const el = roomShell({ run, room: 'rest', title: t('node.rest'), sub: t('rest.sub'), scene, body, foot });
  return { el };
}

// ——— the forgotten shrine ———

export function shrineScreen(o: RoomOpts): Screen {
  const run = o.run;
  const body = h('div', { class: 'choices' });
  const foot = h('div', { class: 'foot-slot' });
  let used = false;
  const finish = (msg: string, result?: HTMLElement): void => {
    used = true;
    body.replaceChildren(h('div', { class: 'room-result panel' }, msg, result ?? null));
    foot.replaceChildren(leaveBtn(o.onDone));
  };
  const canRemove = run.deck.length > CONFIG.run.minDeck;
  body.append(
    choice({
      icon: 'jizo',
      name: t('shrine.letGo'),
      text: t('shrine.letGoText'),
      disabled: !canRemove,
      note: canRemove ? undefined : t('shrine.deckSmall', { n: CONFIG.run.minDeck }),
      onClick: () => {
        if (used) return;
        openDeck({
          title: t('shrine.letGo'),
          hint: t('shrine.letGoHint'),
          cards: run.deck,
          confirm: t('shrine.letGoGo'),
          onPick: (c) => {
            if (removeCard(run, c.uid)) {
              sfx('burn');
              finish(t('shrine.letGoDone', { name: t(`card.${c.id}.name`) }));
            }
          },
        });
      },
    }),
    choice({
      icon: 'henge',
      name: t('shrine.change'),
      text: t('shrine.changeText'),
      onClick: () => {
        if (used) return;
        openDeck({
          title: t('shrine.change'),
          hint: t('shrine.changeHint'),
          cards: run.deck,
          confirm: t('shrine.changeGo'),
          onPick: (c) => {
            const next = transformCard(run, c.uid);
            if (!next) return toast(t('shrine.noChange'));
            sfx('merge');
            finish(
              t('shrine.changeDone', { from: t(`card.${c.id}.name`), to: t(`card.${next.id}.name`) }),
              h('div', { class: 'result-card' }, cardView(next, { width: 96 })),
            );
          },
        });
      },
    }),
  );
  const scene = h(
    'div',
    { class: 'shrine-scene' },
    h('div', { class: 'shrine-glow' }),
    h('img', { class: 'sh-toro l', src: artUrl('toro'), alt: '' }),
    h('img', { class: 'sh-torii', src: artUrl('torii'), alt: '' }),
    h('img', { class: 'sh-toro r', src: artUrl('toro'), alt: '' }),
    h('img', { class: 'sh-jizo', src: artUrl('jizo'), alt: '' }),
  );
  const el = roomShell({ run, room: 'shrine', title: t('node.shrine'), sub: t('shrine.sub'), scene, body, foot });
  return { el };
}

// ——— the hidden cache ———

export function treasureScreen(o: RoomOpts): Screen {
  const run = o.run;
  const body = h('div', { class: 'choices' });
  const foot = h('div', { class: 'foot-slot' });
  const chest = h('div', { class: 'chest' }, pico('nodeTreasure'));
  const scene = h('div', { class: 'chest-scene' }, h('div', { class: 'chest-glow' }), chest);
  let opened = false;
  const open = (): void => {
    if (opened) return;
    opened = true;
    chest.classList.add('open');
    sfx('stamp');
    const ids = rollRelics(run, 3);
    body.replaceChildren(
      h(
        'div',
        { class: 'relic-row' },
        ...ids.map((id) =>
          relicTile(id, () => {
            takeRelic(run, id);
            sfx('buy');
            body.replaceChildren(h('div', { class: 'room-result panel' }, t('treasure.took', { name: t(`relic.${id}.name`) })));
            foot.replaceChildren(leaveBtn(o.onDone));
          }),
        ),
      ),
    );
    if (!ids.length) {
      body.replaceChildren(h('div', { class: 'room-result panel' }, t('treasure.empty')));
      foot.replaceChildren(leaveBtn(o.onDone));
    }
  };
  body.append(choice({ icon: 'nodeTreasure', name: t('treasure.open'), text: t('treasure.openText'), onClick: open }));
  chest.addEventListener('click', open);
  const el = roomShell({ run, room: 'treasure', title: t('node.treasure'), sub: t('treasure.sub'), scene, body, foot });
  return { el };
}

/** A trinket on offer: its picture and name, a tap to inspect and a button to take it. */
export function relicTile(id: string, onTake: () => void, price?: number, disabled = false): HTMLElement {
  const def = RELICS[id];
  const take = h(
    'button',
    { class: 'btn small gold', disabled, onclick: onTake },
    price !== undefined ? pico('coin') : null,
    price !== undefined ? String(price) : t('ui.take'),
  );
  const tile = h(
    'div',
    { class: 'relic-tile panel', 'data-rarity': def.rarity },
    h('button', { class: 'rt-pic', onclick: () => openRelicDetail(id) }, h('img', { src: artUrl(def.art), alt: '' })),
    h('div', { class: 'rt-name title-font' }, t(`relic.${id}.name`)),
    h('div', { class: 'rt-text' }, t(`relic.${id}.d`, { n: def.n, m: def.m ?? 0 })),
    take,
  );
  return tile;
}
