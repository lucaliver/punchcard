import { sfx, unlockAudio } from '../../audio/sfx';
import { t } from '../../core/i18n';
import { CONFIG } from '../../data/config';
import { meta } from '../../game/meta';
import { settings } from '../../game/settings';
import { type Screen, pico } from '../app';
import { artUrl } from '../art/sprites';
import { h } from '../dom';

export interface TitleOpts {
  /** A run is saved: the main button continues it. */
  hasRun: boolean;
  onPlay(): void;
  onContinue(): void;
  onAlmanac(): void;
  onSettings(): void;
  onHow(): void;
  onDebug(): void;
}

/** The little parade that walks along the ridge behind the title: a promise of what comes after dark. */
const MARCHERS: { art: string; delay: number; size: number; hop: boolean }[] = [
  { art: 'karakasa', delay: 0, size: 44, hop: true },
  { art: 'chochin', delay: -6, size: 42, hop: false },
  { art: 'kappa', delay: -12, size: 40, hop: false },
  { art: 'bakeneko', delay: -18, size: 42, hop: true },
  { art: 'zori', delay: -23, size: 34, hop: true },
  { art: 'tengu', delay: -29, size: 46, hop: false },
  { art: 'nopperabo', delay: -35, size: 44, hop: false },
  { art: 'kitsunebi', delay: -41, size: 36, hop: true },
];

const toriiSvg = `<svg viewBox="0 0 400 520" preserveAspectRatio="none" aria-hidden="true">
  <g fill="#c4382a" stroke="#1d1428" stroke-width="6" stroke-linejoin="round">
    <rect x="22" y="70" width="38" height="450"/><rect x="340" y="70" width="38" height="450"/>
    <path d="M-10 78 Q200 54 410 78 L396 42 Q200 14 4 42Z" fill="#2c2840"/>
    <rect x="8" y="104" width="384" height="26" fill="#c4382a"/>
  </g>
  <path d="M30 140 H370" stroke="#e86a5a" stroke-width="3" opacity=".6"/>
</svg>`;

export function titleScreen(o: TitleOpts): Screen {
  const stars = Array.from({ length: 36 }, (_, i) => {
    const x = (i * 97) % 100;
    const y = (i * 53) % 46;
    return h('i', { class: 'star', style: { left: `${x}%`, top: `${y}%`, '--d': `${(i % 7) * 0.5}s`, '--s': `${1 + (i % 3)}px` } });
  });
  const parade = h(
    'div',
    { class: 'parade' },
    ...MARCHERS.map((m) =>
      h(
        'div',
        { class: `marcher ${m.hop ? 'hop' : 'walk'}`, style: { '--delay': `${m.delay}s`, '--size': `${m.size}px` } },
        h('img', { src: artUrl(m.art), alt: '' }),
      ),
    ),
  );
  const lanterns = h(
    'div',
    { class: 'rope' },
    ...Array.from({ length: 5 }, (_, i) => h('div', { class: 'swing', style: { '--i': String(i) } }, pico(i % 2 ? 'redLantern' : 'lanternGlass'))),
  );
  const play = h(
    'button',
    { class: 'btn big title-play', onclick: o.hasRun ? o.onContinue : o.onPlay },
    pico('flame'),
    o.hasRun ? t('title.continue') : t('title.play'),
  );
  const menu = h(
    'div',
    { class: 'title-menu' },
    play,
    o.hasRun ? h('button', { class: 'btn paper', onclick: o.onPlay }, t('title.newRun')) : null,
    h(
      'div',
      { class: 'title-row' },
      h('button', { class: 'btn paper small', onclick: o.onAlmanac }, pico('cards'), t('title.almanac')),
      h('button', { class: 'btn paper small', onclick: o.onHow }, t('title.how')),
      h('button', { class: 'btn paper small', onclick: o.onSettings }, pico('gear'), t('title.settings')),
    ),
  );
  let taps = 0;
  const version = h('button', { class: 'version' }, `v${__APP_VERSION__}`);
  version.addEventListener('click', () => {
    taps++;
    if (taps >= CONFIG.debugTaps) {
      taps = 0;
      settings.debug = true;
      o.onDebug();
    }
  });
  const el = h(
    'div',
    { class: 'screen title' },
    h('div', { class: 'sky' }, ...stars),
    h('div', { class: 'moon' }),
    h('div', { class: 'ridge far' }),
    h('div', { class: 'ridge near' }),
    parade,
    h('div', { class: 'torii-frame', html: toriiSvg }),
    lanterns,
    h(
      'div',
      { class: 'logo' },
      h('div', { class: 'seal' }, pico('lantern')),
      h('h1', { class: 'title-font' }, t('app.title')),
      h('div', { class: 'tagline' }, t('title.tagline')),
    ),
    menu,
    h('div', { class: 'title-foot' }, meta.runs > 0 ? t('title.record', { wins: meta.wins, runs: meta.runs }) : t('title.fresh'), version),
  );
  el.addEventListener('pointerdown', () => unlockAudio(), { once: true });
  el.addEventListener('click', (e) => {
    if ((e.target as HTMLElement).closest('button')) sfx('button');
  });
  return { el };
}
