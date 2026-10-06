import { type TKey, t } from '../../core/i18n';
import { CARDS, RARITY_ORDER } from '../../data/cards';
import type { CardInst, HeroId, Rarity } from '../../game/types';
import { drawIcon, drawSprite } from '../art/riso';
import { h } from '../dom';
import { cardCostLabel, cardName } from './cardView';

/** One line of the payslip, shared by the end screen and the share image. */
export interface SlipRow {
  label: string;
  value: string;
  kind: 'row' | 'section' | 'net';
  /** A one-run record this run beat (stamped NEW RECORD). */
  record?: boolean;
}

export interface ShareSlip {
  hero: HeroId;
  title: string;
  employee: string;
  rows: SlipRow[];
  /** PAID (a won run, stamped blue) or VOID. */
  won: boolean;
  stamp: string;
  /** The final deck, identical copies grouped. */
  deck: { card: CardInst; n: number }[];
  /** Act and floor reached. */
  act: number;
  floor: number;
  /** The hero begged to stay once. */
  begged: boolean;
  /** Seconds spent in fights. */
  time: number;
  /** Ids of the stationery the run ended with. */
  relics: string[];
}

/** Seconds as m:ss, or h:mm:ss from an hour on. */
function clock(seconds: number): string {
  const total = Math.round(seconds);
  const [hh, mm, ss] = [Math.floor(total / 3600), Math.floor(total / 60) % 60, total % 60];
  const two = (n: number): string => String(n).padStart(2, '0');
  return hh ? `${hh}:${two(mm)}:${two(ss)}` : `${mm}:${two(ss)}`;
}

/** What a payslip counts: the end of a run, or a run of the history. */
export interface SlipStats {
  floor: number;
  kills: number;
  elites: number;
  cards: number;
  memos: number;
  pay: number;
  damage: number;
}

/** The payslip's lines for a run; `isRecord` stamps the ones that beat a one-run record. */
export function slipRows(s: SlipStats, isRecord: (k: TKey) => boolean = () => false): SlipRow[] {
  const row = (k: TKey, v: number | string, kind: SlipRow['kind'] = 'row'): SlipRow => ({ label: t(k), value: String(v), kind, record: isRecord(k) });
  return [
    row('end.slip.earnings', '', 'section'),
    row('end.slip.floors', s.floor),
    row('end.slip.kills', s.kills),
    row('end.slip.overtime', s.elites),
    row('end.slip.cards', s.cards),
    ...(s.memos ? [row('end.slip.memos', s.memos)] : []),
    row('end.slip.gross', s.pay),
    row('end.slip.deductions', '', 'section'),
    row('end.slip.injuries', `-${s.damage}`),
    row('end.slip.ceoBonus', `-${s.pay}`),
    row('end.slip.net', t('end.slip.netValue'), 'net'),
  ];
}

const W = 1080;
/** The image is at least this tall; a big deck makes it taller so every card fits. */
const MIN_H = 1350;
const PAD = 60;

/** Layout of the image, top to bottom (the height depends on how many rows the deck needs). */
const TOP = 280;
const SLIP_Y = TOP + 290;
const DECK_COLS = 6;
const DECK_GAP = 12;
const TICKET_H = 100;
const RELIC_SIZE = 100;
const RELIC_GAP = 12;
/** Each row of stationery stands on a little table: a top plank and its legs. */
const TABLE_TOP = 14;
const TABLE_LEGS = 22;
const RELIC_ROW = RELIC_SIZE + TABLE_TOP + TABLE_LEGS + RELIC_GAP;
const RELICS_PER_ROW = Math.floor((W - 2 * PAD + RELIC_GAP) / (RELIC_SIZE + RELIC_GAP));

/** Reads the design tokens so the image matches the game's inks. */
function tokens(): Record<'paper' | 'paper2' | 'k' | 'p' | 'b' | 'y' | 'bg' | 'bg2' | 'wood' | 'woodTop' | 'muted' | 'mutedD' | 'shadow', string> {
  const css = getComputedStyle(document.documentElement);
  const v = (name: string): string => css.getPropertyValue(name).trim();
  return {
    paper: v('--paper'),
    paper2: v('--paper2'),
    k: v('--k'),
    p: v('--p'),
    b: v('--b'),
    y: v('--y'),
    bg: v('--bg'),
    bg2: v('--bg2'),
    wood: v('--wood-edge'),
    woodTop: v('--paper-dot'),
    muted: v('--muted'),
    mutedD: v('--muted-d'),
    shadow: v('--shadow'),
  };
}

