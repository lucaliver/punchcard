import { FOE_ART } from './foes';
import { ICON_ART } from './icons';
import { CHARM_ART, RELIC_ART } from './items';
import { KEEPER_ART } from './keepers';
import { SPIRIT_ART } from './spirits';

/** Every drawing by group. The groups are listed so the dev contact sheet can show them one by one. */
export const ALL_ART: Record<string, Record<string, string>> = {
  foes: FOE_ART,
  spirits: SPIRIT_ART,
  charms: CHARM_ART,
  relics: RELIC_ART,
  keepers: KEEPER_ART,
  icons: ICON_ART,
};
