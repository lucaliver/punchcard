import { applyVolumes, sfx } from '../../audio/sfx';
import { availableLocales, t } from '../../core/i18n';
import { clearAll } from '../../core/save';
import { applySettings, saveSettings, settings } from '../../game/settings';
import { openModal } from '../app';
import { h } from '../dom';

/** A volume slider, painted as a brush stroke that fills as it is raised. */
function slider(label: string, value: number, onChange: (v: number) => void): HTMLElement {
  const input = h('input', { type: 'range', min: '0', max: '100', value: String(Math.round(value * 100)), 'aria-label': label });
  const paint = (): void => input.style.setProperty('--v', `${input.value}%`);
  paint();
  input.addEventListener('input', () => {
    paint();
    onChange(Number(input.value) / 100);
  });
  input.addEventListener('change', () => sfx('tap'));
  return h('label', { class: 'set-row' }, h('span', {}, label), input);
}

/** A switch shaped like a hanko stamp: pressed in when on. */
function toggle(label: string, on: boolean, onChange: (v: boolean) => void): HTMLElement {
  const btn = h('button', { class: `switch ${on ? 'on' : ''}`.trim(), role: 'switch', 'aria-checked': String(on) }, h('i'));
  let state = on;
  btn.addEventListener('click', () => {
    state = !state;
    btn.classList.toggle('on', state);
    btn.setAttribute('aria-checked', String(state));
    sfx('tap');
    onChange(state);
  });
  return h('div', { class: 'set-row' }, h('span', {}, label), btn);
}

export interface SettingsOpts {
  /** Called after the language changes, so the caller can rebuild what it shows. */
  onLocale?: () => void;
  /** Wipes progress (offered on the title only). */
  onReset?: () => void;
  onDebug?: () => void;
}

export function openSettings(o: SettingsOpts = {}): () => void {
  const body = h(
    'div',
    { class: 'settings' },
    slider(t('settings.music'), settings.music, (v) => {
      settings.music = v;
      applyVolumes();
      saveSettings();
    }),
    slider(t('settings.sfx'), settings.sfx, (v) => {
      settings.sfx = v;
      applyVolumes();
      saveSettings();
    }),
    toggle(t('settings.vibrate'), settings.vibrate, (v) => {
      settings.vibrate = v;
      saveSettings();
    }),
    toggle(t('settings.shake'), settings.shake, (v) => {
      settings.shake = v;
      saveSettings();
    }),
    toggle(t('settings.reduce'), settings.reduceMotion, (v) => {
      settings.reduceMotion = v;
      applySettings();
      saveSettings();
    }),
    h(
      'div',
      { class: 'set-row' },
      h('span', {}, t('settings.language')),
      h(
        'div',
        { class: 'langs' },
        ...availableLocales().map((l) =>
          h(
            'button',
            {
              class: `btn small ${settings.locale === l.code ? 'red' : 'paper'}`,
              onclick: () => {
                settings.locale = l.code;
                settings.localeChosen = true;
                applySettings();
                saveSettings();
                close();
                o.onLocale?.();
              },
            },
            l.name,
          ),
        ),
      ),
    ),
    o.onReset ? h('button', { class: 'btn ghost reset', onclick: () => confirmReset() }, t('settings.reset')) : null,
    settings.debug && o.onDebug
      ? h(
          'button',
          {
            class: 'btn ghost',
            onclick: () => {
              close();
              o.onDebug?.();
            },
          },
          t('settings.debug'),
        )
      : null,
  );
  const close = openModal({ title: t('settings.title'), body, cls: 'settings-modal', actions: [{ label: t('ui.close'), cls: 'paper' }] });

  function confirmReset(): void {
    openModal({
      title: t('settings.resetQ'),
      body: t('settings.resetBody'),
      actions: [
        { label: t('ui.cancel'), cls: 'paper' },
        {
          label: t('settings.resetGo'),
          cls: 'red',
          onClick: () => {
            clearAll();
            location.reload();
          },
        },
      ],
    });
  }
  return close;
}
