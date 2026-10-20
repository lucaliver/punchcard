import { ALL_ART } from './index';
import { dataUrl } from './kit';

/** Every drawing, by id, as a data URL (for `<img>`/CSS) and as a decoded bitmap (for the field canvas). Ids are unique across groups. */
const markup = new Map<string, string>();
for (const group of Object.values(ALL_ART)) for (const [id, svg] of Object.entries(group)) markup.set(id, svg);

const urls = new Map<string, string>();
const images = new Map<string, HTMLImageElement>();

export const hasArt = (id: string): boolean => markup.has(id);

/** The drawing as a data URL. An unknown id gives the lantern, never a broken picture. */
export function artUrl(id: string): string {
  let url = urls.get(id);
  if (!url) {
    const svg = markup.get(id) ?? markup.get('nodeWatch') ?? '';
    url = dataUrl(svg);
    urls.set(id, url);
  }
  return url;
}

/** The decoded image for the canvas, or null while it is still loading. */
export function artImage(id: string): HTMLImageElement | null {
  const img = images.get(id);
  return img?.complete && img.naturalWidth > 0 ? img : null;
}

/** Starts decoding every drawing; resolves when all are ready. */
export function preloadArt(): Promise<void> {
  const jobs: Promise<unknown>[] = [];
  for (const id of markup.keys()) {
    const img = new Image();
    img.decoding = 'async';
    img.src = artUrl(id);
    images.set(id, img);
    jobs.push(img.decode().catch(() => undefined));
  }
  return Promise.all(jobs).then(() => undefined);
}
