import { sfx } from '../../audio/sfx';
import { t } from '../../core/i18n';
import { CONFIG } from '../../data/config';
import { sendReview } from '../../feedback/firebase';
import { markRated } from '../../game/meta';
import { openModal } from '../app';
import { icon } from '../art/icons';
import { h } from '../dom';
import { openInfo } from './modals';

/** A row of five tappable stars: `onPick(n)` when one is pressed; `set(n)` lights the first n. */
export function starRow(onPick: (n: number) => void): { el: HTMLElement; set: (n: number) => void } {
  const stars = [1, 2, 3, 4, 5].map((n) =>
    h('button', { class: 'rate-star', 'aria-label': t('rate.star', { n }), html: icon('star'), onclick: () => onPick(n) }),
  );
  return {
    el: h('div', { class: 'rate-stars' }, ...stars),
    set: (n) => {
      stars.forEach((s, i) => {
        s.classList.toggle('on', i < n);
      });
    },
  };
}

/** The review window opened by a star on the home: the stars (changeable), a free text, and Send. `onSent` runs once it is filed. */
export function openReview(stars: number, onSent: () => void): void {
  let n = stars;
  const row = starRow((v) => {
    n = v;
    sfx('tap');
    row.set(n);
  });
  row.set(n);
  const text = h('textarea', { class: 'rate-text', maxlength: String(CONFIG.reviewMax), rows: '5', placeholder: t('rate.placeholder') });
  const note = h('p', { class: 'rate-note' });
  const modal = openModal({
    title: t('rate.title'),
    body: h('div', { class: 'rate-form' }, h('p', null, t('rate.hint')), row.el, text, note),
    actions: [
      { label: t('common.close'), cls: 'secondary' },
      {
        label: t('rate.send'),
        cls: 'cta',
        onClick: () => {
          note.textContent = t('rate.sending');
          void sendReview({ stars: n, text: text.value.trim() }).then((ok) => {
            if (!ok) {
              note.textContent = t('rate.failed');
              return;
            }
            markRated();
            modal.close();
            onSent();
            openInfo({ icon: 'star', title: t('rate.thanksTitle'), desc: t('rate.thanks') });
          });
          return false;
        },
      },
    ],
  });
}
