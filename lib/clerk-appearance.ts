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
    // NOT carbon. The page behind the card is already carbon, so a carbon card
    // computed to rgb(22,22,22) against a section of rgb(22,22,22) — the same
    // colour, measured — and the card simply had no surface. It read as one
    // flat black area rather than as a panel. #1e1e1e is the smallest lift that
    // separates the two without introducing a second grey to the palette.
    colorBackground: "#1e1e1e",
    colorForeground: "#ffffff",
    colorMutedForeground: "rgba(255, 255, 255, 0.7)",
    // Lifted again, off the card rather than off the page, so the field still
    // reads as inset now that the card itself moved.
    colorInput: "#262626",
    colorInputForeground: "#ffffff",
    // 0.34 is the point at which a hairline on the #1e1e1e card reaches the
    // 3:1 WCAG 1.4.11 asks for on a control boundary; 0.15 measured 1.6:1. The
    // fill cannot carry it at these values, so the border does.
    colorBorder: "rgba(255, 255, 255, 0.34)",
    colorDanger: "#fb512f", // flame-2
    colorSuccess: "#4cdd84",
    // 4px matches the `outline` button variant in components/ui/index.tsx
    borderRadius: "4px",
    fontFamily: "var(--font-roboto)",
  },
  elements: {
    // No `bg-*` here, so `colorBackground` above is the single source of truth
    // for the card surface. (This used to carry `bg-carbon`, which agreed with
    // the old `colorBackground` value, so which of the two actually won was
    // never determined — and for social buttons a Tailwind class demonstrably
    // did NOT win. Keeping one of them removes the question.)
    card: "border border-white/10 shadow-none",
    headerTitle: "font-display font-light",
    formButtonPrimary:
      "rounded-pill bg-spring-green text-deep-forest hover:bg-white normal-case font-medium text-[15px]",
    footerActionLink: "text-spring-green hover:text-white",
    // Social buttons are styled in app/globals.css, not here. Tailwind classes
    // passed through `elements` lose the cascade to Clerk's runtime-injected
    // `.cl-internal-*` rules, and the slash-opacity ones were never generated
    // at all. The comment there records the measurements.
    // Sizes the avatar to the header's 36px icon idiom — the same footprint as
    // the Gmail button beside it (`size-9` in Header.tsx). Clerk's default is
    // 28px and sits visibly small against it. The search and apps-grid buttons
    // this used to be measured against were removed from the header.
    userButtonAvatarBox: "size-9",
    userButtonTrigger:
      "rounded-full border border-white/25 transition-colors hover:border-white focus:shadow-none",
    // Deliberately carbon, not the card's #1e1e1e: this popover hangs over the
    // carbon header rather than sitting on a page, so it is a different surface
    // doing a different job.
    userButtonPopoverCard: "bg-carbon border border-white/10",
  },
};
