import type { Metadata } from "next";
import { currentUser } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import { Eyebrow } from "@/components/ui";
import { isAuthConfigured } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Employee portal — UV",
  robots: { index: false, follow: false },
};

/**
 * The employee portal — a placeholder today, and the place UV's internal tools
 * will go.
 *
 * **This page is the authorisation check — not `proxy.ts`.** Clerk deprecated
 * `createRouteMatcher` in this version because middleware path matching "can
 * diverge from how Next.js routes requests and leave protected resources
 * reachable". So the proxy only establishes Clerk's request context; the
 * session check that actually decides access lives here, next to the data it
 * protects.
 *
 * **Every page added under `/portal` must do the same.** Inheriting protection
 * from a matcher somewhere else is precisely the pattern Clerk is warning
 * against.
 *
 * With no Clerk keys this route does not exist (`notFound()`) rather than
 * existing and being open. The explanation belongs in the README, not on a
 * friendly page here: a "not configured" screen is a fail-open branch waiting
 * for someone to put real data behind it.
 */
export default async function PortalPage() {
  if (!isAuthConfigured()) notFound();

  const user = await currentUser();
  if (!user) redirect("/sign-in");

  const name =
    user.firstName ??
    user.username ??
    user.primaryEmailAddress?.emailAddress ??
    "there";

  return (
    <section className="bg-carbon py-20 text-white lg:py-28">
      <div className="shell">
        <Eyebrow variant="eyelid" className="text-white">
          EMPLOYEE PORTAL
        </Eyebrow>
        <h1 className="type-hero mt-6 max-w-[18ch] text-white">
          Welcome, {name}.
        </h1>
        <p className="type-lede mt-6 max-w-[52ch] text-white/70">
          You are signed in. Internal tools will appear here — the first one
          planned is a view of the applications submitted through the careers
          page, which are currently written to disk and never read back.
        </p>
      </div>
    </section>
  );
}
