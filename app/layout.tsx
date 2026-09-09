import type { Metadata } from "next";
import { Be_Vietnam_Pro, Roboto } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { authUiEnabled } from "@/lib/auth";
import { clerkAppearance } from "@/lib/clerk-appearance";
import { CLERK_LOCALIZATION } from "@/content/auth";
import { SITE_DESCRIPTION } from "@/content/nav";
import "./globals.css";

// Body copy on the original is Roboto 400 — an exact match.
const roboto = Roboto({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-roboto",
  display: "swap",
});

// Headings on the original are TWK Everett, a licensed Weltkern face that
// cannot be redistributed here. Be Vietnam Pro is the closest free stand-in by
// measurement — at 100px Everett sets "Handgloves" at 571 to its 566, with the
// same 53px x-height (Schibsted Grotesk, used previously, was 478 and 45).
const display = Be_Vietnam_Pro({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700"],
  variable: "--font-display-face",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Vamscore",
  description: SITE_DESCRIPTION,
};

/**
 * Wraps the tree in Clerk only when a publishable key exists, so the marketing
 * site still builds and runs before Clerk is configured. Written as a component
 * rather than two branches of the whole document so the <html>/<body> tree is
 * never duplicated.
 *
 * No `dynamic` prop: with it, <ClerkProvider> calls auth() and every marketing
 * route would turn dynamic. Without it the provider is static and the header's
 * auth slot resolves client-side once clerk-js loads.
 */
function AuthProvider({ children }: { children: React.ReactNode }) {
  if (!authUiEnabled) return <>{children}</>;
  return (
    <ClerkProvider
      appearance={clerkAppearance}
      localization={CLERK_LOCALIZATION}
      afterSignOutUrl="/"
    >
      {children}
    </ClerkProvider>
  );
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-IN" className={`${roboto.variable} ${display.variable}`}>
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
