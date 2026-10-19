import { sfx } from '../../audio/sfx';
import { t } from '../../core/i18n';
import { CONFIG } from '../../data/config';
import { GrillLine, type Patty } from '../../game/grill';
import { icon } from '../art/icons';
import { h, retrigger, setText, toggle } from '../dom';
import { haptic } from '../fx/fx';
import { createTaskFrame } from './taskFrame';
import type { CombatView } from './view';

/** How long (s) a burnt side is still allowed on the gauge after the ready window, so the marker can run into the black before the end. */
const CHAR_TIME = 1;

/**
 * The Barbecue Dad's chore (`MoveDef.task` = 'grill'): a window over the belt and the sleeve with the grate. Each patty has a gauge (raw, ready, burnt) a marker runs along, and the two sides of the
 * burger as two squares. A tap on a patty calls `Combat.grill`; it only draws `Combat.chore`.
 */
export function createGrillWindow(v: CombatView): { render(): void } {
  const { combat, state } = v;
  const frame = createTaskFrame(v, {
    cls: 'grill-window',
    title: t('task.grill.title'),
    body: `
      <div class="tk-machine">
        <div class="tk-lcd"><span class="tk-msg"></span><b class="tk-val"></b></div>
        <div class="tk-stage gr-stage">
          <div class="gr-alert"></div>
          <div class="gr-grate"></div>
          <div class="gr-plate"><small>${t('task.grill.plate')}</small><span class="gr-served"></span></div>
        </div>
      </div>`,
  });
  const { el, q } = frame;
  const refs = { step: q('.tk-step'), msg: q('.tk-msg'), val: q('.tk-val'), alert: q('.gr-alert'), grate: q('.gr-grate'), served: q('.gr-served') };

  let shown: GrillLine | null = null;
  let slots: HTMLElement[] = [];
  let servedKey = -1;
  let celebrated = false;
  /** What each slot showed last frame, to react when a patty changes (a fresh one, a flip). */
  let seen: (Patty | null)[] = [];
  let seenSide: number[] = [];

  const blocked = (): boolean => state.paused || state.waiting || state.ended;

  const build = (line: GrillLine): void => {
    shown = line;
    servedKey = -1;
    celebrated = false;
    seen = [];
    seenSide = [];
    slots = line.slots.map((_, i) => {
      const btn = h('button', {
        class: 'gr-slot',
        'data-i': String(i),
        'aria-label': t('task.grill.patty'),
        html: `<span class="gr-patty">${icon('patty')}<i class="gr-smoke"></i></span><span class="gr-sides"><i></i><i></i></span><span class="gr-gauge"><i class="gr-mark"></i></span>`,
      });
      btn.addEventListener('click', () => {
        if (blocked()) return;
        const res = combat.grill(i);
        if (res === 'flip') {
          sfx('sizzle');
          haptic('tap');
        } else if (res === 'serve') {
          sfx('served');
          haptic('proc');
        } else if (res === 'binned') {
          sfx('tap');
        } else if (res === 'raw') {
          sfx('denied');
          retrigger(el, 'jolt');
        }
      });
      return btn;
    });
    refs.grate.replaceChildren(...slots);
    frame.place();
  };

  return {
    render() {
      const line = !combat.isOver && combat.chore instanceof GrillLine ? combat.chore : null;
      if (!frame.sync(!!line, line?.phase === 'done') || !line) {
        shown = null;
        return;
      }
      if (shown !== line) build(line);
      el.dataset.phase = line.phase;
      if (line.phase === 'done' && !celebrated) {
        celebrated = true;
        sfx('served');
        haptic('proc');
      }
      const { window: ready } = CONFIG.grill;
      let anyReady = false;
      let anyBurnt = false;
      line.slots.forEach((p, i) => {
        const slot = slots[i];
        toggle(slot, 'empty', !p);
        if (!p) {
          seen[i] = null;
          return;
        }
        const state = line.stateOf(p);
        anyReady ||= state === 'ready';
        anyBurnt ||= state === 'burnt';
        slot.dataset.state = state;
        // A patty that has just been turned, or put on, gets a little pop.
        if (seen[i] !== p || seenSide[i] !== p.side) {
          if (seen[i] === p) retrigger(slot, 'turn');
          else if (seen[i] !== undefined) retrigger(slot, 'drop');
          seen[i] = p;
          seenSide[i] = p.side;
        }
        const span = p.cook + ready + CHAR_TIME;
        slot.style.setProperty('--raw', `${(p.cook / span) * 100}%`);
        slot.style.setProperty('--rdy', `${(ready / span) * 100}%`);
        slot.style.setProperty('--at', `${Math.max(0, Math.min(1, p.t / span)) * 100}%`);
        const sides = slot.querySelectorAll('.gr-sides i');
        sides.forEach((s, k) => {
          toggle(s as HTMLElement, 'done', p.done[k]);
          toggle(s as HTMLElement, 'on', p.side === k);
        });
      });
      if (servedKey !== line.served) {
        if (servedKey >= 0) retrigger(refs.served, 'plop');
        servedKey = line.served;
        refs.served.replaceChildren(...Array.from({ length: line.served }, () => h('span', { class: 'gr-done', html: icon('patty') })));
      }
      setText(refs.step, t('task.grill.step', { n: line.served, total: line.total }));
      setText(refs.msg, t('task.grill.flip'));
      setText(refs.val, `${line.served}/${line.total}`);
      setText(
        refs.alert,
        t(line.phase === 'done' ? 'task.grill.done' : anyBurnt ? 'task.grill.burnt' : anyReady ? 'task.grill.ready' : 'task.grill.cooking'),
      );
      refs.alert.dataset.mood = line.phase === 'done' ? 'done' : anyBurnt ? 'burnt' : anyReady ? 'ready' : 'cooking';
    },
  };
}
