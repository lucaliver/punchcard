import type { TKey } from '../../core/i18n';
import { t } from '../../core/i18n';
import { sfx } from '../../audio/sfx';
import type { CollectionKind, collection } from '../../game/meta';
import type { Section } from '../screens/compendium';
import { icon } from '../art/icons';
import { cssMs, h } from '../dom';
import { haptic } from '../fx/fx';

/** The handbook's pages that fill up, in the order the bars print: their icon and word (the same as the handbook's tabs). */
const COLLECTION_PAGES: [CollectionKind, string, TKey, Section][] = [
  ['cards', 'cards', 'compendium.cards', 'cards'],
  ['foes', 'clipboard', 'compendium.enemies', 'enemies'],
  ['relics', 'stapler', 'compendium.relics', 'relics'],
];

/** The steps of a filling bar (the same as its CSS animation), each one a tick. */
const COLL_STEPS = 12;

/**
 * The handbook's pages as filling bars; tapping one opens that page. With `animate` each bar climbs from where it stood (after the
 * `rows` lines of the payslip above have printed), ticking into `ticks`, which the screen clears when it leaves; without it they are still.
 */
export function collectionBars(
  filled: ReturnType<typeof collection>,
  onOpen: (section: Section) => void,
  animate?: { rows: number; ticks: number[] },
): HTMLElement {
  return h(
    'div',
    { class: `collect${animate ? '' : ' still'}`, style: { '--rows': String(animate?.rows ?? 0) } },
    ...COLLECTION_PAGES.map(([kind, ico, label, section], i) => {
      const { from, n, total } = filled[kind];
      return h(
        'button',
        {
          class: `coll-row coll-${kind}`,
          style: { '--i': String(i), '--to': String(n / total) },
          onclick: () => {
            sfx('button');
            haptic('tap');
            onOpen(section);
          },
        },
        h(
          'span',
          { class: 'coll-label' },
          h('i', { html: icon(ico) }),
          t(label),
          animate && n > from ? h('i', { class: 'slip-record coll-gain' }, `+${n - from}`) : null,
        ),
        h(
          'div',
          { class: 'coll-track' },
          h('i', {
            class: 'coll-fill',
            // Once its delay is over the bar fills: one tick per step, and the stamp lands as it ends.
            onanimationstart: () => {
              if (!animate || !n) return;
              const dur = cssMs('--dur-coll-fill');
              for (let s = 1; s <= COLL_STEPS; s++) animate.ticks.push(window.setTimeout(() => sfx('tally'), (dur * s) / COLL_STEPS));
              if (n > from) animate.ticks.push(window.setTimeout(() => sfx('stamp'), dur));
            },
          }),
        ),
        h('b', null, `${n}/${total}`),
      );
    }),
  );
}
