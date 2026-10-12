import { voice } from '../../audio/sfx';
import { CONFIG } from '../../data/config';
import { h } from '../dom';

/** `speech`: the enemy talking (over the enemy); `shout`: the hero's line (low on the stage, its tail pointing down at the hero). */
export type BubbleKind = 'speech' | 'shout';

export interface Bubble {
  /** `performance.now()` once the bubble has gone: a note meant to follow it waits until then. */
  end: number;
  /** Takes it away at once, mid-line included. */
  cancel(): void;
}

const live = new WeakMap<Element, Partial<Record<BubbleKind, Bubble>>>();

/**
 * A paper speech bubble on the stage, one per kind at a time: the line is typed out letter by letter (the unsaid part keeps the bubble's size)
 * within `ms`, while the speaker's voice reads it, in a pitch of its own (taken from `seed`). It stays `hold` ms once all the text is there, then goes by itself.
 */
export function say(stage: HTMLElement, text: string, kind: BubbleKind, seed: string, ms: number, hold: number = CONFIG.speechHold): Bubble {
  const mine = live.get(stage) ?? {};
  live.set(stage, mine);
  mine[kind]?.cancel();
  const said = h('span', null);
  const unsaid = h('span', { class: 'unsaid' }, text);
  const bubble = h('div', { class: kind, 'aria-label': text }, said, unsaid);
  stage.append(bubble);
  const letters = [...text];
  const gap = Math.min(CONFIG.voiceMs, (ms * 0.7) / Math.max(1, letters.length));
  const total = gap * letters.length + hold;
  const [lo, hi] = CONFIG.voicePitch;
  voice(text, lo + ([...seed].reduce((sum, c) => sum + c.charCodeAt(0) * 7, 0) % (hi - lo)), gap);
  let n = 0;
  const typing = window.setInterval(() => {
    n++;
    said.textContent = letters.slice(0, n).join('');
    unsaid.textContent = letters.slice(n).join('');
    if (n >= letters.length) clearInterval(typing);
  }, gap);
  const hideTimer = window.setTimeout(() => {
    bubble.classList.add('out');
    bubble.addEventListener('animationend', () => bubble.remove());
  }, total);
  const self: Bubble = {
    end: performance.now() + total,
    cancel() {
      clearInterval(typing);
      clearTimeout(hideTimer);
      bubble.remove();
      if (mine[kind] === self) delete mine[kind];
    },
  };
  mine[kind] = self;
  return self;
}
