import type { ComponentProps } from "react";
import type { ClerkProvider } from "@clerk/nextjs";

/**
 * Clerk does not re-export its `Appearance` type from `@clerk/nextjs`, and
 * `@clerk/react` is only a transitive dependency here — importing from it
 * directly would break the day Clerk restructures. Deriving the type from the
 * provider's own props uses nothing but the public surface.
 */
type Appearance = NonNullable<ComponentProps<typeof ClerkProvider>["appearance"]>;

/**
 * Clerk's components themed to the site's palette, so the sign-in card and the
 * avatar menu don't look bolted on.
 *
 * Set once on `<ClerkProvider>`; `<SignIn>`, `<SignUp>` and `<UserButton>`
 * inherit it. Don't repeat it per component.
 *
 * These are the **v7** variable names, read from Clerk's own type definitions
 * rather than from docs: `colorForeground` / `colorMuted` / `colorInput`, not
 * the older `colorText` / `colorTextSecondary` / `colorInputBackground` that
 * earlier majors used. The `Appearance` type is strict, so `tsc` is the check.
 *
 * Colours are the literal `@theme` values from `app/globals.css` — Clerk can't
 * reliably resolve CSS custom properties here, so they're duplicated. **If you
 * change the palette there, change it here too.**
 */
export const clerkAppearance: Appearance = {
  variables: {
    colorPrimary: "#4cdd84", // spring-green
    colorPrimaryForeground: "#042315", // deep-forest
    colorBackground: "#161616", // carbon
    colorForeground: "#ffffff",
    colorMutedForeground: "rgba(255, 255, 255, 0.7)",
    colorInput: "#1f1f1f",
    colorInputForeground: "#ffffff",
    colorBorder: "rgba(255, 255, 255, 0.15)",
    colorDanger: "#fb512f", // flame-2
    colorSuccess: "#4cdd84",
    // 4px matches the `outline` button variant in components/ui/index.tsx
    borderRadius: "4px",
    fontFamily: "var(--font-roboto)",
  },
  elements: {
    card: "bg-carbon border border-white/10 shadow-none",
    headerTitle: "font-display font-light",
    formButtonPrimary:
      "rounded-pill bg-spring-green text-deep-forest hover:bg-white normal-case font-medium text-[15px]",
    footerActionLink: "text-spring-green hover:text-white",
    // Sizes the avatar to the header's established 36px circular idiom — the
    // same footprint as the search and apps-grid buttons beside it. Clerk's
    // default is 28px and sits visibly small against them.
    userButtonAvatarBox: "size-9",
    userButtonTrigger:
      "rounded-full border border-white/25 transition-colors hover:border-white focus:shadow-none",
    userButtonPopoverCard: "bg-carbon border border-white/10",
  },
};
