import { sfx, voice } from '../../audio/sfx';
import { t } from '../../core/i18n';
import { CONFIG } from '../../data/config';
import { ENEMIES } from '../../data/enemies';
import type { EventChoice, EventDef, EventFx } from '../../data/events';
import { applyFx, choicePossible, type Done, finishEvent, needsPick, pickShred, pickUpgrade, rollEvent, rollResult } from '../../game/events';
import { canUpgrade, type RunState } from '../../game/run';
import type { Screen } from '../app';
import { icon } from '../art/icons';
import { creature } from '../art/creatures';
import { CARD_SHOW_MS, playCardChange, playCardGain, playRelic, playShred } from '../components/cardShow';
import { motes } from '../components/decor';
import { openDeck } from '../components/modals';
import { type Typing, typeLine } from '../components/typewriter';
import { roomScene } from '../components/room';
import { h } from '../dom';
import { haptic } from '../fx/fx';
import { HEAL_ANIM_MS, playHealing } from './rest';
import { runHud } from './journey';

/** One letter of a typed line every so many ms (the speaker's voice blips on each). */
const TYPE_MS = 24;
/** The moment between two things that happen after a choice (ms). */
const BEAT_MS = 350;

type Tone = 'good' | 'bad' | 'plain';

/** A chip of what an effect does: its pixel icon and the amount, tinted by whether it helps. `null` for an effect that shows nothing (a story flag). */
function chip(run: RunState, fx: EventFx): { icon: string; text: string; tone: Tone } | null {
  const signed = (n: number): string => `${n > 0 ? '+' : '−'}${Math.abs(n)}`;
  const tone = (n: number): Tone => (n > 0 ? 'good' : 'bad');
  switch (fx.kind) {
    case 'hp':
      return { icon: 'heart', text: signed(fx.n), tone: tone(fx.n) };
    case 'heal':
      return { icon: 'heart', text: signed(Math.round(run.maxHp * fx.pct)), tone: 'good' };
    case 'maxHp':
      return { icon: fx.n > 0 ? 'heartUp' : 'heartbreak', text: signed(fx.n), tone: tone(fx.n) };
    case 'pay':
      return { icon: 'coin', text: signed(fx.n), tone: tone(fx.n) };
    case 'relic':
      return { icon: 'lostBox', text: '+1', tone: 'good' };
    case 'card':
      return { icon: 'addCard', text: '+1', tone: 'good' };
    case 'upgrade':
    case 'upgradeRandom':
      return { icon: 'upgrade', text: '+1', tone: 'good' };
    case 'shred':
      return { icon: 'shredder', text: '−1', tone: 'plain' };
    case 'crystal':
      return { icon: 'crystalUp', text: '+1', tone: 'good' };
    case 'flag':
      return null;
  }
}

const chipHtml = (run: RunState, fx: EventFx[]): string => {
  const chips = fx.flatMap((f) => chip(run, f) ?? []);
  if (!chips.length) return `<i class="fx-chip plain"><b>${t('event.nothing')}</b></i>`;
  return chips.map((c) => `<i class="fx-chip ${c.tone}">${icon(c.icon)}<b>${c.text}</b></i>`).join('');
};

/** What a choice shows before it is made: the chips of its result, or, for a gamble, of every result it may end in, one after the other. */
const optionChips = (run: RunState, choice: EventChoice): string =>
  choice.results.map((r) => `<span class="fx-set">${chipHtml(run, r.fx)}</span>`).join('<i class="fx-or">/</i>');

/**
 * The Water Cooler (events): a scene with a speaker, a few typed lines and two or three choices. Each shows its chips before it is picked; what comes out
 * of it is applied at once (`game/events.ts`) and then played one beat after another: the lines of the result, then its effects, then the hand picks (a card
 * to upgrade or to shred), then the button that ends the room. Nothing is saved until the room ends, like the other rooms.
 */
