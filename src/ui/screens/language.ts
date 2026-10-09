import { availableLocales, detectLocale, setLocale, t } from '../../core/i18n';
import { sfx } from '../../audio/sfx';
import { saveSettings, settings } from '../../game/settings';
import type { Screen } from '../app';
import { icon } from '../art/icons';
import { h } from '../dom';

/**
 * The very first screen of a first launch, before the contract: pick the language. The one the browser prefers is shown already
 * (the title is in it); a choice is saved and the page reloads, like the Settings switch, so every string is built in it.
 */
export function languageScreen(): Screen {
  setLocale(detectLocale());
  const el = h(
    'div',
    { class: 'screen language' },
    h('div', { class: 'language-mark', 'aria-hidden': 'true', html: icon('speech') }),
    h('h1', { class: 'h1' }, t('settings.language')),
    h(
      'div',
      { class: 'language-list' },
      ...availableLocales().map((l) =>
        h(
          'button',
          {
            class: 'btn cta language-btn',
            lang: l.code,
            onclick: () => {
              sfx('button');
              settings.locale = l.code;
              settings.localeChosen = true;
              saveSettings();
              location.reload();
            },
          },
          l.name,
          l.code === 'en' ? h('small', { class: 'language-hint' }, t('settings.recommended')) : null,
        ),
      ),
    ),
  );
  return { el };
}
