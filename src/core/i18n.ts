import en, { type EnKey } from '../i18n/en';
import it from '../i18n/it';

export type Dict = Record<string, string>;

/**
 * Prefixes of ids built at runtime (e.g. `card.${id}.name`); they are checked by tests/content.test.ts.
 * Any other key must be a literal id from en.ts, so a typo fails the typecheck.
 */
type DynamicPrefix =
  | 'card'
  | 'foe'
  | 'keeper'
  | 'relic'
  | 'node'
  | 'rarity'
  | 'kind'
  | 'act'
  | 'scope'
  | 'stat'
  | 'aim'
  | 'tip'
  | 'reward'
  | 'how'
  | 'keepers'
  | 'almanac'
  | 'moon'
  | 'crash'
  | 'rotate';
export type TKey = EnKey | `${DynamicPrefix}.${string}`;
export type Params = Record<string, string | number>;

/** Registered locales. Add a new language by creating `src/i18n/<code>.ts` and registering it here. */
const locales: Record<string, { name: string; dict: Dict }> = {
  en: { name: 'English', dict: en as Dict },
  it: { name: 'Italiano', dict: it },
};

let current = 'en';
const fallback = 'en';

export const availableLocales = (): { code: string; name: string }[] => Object.entries(locales).map(([code, l]) => ({ code, name: l.name }));

/** The registered language the browser prefers (its first language that is one of ours), or the default one. */
export function detectLocale(): string {
  for (const tag of navigator.languages ?? [navigator.language]) {
    const code = tag.toLowerCase().split('-')[0];
    if (locales[code]) return code;
  }
  return fallback;
}

export function setLocale(code: string): void {
  if (locales[code]) {
    current = code;
    if (typeof document !== 'undefined') document.documentElement.lang = code;
  }
}

/** Does the key exist (in the current language or the fallback)? For optional lines. */
export const hasKey = (key: TKey): boolean => key in locales[current].dict || key in locales[fallback].dict;

/**
 * Translates `key`, interpolating `{name}` params.
 * Plurals: `{n|card|cards}` picks a form through Intl.PluralRules for the param `n`.
 */
export function t(key: TKey, params?: Params): string {
  const s = locales[current].dict[key] ?? locales[fallback].dict[key];
  if (s === undefined) {
    if (import.meta.env?.DEV) console.warn(`[i18n] missing key: ${key}`);
    return key;
  }
  if (!params) return s;
  const rules = new Intl.PluralRules(current);
  return s
    .replace(/\{(\w+)\|([^|}]*)\|([^}]*)\}/g, (_, p: string, one: string, other: string) => (rules.select(Number(params[p])) === 'one' ? one : other))
    .replace(/\{(\w+)\}/g, (m, p: string) => (p in params ? String(params[p]) : m));
}
