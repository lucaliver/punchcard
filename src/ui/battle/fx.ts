/** Particles, floating numbers and short-lived shapes for the field. Pure drawing state: nothing here reads the engine. */

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  /** Seconds left, and the total (for fading). */
  life: number;
  max: number;
  size: number;
  color: string;
  shape: 'dot' | 'spark' | 'leaf' | 'ring' | 'star';
  gravity: number;
  /** Fraction of the size gained over the life (a ring grows, smoke swells). */
  grow: number;
  rot: number;
  spin: number;
  glow: boolean;
}

export interface Floater {
  x: number;
  y: number;
  text: string;
  color: string;
  life: number;
  max: number;
  size: number;
}

/** A thing that travels: a bolt, a lob, a streak. */
export interface Shot {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  t: number;
  /** Seconds it takes. */
  dur: number;
  color: string;
  glow: string;
  kind: 'bolt' | 'lob' | 'beam' | 'ring' | 'slash' | 'arrow';
  size: number;
}

export class FxLayer {
  particles: Particle[] = [];
  floaters: Floater[] = [];
  shots: Shot[] = [];

  burst(x: number, y: number, n: number, o: Partial<Particle> & { speed?: number; spread?: number; up?: number } = {}): void {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const sp = (o.speed ?? 90) * (0.35 + Math.random() * 0.8);
      const life = (o.life ?? 0.55) * (0.7 + Math.random() * 0.6);
      this.particles.push({
        x: x + (Math.random() - 0.5) * (o.spread ?? 4),
        y: y + (Math.random() - 0.5) * (o.spread ?? 4),
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp - (o.up ?? 0),
        life,
        max: life,
        size: (o.size ?? 3) * (0.7 + Math.random() * 0.7),
        color: o.color ?? '#fff3d6',
        shape: o.shape ?? 'dot',
        gravity: o.gravity ?? 0,
        grow: o.grow ?? 0,
        rot: Math.random() * 6.28,
        spin: (Math.random() - 0.5) * 8,
        glow: o.glow ?? false,
      });
    }
  }

  ring(x: number, y: number, size: number, color: string, life = 0.4): void {
    this.particles.push({ x, y, vx: 0, vy: 0, life, max: life, size, color, shape: 'ring', gravity: 0, grow: 1.4, rot: 0, spin: 0, glow: true });
  }

  float(x: number, y: number, text: string, color = '#fff3d6', size = 16, life = 0.9): void {
    this.floaters.push({ x, y, text, color, life, max: life, size });
  }

  shot(s: Omit<Shot, 't'>): void {
    this.shots.push({ ...s, t: 0 });
  }

  update(dt: number): void {
    for (const p of this.particles) {
      p.life -= dt;
      p.vy += p.gravity * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.rot += p.spin * dt;
    }
    this.particles = this.particles.filter((p) => p.life > 0);
    for (const f of this.floaters) {
      f.life -= dt;
      f.y -= 34 * dt;
    }
    this.floaters = this.floaters.filter((f) => f.life > 0);
    for (const s of this.shots) s.t += dt;
    this.shots = this.shots.filter((s) => s.t < s.dur);
    if (this.particles.length > 400) this.particles.splice(0, this.particles.length - 400);
  }

  drawParticles(ctx: CanvasRenderingContext2D): void {
    for (const p of this.particles) {
      const k = Math.max(0, p.life / p.max);
      const size = p.size * (1 + p.grow * (1 - k));
      ctx.globalAlpha = Math.min(1, k * 1.6);
      ctx.fillStyle = p.color;
      ctx.strokeStyle = p.color;
      if (p.glow) ctx.globalCompositeOperation = 'lighter';
      switch (p.shape) {
        case 'dot':
          ctx.beginPath();
          ctx.arc(p.x, p.y, size, 0, 6.283);
          ctx.fill();
          break;
        case 'ring':
          ctx.lineWidth = Math.max(1.5, size * 0.12 * k);
          ctx.beginPath();
          ctx.arc(p.x, p.y, size, 0, 6.283);
          ctx.stroke();
          break;
        case 'spark':
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(Math.atan2(p.vy, p.vx));
          ctx.fillRect(-size * 1.6, -size * 0.35, size * 3.2, size * 0.7);
          ctx.restore();
          break;
        case 'leaf':
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rot);
          ctx.beginPath();
          ctx.ellipse(0, 0, size * 1.3, size * 0.7, 0, 0, 6.283);
          ctx.fill();
          ctx.restore();
          break;
        case 'star':
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rot);
          ctx.beginPath();
          for (let i = 0; i < 8; i++) {
            const r = i % 2 === 0 ? size * 1.5 : size * 0.55;
            const a = (i / 8) * 6.283;
            ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
          }
          ctx.closePath();
          ctx.fill();
          ctx.restore();
          break;
      }
      ctx.globalCompositeOperation = 'source-over';
    }
    ctx.globalAlpha = 1;
  }

  drawShots(ctx: CanvasRenderingContext2D): void {
    for (const s of this.shots) {
      const k = Math.min(1, s.t / s.dur);
      let x = s.x0 + (s.x1 - s.x0) * k;
      let y = s.y0 + (s.y1 - s.y0) * k;
      if (s.kind === 'lob') y -= Math.sin(k * Math.PI) * 36;
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      switch (s.kind) {
        case 'bolt':
        case 'arrow':
        case 'lob': {
          const g = ctx.createRadialGradient(x, y, 0, x, y, s.size * 2.6);
          g.addColorStop(0, s.glow);
          g.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(x, y, s.size * 2.6, 0, 6.283);
          ctx.fill();
          ctx.globalCompositeOperation = 'source-over';
          ctx.fillStyle = s.color;
          ctx.translate(x, y);
          ctx.rotate(Math.atan2(s.y1 - s.y0, s.x1 - s.x0));
          if (s.kind === 'arrow') {
            ctx.fillRect(-s.size * 2.4, -s.size * 0.28, s.size * 3.6, s.size * 0.56);
            ctx.beginPath();
            ctx.moveTo(s.size * 1.6, -s.size * 0.8);
            ctx.lineTo(s.size * 2.6, 0);
            ctx.lineTo(s.size * 1.6, s.size * 0.8);
            ctx.fill();
          } else {
            ctx.beginPath();
            ctx.ellipse(0, 0, s.size, s.size * 0.7, 0, 0, 6.283);
            ctx.fill();
          }
          break;
        }
        case 'beam': {
          x = s.x1;
          y = s.y1;
          ctx.globalAlpha = 1 - k;
          ctx.strokeStyle = s.glow;
          ctx.lineWidth = s.size * 2.4 * (1 - k * 0.6);
          ctx.beginPath();
          ctx.moveTo(s.x0, s.y0);
          ctx.lineTo(s.x1, s.y1);
          ctx.stroke();
          ctx.strokeStyle = s.color;
          ctx.lineWidth = s.size * 0.8;
          ctx.stroke();
          break;
        }
        case 'ring': {
          ctx.globalAlpha = 1 - k;
          ctx.strokeStyle = s.glow;
          ctx.lineWidth = 4 * (1 - k) + 1;
          ctx.beginPath();
          ctx.arc(s.x0, s.y0, s.size * (0.3 + k), 0, 6.283);
          ctx.stroke();
          break;
        }
        case 'slash': {
          ctx.globalAlpha = 1 - k;
          ctx.strokeStyle = s.color;
          ctx.lineWidth = s.size * (1 - k * 0.5);
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(s.x1 - s.size * 1.4, s.y1 - s.size * 1.2 + k * 8);
          ctx.quadraticCurveTo(s.x1 + s.size * 0.2, s.y1 + s.size * 0.2, s.x1 + s.size * 1.2, s.y1 + s.size * 1.4 + k * 8);
          ctx.stroke();
          break;
        }
      }
      ctx.restore();
    }
  }

  drawFloaters(ctx: CanvasRenderingContext2D): void {
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (const f of this.floaters) {
      const k = f.life / f.max;
      ctx.globalAlpha = Math.min(1, k * 2.2);
      ctx.font = `${f.size * (1 + (1 - k) * 0.15)}px "Dela Gothic One", sans-serif`;
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#1d1428';
      ctx.lineJoin = 'round';
      ctx.strokeText(f.text, f.x, f.y);
      ctx.fillStyle = f.color;
      ctx.fillText(f.text, f.x, f.y);
    }
    ctx.globalAlpha = 1;
  }
}
