import { type TKey, t } from '../../core/i18n';
import { HERO_LIST, HEROES } from '../../data/heroes';
import { heroHidden, heroUnlocked } from '../../game/meta';
import { currentNode, type RunState, totalFloors } from '../../game/run';
import { creature } from '../art/creatures';
import { icon } from '../art/icons';
import { relicArt } from '../art/relics';
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

/** The run in progress, if any: the right board shows its shift and the left one its stationery instead of the staff. */
let runOf: () => RunState | null = () => null;
let staff: HTMLElement;
let shift: HTMLElement;
let gear: HTMLElement;
let notes: { staff: HTMLElement; shift: HTMLElement; gear: HTMLElement };

const shiftHtml = (run: RunState): string =>
  `<div class="shift-head"><div class="badge-art" style="--hero-ink:${HEROES[run.hero].ink}">${creature(run.hero)}</div><div><b>${t(`hero.${run.hero}.name`)}</b>` +
  `<span>${t('common.floorOf', { a: currentNode(run).act, n: currentNode(run).floor, total: totalFloors(run) })}</span></div></div>` +
  `<ul class="shift-stats"><li>${icon('heart')}${run.hp}/${run.maxHp}</li><li>${icon('coin')}${run.money}</li><li>${icon('cards')}${run.deck.length}</li></ul>`;

const gearHtml = (run: RunState): string => run.relics.map((id) => `<li>${relicArt(id)}<span>${t(`relic.${id}.name`)}</span></li>`).join('');

/** Desktop only (`wings.css` hides them on a phone): a notice board either side of the phone-shaped column, so the wide window is not empty. `run` says which run is on. */
export function initWings(run: () => RunState | null): void {
  runOf = run;
  staff = h('div', { class: 'staff' });
  shift = h('div', { class: 'shift' });
  gear = h('ul', { class: 'gear' });
  const keylist = h('ul', {
    class: 'keylist',
    html: RULES.map(({ key, label }) => `<li><kbd>${key()}</kbd><span>${t(label)}</span></li>`).join(''),
  });
  const note = (title: string, body: HTMLElement): HTMLElement => h('section', { class: 'note' }, h('h3', null, title), body);
  notes = { staff: note(t('wing.staff'), staff), shift: note(t('wing.shift'), shift), gear: note(t('wing.stationery'), gear) };
  document.body.append(
    h(
      'aside',
      { class: 'wing wing-l', 'aria-hidden': 'true' },
      h('p', { class: 'wing-slogan' }, t('menu.slogan')),
      note(t('wing.rules'), keylist),
      notes.gear,
    ),
    h('aside', { class: 'wing wing-r', 'aria-hidden': 'true' }, notes.staff, notes.shift, h('p', { class: 'wing-plate' }, t('menu.plate'))),
  );
  refreshWings();
}

/** The boards follow the game: the heroes unlocked, or the run's hero, pay and stationery (called on every screen change). */
export function refreshWings(): void {
  if (!staff) return;
  const run = runOf();
  notes.staff.hidden = !!run;
  notes.shift.hidden = !run;
  notes.gear.hidden = !run?.relics.length;
  setHtml(staff, staffHtml());
  if (run) {
    setHtml(shift, shiftHtml(run));
    setHtml(gear, gearHtml(run));
  }
}
