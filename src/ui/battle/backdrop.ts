import { Rng } from '../../core/rng';
import { COLS, PLACE_ROW, ROWS, type Terrain } from '../../game/types';

/**
 * The ground of a night, painted once to an offscreen canvas: a road in the top rows, garden plots where spirits may stand,
 * the lantern's slab at the bottom, and the act's scenery in the margins. The field draws light and life over it each frame.
 */

export interface Theme {
  /** Far and near ground colours (the road fades into mist at the top). */
  far: string;
  near: string;
  road: string;
  roadStone: string;
  plotA: string;
  plotB: string;
  plotRim: string;
  moss: string;
  mist: string;
  /** Scenery silhouettes and the light of fireflies. */
  tree: string;
  firefly: string;
  /** A tone of the sky that dawn brings (blended over the field). */
  dawn: string;
}

export const THEMES: Record<number, Theme> = {
  1: {
    far: '#1a1c4a',
    near: '#2a2a62',
    road: '#463d62',
    roadStone: '#5b5078',
    plotA: '#2f3b72',
    plotB: '#374580',
    plotRim: '#4f6ab0',
    moss: '#58935f',
    mist: '#3b2f6b',
    tree: '#0e1030',
    firefly: '#fff6a0',
    dawn: '#ff9a62',
  },
  2: {
    far: '#0d2a38',
    near: '#154550',
    road: '#2f5254',
    roadStone: '#41706a',
    plotA: '#1f5a5c',
    plotB: '#26686a',
    plotRim: '#4fb4a0',
    moss: '#7ac27a',
    mist: '#1f5a60',
    tree: '#07202a',
    firefly: '#b8ffb0',
    dawn: '#ffc27a',
  },
  3: {
    far: '#26102e',
    near: '#3c1a48',
    road: '#5a3a5c',
    roadStone: '#76507a',
    plotA: '#4a2a62',
    plotB: '#56326e',
    plotRim: '#9a5fc0',
    moss: '#a86a9a',
    mist: '#5a2060',
    tree: '#140820',
    firefly: '#ff9a9a',
    dawn: '#ff7a8a',
  },
};

export interface Geometry {
  w: number;
  h: number;
  tw: number;
  th: number;
}

/** Height of the lantern's slab below the last row, in tiles. */
export const BASE_ROWS = 1.3;

export function geometry(w: number, h: number): Geometry {
  const th = h / (ROWS + BASE_ROWS);
  return { w, h, tw: w / COLS, th };
}

const roundRect = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void => {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
};

