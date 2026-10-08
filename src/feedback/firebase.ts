import { CONFIG } from '../data/config';
import { settings } from '../game/settings';

/**
 * The only file that knows Firebase: `sendReview` files one review as a Firestore document (REST, no SDK) in the
 * `reviews` collection. The project's rules must allow `create` on it and nothing else (no read, update or delete).
 * Unset `VITE_FIREBASE_*` (dev, tests, forks) = nothing leaves the page and the send counts as done.
 */
export interface Review {
  stars: number;
  text: string;
}

export const enabled = (): boolean => !!import.meta.env.VITE_FIREBASE_PROJECT_ID && !!import.meta.env.VITE_FIREBASE_API_KEY;

/** Resolves true when the review is stored (or there is nowhere to store it); false on any failure. */
export async function sendReview(review: Review): Promise<boolean> {
  if (!enabled()) return true;
  const { VITE_FIREBASE_PROJECT_ID: project, VITE_FIREBASE_API_KEY: key } = import.meta.env;
  const body = {
    fields: {
      stars: { integerValue: String(review.stars) },
      text: { stringValue: review.text.slice(0, CONFIG.reviewMax) },
      version: { stringValue: __APP_VERSION__ },
      locale: { stringValue: settings.locale },
      at: { timestampValue: new Date().toISOString() },
    },
  };
  try {
    const res = await fetch(`https://firestore.googleapis.com/v1/projects/${project}/databases/(default)/documents/reviews?key=${key}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    return res.ok;
  } catch {
    return false;
  }
}