export function eventScreen(run: RunState, onDone: () => void): Screen {
  const def: EventDef = rollEvent(run);
  const timers = new Set<number>();
  const later = (ms: number, fn: () => void): void => {
    const id = window.setTimeout(() => {
      timers.delete(id);
      fn();
    }, ms);
    timers.add(id);
  };
  let typing: Typing | undefined;

  const title = def.speaker ? t(`enemy.${def.speaker}.name`) : t('event.cooler');
  const said = h('span', null);
  const unsaid = h('span', { class: 'unsaid' });
  const slip = h('div', { class: 'event-slip', 'aria-live': 'polite' }, h('b', { class: 'event-name' }, title), said, unsaid);
  const options = h('div', { class: 'event-options' });
  const outcome = h('div', { class: 'event-outcome' });
  const actions = h('div', { class: 'event-actions' });
  let hud = runHud(run);

  /** Types a line into the slip with the speaker's voice; a tap on the slip shows it whole. Calls `then` when it is all there. */
  const speak = (text: string, then: () => void): void => {
    typing?.cancel();
    const [lo, hi] = CONFIG.voicePitch;
    voice(text, lo + ([...def.id].reduce((sum, c) => sum + c.charCodeAt(0) * 7, 0) % (hi - lo)), TYPE_MS);
    const line = typeLine(said, unsaid, text, TYPE_MS, () => {
      slip.onclick = null;
      then();
    });
    slip.onclick = line.skip;
    typing = line;
  };

  const refreshHud = (): void => {
    const fresh = runHud(run);
    hud.replaceWith(fresh);
    hud = fresh;
  };

  /** The hero takes a knock: the screen flashes and the phone knocks back. */
  const hurt = (): void => {
    sfx('blunt');
    haptic('hit');
    el.classList.remove('hurt');
    void el.offsetWidth;
    el.classList.add('hurt');
  };

  /** Plays what one effect did and returns how long it takes. */
  const play = (d: Done): number => {
    const { fx } = d;
    switch (fx.kind) {
      case 'hp':
        if (d.hp && d.hp < 0) hurt();
        else if (d.hp) playHealing(el, d.hp);
        return d.hp && d.hp > 0 ? HEAL_ANIM_MS : BEAT_MS;
      case 'heal':
        if (d.hp) playHealing(el, d.hp);
        return d.hp ? HEAL_ANIM_MS : 0;
      case 'maxHp':
        if (fx.n > 0) playHealing(el, fx.n, t('reward.maxHp'), false, 'heartUp');
        else hurt();
        return fx.n > 0 ? HEAL_ANIM_MS : BEAT_MS;
      case 'pay':
        sfx(fx.n > 0 ? 'coin' : 'denied');
        return BEAT_MS;
      case 'crystal':
        sfx('mana');
        haptic('ability');
        return BEAT_MS;
      case 'relic':
        if (d.relic) playRelic(el, d.relic, { start: 'chomp', end: 'jingle' });
        return d.relic ? CARD_SHOW_MS : 0;
      case 'card':
        if (d.card) playCardGain(el, [d.card], t('event.added'), { start: 'deckAdd', end: 'levelUp' });
        return d.card ? CARD_SHOW_MS : 0;
      case 'upgradeRandom':
        if (d.card) playCardChange(el, { ...d.card, up: false }, { ...d.card }, t('rest.upgraded'), { start: 'anvil', end: 'levelUp' });
        return d.card ? CARD_SHOW_MS : 0;
      case 'upgrade':
      case 'shred':
      case 'flag':
        return 0;
    }
  };

  /** The room is over: the chips of what happened stay, and a button leaves. */
  const finish = (): void => {
    refreshHud();
    actions.replaceChildren(
      h(
        'button',
        {
          class: 'btn cta',
          onclick: () => {
            actions.querySelectorAll('button').forEach((b) => {
              b.disabled = true;
            });
            finishEvent(run, def.id);
            later(120, onDone);
          },
        },
        t('event.continue'),
      ),
    );
  };

  /** A pick of the hand: the deck opens until a card is chosen (closing it leaves a button to open it again). */
  const pick = (kind: 'upgrade' | 'shred', then: () => void): void => {
    const open = (): void => {
      sfx('tap');
      openDeck(run.deck, {
        title: t(kind === 'upgrade' ? 'rest.smithHint' : 'event.shredHint'),
        confirmLabel: t(kind === 'upgrade' ? 'rest.upgrade' : 'event.shred'),
        filter: kind === 'upgrade' ? canUpgrade : undefined,
        previewSelected: kind === 'upgrade' ? (c) => ({ ...c, up: true }) : undefined,
        onPick: (c) => {
          actions.replaceChildren();
          if (kind === 'upgrade') {
            const before = { ...c };
            pickUpgrade(run, c.uid);
            playCardChange(el, before, { ...c }, t('rest.upgraded'), { start: 'anvil', end: 'levelUp' });
          } else {
            pickShred(run, c.uid);
            playShred(el, c, t('event.shredded'));
          }
          later(CARD_SHOW_MS, then);
        },
      });
    };
    actions.replaceChildren(h('button', { class: 'btn cta', onclick: open }, t(kind === 'upgrade' ? 'event.pickUpgrade' : 'event.pickShred')));
    open();
  };

  /** A choice is made: its result is rolled and applied, then told. */
  const choose = (choice: EventChoice, button: HTMLButtonElement): void => {
    sfx('tap');
    for (const b of options.querySelectorAll('button')) {
      b.disabled = true;
      b.classList.toggle('picked', b === button);
    }
    options.classList.add('chosen');
    const result = rollResult(run, choice);
    const index = choice.results.indexOf(result);
    const done = result.fx.filter((fx) => !needsPick(fx)).map((fx) => applyFx(run, fx));
    const picks = result.fx.filter(needsPick);
    const afterEffects = (): void => {
      const next = picks.shift();
      if (next) pick(next.kind, afterEffects);
      else finish();
    };
    speak(t(`event.${def.id}.${choice.id}.${index}`), () => {
      outcome.innerHTML = chipHtml(run, result.fx);
      outcome.classList.add('shown');
      const queue = [...done];
      const next = (): void => {
        const d = queue.shift();
        if (!d) {
          afterEffects();
          return;
        }
        const ms = play(d);
        if (d.fx.kind === 'hp' || d.fx.kind === 'heal' || d.fx.kind === 'maxHp') refreshHud();
        later(ms + BEAT_MS, next);
      };
      later(BEAT_MS, next);
    });
  };

  const speaker = def.speaker
    ? h('div', {
        class: 'room-scene enter-event speaker',
        html: `${motes(14, ['var(--paper)', 'var(--paper)', 'var(--y)'])}<div class="room-stage"><div class="pedestal"></div><div class="room-art sway">${creature(ENEMIES[def.speaker].art)}</div></div>`,
      })
    : roomScene('event');

  for (const choice of def.choices) {
    const possible = choicePossible(run, choice);
    const button = h('button', {
      class: 'option choice',
      disabled: !possible,
      onclick: () => choose(choice, button),
      html: `<span class="choice-text">${t(`event.${def.id}.${choice.id}`)}</span><span class="fx-row">${optionChips(run, choice)}</span>`,
    });
    options.append(button);
  }

  const el = h(
    'div',
    { class: 'screen event' },
    hud,
    h('h1', { class: 'h1', style: { marginTop: '12px' } }, t(`event.${def.id}.title`)),
    speaker,
    slip,
    outcome,
    options,
    actions,
  );

  speak(t(`event.${def.id}.text`), () => options.classList.add('ready'));

  return {
    el,
    leave: () => {
      typing?.cancel();
      for (const id of timers) clearTimeout(id);
      timers.clear();
    },
  };
}
