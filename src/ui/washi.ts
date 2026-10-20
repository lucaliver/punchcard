/** Paints a tile of washi paper (soft fibres and specks, mostly transparent) and hands it to the stylesheet as `--washi`. */
export function paintWashi(): void {
  const size = 192;
  const c = document.createElement('canvas');
  c.width = size;
  c.height = size;
  const ctx = c.getContext('2d');
  if (!ctx) return;
  // A seeded wobble so the tile is the same on every launch.
  let s = 20211019;
  const rnd = (): number => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
  for (let i = 0; i < 260; i++) {
    const x = rnd() * size;
    const y = rnd() * size;
    const len = 6 + rnd() * 22;
    const a = rnd() * Math.PI;
    ctx.strokeStyle = rnd() < 0.5 ? `rgba(120,90,50,${0.03 + rnd() * 0.05})` : `rgba(255,255,255,${0.05 + rnd() * 0.08})`;
    ctx.lineWidth = 0.6 + rnd() * 0.8;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.quadraticCurveTo(
      x + Math.cos(a) * len * 0.5 + (rnd() - 0.5) * 6,
      y + Math.sin(a) * len * 0.5 + (rnd() - 0.5) * 6,
      x + Math.cos(a) * len,
      y + Math.sin(a) * len,
    );
    ctx.stroke();
  }
  for (let i = 0; i < 90; i++) {
    ctx.fillStyle = `rgba(110,80,40,${0.04 + rnd() * 0.06})`;
    ctx.fillRect(rnd() * size, rnd() * size, 1 + rnd() * 1.4, 1 + rnd() * 1.4);
  }
  document.documentElement.style.setProperty('--washi', `url(${c.toDataURL('image/png')})`);
}
