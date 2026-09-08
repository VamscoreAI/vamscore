import type { Metadata } from "next";
import { SignIn } from "@clerk/nextjs";
import { notFound } from "next/navigation";
import { isAuthConfigured } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Employee sign in — Vamscore",
  // A staff door has no business in search results.
  robots: { index: false, follow: false },
};

/**
 * The optional catch-all segment `[[...sign-in]]` is required, not stylistic:
 * Clerk's path-based flow routes SSO callbacks, second factors and email
 * verification to sub-paths of this same segment. A plain `page.tsx` would 404
 * partway through signing in.
 *
 * Appearance is inherited from `<ClerkProvider>` — don't set it again here.
 */
export default async function SignInPage() {
  if (!isAuthConfigured()) notFound();

  return (
    <div className="grid min-h-[70vh] place-items-center bg-carbon px-5 py-20">
      <SignIn />
    </div>
  );
}
