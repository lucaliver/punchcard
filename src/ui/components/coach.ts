import { t } from '../../core/i18n';
import { artUrl } from '../art/sprites';
import { h } from '../dom';

export interface CoachStep {
  /** The thing to light up. */
  target: () => Element | null;
  text: string;
  /** Where the bubble goes relative to the lit part. */
  place?: 'above' | 'below';
}

/**
 * A guided tour: the screen dims, one part stays lit, and a bubble with the keeper's face says what it is. Taps go on to the next step;
 * the last one calls `onDone`. Used for the very first fight.
 */
export function runCoach(host: HTMLElement, steps: CoachStep[], keeper: string, onDone: () => void): () => void {
  let i = 0;
  const spot = h('div', { class: 'coach-spot' });
  const text = h('div', { class: 'coach-text' });
  const next = h('button', { class: 'btn small' });
  const bubble = h('div', { class: 'coach-bubble panel' }, h('img', { src: artUrl(keeper), alt: '' }), h('div', { class: 'coach-body' }, text, next));
  const layer = h('div', { class: 'coach' }, spot, bubble);
  host.append(layer);
  const finish = (): void => {
    layer.remove();
    onDone();
  };
  const paint = (): void => {
    const step = steps[i];
    const target = step.target();
    const hostRect = host.getBoundingClientRect();
    text.textContent = step.text;
    next.textContent = i === steps.length - 1 ? t('ui.letsGo') : t('ui.next');
    if (target) {
      const r = target.getBoundingClientRect();
      spot.style.display = 'block';
      spot.style.left = `${r.left - hostRect.left - 6}px`;
      spot.style.top = `${r.top - hostRect.top - 6}px`;
      spot.style.width = `${r.width + 12}px`;
      spot.style.height = `${r.height + 12}px`;
      const below = step.place === 'below' || (step.place !== 'above' && r.top - hostRect.top < hostRect.height * 0.4);
      bubble.style.top = below ? `${Math.min(hostRect.height - 170, r.bottom - hostRect.top + 16)}px` : 'auto';
      bubble.style.bottom = below ? 'auto' : `${Math.max(12, hostRect.bottom - r.top + 16)}px`;
    } else {
      spot.style.display = 'none';
      bubble.style.top = '30%';
      bubble.style.bottom = 'auto';
    }
  };
  next.addEventListener('click', () => {
    i++;
    if (i >= steps.length) finish();
    else paint();
  });
  paint();
  return finish;
}