/** A card's name band colours, as its class sets them in cards.css. */
function bandOf(cls: string): { band: string; text: string } {
  const probe = h('div', { class: 'card', 'data-cls': cls, style: { position: 'absolute', visibility: 'hidden' } });
  document.body.append(probe);
  const css = getComputedStyle(probe);
  const out = { band: css.getPropertyValue('--band').trim(), text: css.getPropertyValue('--band-text').trim() };
  probe.remove();
  return out;
}

/** The background of a card type's art, as `.card[data-type]` sets it in cards.css. */
function artBgOf(type: string): string {
  const probe = h('div', { class: 'card', 'data-type': type, style: { position: 'absolute', visibility: 'hidden' } });
  document.body.append(probe);
  const bg = getComputedStyle(probe).getPropertyValue('--art-bg').trim();
  probe.remove();
  return bg;
}

/** Sets the largest font (down to `min`) that fits `text` in `width`. */
function fitFont(g: CanvasRenderingContext2D, text: string, width: number, size: number, family: string, min = 14): void {
  for (let s = size; s >= min; s -= 2) {
    g.font = `${s}px ${family}`;
    if (g.measureText(text).width <= width) return;
  }
}

const GEM = 32;

/** The ink of a card's rarity corner (none for commons), as `.c-gem` sets it in cards.css. */
function gemInk(rarity: Rarity, c: ReturnType<typeof tokens>): string | null {
  const inks: Partial<Record<Rarity, string>> = { rare: c.b, epic: c.p, legendary: c.y, special: c.k };
  return inks[rarity] ?? null;
}

/** A rubber stamp: bordered caps, tilted. */
function stamp(g: CanvasRenderingContext2D, text: string, x: number, y: number, size: number, color: string, angle: number): void {
  g.save();
  g.translate(x, y);
  g.rotate(angle);
  g.font = `${size}px Silkscreen`;
  const w = g.measureText(text).width + size;
  g.strokeStyle = color;
  g.lineWidth = Math.max(3, size / 7);
  g.strokeRect(-w / 2, -size * 0.75, w, size * 1.5);
  g.fillStyle = color;
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillText(text, 0, 2);
  g.restore();
}