/** Paints the whole backdrop into `ctx` (already scaled to css pixels). */
export function paintBackdrop(ctx: CanvasRenderingContext2D, g: Geometry, act: number, terrain: Terrain[][], seed: number): void {
  const T = THEMES[act] ?? THEMES[1];
  const { w, h, tw, th } = g;
  const rng = new Rng(seed * 7919 + act);

  const base = ctx.createLinearGradient(0, 0, 0, h);
  base.addColorStop(0, T.far);
  base.addColorStop(1, T.near);
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, w, h);

  // The road the parade walks: a darker band with cobbles, wider than the lanes' edges so it reads as a path.
  const roadH = PLACE_ROW * th;
  ctx.fillStyle = T.road;
  ctx.fillRect(0, 0, w, roadH + th * 0.12);
  for (let i = 0; i < 70; i++) {
    const x = rng.next() * w;
    const y = rng.next() * roadH;
    const sw = 7 + rng.next() * 12;
    ctx.fillStyle = T.roadStone;
    ctx.globalAlpha = 0.28 + rng.next() * 0.3;
    roundRect(ctx, x, y, sw, sw * 0.62, 3);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  // Lane seams on the road: faint, so the lanes can be read before a spirit stands in them.
  ctx.strokeStyle = 'rgba(255,255,255,0.06)';
  ctx.lineWidth = 2;
  ctx.setLineDash([6, 10]);
  for (let l = 1; l < COLS; l++) {
    ctx.beginPath();
    ctx.moveTo(l * tw, 0);
    ctx.lineTo(l * tw, roadH);
    ctx.stroke();
  }
  ctx.setLineDash([]);

  // The garden: one plot per tile, in two tones like a board, with a mossy rim.
  for (let l = 0; l < COLS; l++) {
    for (let r = PLACE_ROW; r < ROWS; r++) {
      const x = l * tw + 2.5;
      const y = r * th + 2.5;
      const pw = tw - 5;
      const ph = th - 5;
      ctx.fillStyle = (l + r) % 2 ? T.plotA : T.plotB;
      roundRect(ctx, x, y, pw, ph, 9);
      ctx.fill();
      ctx.strokeStyle = T.plotRim;
      ctx.globalAlpha = 0.45;
      ctx.lineWidth = 2;
      roundRect(ctx, x, y, pw, ph, 9);
      ctx.stroke();
      ctx.globalAlpha = 1;
      // Grass tufts and a flower or two.
      for (let i = 0; i < 4; i++) {
        const gx = x + 8 + rng.next() * (pw - 16);
        const gy = y + 8 + rng.next() * (ph - 16);
        ctx.strokeStyle = T.moss;
        ctx.globalAlpha = 0.55;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(gx, gy + 4);
        ctx.lineTo(gx - 2, gy - 2);
        ctx.moveTo(gx, gy + 4);
        ctx.lineTo(gx + 3, gy - 3);
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
      if (rng.chance(0.18)) {
        ctx.fillStyle = rng.chance(0.5) ? '#f4b6c8' : '#fff3d6';
        ctx.globalAlpha = 0.8;
        ctx.beginPath();
        ctx.arc(x + 10 + rng.next() * (pw - 20), y + 10 + rng.next() * (ph - 20), 2.2, 0, 6.283);
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    }
  }

  // Terrain: rocks and shrine pads.
  for (let l = 0; l < COLS; l++) {
    for (let r = PLACE_ROW; r < ROWS; r++) {
      const kind = terrain[l]?.[r];
      const cx = (l + 0.5) * tw;
      const cy = (r + 0.5) * th;
      if (kind === 'rock') paintRock(ctx, cx, cy, tw, th, rng);
      else if (kind === 'shrine') paintShrinePad(ctx, cx, cy, tw, th);
    }
  }

  // A line of paper streamers where the road meets the garden.
  ctx.strokeStyle = '#d8c58a';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, roadH + 1);
  ctx.lineTo(w, roadH + 1);
  ctx.stroke();
  ctx.fillStyle = '#fff3d6';
  for (let i = 0; i < COLS * 2; i++) {
    const x = (i + 0.5) * (w / (COLS * 2));
    ctx.beginPath();
    ctx.moveTo(x - 5, roadH + 2);
    ctx.lineTo(x + 5, roadH + 2);
    ctx.lineTo(x + 5, roadH + 11);
    ctx.lineTo(x, roadH + 7);
    ctx.lineTo(x - 5, roadH + 11);
    ctx.closePath();
    ctx.globalAlpha = 0.75;
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  paintSlab(ctx, g);
  paintScenery(ctx, g, T, rng, act);

  // Mist over the far end, and a vignette.
  const mist = ctx.createLinearGradient(0, 0, 0, th * 2.3);
  mist.addColorStop(0, T.mist);
  mist.addColorStop(0.55, `${T.mist}aa`);
  mist.addColorStop(1, `${T.mist}00`);
  ctx.fillStyle = mist;
  ctx.fillRect(0, 0, w, th * 2.3);
  const vig = ctx.createRadialGradient(w / 2, h * 0.55, h * 0.3, w / 2, h * 0.55, h * 0.78);
  vig.addColorStop(0, 'rgba(0,0,0,0)');
  vig.addColorStop(1, 'rgba(4,2,16,0.55)');
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, w, h);
}

function paintRock(ctx: CanvasRenderingContext2D, cx: number, cy: number, tw: number, th: number, rng: Rng): void {
  const rw = tw * 0.36;
  const rh = th * 0.32;
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.beginPath();
  ctx.ellipse(cx, cy + rh * 0.9, rw * 1.1, rh * 0.45, 0, 0, 6.283);
  ctx.fill();
  const body = (dx: number, dy: number, sx: number, sy: number, c: string): void => {
    ctx.fillStyle = c;
    ctx.strokeStyle = '#1d1428';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(cx + dx - rw * sx, cy + dy + rh * sy * 0.8);
    ctx.quadraticCurveTo(cx + dx - rw * sx * 1.1, cy + dy - rh * sy * 0.9, cx + dx - rw * sx * 0.2, cy + dy - rh * sy);
    ctx.quadraticCurveTo(cx + dx + rw * sx * 1.1, cy + dy - rh * sy * 0.8, cx + dx + rw * sx, cy + dy + rh * sy * 0.8);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  };
  body(-rw * 0.3, rh * 0.1, 0.8, 0.8, '#7f8aa0');
  body(rw * 0.35, rh * 0.25, 0.65, 0.6, '#98a3b8');
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  ctx.beginPath();
  ctx.ellipse(cx - rw * 0.5, cy - rh * 0.3, rw * 0.16, rh * 0.12, -0.5, 0, 6.283);
  ctx.fill();
  ctx.fillStyle = '#6aa55a';
  ctx.globalAlpha = 0.8;
  ctx.beginPath();
  ctx.ellipse(cx + rw * 0.1 + rng.next() * 4, cy + rh * 0.5, rw * 0.4, rh * 0.1, 0, 0, 6.283);
  ctx.fill();
  ctx.globalAlpha = 1;
}

function paintShrinePad(ctx: CanvasRenderingContext2D, cx: number, cy: number, tw: number, th: number): void {
  const r = Math.min(tw, th) * 0.4;
  ctx.fillStyle = 'rgba(245,181,63,0.16)';
  ctx.beginPath();
  ctx.arc(cx, cy, r * 1.15, 0, 6.283);
  ctx.fill();
  ctx.strokeStyle = '#f5b53f';
  ctx.lineWidth = 2.4;
  ctx.setLineDash([5, 4]);
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, 6.283);
  ctx.stroke();
  ctx.setLineDash([]);
  // a small torii mark
  ctx.strokeStyle = '#e4452f';
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(cx - r * 0.5, cy + r * 0.42);
  ctx.lineTo(cx - r * 0.5, cy - r * 0.2);
  ctx.moveTo(cx + r * 0.5, cy + r * 0.42);
  ctx.lineTo(cx + r * 0.5, cy - r * 0.2);
  ctx.moveTo(cx - r * 0.7, cy - r * 0.34);
  ctx.lineTo(cx + r * 0.7, cy - r * 0.34);
  ctx.moveTo(cx - r * 0.55, cy - r * 0.04);
  ctx.lineTo(cx + r * 0.55, cy - r * 0.04);
  ctx.stroke();
}

