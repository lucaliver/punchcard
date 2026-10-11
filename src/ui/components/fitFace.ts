/**
 * A card face's glyph row that is wider than the face (a long rule such as `{dmg:0}×{cards}`) shrinks until it fits inside the face's padding,
 * so no glyph touches the sides. The CSS reads `--fit` (1 = as written); rows are measured as cards are added to the page and whenever a
 * fight rewrites a face's numbers.
 */

/** Steps of the shrink: a row only ever takes one of these sizes, so a changing number does not make it flicker. */
const FIT_STEPS = 20;

function shrinkToFit(row: HTMLElement): void {
  row.style.removeProperty('--fit');
  const face = row.closest<HTMLElement>('.c-face');
  if (!face || !face.offsetWidth) return;
  // The row can't shrink under its content (`nowrap`), so its own box is the width of what it holds.
  const box = row.getBoundingClientRect();
  const style = getComputedStyle(face);
  // Rects carry any transform the card is under (a card being dealt is scaled), the layout sizes do not: the scale puts them in one unit.
  const scale = face.getBoundingClientRect().width / face.offsetWidth;
  const room = (face.clientWidth - Number.parseFloat(style.paddingLeft) - Number.parseFloat(style.paddingRight)) * scale;
  const width = box.width;
  if (width > room && room > 0) row.style.setProperty('--fit', (Math.floor((room / width) * FIT_STEPS) / FIT_STEPS).toFixed(2));
}

/** Starts watching the page: call once. */
export function fitFaces(): void {
  const pending = new Set<HTMLElement>();
  let queued = false;
  const flush = (): void => {
    queued = false;
    for (const row of pending) if (row.isConnected) shrinkToFit(row);
    pending.clear();
  };
  new MutationObserver((mutations) => {
    for (const m of mutations)
      for (const node of m.addedNodes) {
        if (!(node instanceof HTMLElement)) continue;
        if (node.matches('.gl')) pending.add(node);
        for (const row of node.querySelectorAll<HTMLElement>('.gl')) pending.add(row);
      }
    if (pending.size && !queued) {
      queued = true;
      requestAnimationFrame(flush);
    }
  }).observe(document.documentElement, { childList: true, subtree: true });
}
