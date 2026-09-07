import { clerkMiddleware } from "@clerk/nextjs/server";
import {
  NextResponse,
  type NextRequest,
  type NextFetchEvent,
  type NextMiddleware,
} from "next/server";
import { isAuthConfigured } from "@/lib/auth";

/**
 * Establishes Clerk's request context on the auth routes.
 *
 * **This file is `proxy.ts`, not `middleware.ts`.** Next.js 16 renamed the
 * convention — `middleware` is deprecated and warns on every build — and
 * Clerk's Next.js docs say to use `proxy.ts` on 16, with `clerkMiddleware()`
 * itself unchanged. A proxy file may NOT export a `runtime` segment config;
 * Next throws at build if it does, because proxy always runs on Node.
 *
 * **It deliberately does not decide who may see what.** Clerk deprecated
 * `createRouteMatcher` in this version, with the reason spelled out in its own
 * warning: path matching here "can diverge from how Next.js routes requests and
 * leave protected resources reachable". So authorisation lives in the page that
 * owns the data — `app/(site)/portal/page.tsx` — which checks the session
 * itself and redirects. This file only makes `auth()` and `currentUser()`
 * available on the routes below.
 *
 * That means the matcher failing open is survivable: an unauthenticated request
 * reaching `/portal` still gets redirected by the page. The old arrangement,
 * where the matcher WAS the gate, is exactly what Clerk is warning against.
 */

// Built lazily so merely importing this module never triggers Clerk's key
// validation — which is what lets the site run with no keys at all.
// Typed as NextMiddleware rather than ReturnType<typeof clerkMiddleware>:
// clerkMiddleware is an overloaded interface, and ReturnType resolves to its
// LAST overload (a response), not the handler the first three return.
let handler: NextMiddleware | null = null;
const clerk = () => (handler ??= clerkMiddleware());

export default function proxy(req: NextRequest, event: NextFetchEvent) {
  // No keys means the portal and the auth routes do not exist — rather than
  // existing and being unprotected. Fail closed.
  if (!isAuthConfigured()) return new NextResponse(null, { status: 404 });
  return clerk()(req, event);
}

/**
 * A narrow allow-list, not Clerk's documented broad negative-lookahead matcher.
 *
 * This structurally guarantees `POST /api/apply` stays unauthenticated: that
 * route is not listed, so nothing here can ever break public job applications.
 * Marketing pages are never entered at all — no proxy invocation, no header
 * rewriting, nothing to slow down or accidentally gate.
 *
 * The contract, so the next person knows: **anything calling `auth()` or
 * `currentUser()` from the server must have its route listed here**, or Clerk
 * throws "can't detect clerkMiddleware". That is a loud failure, not a silent
 * one. Nothing on the marketing routes calls it — `<SignedIn>`/`<SignedOut>`/
 * `<UserButton>` are client-side and reach Clerk's Frontend API directly.
 */
export const config = {
  matcher: ["/portal/:path*", "/sign-in/:path*", "/sign-up/:path*"],
};
