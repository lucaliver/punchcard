import { t, type Params } from '../../core/i18n';
import { sfx } from '../../audio/sfx';
import { rankMax, rankSteps, type RankEffect } from '../../data/rank';
import { rankPick, rankTop, setRankPick } from '../../game/meta';
import { settings } from '../../game/settings';
import type { HeroId } from '../../game/types';
import { openModal } from '../app';
import { icon } from '../art/icons';
import { cssMs, h, retrigger } from '../dom';
import { burst, haptic } from '../fx/fx';
import { keywordHtml } from './cardView';

export const rankTitle = (level: number): string => t(`rank.${level}`);

/** One effect of a rank as a line of rules text (its keywords highlighted). */
export function effectHtml(e: RankEffect): string {
  const params: Params = {};
  if ('n' in e) params.n = e.n;
  if (e.kind === 'upgrade') params.cards = e.cards.map((id) => t(`card.${id}.name`)).join(', ');
  return keywordHtml(t(`rank.fx.${e.kind === 'cards' ? `cards.${e.rarity}` : e.kind}`, params));
}

/** The plaque shows a rank: its number in a dark tile and its title. */
function paintPlaque(el: HTMLElement, level: number): void {
  el.innerHTML = `<i class="rk-ico">${icon('ladder')}</i><b class="rk-n">${level}</b><span class="rk-title">${rankTitle(level)}</span>`;
  el.setAttribute('aria-label', `${t('rank.plaque', { n: level })}: ${rankTitle(level)}`);
}

/** The brass plaque on the hire screen: the rank the next shift is played at. A tap opens the whole ladder, where the rank can be changed. */
export function rankPlaque(hero: HeroId, onChange: (level: number) => void): { el: HTMLButtonElement; refresh: () => void } {
  const el = h('button', { class: 'rank-plaque', 'data-hero': hero });
  const refresh = (): void => {
    paintPlaque(el, rankPick(hero));
    onChange(rankPick(hero));
  };
  el.addEventListener('click', () => {
    sfx('tap');
    openLadder(hero, refresh);
  });
  refresh();
  return { el, refresh };
}

/** The ladder: every rank of the hero with its perk and its duty. The ones reached can be picked for the next shift; the rest are shown, locked. */
export function openLadder(hero: HeroId, onChange: () => void): void {
  const top = rankTop(hero);
  const rows: HTMLElement[] = [];
  const mark = (): void => {
    rows.forEach((r, level) => {
      r.classList.toggle('picked', level === rankPick(hero));
    });
  };
  for (let level = 0; level <= rankMax(hero); level++) {
    const open = level <= top;
    const step = level ? rankSteps(hero, level)[level - 1] : null;
    const row = h(
      'button',
      {
        class: `rank-row ${open ? '' : 'locked'}`,
        'aria-disabled': String(!open),
        onclick: () => {
          if (!open) return;
          setRankPick(hero, level);
          sfx('tap');
          mark();
          onChange();
        },
      },
      h('b', { class: 'rk-n', html: open ? String(level) : `${icon('lock')}<small>${level}</small>` }),
      h(
        'div',
        { class: 'rk-text' },
        h('h3', null, rankTitle(level)),
        ...(step
          ? [
              h('p', { class: 'rk-line perk', html: `<i class="ftag">${t('rank.bonus')}</i><span>${effectHtml(step.bonus)}</span>` }),
              h('p', { class: 'rk-line duty', html: `<i class="ftag">${t('rank.duty')}</i><span>${effectHtml(step.duty)}</span>` }),
            ]
          : [h('p', { class: 'rk-line' }, t('rank.plain'))]),
      ),
      h('i', { class: 'rk-picked' }, t('rank.picked')),
    );
    rows.push(row);
  }
  mark();
  const list = h('div', { class: 'rank-list' });
  rows.forEach((row, level) => {
    list.append(row);
    if (level === top && top < rankMax(hero)) list.append(h('p', { class: 'rank-note' }, t('rank.lockedNote', { title: rankTitle(top) })));
  });
  openModal({
    title: t('rank.title'),
    cls: 'rank-ladder',
    body: h('div', null, h('p', { class: 'setting-note' }, t('rank.intro')), list),
    actions: [{ label: t('common.close'), cls: 'secondary' }],
    onClose: onChange,
  });
  requestAnimationFrame(() => rows[rankPick(hero)]?.scrollIntoView({ block: 'center' }));
}

/**
 * The promotion, played on the plaque: it shakes with the old rank, then the new one is stamped over it in a burst of confetti.
 * Returns a function that stops it (a screen undoes its timers when it leaves).
 */
export function playPromotion(plaque: HTMLElement, from: number, to: number): () => void {
  paintPlaque(plaque, from);
  const timers: number[] = [];
  const land = (): void => {
    paintPlaque(plaque, to);
    const stamp = h('i', { class: 'rk-stamp' }, t('rank.promoted'));
    plaque.append(stamp);
    if (!settings.reduceMotion) {
      retrigger(plaque, 'promoted');
      const box = plaque.getBoundingClientRect();
      burst('gold', box.left + box.width / 2, box.top + box.height / 2, 32, 1.3, 110);
    }
    sfx('stamp');
    haptic('heavy');
    timers.push(window.setTimeout(() => stamp.remove(), cssMs('--dur-promote-stamp')));
  };
  if (settings.reduceMotion) land();
  else {
    sfx('levelUp');
    retrigger(plaque, 'promoting');
    timers.push(window.setTimeout(land, cssMs('--dur-promote-shake')));
  }
  return () => timers.forEach(window.clearTimeout);
}
