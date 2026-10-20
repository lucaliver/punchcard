import './styles/index.css';

import { applyVolumes } from './audio/sfx';
import { t } from './core/i18n';
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

/** If the game throws, a paper sheet says so and offers the way out (the climb itself is saved at every step). */
function catchCrashes(): void {
  let shown = false;
  const show = (what: unknown): void => {
    if (shown) return;
    shown = true;
    const text = what instanceof Error ? `${what.message}\n${what.stack ?? ''}` : String(what);
    console.error(text);
    const sheet = document.createElement('div');
    sheet.className = 'crash';
    sheet.innerHTML = '<div class="panel"><h2 class="title-font"></h2><p></p><pre></pre><div class="actions"></div></div>';
    (sheet.querySelector('h2') as HTMLElement).textContent = t('crash.title');
    (sheet.querySelector('p') as HTMLElement).textContent = t('crash.body');
    (sheet.querySelector('pre') as HTMLElement).textContent = `v${__APP_VERSION__}\n${text.slice(0, 700)}`;
    const reload = document.createElement('button');
    reload.className = 'btn';
    reload.textContent = t('crash.reload');
    reload.addEventListener('click', () => location.reload());
    (sheet.querySelector('.actions') as HTMLElement).append(reload);
    document.body.append(sheet);
  };
  addEventListener('error', (e) => show(e.error ?? e.message));
  addEventListener('unhandledrejection', (e) => show(e.reason));
}

/** A phone held sideways gets a curtain asking to turn it upright (CSS shows it; the fight pauses behind it). */
function rotateBanner(): void {
  const el = document.createElement('div');
  el.className = 'rotate-banner';
  el.innerHTML = '<div class="panel"><div class="title-font"></div><p></p></div>';
  (el.querySelector('.title-font') as HTMLElement).textContent = t('rotate.title');
  (el.querySelector('p') as HTMLElement).textContent = t('rotate.body');
  document.body.append(el);
}

async function boot(): Promise<void> {
  catchCrashes();
  rotateBanner();
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
    const battle = new Battle({
      seed,
      keeper,
      deck,
      relics: (q.get('relics') ?? '').split(',').filter(Boolean),
      stage: makeStage({ act, floor, kind, seed }),
      flame: k.flame,
      maxFlame: k.flame,
    });
    (window as unknown as { __battle: Battle }).__battle = battle;
    await show(battleScreen({ battle, act, kind, title: 'Debug watch', onEnd: () => location.reload(), onAbandon: () => location.reload() }), {
      instant: true,
    });
    return;
  }
  startGame();
}

void boot();
