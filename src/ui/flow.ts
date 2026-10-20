import { unlockAudio } from '../audio/sfx';
import { playMusic } from '../audio/music';
import { randomSeed } from '../core/rng';
import { t } from '../core/i18n';
import { CARDS } from '../data/cards';
import { CONFIG } from '../data/config';
import { Battle } from '../game/battle';
import { bossDown, discover, logRun, meta, saveMeta } from '../game/meta';
import {
  afterFight,
  applyBattle,
  battleSetup,
  clearRun,
  fightKind,
  loadRun,
  newRun,
  offerReward,
  type RunNode,
  type RunState,
  saveRun,
  startAct,
} from '../game/run';
import { applySettings, saveSettings, settings } from '../game/settings';
import type { KeeperId } from '../game/types';
import { confirmModal, openModal, show } from './app';
import { battleScreen } from './battle/battleScreen';
import { openHowTo } from './components/howTo';
import { openSettings } from './components/settingsModal';
import { almanacScreen } from './screens/almanac';
import { keepersScreen } from './screens/keepers';
import { mapScreen } from './screens/map';
import { marketScreen } from './screens/market';
import { rewardScreen } from './screens/reward';
import { restScreen, shrineScreen, treasureScreen } from './screens/rooms';
import { actIntroScreen, endScreen } from './screens/story';
import { titleScreen } from './screens/title';

/** The run's flow: which screen follows which. State lives in `run` (saved at every step), the screens only show it. */
let run: RunState | null = null;
/** A keeper this run unlocked, for the end screen. */
let unlocked: KeeperId | null = null;

const NIGHT_TRACK = { 1: 'night1', 2: 'night2', 3: 'night3' } as const;

/** Tools for trying the game out: only reachable once the version line has been tapped enough times. */
function debugMenu(): void {
  const act = (label: string, fn: () => void): { label: string; cls: string; onClick: () => boolean } => ({
    label,
    cls: 'paper',
    onClick: () => {
      fn();
      return true;
    },
  });
  const r = run;
  openModal({
    title: t('settings.debug'),
    actions: [
      act('Unlock all keepers', () => {
        for (const k of ['miko', 'ronin', 'tanuki'] as const) if (!meta.unlocked.includes(k)) meta.unlocked.push(k);
        saveMeta();
        showTitle();
      }),
      ...(r
        ? [
            act('+100 mon', () => {
              r.mon += 100;
              saveRun(r);
              goMap();
            }),
            act('Mend the lantern', () => {
              r.flame = r.maxFlame;
              saveRun(r);
              goMap();
            }),
            act('Skip to night 2', () => {
              startAct(r, 2);
              saveRun(r);
              intro();
            }),
            act('Skip to night 3', () => {
              startAct(r, 3);
              saveRun(r);
              intro();
            }),
          ]
        : []),
      { label: t('ui.close'), cls: 'red' },
    ],
  });
}

export function showTitle(): void {
  playMusic('title');
  void show(
    titleScreen({
      hasRun: loadRun() !== null,
      onPlay: () => {
        unlockAudio();
        const go = (): void => chooseKeeper();
        if (loadRun()) confirmModal(t('title.newRunQ'), t('title.newRunBody'), go);
        else go();
      },
      onContinue: () => {
        unlockAudio();
        resume();
      },
      onAlmanac: () => {
        unlockAudio();
        void show(almanacScreen(showTitle));
      },
      onSettings: () => openSettings({ onLocale: showTitle, onReset: () => undefined, onDebug: debugMenu }),
      onHow: () => openHowTo(),
      onDebug: () => {
        saveSettings();
        debugMenu();
      },
    }),
  );
}

function chooseKeeper(): void {
  playMusic('map');
  void show(
    keepersScreen({
      onBack: showTitle,
      onPick: (keeper) => {
        run = newRun(keeper, randomSeed(), !meta.introDone);
        unlocked = null;
        saveRun(run);
        intro();
      },
    }),
  );
}

/** Picks the saved run up where it was left. */
function resume(): void {
  run = loadRun();
  if (!run) {
    showTitle();
    return;
  }
  unlocked = null;
  if (run.reward && !run.reward.taken) {
    rewardFlow(run.map[run.at ?? 0]);
    return;
  }
  if (run.introAct < run.act) {
    intro();
    return;
  }
  if (run.inRoom !== null) {
    enterRoom(run.map[run.inRoom]);
    return;
  }
  goMap();
}

function intro(): void {
  const r = run;
  if (!r) return;
  playMusic('map');
  void show(
    actIntroScreen(r.act, () => {
      r.introAct = r.act;
      saveRun(r);
      goMap();
    }),
  );
}

function discoverRun(r: RunState): void {
  discover(
    'seenCards',
    r.deck.map((c) => c.id),
  );
  discover('seenRelics', r.relics);
}

function goMap(): void {
  const r = run;
  if (!r) return;
  saveRun(r);
  discoverRun(r);
  playMusic('map');
  void show(
    mapScreen({
      run: r,
      onEnter: enterRoom,
      onMenu: () => mapMenu(r),
    }),
  );
}

