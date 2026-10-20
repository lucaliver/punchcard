import './styles/index.css';

import { applyVolumes } from './audio/sfx';
import { randomSeed } from './core/rng';
import { KEEPERS } from './data/keepers';
import { Battle } from './game/battle';
import { applySettings } from './game/settings';
import type { CardInst, KeeperId } from './game/types';
import { makeStage } from './game/waves';
import { startGame } from './ui/flow';
import { initApp, show } from './ui/app';
import { preloadArt } from './ui/art/sprites';
import { battleScreen } from './ui/battle/battleScreen';
import { paintWashi } from './ui/washi';

async function boot(): Promise<void> {
  applySettings();
  const root = document.getElementById('app') as HTMLElement;
  initApp(root);
  paintWashi();
  await Promise.all([preloadArt(), document.fonts?.ready]);
  applyVolumes();

  const q = new URLSearchParams(location.search);
  if (import.meta.env.DEV && q.has('fight')) {
    const keeper = (q.get('keeper') ?? 'miko') as KeeperId;
    const act = Number(q.get('act') ?? 1);
    const kind = (q.get('kind') ?? 'watch') as 'watch' | 'elite' | 'boss';
    const floor = Number(q.get('floor') ?? 0);
    const seed = Number(q.get('seed') ?? randomSeed());
    const k = KEEPERS[keeper];
    let uid = 1;
    const deck: CardInst[] = k.deck.map((id) => ({ uid: uid++, id, up: false }));
    const battle = new Battle({ seed, keeper, deck, relics: [], stage: makeStage({ act, floor, kind, seed }), flame: k.flame, maxFlame: k.flame });
    (window as unknown as { __battle: Battle }).__battle = battle;
    await show(battleScreen({ battle, act, kind, title: 'Debug watch', onEnd: () => location.reload(), onAbandon: () => location.reload() }), {
      instant: true,
    });
    return;
  }
  startGame();
}

void boot();
