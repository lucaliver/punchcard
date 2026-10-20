import { t } from '../core/i18n';
import { settings } from '../game/settings';
import { artUrl } from './art/sprites';
import { cssMs, h } from './dom';

export interface Screen {
  el: HTMLElement;
  enter?(): void;
  leave?(): void;
  /** Called every animation frame while the screen is active. */
  frame?(dt: number): void;
}

let root: HTMLElement;
let current: Screen | null = null;
let changing = false;

export function initApp(el: HTMLElement): void {
  root = el;
  let last = performance.now();
  const loop = (now: number): void => {
    const dt = Math.min(0.1, (now - last) / 1000);
    last = now;
    current?.frame?.(dt);
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
}

/** A pixel-crisp picture of a drawing, as an `<img>`. */
export const pico = (id: string, cls = ''): HTMLImageElement =>
  h('img', { class: `pico ${cls}`.trim(), src: artUrl(id), alt: '', draggable: 'false' });

/** The same as markup, for strings that go through `innerHTML`. */
export const picoHtml = (id: string, cls = ''): string => `<img class="pico ${cls}" src="${artUrl(id)}" alt="" draggable="false">`;

const wait = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));

/** Swaps to another screen behind two sliding paper doors (at once with reduced motion or `instant`). */
export async function show(screen: Screen, opts: { instant?: boolean } = {}): Promise<void> {
  if (changing) {
    // A second change while one runs just replaces what is on show when the doors open.
    await wait(cssMs('--dur-shoji') * 2 + 60);
  }
  const prev = current;
  const swap = (): void => {
    if (prev) {
      prev.leave?.();
      prev.el.remove();
    }
    current = screen;
    root.append(screen.el);
    screen.enter?.();
  };
  if (!prev || opts.instant || settings.reduceMotion) {
    swap();
    return;
  }
  changing = true;
  const doors = h('div', { class: 'shoji' }, h('i'), h('i'), pico('nodeWatch', 'mark'));
  root.append(doors);
  void doors.offsetWidth;
  doors.classList.add('closed');
  await wait(cssMs('--dur-shoji') + 40);
  swap();
  await wait(60);
  doors.classList.remove('closed');
  await wait(cssMs('--dur-shoji') + 40);
  doors.remove();
  changing = false;
}

export const currentScreen = (): Screen | null => current;

export interface ModalAction {
  label: string;
  cls?: string;
  /** Return false to keep the modal open. */
  onClick?: () => unknown;
}

export interface ModalOpts {
  title?: string;
  body?: Node | string;
  actions?: ModalAction[];
  /** Tapping the backdrop closes the modal (default true). */
  dismiss?: boolean;
  cls?: string;
  onClose?: () => void;
}

/** A paper sheet over the current screen. Returns a function that closes it. */
export function openModal(opts: ModalOpts): () => void {
  const host = current?.el ?? root;
  const back = h('div', { class: 'modal-back' });
  const close = (): void => {
    back.remove();
    opts.onClose?.();
  };
  const body =
    typeof opts.body === 'string' ? h('div', { class: 'body', html: opts.body }) : opts.body ? h('div', { class: 'body' }, opts.body) : null;
  const actions = opts.actions?.length
    ? h(
        'div',
        { class: 'actions' },
        ...opts.actions.map((a) =>
          h(
            'button',
            {
              class: `btn ${a.cls ?? 'paper'}`,
              onclick: () => {
                if (a.onClick?.() !== false) close();
              },
            },
            a.label,
          ),
        ),
      )
    : null;
  const sheet = h(
    'div',
    { class: `modal panel ${opts.cls ?? ''}`.trim() },
    opts.title ? h('div', { class: 'title' }, opts.title) : null,
    body,
    actions,
  );
  back.append(sheet);
  if (opts.dismiss !== false) {
    // A full tap on the backdrop closes it, never the press alone.
    let downOnBack = false;
    back.addEventListener('pointerdown', (e) => {
      downOnBack = e.target === back;
    });
    back.addEventListener('click', (e) => {
      if (downOnBack && e.target === back) close();
    });
  }
  host.append(back);
  return close;
}

export function toast(text: string): void {
  const el = h('div', { class: 'toast' }, text);
  (current?.el ?? root).append(el);
  setTimeout(() => el.remove(), 1900);
}

/** A question with two answers; `onYes` runs on the first. */
export function confirmModal(title: string, body: string, onYes: () => void): () => void {
  return openModal({
    title,
    body,
    actions: [
      { label: t('ui.no'), cls: 'paper' },
      { label: t('ui.yes'), cls: 'red', onClick: onYes },
    ],
  });
}