function mapMenu(r: RunState): void {
  openModal({
    title: t('ui.paused'),
    actions: [
      { label: t('ui.resume'), cls: 'red' },
      {
        label: t('title.settings'),
        cls: 'paper',
        onClick: () => {
          openSettings({ onLocale: () => goMap() });
          return false;
        },
      },
      {
        label: t('ui.toTitle'),
        cls: 'paper',
        onClick: () => {
          saveRun(r);
          showTitle();
        },
      },
      {
        label: t('ui.giveUp'),
        cls: 'paper',
        onClick: () => {
          confirmModal(t('ui.giveUpQ'), t('ui.giveUpBody'), () => finishRun(false));
          return false;
        },
      },
    ],
  });
}

function completeRoom(node: RunNode): void {
  const r = run;
  if (!r) return;
  r.at = node.id;
  r.inRoom = null;
  r.shop = null;
  r.visited[node.type] = (r.visited[node.type] ?? 0) + 1;
  goMap();
}

function enterRoom(node: RunNode): void {
  const r = run;
  if (!r) return;
  r.inRoom = node.id;
  saveRun(r);
  const done = (): void => completeRoom(node);
  switch (node.type) {
    case 'watch':
    case 'elite':
    case 'boss':
      fight(node);
      return;
    case 'rest':
      playMusic('rest');
      return void show(restScreen({ run: r, onDone: done }));
    case 'shrine':
      playMusic('rest');
      return void show(shrineScreen({ run: r, onDone: done }));
    case 'treasure':
      playMusic('market');
      return void show(treasureScreen({ run: r, onDone: done }));
    case 'market':
      playMusic('market');
      return void show(marketScreen({ run: r, onDone: done, onChange: () => saveRun(r) }));
  }
}

function fight(node: RunNode): void {
  const r = run;
  if (!r) return;
  const kind = fightKind(node);
  const battle = new Battle(battleSetup(r, node));
  discover('seenFoes', [...new Set(battle.stage.spawns.map((s) => s.foe))]);
  playMusic(kind === 'boss' ? 'boss' : NIGHT_TRACK[r.act as 1 | 2 | 3]);
  if (import.meta.env.DEV) (window as unknown as { __battle: Battle }).__battle = battle;
  const title = kind === 'boss' ? t(`act.${r.act}.boss`) : kind === 'elite' ? t('node.elite') : t('node.watch');
  void show(
    battleScreen({
      battle,
      act: r.act,
      kind,
      title,
      tour: !settings.seenTour && r.first,
      onAbandon: () => finishRun(false),
      onEnd: (res) => {
        if (!res.won) {
          finishRun(false);
          return;
        }
        applyBattle(r, node, res.flame, res.stats);
        afterFight(r, kind);
        offerReward(r, kind, res.flame, res.timeLeft, res.early);
        saveRun(r);
        rewardFlow(node);
      },
    }),
  );
}

function rewardFlow(node: RunNode): void {
  const r = run;
  if (!r?.reward) {
    goMap();
    return;
  }
  const offer = r.reward;
  discover(
    'seenCards',
    offer.cards.map((c) => c.id),
  );
  discover('seenRelics', offer.relics);
  playMusic('win');
  void show(
    rewardScreen({
      run: r,
      offer,
      onDone: () => {
        r.reward = null;
        if (node.type === 'boss') {
          const fresh = bossDown(r.act);
          if (fresh) unlocked = fresh;
          if (r.act >= CONFIG.run.acts) {
            finishRun(true);
            return;
          }
          startAct(r, r.act + 1);
          saveRun(r);
          intro();
          return;
        }
        completeRoom(node);
      },
    }),
  );
}

function finishRun(won: boolean): void {
  const r = run;
  if (!r) {
    showTitle();
    return;
  }
  logRun({
    keeper: r.keeper,
    won,
    act: r.act,
    fights: r.fights,
    kills: r.kills,
    deck: r.deck.map((c) => c.id).filter((id) => CARDS[id]),
    relics: [...r.relics],
    at: Date.now(),
  });
  meta.introDone = true;
  settings.seenTour = true;
  saveSettings();
  saveMeta();
  clearRun();
  const log = meta.history[0];
  run = null;
  playMusic(won ? 'win' : 'lose');
  void show(
    endScreen({
      won,
      log,
      unlocked,
      onTitle: showTitle,
      onAgain: chooseKeeper,
    }),
  );
}

export function startGame(): void {
  applySettings();
  showTitle();
}

/** Handles for the browser tests and the dev console (the dev server only). */
if (import.meta.env.DEV) {
  (window as unknown as { __game: unknown }).__game = {
    run: () => run,
    /** Enters a room of this kind (the first free spot of the map is turned into one if the map has none). */
    enter: (type: string) => {
      const node = run?.map.find((n) => n.type === type) ?? run?.map.find((n) => n.row > 0 && n.type === 'watch');
      if (node) {
        node.type = type as RunNode['type'];
        enterRoom(node);
      }
    },
    map: () => goMap(),
  };
}
