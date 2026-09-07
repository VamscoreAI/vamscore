/**
 * TEMPORARY SCAFFOLDING. Delete this file and its call sites once UV's Clerk
 * keys are in `.env.local` — see the "Employee login" section of the README.
 *
 * It exists so the marketing site keeps building and running before Clerk is
 * configured. `<ClerkProvider>` and `clerkMiddleware()` both throw without a
 * publishable key, so adding them unguarded would break `npm run dev` and
 * `npm run build` the moment this landed and leave it broken until the Clerk
 * account existed.
 *
 * Both checks below **fail closed**: without keys the portal and the auth
 * routes do not exist at all, rather than existing and being open. That
 * distinction is worth nothing today (the portal is a placeholder) and worth a
 * great deal the moment real tools live behind it.
 */

/**
 * Whether to render auth UI. Safe in the browser — it reads only the public
 * key, which Next statically replaces in every bundle, so this evaluates
 * identically during SSR and hydration.
 *
 * `next.config.ts` pins this variable into the build precisely so that stays
 * true: without that pin, a build with no key leaves a live `process.env`
 * lookup that resolves to `undefined` in the browser but to the real value on
 * the Node server — which renders the login link on the server, omits it on the
 * client, and throws a hydration error on every page of the site.
 *
 * Reference `process.env.<KEY>` literally; destructuring defeats the
 * replacement.
 */
export const authUiEnabled = Boolean(
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
);

/**
 * Server-only gate. Requires **both** keys, so a half-configured environment
 * fails closed rather than half-open.
 *
 * Never use this to decide UI: the browser cannot see `CLERK_SECRET_KEY`, so it
 * would disagree with the server and cause the very hydration mismatch the note
 * above describes. Use `authUiEnabled` for that.
 */
export function isAuthConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY
  );
}
