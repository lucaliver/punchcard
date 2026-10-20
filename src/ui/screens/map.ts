import { t } from '../../core/i18n';
import { BOSS_OF_ACT, FOES } from '../../data/foes';
import { CONFIG } from '../../data/config';
import { KEEPERS } from '../../data/keepers';
import { RELICS } from '../../data/relics';
import { reachable, type RunNode, type RunState } from '../../game/run';
import type { RoomType } from '../../game/types';
import { type Screen, pico, toast } from '../app';
import { artUrl } from '../art/sprites';
import { openRelicDetail } from '../components/cardShow';
import { openDeck } from '../components/deckView';
import { h } from '../dom';

export interface MapOpts {
  run: RunState;
  onEnter(node: RunNode): void;
  onMenu(): void;
}

const ICON: Record<RoomType, string> = {
  watch: 'nodeWatch',
  elite: 'nodeElite',
  boss: 'nodeBoss',
  rest: 'nodeRest',
  market: 'nodeMarket',
  shrine: 'nodeShrine',
  treasure: 'nodeTreasure',
};

const COLS_X = [0.2, 0.5, 0.8];
const ROW_H = 92;

/** x of a node on the board (0..1): its column, nudged by its seed so the road wanders. */
const xOf = (n: RunNode): number => (n.type === 'boss' ? 0.5 : COLS_X[n.col] + ((n.seed % 100) / 100 - 0.5) * 0.1);

/** The mountain path of one night: rooms as stones on a road that climbs towards the boss. */
export function mapScreen(o: MapOpts): Screen {
  const run = o.run;
  const rows = CONFIG.run.mapRows + 1;
  const height = rows * ROW_H + 150;
  const yOf = (n: RunNode): number => height - 100 - n.row * ROW_H;
  const reach = new Set(reachable(run).map((n) => n.id));
  const done = new Set<number>();
  // every room on the way to where the keeper stands counts as done
  if (run.at !== null) {
    const back = (id: number): void => {
      if (done.has(id)) return;
      done.add(id);
      for (const n of run.map) if (n.next.includes(id) && n.row === run.map[id].row - 1) back(n.id);
    };
    back(run.at);
  }

  const svgNS = 'http://www.w3.org/2000/svg';
  const roads = document.createElementNS(svgNS, 'svg');
  roads.setAttribute('class', 'm-roads');
  roads.setAttribute('viewBox', `0 0 100 ${height}`);
  roads.setAttribute('preserveAspectRatio', 'none');
  const board = h('div', { class: 'm-board', style: { height: `${height}px` } });
  board.append(roads as unknown as Node);

  const drawRoad = (a: { x: number; y: number }, b: { x: number; y: number }, cls: string): void => {
    const path = document.createElementNS(svgNS, 'path');
    const my = (a.y + b.y) / 2;
    path.setAttribute('d', `M${a.x * 100} ${a.y} C${a.x * 100} ${my}, ${b.x * 100} ${my}, ${b.x * 100} ${b.y}`);
    path.setAttribute('class', `road ${cls}`);
    path.setAttribute('vector-effect', 'non-scaling-stroke');
    roads.append(path);
  };

  // the foot of the mountain: where the keeper starts
  const gate = { x: 0.5, y: height - 24 };
  for (const n of run.map.filter((m) => m.row === 0)) drawRoad(gate, { x: xOf(n), y: yOf(n) }, run.at === null ? 'live' : 'done');
  for (const n of run.map) {
    for (const id of n.next) {
      const m = run.map[id];
      const live = n.id === run.at && reach.has(id);
      const walked = done.has(n.id) && done.has(id);
      drawRoad({ x: xOf(n), y: yOf(n) }, { x: xOf(m), y: yOf(m) }, live ? 'live' : walked ? 'done' : '');
    }
  }

  const nodeEls: HTMLElement[] = [];
  for (const n of run.map) {
    const isBoss = n.type === 'boss';
    const can = reach.has(n.id);
    const cls = ['m-node', n.type, can ? 'reach' : '', done.has(n.id) ? 'done' : '', n.id === run.at ? 'here' : ''].filter(Boolean).join(' ');
    const label = isBoss ? t(`act.${run.act}.boss`) : t(`node.${n.type}`);
    const icon = isBoss ? h('img', { class: 'pico boss-face', src: artUrl(FOES[BOSS_OF_ACT[run.act]].art), alt: '' }) : pico(ICON[n.type]);
    const b = h(
      'button',
      { class: cls, style: { left: `${xOf(n) * 100}%`, top: `${yOf(n)}px` }, 'aria-label': label },
      h('span', { class: 'disc' }, icon),
      can || isBoss ? h('span', { class: 'm-label' }, label) : null,
    );
    b.addEventListener('click', () => {
      if (can) o.onEnter(n);
      else toast(isBoss ? label : `${label}${done.has(n.id) ? ` · ${t('map.cleared')}` : ''}`);
    });
    nodeEls.push(b);
    board.append(b);
  }
  // the keeper's pawn
  const pawnAt = run.at === null ? { x: 0.5, y: gate.y } : { x: xOf(run.map[run.at]), y: yOf(run.map[run.at]) };
  board.append(
    h(
      'div',
      { class: 'm-pawn', style: { left: `${pawnAt.x * 100}%`, top: `${pawnAt.y - (run.at === null ? 0 : 36)}px` } },
      h('img', { src: artUrl(run.keeper), alt: '' }),
    ),
  );

  const flamePips = h(
    'div',
    { class: 'pips' },
    ...Array.from({ length: run.maxFlame }, (_, i) =>
      h('i', { class: `pip ${i >= run.flame ? 'off' : ''}`.trim(), style: { '--img': `url("${artUrl('flame')}")` } }),
    ),
  );
  const relics = h(
    'div',
    { class: 'm-relics' },
    ...run.relics.map((id) => {
      const b = h('button', { class: 'm-relic' }, h('img', { src: artUrl(RELICS[id].art), alt: '' }));
      b.addEventListener('click', () => openRelicDetail(id));
      return b;
    }),
  );
  const deckBtn = h(
    'button',
    { class: 'btn paper small m-deck', onclick: () => openDeck({ title: t('ui.yourDeck'), cards: run.deck }) },
    pico('cards'),
    String(run.deck.length),
  );
  const menuBtn = h('button', { class: 'icon-btn', 'aria-label': t('ui.pause'), onclick: o.onMenu }, pico('gear'));
  const head = h(
    'div',
    { class: 'm-head' },
    menuBtn,
    h(
      'div',
      { class: 'm-title' },
      h('div', { class: 'title-font' }, t(`act.${run.act}.name`)),
      h('div', { class: 'm-sub' }, t(`act.${run.act}.sub`)),
    ),
    deckBtn,
  );
  const status = h(
    'div',
    { class: 'm-status' },
    h('div', { class: 'm-flame' }, pico('flame'), flamePips),
    h('div', { class: 'chip' }, pico('coin'), String(run.mon)),
  );
  const scroll = h('div', { class: 'm-scroll scroll' }, board);
  const el = h(
    'div',
    { class: 'screen map', 'data-act': run.act, 'data-keeper': KEEPERS[run.keeper].id },
    head,
    status,
    relics.children.length ? relics : null,
    scroll,
  );
  return {
    el,
    enter() {
      // the foot of the mountain is what is seen first, or the room just cleared with the road above it
      const focus = run.at === null ? height : yOf(run.map[run.at]) + 140;
      requestAnimationFrame(() => {
        scroll.scrollTop = Math.max(0, focus - scroll.clientHeight);
      });
    },
  };
}
