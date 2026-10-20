import { t } from '../../core/i18n';
import { KEEPERS, KEEPER_IDS } from '../../data/keepers';
import { isUnlocked } from '../../game/meta';
import type { KeeperId } from '../../game/types';
import { type Screen, pico } from '../app';
import { artUrl } from '../art/sprites';
import { effectLine, fmt, rich } from '../components/cardText';
import { cardView } from '../components/cardView';
import { h } from '../dom';

export interface KeeperOpts {
  onPick(k: KeeperId): void;
  onBack(): void;
}

const UNLOCK_HINT: Record<KeeperId, string> = { miko: '', ronin: 'keepers.unlock.ronin', tanuki: 'keepers.unlock.tanuki' };

function passiveText(id: KeeperId): string {
  const p = KEEPERS[id].passive;
  const n = p.k === 'hardy' ? Math.round(p.n * 100) : p.n;
  return t(`keeper.${id}.passive.d`, { n });
}

function page(id: KeeperId): HTMLElement {
  const k = KEEPERS[id];
  const locked = !isUnlocked(id);
  const counts = new Map<string, number>();
  for (const c of k.deck) counts.set(c, (counts.get(c) ?? 0) + 1);
  const deck = h(
    'div',
    { class: 'k-deck' },
    ...[...counts.entries()].map(([cid, n]) => {
      const cv = cardView({ uid: 0, id: cid, up: false }, { width: 54 });
      return h('div', { class: 'k-card' }, cv, n > 1 ? h('span', { class: 'num k-n' }, `×${n}`) : null);
    }),
  );
  return h(
    'section',
    { class: `k-page ${locked ? 'locked' : ''}`.trim(), 'data-keeper': id, style: { '--ink-k': k.ink } },
    h('div', { class: 'k-portrait' }, h('div', { class: 'k-glow' }), h('img', { src: artUrl(id), alt: '' })),
    h('h2', { class: 'k-name title-font' }, locked ? t('keepers.locked') : t(`keeper.${id}.name`)),
    h('div', { class: 'k-title' }, locked ? t(UNLOCK_HINT[id] as 'keepers.locked') : t(`keeper.${id}.title`)),
    h('p', { class: 'k-blurb' }, locked ? '' : t(`keeper.${id}.blurb`)),
    locked
      ? null
      : h(
          'div',
          { class: 'k-stats' },
          h('span', { class: 'chip' }, pico('flame'), String(k.flame)),
          h('span', { class: 'chip' }, pico('oil'), `${k.maxOil}`),
          h('span', { class: 'chip' }, pico('cards'), String(k.hand)),
        ),
    locked
      ? null
      : h(
          'div',
          { class: 'k-skills panel' },
          h('div', { class: 'k-skill' }, h('b', {}, t(`keeper.${id}.passive`)), h('span', {}, passiveText(id))),
          h(
            'div',
            { class: 'k-skill' },
            h('b', {}, pico('bell'), t(`keeper.${id}.ability`)),
            h('span', { html: rich(`${k.ability.fx.map(effectLine).join(' ')} ${t('keepers.cooldown', { secs: fmt(k.ability.cd) })}`) }),
          ),
        ),
    locked ? null : deck,
  );
}

/** Choosing the keeper: three pages side by side, swiped or stepped through. */
export function keepersScreen(o: KeeperOpts): Screen {
  let index = 0;
  const pages = KEEPER_IDS.map(page);
  const track = h('div', { class: 'k-track' }, ...pages);
  const dots = h('div', { class: 'k-dots' }, ...KEEPER_IDS.map((_, i) => h('i', { class: i === 0 ? 'on' : '' })));
  const go = h('button', { class: 'btn big' }, pico('flame'), t('keepers.begin'));
  const back = h('button', { class: 'icon-btn', 'aria-label': t('ui.back') }, pico('back'));
  const prev = h('button', { class: 'k-arrow left' }, pico('back'));
  const next = h('button', { class: 'k-arrow right' }, pico('back'));

  const paint = (): void => {
    const id = KEEPER_IDS[index];
    go.disabled = !isUnlocked(id);
    dots.querySelectorAll('i').forEach((d, i) => {
      d.classList.toggle('on', i === index);
    });
    prev.classList.toggle('off', index === 0);
    next.classList.toggle('off', index === KEEPER_IDS.length - 1);
  };
  const scrollTo = (i: number): void => {
    index = Math.max(0, Math.min(KEEPER_IDS.length - 1, i));
    track.scrollTo({ left: index * track.clientWidth, behavior: 'smooth' });
    paint();
  };
  track.addEventListener('scroll', () => {
    const i = Math.round(track.scrollLeft / Math.max(1, track.clientWidth));
    if (i !== index) {
      index = i;
      paint();
    }
  });
  prev.addEventListener('click', () => scrollTo(index - 1));
  next.addEventListener('click', () => scrollTo(index + 1));
  back.addEventListener('click', o.onBack);
  go.addEventListener('click', () => o.onPick(KEEPER_IDS[index]));
  const el = h(
    'div',
    { class: 'screen keepers' },
    h('div', { class: 'k-head' }, back, h('div', { class: 'k-heading title-font' }, t('keepers.title'))),
    h('div', { class: 'k-stage' }, track, prev, next),
    h('div', { class: 'k-foot' }, dots, go),
  );
  paint();
  return { el };
}
