import { t } from '../../core/i18n';
import { h } from '../dom';

/** A phone held sideways: touch screen, wider than tall and short. The game is a portrait column and is not meant to be played like that. */
const SIDEWAYS = '(orientation: landscape) and (max-height: 520px) and (pointer: coarse)';
const query = matchMedia(SIDEWAYS);

/** Subscribes to the phone being turned sideways or upright again; returns the unsubscribe. */
export function watchSideways(fn: (sideways: boolean) => void): () => void {
  const listener = (): void => fn(query.matches);
  query.addEventListener('change', listener);
  return () => query.removeEventListener('change', listener);
}

/** A curtain over the game, shown while the phone is sideways, asking to turn it upright. */
export function initRotateBanner(): void {
  const banner = h(
    'div',
    { class: 'rotate-banner', role: 'alert' },
    h('div', { class: 'rotate-phone', 'aria-hidden': 'true' }, h('i')),
    h('h2', null, t('rotate.title')),
    h('p', null, t('rotate.body')),
  );
  document.body.append(banner);
  const sync = (on: boolean): void => {
    banner.classList.toggle('on', on);
  };
  sync(query.matches);
  watchSideways(sync);
}
