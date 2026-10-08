import { CONFIG } from '../data/config';
import { settings } from '../game/settings';

/**
 * The only file that knows Firebase: `sendReview` files one review as a Firestore document (REST, no SDK) in the
 * `reviews` collection (and `sendCrash` a crash report in `crashes`). The project's rules must allow `create` on them and nothing else (no read, update or delete).
 * Unset `VITE_FIREBASE_*` (dev, tests, forks) = nothing leaves the page and the send counts as done.
 */
export interface Review {
  stars: number;
  text: string;
}

export const enabled = (): boolean => !!import.meta.env.VITE_FIREBASE_PROJECT_ID && !!import.meta.env.VITE_FIREBASE_API_KEY;

type Fields = Record<string, { stringValue: string } | { integerValue: string } | { timestampValue: string }>;

/** Files one document in `collection`; true when stored (or there is nowhere to store it), false on any failure. */
async function file(collection: string, fields: Fields): Promise<boolean> {
  if (!enabled()) return true;
  const { VITE_FIREBASE_PROJECT_ID: project, VITE_FIREBASE_API_KEY: key } = import.meta.env;
  try {
    const res = await fetch(`https://firestore.googleapis.com/v1/projects/${project}/databases/(default)/documents/${collection}?key=${key}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fields }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

const stamp = () => ({
  version: { stringValue: __APP_VERSION__ },
  locale: { stringValue: settings.locale },
  at: { timestampValue: new Date().toISOString() },
});

export const sendReview = (review: Review): Promise<boolean> =>
  file('reviews', {
    stars: { integerValue: String(review.stars) },
    text: { stringValue: review.text.slice(0, CONFIG.reviewMax) },
    ...stamp(),
  });

/**
 * Crash reports: `report` (version, browser, stack) goes to the `crashes` collection, fire and forget. Off with the Settings switch
 * `analytics`. To remove: delete this function, its call in `catchCrashes` (`main.ts`) and the `crashes` rules.
 */
export function sendCrash(report: string): void {
  if (settings.analytics) void file('crashes', { report: { stringValue: report.slice(0, CONFIG.crashMax) }, ...stamp() });
}
