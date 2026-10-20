import { t } from '../../core/i18n';
import { openModal } from '../app';
import { artUrl } from '../art/sprites';
import { h } from '../dom';
import { rich } from './cardText';

const PAGES: { art: string[]; key: string }[] = [
  { art: ['lantern', 'karakasa', 'chochin'], key: 'night' },
  { art: ['crane', 'jizo', 'kodama'], key: 'spirits' },
  { art: ['oil', 'cards', 'clock'], key: 'oil' },
  { art: ['ofuda', 'fireFan', 'gust'], key: 'charms' },
  { art: ['star', 'crane', 'crane'], key: 'merge' },
  { art: ['bell', 'nodeRest', 'nodeMarket'], key: 'run' },
];

/** The rules in six pages: a few pictures and a line or two each. */
export function openHowTo(): () => void {
  let i = 0;
  const art = h('div', { class: 'how-art' });
  const title = h('div', { class: 'title title-font' });
  const text = h('p', { class: 'how-text' });
  const dots = h('div', { class: 'k-dots' }, ...PAGES.map(() => h('i')));
  const prev = h('button', { class: 'btn paper small' }, t('ui.back'));
  const next = h('button', { class: 'btn small' }, t('ui.next'));
  const paint = (): void => {
    const p = PAGES[i];
    art.replaceChildren(...p.art.map((a, k) => h('img', { src: artUrl(a), alt: '', style: { '--k': String(k) } })));
    title.textContent = t(`how.${p.key}.title` as 'how.night.title');
    text.innerHTML = rich(t(`how.${p.key}.text` as 'how.night.text'));
    dots.querySelectorAll('i').forEach((d, k) => {
      d.classList.toggle('on', k === i);
    });
    prev.style.visibility = i === 0 ? 'hidden' : 'visible';
    next.textContent = i === PAGES.length - 1 ? t('ui.done') : t('ui.next');
  };
  const body = h('div', { class: 'how' }, art, title, text, dots, h('div', { class: 'actions' }, prev, next));
  const close = openModal({ body, cls: 'how-modal' });
  prev.addEventListener('click', () => {
    i = Math.max(0, i - 1);
    paint();
  });
  next.addEventListener('click', () => {
    if (i === PAGES.length - 1) close();
    else {
      i++;
      paint();
    }
  });
  paint();
  return close;
}
