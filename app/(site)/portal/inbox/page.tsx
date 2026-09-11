import type { Metadata } from "next";
import { currentUser } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import Inbox from "@/components/portal/inbox/Inbox";
import { Eyebrow } from "@/components/ui";
import { isAuthConfigured } from "@/lib/auth";
import { isBotConfigured } from "@/lib/bot/run";
import { isWhatsAppConfigured } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "WhatsApp inbox — Vamscore",
  robots: { index: false, follow: false },
};

/**
 * The staff view of every WhatsApp conversation, bot-handled or not.
 *
 * **This page does its own authorisation**, as `app/(site)/portal/page.tsx`
 * requires of every page under `/portal`: the proxy only establishes Clerk's
 * context; the session check that decides access is here. The data itself is
 * fetched by the client from `/api/whatsapp/*`, and every one of those routes
 * checks the session again — this page being reachable grants nothing.
 */
export default async function InboxPage() {
  if (!isAuthConfigured()) notFound();
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  const connected = isWhatsAppConfigured();
  const botOn = isBotConfigured();

  return (
    <section className="bg-carbon text-white">
      <div className="shell py-10 lg:py-14">
        <Eyebrow variant="eyelid" className="text-white">
          EMPLOYEE PORTAL
        </Eyebrow>
        <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
          <h1 className="type-section text-white">WhatsApp inbox</h1>
          {connected && (
            <p className="text-[14px] text-white/60">
              Assistant: {botOn ? "on" : "off — every chat goes to staff"}
            </p>
          )}
        </div>

        {connected ? (
          <div className="mt-8">
            <Inbox />
          </div>
        ) : (
          <div className="mt-8 max-w-[62ch] rounded-lg border border-white/15 p-6">
            <p className="type-body text-white/85">
              WhatsApp is not connected yet. Once the WhatsApp account and the
              database are set up, conversations will appear here.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