/** The slab at the bottom where the lantern stands. */
function paintSlab(ctx: CanvasRenderingContext2D, g: Geometry): void {
  const { w, h, th } = g;
  const y = ROWS * th;
  const slab = ctx.createLinearGradient(0, y, 0, h);
  slab.addColorStop(0, '#5a5470');
  slab.addColorStop(1, '#2e2a44');
  ctx.fillStyle = slab;
  ctx.fillRect(0, y, w, h - y);
  ctx.strokeStyle = '#1d1428';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(0, y);
  ctx.lineTo(w, y);
  ctx.stroke();
  // flagstones
  ctx.strokeStyle = 'rgba(14,10,30,0.55)';
  ctx.lineWidth = 2;
  for (let i = 1; i < 8; i++) {
    ctx.beginPath();
    ctx.moveTo((i * w) / 8, y);
    ctx.lineTo((i * w) / 8 + (i % 2 ? 6 : -6), h);
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.moveTo(0, y + (h - y) * 0.55);
  ctx.lineTo(w, y + (h - y) * 0.55);
  ctx.stroke();
  // the threshold a foe must not cross: a row of red-and-white pegs
  for (let i = 0; i < 28; i++) {
    ctx.fillStyle = i % 2 ? '#e4452f' : '#fff3d6';
    ctx.fillRect((i * w) / 28, y + 2, w / 28, 5);
  }
}

function tree(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, c: string, kind: number): void {
  ctx.fillStyle = c;
  if (kind === 2) {
    // bamboo: tall segmented stalks
    for (let i = 0; i < 3; i++) {
      const bx = x + (i - 1) * s * 0.22;
      ctx.fillRect(bx - s * 0.045, y - s * (1.7 - i * 0.2), s * 0.09, s * (1.7 - i * 0.2));
      for (let k = 1; k < 5; k++) ctx.fillRect(bx - s * 0.07, y - s * 0.34 * k, s * 0.14, s * 0.04);
    }
    return;
  }
  // cedar: stacked triangles
  for (let i = 0; i < 4; i++) {
    const ty = y - s * 0.38 * i;
    const tw = s * (0.55 - i * 0.1);
    ctx.beginPath();
    ctx.moveTo(x - tw, ty);
    ctx.lineTo(x, ty - s * 0.5);
    ctx.lineTo(x + tw, ty);
    ctx.closePath();
    ctx.fill();
  }
  ctx.fillRect(x - s * 0.05, y, s * 0.1, s * 0.25);
}

/** Scenery along both margins and the far end: cedars, bamboo, houses or torii, by act. */
function paintScenery(ctx: CanvasRenderingContext2D, g: Geometry, T: Theme, rng: Rng, act: number): void {
  const { w, th } = g;
  ctx.save();
  ctx.globalAlpha = 0.9;
  const rows = PLACE_ROW + 0.4;
  for (let i = 0; i < 9; i++) {
    const side = i % 2 === 0 ? 0 : 1;
    const x = side === 0 ? rng.next() * w * 0.12 : w - rng.next() * w * 0.12;
    const y = (0.5 + rng.next() * rows) * th;
    tree(ctx, x, y, th * (0.9 + rng.next() * 0.7), T.tree, act === 2 ? 2 : 1);
  }
  if (act === 1) {
    // a few thatched roofs in the dark at the far end
    ctx.fillStyle = T.tree;
    for (let i = 0; i < 3; i++) {
      const x = w * (0.2 + i * 0.3) + rng.next() * 20;
      ctx.beginPath();
      ctx.moveTo(x - 30, th * 0.55);
      ctx.lineTo(x, th * 0.12);
      ctx.lineTo(x + 30, th * 0.55);
      ctx.closePath();
      ctx.fill();
    }
  }
  if (act === 3) {
    // the far torii of the stairs
    ctx.strokeStyle = '#7a1c2a';
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.moveTo(w * 0.34, th * 0.9);
    ctx.lineTo(w * 0.34, th * 0.15);
    ctx.moveTo(w * 0.66, th * 0.9);
    ctx.lineTo(w * 0.66, th * 0.15);
    ctx.moveTo(w * 0.28, th * 0.2);
    ctx.lineTo(w * 0.72, th * 0.2);
    ctx.moveTo(w * 0.31, th * 0.38);
    ctx.lineTo(w * 0.69, th * 0.38);
    ctx.stroke();
  }
  ctx.restore();
}
