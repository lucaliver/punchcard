import { sfx } from '../../audio/sfx';
import { type TKey, t } from '../../core/i18n';
import { CONFIG } from '../../data/config';
import { BadgeSwipe } from '../../game/badge';
import { creature } from '../art/creatures';
import { retrigger, setText, toggle } from '../dom';
import { haptic } from '../fx/fx';
import { createTaskFrame } from './taskFrame';
import type { CombatView } from './view';

/** The part of the track (shares of the badge's travel) whose crossing is timed: the start and the end are the finger getting going and slowing down. */
const TIMED_FROM = 0.1;
const TIMED_TO = 0.9;
/** A drag that lets go past this share, short of the end, gets a "all the way" note instead of nothing. */
const SHORT_NOTE = 0.2;
/** Frames that note stays up. */
const SHORT_FRAMES = 70;
/** Weight of the newest sample in the speed the gauge shows (the finger's speed is jumpy). */
const SMOOTH = 0.4;
/** Below this the badge counts as standing still (tracks per second). */
const STILL = 0.05;
/** Segments of the speed gauge, and the sparks that fly off a fast or a read badge. */
const SEGMENTS = 12;
const SPARKS = 8;
/** The clock above the reader starts this many minutes into the day (08:58) and loses a minute to every swipe: it is always late in the end. */
const CLOCK_START = 8 * 60 + 58;
const LATE_AT = 9 * 60;

type Pace = 'idle' | 'slow' | 'ok' | 'fast';

