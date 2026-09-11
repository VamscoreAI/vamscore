import type { Metadata } from "next";
import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import { Arrow, Eyebrow } from "@/components/ui";
import { isAuthConfigured } from "@/lib/auth";
import { isWhatsAppConfigured } from "@/lib/whatsapp";
import { totalUnread } from "@/lib/whatsapp/store";

export const metadata: Metadata = {
  title: "Employee portal — Vamscore",
  robots: { index: false, follow: false },
};

/**
 * The employee portal — the place Vamscore's internal tools live.
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

  // The badge is a nicety: if the database is unreachable the portal still
  // renders, just without a count.
  let unread: number | null = null;
  if (isWhatsAppConfigured()) {
    try {
      unread = await totalUnread();
    } catch (error) {
      console.error("Could not read WhatsApp unread count", error);
    }
  }

  return (
    <section className="bg-carbon py-20 text-white lg:py-28">
      <div className="shell">
        <Eyebrow variant="eyelid" className="text-white">
          EMPLOYEE PORTAL
        </Eyebrow>
        <h1 className="type-hero mt-6 max-w-[18ch] text-white">
          Welcome, {name}.
        </h1>

        <ul className="mt-12 grid max-w-3xl gap-4 sm:grid-cols-2">
          <li>
            <Link
              href="/portal/inbox"
              className="group block h-full rounded-lg border border-white/15 p-6 transition-colors hover:border-white/40"
            >
              <div className="flex items-center justify-between gap-3">
                <h2 className="type-card text-white">WhatsApp inbox</h2>
                {unread !== null && unread > 0 && (
                  <span className="grid min-w-6 place-items-center rounded-full bg-spring-green px-2 text-[13px] font-medium text-deep-forest">
                    {unread}
                  </span>
                )}
              </div>
              <p className="type-body mt-3 text-white/70">
                Customer chats, the assistant&apos;s replies, and the leads and
                call-backs it has taken.
              </p>
              <span className="mt-4 inline-flex items-center gap-2 text-[15px] text-spring-green group-hover:text-white">
                Open <Arrow />
              </span>
            </Link>
          </li>
        </ul>

        <p className="type-body mt-10 max-w-[52ch] text-white/60">
          Next planned: a view of the applications submitted through the careers
          page, which are currently written to disk and never read back.
        </p>
      </div>
    </section>
  );
}
