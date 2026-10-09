import { t } from '../../core/i18n';
import { sfx } from '../../audio/sfx';
import { CONFIG } from '../../data/config';
import { RELICS } from '../../data/relics';
import { gainRelic, hasRelic, tailorCrystal, type RunState } from '../../game/run';
import type { Screen } from '../app';
import { h } from '../dom';
import { icon } from '../art/icons';
import { relicArt } from '../art/relics';
import { playHealing, HEAL_ANIM_MS } from './rest';
import { CARD_SHOW_MS, playRelic } from '../components/cardShow';
import { closeRoom, roomOption, roomScene } from '../components/room';
import { runHud } from './journey';

/** The relic the Tailor sells. */
const PANTS = 'cargoPants';

/** Tailor: cargo pants (a relic: another sleeve slot) or a mana crystal sewn into the lining (for the run). */
export function tailorScreen(run: RunState, onDone: () => void): Screen {
  const pants = RELICS[PANTS];
  const owned = hasRelic(run, PANTS);
  const el = h(
    'div',
    { class: 'screen' },
    runHud(run),
    h('h1', { class: 'h1', style: { marginTop: '12px' } }, t('tailor.title')),
    h('p', { class: 'sub' }, t('tailor.desc')),
    roomScene('tailor'),
    h(
      'div',
      { class: 'rest-options' },
      roomOption(relicArt(PANTS), t(`relic.${PANTS}.name`), owned ? t('tailor.owned') : t(`relic.${PANTS}.d`, { n: pants.n }), owned, () => {
        sfx('tap');
        gainRelic(run, PANTS);
        playRelic(el, PANTS, { start: 'snip', end: 'jingle' });
        closeRoom(el, onDone, CARD_SHOW_MS);
      }),
      roomOption(icon('crystal'), t('tailor.crystal'), t('tailor.crystalDesc', { n: CONFIG.tailorCrystals }), false, () => {
        tailorCrystal(run);
        playHealing(el, CONFIG.tailorCrystals, t('tailor.fitted'), false, 'crystal');
        closeRoom(el, onDone, HEAL_ANIM_MS);
      }),
    ),
  );
  return { el };
}
