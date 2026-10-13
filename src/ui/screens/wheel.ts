import { sfx } from '../../audio/sfx';
import { t } from '../../core/i18n';
import { Rng, randomSeed } from '../../core/rng';
import { CONFIG } from '../../data/config';
import { PERKS } from '../../data/perks';
import { WHEEL, type WheelSlot } from '../../data/wheel';
import { applyWheel, canWheel, spinWheel, wheelTargets, type RunState } from '../../game/run';
import type { CardInst } from '../../game/types';
import { settings } from '../../game/settings';
import type { Screen } from '../app';
import { cssColor, h, retrigger } from '../dom';
import { icon } from '../art/icons';
import { CARD_SHOW_MS, playCardChange } from '../components/cardShow';
import { motes } from '../components/decor';
import { openDeck } from '../components/modals';
import { closeRoom } from '../components/room';
import { haptic } from '../fx/fx';
import { runHud } from './journey';

/** Pixels the wheel's picture is drawn on (it is shown many times bigger, so it stays chunky). */
const DISC_PX = 64;
/** The disc turns in steps of this many degrees, so the picture never smears. */
const TURN_STEP = 3;
/** The slices' inks, taken in turn. */
const SLICE_INKS = ['--p', '--b'];
/** How far from the middle of its slice the pointer may come to rest (degrees; a slice is 360 / slices wide). */
const REST_SPREAD = 20;