/** A shareable portrait image of the run's payslip: the hero and how far it got, the slip, the stationery, the final deck and where to play. */
export async function payslipImage(s: ShareSlip): Promise<Blob | null> {
  await Promise.all(['64px Silkscreen', '40px "Pixel UI"', '600 30px "Chakra Petch"'].map((f) => document.fonts.load(f)));
  const c = tokens();
  const slipH = 150 + s.rows.length * 40;
  const relicY = SLIP_Y + slipH + 50;
  const relicH = s.relics.length ? 20 + Math.ceil(s.relics.length / RELICS_PER_ROW) * RELIC_ROW + 30 : 0;
  const deckY = relicY + relicH;
  const H = Math.max(MIN_H, deckY + 20 + Math.ceil(s.deck.length / DECK_COLS) * (TICKET_H + DECK_GAP) + 80);
  const cv = document.createElement('canvas');
  cv.width = W;
  cv.height = H;
  const g = cv.getContext('2d')!;
  g.imageSmoothingEnabled = false;
  g.textBaseline = 'alphabetic';

  // The night, crossed by the poster's yellow band.
  g.fillStyle = c.bg;
  g.fillRect(0, 0, W, H);
  g.fillStyle = c.y;
  g.beginPath();
  g.moveTo(0, 150);
  g.lineTo(W, 30);
  g.lineTo(W, 190);
  g.lineTo(0, 310);
  g.fill();

  // The logo on a paper plate, tilted, printed pink under black.
  g.save();
  g.translate(W / 2, 150);
  g.rotate(-0.07);
  g.fillStyle = c.p;
  g.fillRect(-380 + 10, -70 + 10, 760, 140);
  g.fillStyle = c.paper;
  g.fillRect(-380, -70, 760, 140);
  g.lineWidth = 6;
  g.strokeStyle = c.k;
  g.strokeRect(-380, -70, 760, 140);
  g.font = '92px Silkscreen';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillStyle = c.p;
  g.fillText(t('app.title').toUpperCase(), 6, 6);
  g.fillStyle = c.k;
  g.fillText(t('app.title').toUpperCase(), 0, 0);
  g.restore();

  // The hero in a frame, its name and how the day went.
  const top = TOP;
  g.fillStyle = c.shadow;
  g.fillRect(PAD + 8, top + 8, 250, 250);
  g.fillStyle = c.bg2;
  g.fillRect(PAD, top, 250, 250);
  g.lineWidth = 6;
  g.strokeStyle = c.k;
  g.strokeRect(PAD, top, 250, 250);
  await drawSprite(g, s.hero, PAD + 10, top + 10, 230);
  const tx = PAD + 290;
  g.textAlign = 'left';
  g.fillStyle = c.paper;
  const name = t(`hero.${s.hero}.name`).toUpperCase();
  fitFont(g, name, W - tx - PAD, 52, 'Silkscreen');
  g.fillText(name, tx, top + 50);
  g.fillStyle = c.p;
  const result = s.title.toUpperCase();
  fitFont(g, result, W - tx - PAD, 48, 'Silkscreen');
  g.fillText(result, tx, top + 112);
  g.fillStyle = c.y;
  const reach = t('end.share.reach', { a: s.act, n: s.floor }).toUpperCase();
  fitFont(g, reach, W - tx - PAD, 64, 'Silkscreen');
  g.fillText(reach, tx, top + 188);
  g.fillStyle = c.mutedD;
  const small = `${t('end.share.time', { t: clock(s.time) })} · ${t(s.begged ? 'end.share.begged' : 'end.share.noBeg')}`;
  fitFont(g, small, W - tx - PAD, 30, '"Pixel UI"');
  g.fillText(small, tx, top + 236);

  // The payslip on paper: rows with dot leaders, NEW RECORD stamps, then the big stamp.
  const sy = SLIP_Y;
  const sh = slipH;
  g.fillStyle = c.shadow;
  g.fillRect(PAD + 10, sy + 10, W - 2 * PAD, sh);
  g.fillStyle = c.paper;
  g.fillRect(PAD, sy, W - 2 * PAD, sh);
  g.strokeStyle = c.k;
  g.strokeRect(PAD, sy, W - 2 * PAD, sh);
  const lx = PAD + 40;
  const rx = W - PAD - 40;
  g.fillStyle = c.k;
  g.font = '40px Silkscreen';
  g.fillText(t('end.slip.title').toUpperCase(), lx, sy + 60);
  g.textAlign = 'right';
  g.fillStyle = c.muted;
  g.font = '32px "Pixel UI"';
  g.fillText(t('end.slip.company'), rx, sy + 58);
  g.textAlign = 'left';
  g.fillText(s.employee, lx, sy + 100);
  g.setLineDash([10, 8]);
  g.lineWidth = 3;
  g.beginPath();
  g.moveTo(lx, sy + 118);
  g.lineTo(rx, sy + 118);
  g.stroke();
  g.setLineDash([]);
  let y = sy + 160;
  for (const r of s.rows) {
    g.font = '34px "Pixel UI"';
    g.fillStyle = r.kind === 'section' ? c.p : c.k;
    const label = r.kind === 'section' ? r.label.toUpperCase() : r.label;
    g.textAlign = 'left';
    g.fillText(label, lx, y);
    g.textAlign = 'right';
    g.fillText(r.value, rx, y);
    if (r.kind === 'row') {
      const from = lx + g.measureText(label).width + 12;
      const to = rx - g.measureText(r.value).width - 12;
      g.fillStyle = c.paper2;
      for (let x = from; x < to; x += 10) g.fillRect(x, y - 6, 4, 4);
    }
    if (r.record) stamp(g, t('end.newRecord'), rx - 200, y - 12, 20, c.p, -0.08);
    y += 40;
  }
  stamp(g, s.stamp.toUpperCase(), W / 2 + 60, sy + sh - 90, 48, s.won ? c.b : c.p, -0.2);

  // The stationery it ended with.
  if (s.relics.length) {
    g.textAlign = 'left';
    g.fillStyle = c.mutedD;
    g.font = '32px "Pixel UI"';
    g.fillText(t('hero.relics').toUpperCase(), PAD, relicY);
    for (const [i, id] of s.relics.entries()) {
      const x = PAD + (i % RELICS_PER_ROW) * (RELIC_SIZE + RELIC_GAP);
      const ry = relicY + 20 + Math.floor(i / RELICS_PER_ROW) * RELIC_ROW;
      await drawSprite(g, `relic.${id}`, x, ry, RELIC_SIZE);
    }
    // One little table per row, drawn under the sprites' feet.
    const rows = Math.ceil(s.relics.length / RELICS_PER_ROW);
    for (let r = 0; r < rows; r++) {
      const n = Math.min(RELICS_PER_ROW, s.relics.length - r * RELICS_PER_ROW);
      const tx0 = PAD - 6;
      const tw0 = n * (RELIC_SIZE + RELIC_GAP) - RELIC_GAP + 12;
      const ty0 = relicY + 20 + r * RELIC_ROW + RELIC_SIZE - 6;
      g.lineWidth = 3;
      g.strokeStyle = c.k;
      g.fillStyle = c.wood;
      for (const lx0 of [tx0 + 14, tx0 + tw0 - 14 - 10]) {
        g.fillRect(lx0, ty0 + TABLE_TOP, 10, TABLE_LEGS);
        g.strokeRect(lx0, ty0 + TABLE_TOP, 10, TABLE_LEGS);
      }
      g.fillStyle = c.woodTop;
      g.fillRect(tx0, ty0, tw0, TABLE_TOP);
      g.strokeRect(tx0, ty0, tw0, TABLE_TOP);
    }
  }

  // The final deck: one ticket per card, copies counted.
  const dy = deckY;
  g.textAlign = 'left';
  g.fillStyle = c.mutedD;
  g.font = '32px "Pixel UI"';
  g.fillText(t('common.deck').toUpperCase(), PAD, dy);
  const tw = (W - 2 * PAD - (DECK_COLS - 1) * DECK_GAP) / DECK_COLS;
  const th = TICKET_H;
  const bands = new Map<string, { band: string; text: string }>();
  const artBgs = new Map<string, string>();
  // Rarer cards last; the order the deck came in holds within a rarity.
  const deck = [...s.deck].sort((a, b) => RARITY_ORDER.indexOf(CARDS[a.card.id].rarity) - RARITY_ORDER.indexOf(CARDS[b.card.id].rarity));
  for (const [i, { card, n }] of deck.entries()) {
    const x = PAD + (i % DECK_COLS) * (tw + DECK_GAP);
    const ty = dy + 20 + Math.floor(i / DECK_COLS) * (th + DECK_GAP);
    const def = CARDS[card.id];
    const cls = def.cls;
    if (!bands.has(cls)) bands.set(cls, bandOf(cls));
    const band = bands.get(cls)!;
    if (!artBgs.has(def.type)) artBgs.set(def.type, artBgOf(def.type));
    g.fillStyle = c.paper;
    g.fillRect(x, ty, tw, th);
    g.fillStyle = band.band;
    g.fillRect(x, ty, tw, 34);
    g.lineWidth = 3;
    g.strokeStyle = c.k;
    g.strokeRect(x, ty, tw, th);
    g.fillStyle = band.text;
    g.textAlign = 'left';
    fitFont(g, cardName(card), tw - 12, 24, '"Pixel UI"');
    g.fillText(cardName(card), x + 6, ty + 25);
    g.fillStyle = artBgs.get(def.type)!;
    g.fillRect(x, ty + 34, tw, th - 34);
    g.strokeRect(x, ty, tw, th);
    g.fillStyle = c.b;
    g.fillRect(x + 6, ty + 44, 40, 44);
    g.fillStyle = c.paper;
    g.font = '36px "Pixel UI"';
    g.textAlign = 'center';
    g.fillText(cardCostLabel(card), x + 26, ty + 78);
    await drawIcon(g, def.art, x + 54, ty + 44, 44, c.k);
    if (n > 1) {
      g.fillStyle = c.k;
      g.textAlign = 'right';
      g.font = '30px "Pixel UI"';
      g.fillText(t('deck.copies', { n }), x + tw - 6, ty + 66);
    }
    // The rarity corner: rare and above, a triangle in the rarity ink (as on the card).
    const gem = gemInk(def.rarity, c);
    if (gem) {
      g.fillStyle = c.k;
      g.beginPath();
      g.moveTo(x + tw, ty + th - GEM);
      g.lineTo(x + tw, ty + th);
      g.lineTo(x + tw - GEM, ty + th);
      g.fill();
      g.fillStyle = gem;
      g.beginPath();
      g.moveTo(x + tw - 3, ty + th - GEM * 0.74);
      g.lineTo(x + tw - 3, ty + th - 3);
      g.lineTo(x + tw - GEM * 0.74, ty + th - 3);
      g.fill();
    }
  }

  // Where to clock in.
  g.textAlign = 'center';
  g.fillStyle = c.mutedD;
  g.font = '30px "Pixel UI"';
  g.fillText(`${location.host}${location.pathname}`.replace(/\/$/, ''), W / 2, H - 30);
  g.textAlign = 'right';
  g.font = '24px "Pixel UI"';
  g.fillText(`v${__APP_VERSION__}`, W - PAD, H - 30);

  return new Promise((resolve) => cv.toBlob(resolve, 'image/png'));
}

/** Shares the image through the system sheet where files can be shared; otherwise downloads it. */
export async function shareImage(blob: Blob, name: string, text: string): Promise<void> {
  const file = new File([blob], name, { type: 'image/png' });
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], text });
    } catch {
      /* the player closed the share sheet */
    }
    return;
  }
  const url = URL.createObjectURL(blob);
  const a = h('a', { href: url, download: name });
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
