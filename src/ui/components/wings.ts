import { type TKey, t } from '../../core/i18n';
import { HERO_LIST } from '../../data/heroes';
import { heroHidden, heroUnlocked } from '../../game/meta';
import { creature } from '../art/creatures';
import { h, setHtml } from '../dom';
import { UNKNOWN } from './cardView';

/** What a key does in a fight (the keys themselves are the same in every language, `space` and `click` are words). */
const RULES: { key: () => string; label: TKey }[] = [
  { key: () => t('wing.space'), label: 'wing.pause' },
  { key: () => 'A', label: 'wing.ability' },
  { key: () => 'D', label: 'wing.deck' },
  { key: () => '1–9', label: 'wing.sleeve' },
  { key: () => 'Esc', label: 'wing.close' },
  { key: () => t('wing.click'), label: 'wing.inspect' },
];

/** The hero ID badges pinned on the right wall: a hero not met yet is an ink silhouette, a hidden one leaves no trace. */
const staffHtml = (): string =>
  HERO_LIST.filter((hero) => !heroHidden(hero.id))
    .map((hero) => {
      const locked = !heroUnlocked(hero.id);
      return (
        `<div class="badge${locked ? ' locked' : ''}" style="--hero-ink:${hero.ink}"><div class="badge-art">${creature(hero.id)}</div>` +
        `<b>${locked ? UNKNOWN : t(`hero.${hero.id}.name`)}</b><span>${locked ? UNKNOWN : t(`hero.${hero.id}.job`)}</span></div>`
      );
    })
    .join('');

let staff: HTMLElement | null = null;

/** Desktop only (`wings.css` hides them on a phone): a notice board either side of the phone-shaped column, so the wide window is not empty. */
export function initWings(): void {
  staff = h('div', { class: 'staff' });
  const keylist = h('ul', {
    class: 'keylist',
    html: RULES.map(({ key, label }) => `<li><kbd>${key()}</kbd><span>${t(label)}</span></li>`).join(''),
  });
  document.body.append(
    h(
      'aside',
      { class: 'wing wing-l', 'aria-hidden': 'true' },
      h('p', { class: 'wing-slogan' }, t('menu.slogan')),
      h('section', { class: 'note' }, h('h3', null, t('wing.rules')), keylist),
    ),
    h(
      'aside',
      { class: 'wing wing-r', 'aria-hidden': 'true' },
      h('section', { class: 'note' }, h('h3', null, t('wing.staff')), staff),
      h('p', { class: 'wing-plate' }, t('menu.plate')),
    ),
  );
  refreshWings();
}

/** The badges follow the heroes the player has unlocked (called on every screen change). */
export function refreshWings(): void {
  if (staff) setHtml(staff, staffHtml());
}
