import { CONFIG } from '../data/config';
import { settings } from '../game/settings';

type Child = Node | string | number | null | undefined | false;
type Attrs = Record<string, unknown>;

/** Tiny hyperscript: `h('div', { class: 'x', onclick: fn }, child…)`. */
export function h<K extends keyof HTMLElementTagNameMap>(tag: K, attrs: Attrs | null = null, ...children: Child[]): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag);
  if (attrs) {
    for (const [k, v] of Object.entries(attrs)) {
      if (v === undefined || v === null || v === false) continue;
      if (k === 'html') el.innerHTML = String(v);
      else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2), v as EventListener);
      else if (k === 'style' && typeof v === 'object') {
        for (const [prop, val] of Object.entries(v as Record<string, string>)) {
          if (prop.startsWith('--')) el.style.setProperty(prop, val);
          else (el.style as unknown as Record<string, string>)[prop] = val;
        }
      } else el.setAttribute(k, v === true ? '' : String(v));
    }
  }
  for (const c of children) {
    if (c === null || c === undefined || c === false) continue;
    el.append(c instanceof Node ? c : document.createTextNode(String(c)));
  }
  return el;
}

export const $ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document): T => root.querySelector(sel) as T;

/** Sets text only when it changed (cheap per-frame updates). */
export function setText(el: Element, text: string | number): void {
  const s = String(text);
  if (el.textContent !== s) el.textContent = s;
}

export function toggle(el: Element, cls: string, on: boolean): void {
  if (el.classList.contains(cls) !== on) el.classList.toggle(cls, on);
}

/** A duration token of the stylesheet (`--dur-fly`) in milliseconds, so what waits for an animation waits as long as the CSS plays it. */
export const cssMs = (token: string): number => {
  const value = cssVar(token);
  return (Number.parseFloat(value) || 0) * (value.endsWith('ms') ? 1 : 1000);
};

/** A token of the stylesheet, so scripts paint with the same inks as the CSS. */
export const cssVar = (token: string): string => getComputedStyle(document.documentElement).getPropertyValue(token).trim();

/** A short buzz, when the player has not turned it off. */
export function haptic(ms: number | number[] = 12): void {
  if (!settings.vibrate) return;
  try {
    navigator.vibrate?.(ms);
  } catch {
    /* not supported */
  }
}

/**
 * Calls `onTap` on a tap and `onHold` on a long press (the long press never also taps). A press that goes on shows a small ring.
 */
export function onTapOrHold(el: HTMLElement, onTap: () => void, onHold: () => void, longMs: number = CONFIG.longPressMs): void {
  let timer = 0;
  let held = false;
  let x0 = 0;
  let y0 = 0;
  const cancel = (): void => clearTimeout(timer);
  el.addEventListener('pointerdown', (e) => {
    held = false;
    x0 = e.clientX;
    y0 = e.clientY;
    clearTimeout(timer);
    timer = window.setTimeout(() => {
      held = true;
      haptic(18);
      onHold();
    }, longMs);
  });
  el.addEventListener('pointermove', (e) => {
    if (Math.hypot(e.clientX - x0, e.clientY - y0) > CONFIG.tapSlop) cancel();
  });
  for (const ev of ['pointerup', 'pointerleave', 'pointercancel']) el.addEventListener(ev, cancel);
  el.addEventListener('click', () => {
    if (!held) onTap();
  });
  el.addEventListener('contextmenu', (e) => e.preventDefault());
}
