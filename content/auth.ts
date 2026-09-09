// Copy for the two Clerk-backed routes: the staff sign-in and the invitation
// acceptance page.
//
// Deliberately says nothing about what is behind the door. `/portal` is still a
// placeholder, so a list of "what's inside" would be invented — and this is the
// one page where overclaiming reads as a phishing signal rather than as
// marketing. It describes how access works, which is a fact: sign-ups are
// restricted in the Clerk dashboard, so accounts exist only by invitation.
//
// None of these headings repeat what Clerk prints on its own card ("Sign in to
// Vamscore" / "Accept your invitation"). The panel explains *why* you are here;
// the card names the action. Saying both, 40px apart, looked like a bug.

export const SIGN_IN = {
  eyebrow: "EMPLOYEE ACCESS",
  title: "Internal tools, for the Vamscore team",
  body: "Accounts here are created by invitation, so there is nothing to register for. If you need access, ask your manager to send you an invite.",
  /** Shown under the panel. Anyone who landed here by accident needs a way out. */
  escape: { label: "Back to the main site", href: "/" },
};

export const SIGN_UP = {
  eyebrow: "EMPLOYEE ACCESS",
  title: "Finish setting up your account",
  body: "Open the link from your invitation email to complete this step. Landing on this page without that link will not create an account.",
  escape: { label: "Back to the main site", href: "/" },
};

/**
 * Overrides Clerk's own card headings.
 *
 * Clerk builds its default title from the **application name set in the Clerk
 * dashboard**, not from anything in this repo — which is why the card read
 * "Sign in to UV" for a while after the company was renamed. Renaming it in the
 * dashboard is still worth doing, because it also appears in invitation emails
 * and on the OAuth consent screen, neither of which this file can reach. But
 * pinning the strings here means the card cannot silently drift from the site
 * again, and it fixes the visible one without waiting on a dashboard change.
 */
export const CLERK_LOCALIZATION = {
  signIn: {
    start: {
      title: "Sign in to Vamscore",
      subtitle: "Use the account your invitation created",
    },
  },
  signUp: {
    start: {
      title: "Accept your invitation",
      subtitle: "Set a password to finish",
    },
  },
};
