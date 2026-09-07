import type { Metadata } from "next";
import { SignUp } from "@clerk/nextjs";
import { notFound } from "next/navigation";
import { isAuthConfigured } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Accept your invitation — UV",
  robots: { index: false, follow: false },
};

/**
 * This route exists **because the setup is invite-only**, which sounds
 * backwards until you see how Clerk delivers invitations: the email links to
 * `/sign-up?__clerk_ticket=…`. Without this page those links 404 and nobody can
 * accept an invitation.
 *
 * It is deliberately public (the proxy does not protect it) — an invitee has no
 * session yet. With sign-ups set to restricted in the Clerk dashboard,
 * `<SignUp />` renders the ticket flow for a valid invitation and an
 * "invitation required" state for anyone who wanders in without one. That
 * restriction lives in the dashboard, not here; do not add a second copy of it
 * in code, or the two will drift.
 */
export default async function SignUpPage() {
  if (!isAuthConfigured()) notFound();

  return (
    <div className="grid min-h-[70vh] place-items-center bg-carbon px-5 py-20">
      <SignUp />
    </div>
  );
}
