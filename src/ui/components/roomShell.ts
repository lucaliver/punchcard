import { t } from '../../core/i18n';
import type { RunState } from '../../game/run';
import { pico } from '../app';
import { artUrl } from '../art/sprites';
import { h } from '../dom';

export interface ShellOpts {
  run: RunState;
  /** CSS class of the room (`rest`, `shrine`…): the scene's look. */
  room: string;
  title: string;
  sub?: string;
  scene: HTMLElement;
  body: HTMLElement;
  foot?: HTMLElement | null;
}

/** The mon and flame the keeper carries, always in view in a room. */
export function purse(run: RunState): HTMLElement {
  return h(
    'div',
    { class: 'purse' },
    h('span', { class: 'chip' }, pico('flame'), `${Math.ceil(run.flame)}/${run.maxFlame}`),
    h('span', { class: 'chip mon' }, pico('coin'), String(run.mon)),
  );
}

/** The frame every room shares: a heading, a picture on top, the choices below, and a foot with the way out. */
export function roomShell(o: ShellOpts): HTMLElement {
  return h(
    'div',
    { class: `screen room ${o.room}`, 'data-act': o.run.act },
    h(
      'div',
      { class: 'room-head' },
      h('div', { class: 'room-title title-font' }, o.title),
      o.sub ? h('div', { class: 'room-sub' }, o.sub) : null,
      purse(o.run),
    ),
    h('div', { class: 'room-scene' }, o.scene),
    h('div', { class: 'room-body scroll' }, o.body),
    o.foot ? h('div', { class: 'room-foot' }, o.foot) : null,
  );
}

/** A choice the keeper can make in a room: a paper tag with a picture, a name and what it does. */
export function choice(o: { icon: string; name: string; text: string; disabled?: boolean; note?: string; onClick: () => void }): HTMLElement {
  const b = h(
    'button',
    { class: 'choice panel', disabled: o.disabled },
    h('img', { class: 'choice-icon', src: artUrl(o.icon), alt: '' }),
    h('div', { class: 'choice-text' }, h('b', { class: 'title-font' }, o.name), h('span', {}, o.text), o.note ? h('i', {}, o.note) : null),
  );
  b.addEventListener('click', o.onClick);
  return b;
}

export const leaveBtn = (onClick: () => void, label = t('ui.continue')): HTMLElement => h('button', { class: 'btn big', onclick: onClick }, label);
