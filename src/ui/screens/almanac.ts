import { t } from '../../core/i18n';
import { CARD_IDS, card } from '../../data/cards';
import { FOE_IDS, FOES } from '../../data/foes';
import { RELIC_IDS, RELICS } from '../../data/relics';
import { meta } from '../../game/meta';
import { type Screen, pico } from '../app';
import { artUrl } from '../art/sprites';
import { openCardDetail, openFoeDetail, openRelicDetail } from '../components/cardShow';
import { cardView } from '../components/cardView';
import { h } from '../dom';

type Tab = 'spirits' | 'charms' | 'foes' | 'relics' | 'records';
const TABS: Tab[] = ['spirits', 'charms', 'foes', 'relics', 'records'];

/** Everything met so far: spirits, charms, the parade and trinkets, and how the runs went. */
export function almanacScreen(onBack: () => void): Screen {
  let tab: Tab = 'spirits';
  const body = h('div', { class: 'al-body scroll' });
  const tabs = h('div', { class: 'al-tabs' });
  const count = h('div', { class: 'al-count' });

  const unknown = (): HTMLElement => h('div', { class: 'al-unknown' }, h('span', { class: 'title-font' }, '?'));

  const paint = (): void => {
    tabs.replaceChildren(
      ...TABS.map((k) =>
        h(
          'button',
          {
            class: `al-tab ${k === tab ? 'on' : ''}`.trim(),
            onclick: () => {
              tab = k;
              paint();
            },
          },
          t(`almanac.${k}`),
        ),
      ),
    );
    body.replaceChildren();
    if (tab === 'spirits' || tab === 'charms') {
      const kind = tab === 'spirits' ? 'spirit' : 'charm';
      const ids = CARD_IDS.filter((id) => card(id).kind === kind);
      const seen = ids.filter((id) => meta.seenCards.includes(id));
      count.textContent = `${seen.length}/${ids.length}`;
      body.append(
        h(
          'div',
          { class: 'al-grid cards' },
          ...ids.map((id) =>
            meta.seenCards.includes(id)
              ? h(
                  'button',
                  { class: 'al-cell', onclick: () => openCardDetail({ uid: 0, id, up: false }) },
                  cardView({ uid: 0, id, up: false }, { width: 78 }),
                )
              : h('div', { class: 'al-cell' }, unknown()),
          ),
        ),
      );
    } else if (tab === 'foes') {
      const seen = FOE_IDS.filter((id) => meta.seenFoes.includes(id));
      count.textContent = `${seen.length}/${FOE_IDS.length}`;
      body.append(
        h(
          'div',
          { class: 'al-grid foes' },
          ...FOE_IDS.map((id) =>
            meta.seenFoes.includes(id)
              ? h(
                  'button',
                  { class: `al-foe tier-${FOES[id].tier}`, onclick: () => openFoeDetail(FOES[id]) },
                  h('img', { src: artUrl(FOES[id].art), alt: '' }),
                  h('span', {}, t(`foe.${id}.name`)),
                )
              : h('div', { class: 'al-foe' }, unknown()),
          ),
        ),
      );
    } else if (tab === 'relics') {
      const seen = RELIC_IDS.filter((id) => meta.seenRelics.includes(id));
      count.textContent = `${seen.length}/${RELIC_IDS.length}`;
      body.append(
        h(
          'div',
          { class: 'al-grid foes' },
          ...RELIC_IDS.map((id) =>
            meta.seenRelics.includes(id)
              ? h(
                  'button',
                  { class: 'al-foe', onclick: () => openRelicDetail(id) },
                  h('img', { src: artUrl(RELICS[id].art), alt: '' }),
                  h('span', {}, t(`relic.${id}.name`)),
                )
              : h('div', { class: 'al-foe' }, unknown()),
          ),
        ),
      );
    } else {
      count.textContent = '';
      body.append(
        h(
          'div',
          { class: 'al-records' },
          h('div', { class: 'panel rec' }, h('span', {}, t('almanac.runs')), h('b', { class: 'num' }, String(meta.runs))),
          h('div', { class: 'panel rec' }, h('span', {}, t('almanac.wins')), h('b', { class: 'num' }, String(meta.wins))),
          h('div', { class: 'panel rec' }, h('span', {}, t('almanac.best')), h('b', { class: 'num' }, meta.bestAct ? `${meta.bestAct}/3` : '–')),
          h('div', { class: 'al-head title-font' }, t('almanac.history')),
          ...(meta.history.length
            ? meta.history.map((r) =>
                h(
                  'div',
                  { class: `panel hist ${r.won ? 'won' : ''}`.trim() },
                  h('img', { src: artUrl(r.keeper), alt: '' }),
                  h(
                    'div',
                    {},
                    h('b', { class: 'title-font' }, r.won ? t('almanac.dawnWon') : t('almanac.fellOn', { act: r.act })),
                    h('span', {}, t('almanac.line', { fights: r.fights, kills: r.kills })),
                  ),
                ),
              )
            : [h('div', { class: 'al-none' }, t('almanac.noHistory'))]),
        ),
      );
    }
  };
  paint();
  const el = h(
    'div',
    { class: 'screen almanac' },
    h(
      'div',
      { class: 'k-head' },
      h('button', { class: 'icon-btn', onclick: onBack, 'aria-label': t('ui.back') }, pico('back')),
      h('div', { class: 'k-heading title-font' }, t('almanac.title')),
      count,
    ),
    tabs,
    body,
  );
  return { el };
}