const clock = (minutes: number): string => `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;

/** What the reader's slim display says (the step), and what its screen says (the verdict, in the reader's own words). */
const lcdKey = (game: BadgeSwipe, swiping: boolean, short: boolean): TKey => {
  if (game.phase === 'done') return 'task.badge.step.done';
  if (swiping) return 'task.badge.step.drag';
  if (short) return 'task.badge.step.short';
  return game.last ? 'task.badge.step.again' : 'task.badge.step.start';
};
const lineKey = (game: BadgeSwipe, swiping: boolean): TKey => {
  if (game.phase === 'done') return 'task.badge.done';
  if (swiping) return 'task.badge.reading';
  switch (game.last?.kind) {
    case 'glitch':
      return `task.badge.glitch.${game.last.glitch ?? 'readError'}`;
    case 'slow':
      return 'task.badge.slow';
    case 'fast':
      return 'task.badge.fast';
    case 'ok':
    case undefined:
      return 'task.badge.idle';
  }
};

/**
 * The Punch Clock's chore (`MoveDef.task` = 'badge'): a window over the belt and the sleeve with a badge reader. The badge is dragged along its slot; how long the middle of the track takes
 * is its speed (`Combat.swipeBadge` judges it). A gauge shows the speed the finger has now and the zone the reader takes, the phone hums when it is right and buzzes when it is too fast.
 */
export function createBadgeWindow(v: CombatView): { render(): void } {
  const { combat, state } = v;
  const frame = createTaskFrame(v, {
    cls: 'badge-window',
    title: t('task.badge.title'),
    body: `
      <div class="tk-note"><b>${t('task.badge.note')}</b></div>
      <div class="tk-machine">
        <div class="tk-lcd"><span class="tk-msg"></span><b class="tk-val"></b></div>
        <div class="tk-stage">
          <div class="bd-reader" data-pace="idle" data-led="idle">
            <div class="bd-top">
              <i class="bd-led"></i>
              <div class="bd-screen"><span class="bd-line"></span></div>
              <i class="bd-led"></i>
            </div>
            <div class="bd-track">
              <i class="bd-groove"></i>
              <b class="bd-stamp"></b>
              <button class="bd-badge" aria-label="${t('task.badge.badge')}">
                <i class="bd-clip"></i>
                <span class="bd-photo">${creature(v.heroId)}</span>
                <i class="bd-bars"></i>
                <i class="bd-stripe"></i>
              </button>
              <i class="bd-lip"></i>
              <span class="bd-sparks">${'<i></i>'.repeat(SPARKS)}</span>
            </div>
            <div class="bd-gauge"><small>${t('task.badge.gauge')}</small><span class="bd-segs">${'<i></i>'.repeat(SEGMENTS)}</span></div>
          </div>
        </div>
      </div>`,
  });
  const { el, q } = frame;
  const refs = {
    step: q('.tk-step'),
    msg: q('.tk-msg'),
    val: q('.tk-val'),
    reader: q('.bd-reader'),
    line: q('.bd-line'),
    stamp: q('.bd-stamp'),
    track: q('.bd-track'),
    badge: q<HTMLButtonElement>('.bd-badge'),
    segs: [...el.querySelectorAll<HTMLElement>('.bd-segs i')],
  };

  /** The reader the window was built for, the swipes already shown, the zone drawn and the speed the gauge shows now. */
  let shown: BadgeSwipe | null = null;
  let seen = 0;
  let zoneKey = '';
  let speed = 0;
  let litNow = -1;
  let shortFrames = 0;
  /** The finger: the pointer, where the badge and the finger were when it took the badge, the last sample, and when the timed part of the track began. */
  let drag: { pointerId: number; fromX: number; at: number; lastAt: number; lastT: number; since: number | null } | null = null;

  const blocked = (): boolean => state.paused || state.waiting || state.ended;
  const paceOf = (game: BadgeSwipe, s: number): Pace => (s < STILL ? 'idle' : s < game.min ? 'slow' : s > game.max ? 'fast' : 'ok');
  /** How far the badge can travel, in pixels. */
  const travel = (): number => Math.max(1, refs.track.clientWidth - refs.badge.offsetWidth);
  const setAt = (u: number): void => {
    refs.track.style.setProperty('--at', u.toFixed(3));
  };

  const finish = (rate: number): void => {
    drag = null;
    refs.badge.classList.remove('held');
    speed = rate;
    sfx('swipe');
    const res = combat.swipeBadge(rate);
    if (res === 'ok') {
      sfx('served');
      haptic('proc');
      setAt(1);
    } else if (res && res !== 'ignored') {
      sfx('denied');
      retrigger(el, 'jolt');
      retrigger(refs.reader, 'refused');
      refs.badge.classList.add('spit');
      setAt(0);
    }
  };

  refs.badge.addEventListener('pointerdown', (ev) => {
    const game = shown;
    if (drag || blocked() || !game || game.phase !== 'swipe') return;
    try {
      refs.badge.setPointerCapture(ev.pointerId);
    } catch {
      /* synthetic events (tests) have no active pointer */
    }
    refs.badge.classList.remove('spit');
    refs.badge.classList.add('held');
    shortFrames = 0;
    speed = 0;
    drag = { pointerId: ev.pointerId, fromX: ev.clientX, at: 0, lastAt: 0, lastT: ev.timeStamp, since: null };
    setAt(0);
  });
  refs.badge.addEventListener('pointermove', (ev) => {
    const game = shown;
    if (!drag || ev.pointerId !== drag.pointerId || !game || blocked()) return;
    const at = Math.min(1, Math.max(0, (ev.clientX - drag.fromX) / travel()));
    setAt(at);
    const dt = (ev.timeStamp - drag.lastT) / 1000;
    if (dt >= 0.004) {
      speed += ((at - drag.lastAt) / dt - speed) * SMOOTH;
      speed = Math.max(0, speed);
      drag.lastAt = at;
      drag.lastT = ev.timeStamp;
    }
    // The timed part runs from where it is first crossed to where the end of it is; falling back behind its start begins it again.
    if (drag.since === null && at >= TIMED_FROM) drag.since = ev.timeStamp;
    else if (at < TIMED_FROM) drag.since = null;
    const pace = paceOf(game, speed);
    if (pace === 'ok') haptic('swipe');
    else if (pace === 'fast') haptic('swipeRough');
    drag.at = at;
    if (at >= TIMED_TO) finish((TIMED_TO - TIMED_FROM) / (Math.max(ev.timeStamp - (drag.since ?? drag.lastT), 1) / 1000));
  });
  const letGo = (ev: PointerEvent): void => {
    if (!drag || ev.pointerId !== drag.pointerId) return;
    if (drag.at >= SHORT_NOTE) shortFrames = SHORT_FRAMES;
    drag = null;
    speed = 0;
    refs.badge.classList.remove('held');
    refs.badge.classList.add('spit');
    setAt(0);
  };
  refs.badge.addEventListener('pointerup', letGo);
  refs.badge.addEventListener('pointercancel', letGo);

  const build = (game: BadgeSwipe): void => {
    shown = game;
    seen = 0;
    zoneKey = '';
    speed = 0;
    litNow = -1;
    shortFrames = 0;
    drag = null;
    refs.badge.classList.remove('held', 'spit');
    setAt(0);
    frame.place();
  };

  /** Paints the zone the reader takes on the gauge, and how much of it the speed fills. */
  const drawGauge = (game: BadgeSwipe, pace: Pace): void => {
    const key = `${game.min.toFixed(3)}-${game.max.toFixed(3)}`;
    if (key !== zoneKey) {
      if (zoneKey) retrigger(refs.reader, 'recalibrated');
      zoneKey = key;
      const per = CONFIG.badge.scale / SEGMENTS;
      refs.segs.forEach((s, i) => {
        const mid = (i + 0.5) * per;
        s.dataset.zone = mid < game.min ? 'low' : mid > game.max ? 'high' : 'ok';
      });
    }
    const lit = Math.min(SEGMENTS, Math.round((speed / CONFIG.badge.scale) * SEGMENTS));
    if (lit !== litNow) {
      litNow = lit;
      refs.segs.forEach((s, i) => {
        toggle(s, 'lit', i < lit);
      });
    }
    refs.reader.dataset.pace = pace;
  };

  return {
    render() {
      const game = !combat.isOver && combat.chore instanceof BadgeSwipe ? combat.chore : null;
      if (!frame.sync(!!game, game?.phase === 'done') || !game) {
        shown = null;
        return;
      }
      if (shown !== game) build(game);
      const last = game.last;
      // A swipe has just been judged: the reader reacts (a refusal also jolts the window, which `finish` did the moment it happened).
      if (game.attempts > seen) {
        seen = game.attempts;
        retrigger(refs.stamp, 'print');
        retrigger(refs.line, 'flicker');
      }
      const done = game.phase === 'done';
      const pace = drag ? paceOf(game, speed) : 'idle';
      refs.reader.dataset.led = done ? 'ok' : drag ? 'drag' : last ? 'bad' : 'idle';
      toggle(refs.reader, 'read', done);
      setText(refs.step, t('task.badge.try', { n: game.attempts + (done ? 0 : 1) }));
      if (shortFrames > 0) shortFrames--;
      setText(refs.msg, t(lcdKey(game, !!drag, shortFrames > 0)));
      const minutes = CLOCK_START + game.attempts;
      setText(refs.val, clock(minutes));
      toggle(refs.val, 'late', minutes >= LATE_AT);
      setText(refs.line, t(lineKey(game, !!drag)));
      refs.stamp.dataset.kind = last?.kind ?? '';
      setText(refs.stamp, last && !drag ? t(`task.badge.stamp.${last.kind}`) : '');
      drawGauge(game, pace);
    },
  };
}
