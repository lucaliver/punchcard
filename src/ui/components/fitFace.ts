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
  // Measured in the observer itself (a microtask, before the next paint): a face the fight rewrites every few frames would otherwise
  // show one frame at full size before it shrinks, which flickers.
  new MutationObserver((mutations) => {
    for (const m of mutations)
      for (const node of m.addedNodes) {
        if (!(node instanceof HTMLElement)) continue;
        if (node.matches('.gl') && node.isConnected) shrinkToFit(node);
        for (const row of node.querySelectorAll<HTMLElement>('.gl')) if (row.isConnected) shrinkToFit(row);
      }
  }).observe(document.documentElement, { childList: true, subtree: true });
}
