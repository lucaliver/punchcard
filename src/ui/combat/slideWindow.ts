import { sfx } from '../../audio/sfx';
import { type TKey, t } from '../../core/i18n';
import { CONFIG } from '../../data/config';
import { SlideDance, type Step, STEPS } from '../../game/slide';
import { icon } from '../art/icons';
import { h, retrigger, setText, toggle } from '../dom';
import { haptic } from '../fx/fx';
import { createTaskFrame } from './taskFrame';
import type { CombatView } from './view';

const STEP_ICON: Record<Step, string> = { left: 'left', right: 'left', back: 'down', hop: 'up' };
const STEP_NAME: Record<Step, TKey> = {
  left: 'task.slide.step.left',
  right: 'task.slide.step.right',
  back: 'task.slide.step.back',
  hop: 'task.slide.step.hop',
};
const CALL: Record<Step | 'freeze', TKey> = {
  left: 'task.slide.call.left',
  right: 'task.slide.call.right',
  back: 'task.slide.call.back',
  hop: 'task.slide.call.hop',
  freeze: 'task.slide.call.freeze',
};

/**
 * The Wedding DJ's chore (`MoveDef.task` = 'slide'): a window over the belt and the sleeve with the DJ's call, a bar for the time it gives, a pip per call and the pad of four buttons.
 * A press calls `Combat.slide`; it only draws `Combat.chore`.
 */
export function createSlideWindow(v: CombatView): { render(): void } {
  const { combat, state } = v;
  const frame = createTaskFrame(v, {
    cls: 'slide-window',
    title: t('task.slide.title'),
    body: `
      <div class="tk-machine">
        <div class="tk-lcd"><span class="tk-msg"></span><b class="tk-val"></b></div>
        <div class="tk-stage sl-stage">
          <div class="sl-call"><b></b><small></small></div>
          <i class="sl-time"></i>
          <div class="sl-pips"></div>
          <div class="sl-pad">${STEPS.map(
            (s) =>
              `<button class="sl-btn" data-step="${s}" aria-label="${t(STEP_NAME[s])}">${icon(STEP_ICON[s])}<small>${t(STEP_NAME[s])}</small></button>`,
          ).join('')}</div>
        </div>
      </div>`,
  });
  const { el, q } = frame;
  const refs = {
    step: q('.tk-step'),
    msg: q('.tk-msg'),
    val: q('.tk-val'),
    call: q('.sl-call b'),
    hint: q('.sl-call small'),
    time: q('.sl-time'),
    pips: q('.sl-pips'),
  };

  let shown: SlideDance | null = null;
  let callKey = '';
  let celebrated = false;

  const blocked = (): boolean => state.paused || state.waiting || state.ended;
  el.addEventListener('click', (ev) => {
    const btn = (ev.target as HTMLElement).closest<HTMLElement>('.sl-btn');
    if (!btn || blocked()) return;
    const res = combat.slide(btn.dataset.step as Step);
    if (res === 'ok') {
      sfx('tap');
      haptic('tap');
    } else if (res === 'wrong') {
      sfx('denied');
      retrigger(el, 'jolt');
    }
  });

  const build = (dance: SlideDance): void => {
    shown = dance;
    callKey = '';
    celebrated = false;
    refs.pips.replaceChildren(...dance.calls.map((c) => h('i', { class: `sl-pip${c === 'freeze' ? ' freeze' : ''}` })));
    frame.place();
  };

  return {
    render() {
      const dance = !combat.isOver && combat.chore instanceof SlideDance ? combat.chore : null;
      if (!frame.sync(!!dance, dance?.phase === 'done') || !dance) {
        shown = null;
        return;
      }
      if (shown !== dance) build(dance);
      const call = dance.call;
      el.dataset.phase = dance.phase;
      el.dataset.call = call ?? '';
      if (dance.phase === 'done' && !celebrated) {
        celebrated = true;
        sfx('airhorn');
        haptic('proc');
      }
      // A new call: the DJ shouts it again, louder.
      const key = `${dance.index}:${call ?? ''}:${dance.phase}`;
      if (key !== callKey) {
        callKey = key;
        retrigger(refs.call, 'shout');
        if (call && call !== 'freeze') sfx('tally');
      }
      const done = dance.phase === 'done';
      setText(refs.call, done ? t('task.slide.done') : call ? t(CALL[call]) : '…');
      setText(refs.hint, !done && call === 'freeze' ? t('task.slide.freezeHint') : '');
      setText(refs.step, t('task.slide.progress', { n: dance.answered, total: dance.calls.length }));
      setText(refs.msg, t('task.slide.msg'));
      setText(refs.val, `${dance.answered}/${dance.calls.length}`);
      // The bar: the time the call has left (a freeze fills up instead: hold still till it is full).
      const left = !call ? 0 : call === 'freeze' ? dance.t / CONFIG.slide.freeze : 1 - dance.t / dance.window;
      refs.time.style.setProperty('--left', String(Math.max(0, Math.min(1, left))));
      const pips = refs.pips.children;
      for (let i = 0; i < pips.length; i++) {
        toggle(pips[i] as HTMLElement, 'done', i < dance.answered);
        toggle(pips[i] as HTMLElement, 'now', i === dance.index && !done);
      }
    },
  };
}