const hex = (css: string): [number, number, number] => {
  const n = Number.parseInt(css.replace('#', ''), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

/** The disc as a bitmap, one pixel at a time: slices in the inks in turn, dark seams and rim, a pale hub. Slice `i` is centred `i` slices clockwise from the top. */
function paintDisc(slices: number): string {
  const canvas = document.createElement('canvas');
  canvas.width = DISC_PX;
  canvas.height = DISC_PX;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';
  const inks = SLICE_INKS.map((token) => hex(cssColor(token)));
  const dark = hex(cssColor('--k'));
  const hub = hex(cssColor('--y'));
  const image = ctx.createImageData(DISC_PX, DISC_PX);
  const half = DISC_PX / 2;
  const arc = 360 / slices;
  for (let y = 0; y < DISC_PX; y++)
    for (let x = 0; x < DISC_PX; x++) {
      const dx = x + 0.5 - half;
      const dy = y + 0.5 - half;
      const r = Math.hypot(dx, dy);
      if (r > half) continue;
      const angle = (Math.atan2(dx, -dy) * 180) / Math.PI + 360;
      const within = (angle + arc / 2) % arc;
      const seam = Math.min(within, arc - within) * (Math.PI / 180) * r < 0.9;
      let rgb = inks[Math.floor(((angle + arc / 2) % 360) / arc) % inks.length];
      if (r > half - 2.5 || seam) rgb = dark;
      if (r < 6) rgb = r > 4.5 ? dark : hub;
      const at = (y * DISC_PX + x) * 4;
      image.data.set([...rgb, 255], at);
    }
  ctx.putImageData(image, 0, 0);
  return canvas.toDataURL();
}

const slotName = (slot: WheelSlot): string => (slot.effect.kind === 'perk' ? t(`perk.${slot.effect.perk}`) : t(`wheel.${slot.id}`));
const slotDesc = (slot: WheelSlot): string => (slot.effect.kind === 'perk' ? t(`perk.${slot.effect.perk}.d`) : t(`wheel.${slot.id}.d`));
const isBad = (slot: WheelSlot): boolean => slot.effect.kind === 'perk' && !!PERKS[slot.effect.perk].bad;

/** A card as it will be once the slice has landed on it (the preview of the deck window). */
function afterSlot(slot: WheelSlot, card: CardInst): CardInst {
  switch (slot.effect.kind) {
    case 'upgrade':
      return { ...card, up: true };
    case 'perk':
      return { ...card, perks: [...(card.perks ?? []), slot.effect.perk] };
  }
}

/**
 * Raffle: a wheel of card modifiers. One spin (its slice is `spinWheel`'s: the engine decides, the picture only follows), then the player picks
 * `wheelCards` deck cards for it to land on, whatever it is.
 */
export function wheelScreen(run: RunState, onDone: () => void): Screen {
  const timers: number[] = [];
  const slices = WHEEL.length;
  const arc = 360 / slices;
  let slot: WheelSlot | undefined;
  // The spin: the disc's angle (degrees, clockwise), where it stops, and how long it has been turning.
  let angle = 0;
  let stopAt = 0;
  let spun = 0;
  let spinning = false;
  let lastTick = 0;
  let shown = 0;

  const disc = h('div', {
    class: 'wheel-disc',
    html: `<img class="wheel-bitmap" alt="" src="${paintDisc(slices)}">${WHEEL.map(
      (s, i) => `<i class="wheel-ico" style="--a:${i * arc}deg">${icon(s.icon)}</i>`,
    ).join('')}`,
  });
  const pointer = h('i', { class: 'wheel-pointer', html: icon('down') });
  const result = h('div', { class: 'wheel-result' });
  const button = h('button', { class: 'btn cta wheel-btn' }, t('wheel.spin'));
  const stage = h('div', { class: 'room-stage wheel-stage' }, h('div', { class: 'pedestal' }), disc, pointer);

  function pickCards(): void {
    if (!slot) return;
    const landed = slot;
    const n = Math.min(CONFIG.wheelCards, wheelTargets(run, landed).length);
    sfx('tap');
    openDeck(run.deck, {
      title: t('wheel.pickTitle', { n, name: slotName(landed) }),
      confirmLabel: t('wheel.confirm'),
      filter: (c) => canWheel(c, landed),
      count: CONFIG.wheelCards,
      previewSelected: (c) => afterSlot(landed, c),
      onPickMany: (cards) => {
        const sounds = { start: 'stamp', end: isBad(landed) ? 'debuff' : 'promoted' } as const;
        const changed = applyWheel(
          run,
          landed,
          cards.map((c) => c.uid),
        );
        changed.forEach(({ before, after }, i) => {
          const show = (): void => playCardChange(el, before, after, slotName(landed), sounds);
          if (i) timers.push(window.setTimeout(show, i * CARD_SHOW_MS));
          else show();
        });
        closeRoom(el, onDone, changed.length * CARD_SHOW_MS);
      },
    });
  }

  /** The wheel has stopped: the slice is named, and the button picks the cards. */
  function land(landed: WheelSlot): void {
    spinning = false;
    sfx(isBad(landed) ? 'debuff' : 'ding');
    haptic('tap');
    result.dataset.luck = isBad(landed) ? 'bad' : 'good';
    result.innerHTML = `${icon(landed.icon)}<div><b>${slotName(landed)}</b><span>${slotDesc(landed)}</span></div>`;
    retrigger(result, 'land');
    disc.children[WHEEL.indexOf(landed) + 1]?.classList.add('hit');
    button.disabled = false;
    // Nothing in the deck takes it (a deck that has everything already): there is nothing to pick, the room is over.
    if (!wheelTargets(run, landed).length) {
      button.textContent = t('wheel.leave');
      button.onclick = () => {
        sfx('tap');
        applyWheel(run, landed, []);
        closeRoom(el, onDone, 0);
      };
      return;
    }
    button.textContent = t('wheel.pick', { n: Math.min(CONFIG.wheelCards, wheelTargets(run, landed).length) });
    button.onclick = pickCards;
  }

  button.onclick = () => {
    sfx('tap');
    button.disabled = true;
    const index = spinWheel(run, new Rng(randomSeed()));
    slot = WHEEL[index];
    // The pointer is on top: the landing slice has to come round to the angle 0, a little off its middle.
    const rest = (Math.random() * 2 - 1) * Math.min(REST_SPREAD, arc / 2 - 4);
    stopAt = 360 * CONFIG.wheelTurns + ((((rest - index * arc) % 360) + 360) % 360);
    spun = settings.reduceMotion ? CONFIG.wheelSpinTime : 0;
    spinning = true;
  };

  const el = h(
    'div',
    { class: 'screen' },
    runHud(run),
    h('h1', { class: 'h1', style: { marginTop: '12px' } }, t('wheel.title')),
    h('p', { class: 'sub' }, t('wheel.desc')),
    h('div', { class: 'room-scene enter-wheel', html: motes(14, ['var(--paper)', 'var(--p)', 'var(--y)']) }, stage),
    result,
    h('div', { class: 'wheel-actions' }, button),
  );

  return {
    el,
    frame(dt) {
      if (!spinning || !slot) return;
      spun = Math.min(CONFIG.wheelSpinTime, spun + dt);
      const k = spun / CONFIG.wheelSpinTime;
      angle = stopAt * (1 - (1 - k) ** 3);
      const turned = Math.round(angle / TURN_STEP) * TURN_STEP;
      if (turned !== shown) {
        shown = turned;
        disc.style.transform = `rotate(${turned}deg)`;
      }
      // A tick every time a seam passes the pointer.
      const seams = Math.floor((angle + arc / 2) / arc);
      if (seams !== lastTick) {
        lastTick = seams;
        sfx('ratchet');
        retrigger(pointer, 'flick');
      }
      if (k >= 1) land(slot);
    },
    leave() {
      for (const id of timers) window.clearTimeout(id);
    },
  };
}
