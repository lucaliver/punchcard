import { sfx } from '../../audio/sfx';
import { t } from '../../core/i18n';
import { RELICS } from '../../data/relics';
import type { RunLog } from '../../game/meta';
import { type Screen, pico } from '../app';
import { artUrl } from '../art/sprites';
import { h } from '../dom';

/** The opening of a night: a painting, its name, and a few lines. A tap goes on. */
export function actIntroScreen(act: number, onDone: () => void): Screen {
  const lines = [1, 2, 3].map((i) => h('p', { class: 'story-line', style: { '--i': String(i) } }, t(`act.${act}.intro${i}` as 'act.1.intro1')));
  const el = h(
    'div',
    { class: 'screen story', 'data-act': act },
    h('div', { class: 'story-sky' }),
    h('div', { class: 'story-moon' }),
    h('div', { class: 'story-ridge' }),
    h('div', { class: 'story-ridge near' }),
    h(
      'div',
      { class: 'story-card' },
      h('div', { class: 'story-night title-font' }, t(`act.${act}.sub`)),
      h('h1', { class: 'title-font' }, t(`act.${act}.name`)),
      h('div', { class: 'rule' }),
      ...lines,
    ),
    h('button', { class: 'btn big story-go', onclick: () => onDone() }, t('ui.continue')),
  );
  return {
    el,
    enter() {
      sfx('page');
    },
  };
}

export interface EndOpts {
  won: boolean;
  log: RunLog;
  /** A keeper unlocked by this run. */
  unlocked: string | null;
  onTitle(): void;
  onAgain(): void;
}

/** The end of a run: dawn on the last step, or the lantern going out. */
export function endScreen(o: EndOpts): Screen {
  const { log } = o;
  const stats = h(
    'div',
    { class: 'end-stats' },
    h('span', { class: 'chip' }, pico('nodeWatch'), t('end.fights', { n: log.fights })),
    h('span', { class: 'chip' }, pico('sword'), t('end.kills', { n: log.kills })),
    h('span', { class: 'chip' }, pico('cards'), t('end.cards', { n: log.deck.length })),
  );
  const relics = h('div', { class: 'end-relics' }, ...log.relics.map((id) => h('img', { class: 'pico', src: artUrl(RELICS[id].art), alt: '' })));
  const el = h(
    'div',
    { class: `screen story end ${o.won ? 'won' : 'lost'}`, 'data-act': log.act },
    h('div', { class: 'story-sky' }),
    o.won ? h('div', { class: 'sunrise' }) : h('div', { class: 'story-moon dim' }),
    h('div', { class: 'story-ridge' }),
    h('div', { class: 'story-ridge near' }),
    h(
      'div',
      { class: 'story-card' },
      h('div', { class: 'story-night title-font' }, o.won ? t('end.wonSub') : t('end.lostSub', { act: log.act })),
      h('h1', { class: 'title-font' }, o.won ? t('end.won') : t('end.lost')),
      h('div', { class: 'rule' }),
      h('div', { class: 'end-keeper' }, h('img', { src: artUrl(log.keeper), alt: '' })),
      h('p', { class: 'story-line show' }, o.won ? t('end.wonText') : t('end.lostText')),
      stats,
      log.relics.length ? relics : null,
      o.unlocked
        ? h('div', { class: 'unlock-note panel' }, pico('star'), t('end.unlocked', { name: t(`keeper.${o.unlocked}.name` as 'keeper.miko.name') }))
        : null,
    ),
    h(
      'div',
      { class: 'end-btns' },
      h('button', { class: 'btn big', onclick: o.onAgain }, t('end.again')),
      h('button', { class: 'btn paper', onclick: o.onTitle }, t('end.title')),
    ),
  );
  return {
    el,
    enter() {
      sfx(o.won ? 'dawn' : 'lose');
    },
  };
}
