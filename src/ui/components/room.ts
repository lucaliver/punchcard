import { type SoundId, sfx } from '../../audio/sfx';
import type { NodeType } from '../../game/run';
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
};

/** The big picture at the top of a room: its sprite, moving, on a plinth in the act's ink, with motes drifting behind. It comes in its own way (`ENTRANCE`). */
export function roomScene(type: NodeType): HTMLElement {
  const { anim, inks, alt } = ROOM_SCENE[type] ?? NO_SCENE;
  const entrance = ENTRANCE[type];
  for (const [ms, sound] of entrance?.sounds ?? []) setTimeout(() => sfx(sound), ms);
  return h('div', {
    class: `room-scene enter-${type}`,
    html: `${motes(14, inks)}<div class="room-stage"><div class="pedestal"></div><div class="room-art ${anim}">${roomArt(type)}${alt ? roomArt(`${type}.open`, 'alt') : ''}</div>${entrance?.fx?.() ?? ''}</div>`,
  });
}

/** The choice is made: locks the room's buttons and goes on once its animation (`ms`) is over. */
export function closeRoom(el: HTMLElement, onDone: () => void, ms: number): void {
  el.querySelectorAll('button').forEach((b) => {
    b.disabled = true;
  });
  setTimeout(onDone, ms);
}
