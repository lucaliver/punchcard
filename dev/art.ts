import { ALL_ART } from '../src/ui/art';
import { dataUrl } from '../src/ui/art/kit';

const only = new URLSearchParams(location.search).get('set');
const out = document.getElementById('out') as HTMLElement;
for (const [group, sprites] of Object.entries(ALL_ART)) {
  if (only && only !== group) continue;
  const h = document.createElement('h2');
  h.textContent = group;
  const grid = document.createElement('div');
  grid.className = 'grid';
  for (const [id, markup] of Object.entries(sprites)) {
    const cell = document.createElement('div');
    cell.className = 'cell';
    cell.innerHTML = `<img src="${dataUrl(markup)}" /><div>${id}</div>`;
    grid.append(cell);
  }
  out.append(h, grid);
}
