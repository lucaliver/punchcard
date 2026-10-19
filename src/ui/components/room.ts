import { type SoundId, sfx } from '../../audio/sfx';
import type { NodeType } from '../../game/run';
import { t, type TKey } from '../../core/i18n';
import { say } from '../combat/speech';
import { h } from '../dom';
import { roomArt } from '../art/rooms';
import { motes } from './decor';
import { keywordHtml } from './cardView';

/** A choice button of a room (Break Room, Copy Room, Promotion); `art` is the HTML of its icon or sprite. */
export const roomOption = (art: string, title: string, desc: string, disabled: boolean, fn: () => void): HTMLButtonElement =>
  h('button', { class: 'option', disabled, onclick: fn, html: `${art}<b>${title}</b><span>${keywordHtml(desc)}</span>` });

/** How a room's picture moves (`anim`: a class of rooms.css), the inks of its motes, and whether its sprite has a second frame (`.open`). */
export const ROOM_SCENE: Partial<Record<NodeType, { anim: string; inks: string[]; alt?: boolean }>> = {
  rest: { anim: 'steam', inks: ['var(--paper)', 'var(--paper)', 'var(--y)'] },
  promotion: { anim: 'climb', inks: ['var(--y)', 'var(--b)'] },
  copy: { anim: 'copy', inks: ['var(--paper)', 'var(--paper)', 'var(--y)'] },
  tailor: { anim: 'sway', inks: ['var(--paper)', 'var(--paper)', 'var(--y)'] },
  lostFound: { anim: 'flap', inks: ['var(--paper)', 'var(--paper)', 'var(--y)'], alt: true },
  vending: { anim: 'thump', inks: ['var(--paper)', 'var(--p)', 'var(--y)'] },
  restructuring: { anim: 'shuffle', inks: ['var(--paper)', 'var(--paper)', 'var(--p)'], alt: true },
  lunch: { anim: 'steam', inks: ['var(--paper)', 'var(--y)', 'var(--p)'] },
  lottery: { anim: 'sway', inks: ['var(--y)', 'var(--p)', 'var(--paper)'] },
  event: { anim: '', inks: ['var(--paper)', 'var(--b)', 'var(--y)'] },
};

const NO_SCENE = { anim: '', inks: [], alt: false };

/**
 * How a room's picture comes in (`rooms.css`, `.enter-<type>`): the sounds that go with it (at `ms` after the screen opens) and the extra pieces it needs
 * on the sprite's box (`fx`: a bar of light, the two halves of a curtain).
 */
const ENTRANCE: Partial<Record<NodeType, { sounds: [ms: number, sound: SoundId][]; fx?: () => string }>> = {
  rest: { sounds: [[480, 'blunt']] },
  promotion: { sounds: [[100, 'machinery']] },
  copy: { sounds: [[0, 'copier']], fx: () => '<i class="room-fx scan"></i>' },
  tailor: { sounds: [[250, 'swipe']], fx: () => '<i class="room-fx drape l"></i><i class="room-fx drape r"></i>' },
  lostFound: { sounds: [[420, 'thunk']] },
  vending: {
    sounds: [
      [0, 'machinery'],
      [850, 'coin'],
    ],
  },
  restructuring: { sounds: [[300, 'reshuffle']] },
  lunch: { sounds: [[200, 'doorBell']] },
  lottery: { sounds: [[300, 'coin']] },
  event: { sounds: [[300, 'doorBell']] },
};

/** The rooms whose picture talks, and how many lines it has for coming in and for a choice made (`quip.<room>.enter.<n>`, `quip.<room>.done.<n>`). */
const QUIPS: Partial<Record<NodeType, { enter: number; done: number }>> = Object.fromEntries(
  (['rest', 'promotion', 'copy', 'tailor', 'lostFound', 'vending', 'restructuring', 'lunch', 'lottery'] as const).map((t) => [
    t,
    { enter: 3, done: 2 },
  ]),
);
/** How long a quip takes to be typed out (ms). */
const QUIP_MS = 1300;
/** The wait between a room's picture coming in and its first line (ms). */
const QUIP_WAIT = 1100;

/** The room's picture says one of its lines (`say`, like an enemy's): a random one for the moment (`enter` or `done`). */
function quip(scene: HTMLElement, type: NodeType, when: 'enter' | 'done'): void {
  const n = QUIPS[type]?.[when];
  if (!n || !scene.isConnected) return;
  say(scene, t(`quip.${type}.${when}.${Math.floor(Math.random() * n)}` as TKey), 'speech', type, QUIP_MS);
}

/** The big picture at the top of a room: its sprite, moving, on a plinth in the act's ink, with motes drifting behind. It comes in its own way (`ENTRANCE`). */
export function roomScene(type: NodeType): HTMLElement {
  const { anim, inks, alt } = ROOM_SCENE[type] ?? NO_SCENE;
  const entrance = ENTRANCE[type];
  for (const [ms, sound] of entrance?.sounds ?? []) setTimeout(() => sfx(sound), ms);
  const scene = h('div', {
    class: `room-scene enter-${type}`,
    'data-room': type,
    html: `${motes(14, inks)}<div class="room-stage"><div class="pedestal"></div><div class="room-art ${anim}">${roomArt(type)}${alt ? roomArt(`${type}.open`, 'alt') : ''}</div>${entrance?.fx?.() ?? ''}</div>`,
  });
  setTimeout(() => quip(scene, type, 'enter'), QUIP_WAIT);
  return scene;
}

/** The choice is made: locks the room's buttons and goes on once its animation (`ms`) is over. */
export function closeRoom(el: HTMLElement, onDone: () => void, ms: number): void {
  el.querySelectorAll('button').forEach((b) => {
    b.disabled = true;
  });
  const scene = el.querySelector<HTMLElement>('.room-scene[data-room]');
  if (scene) quip(scene, scene.dataset.room as NodeType, 'done');
  setTimeout(onDone, ms);
}
