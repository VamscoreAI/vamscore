"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  ACTIVE_LOCALE,
  GMAIL_COMPOSE_URL,
  LOCALES,
  LOCALE_SHORT,
  NAV_ITEMS,
} from "@/content/nav";
import { UserButton, useAuth } from "@clerk/nextjs";
import { Arrow, Button, Wordmark, cx } from "@/components/ui";
import { authUiEnabled } from "@/lib/auth";

type Overlay = { kind: "menu"; index: number } | { kind: "locale" } | null;

export default function Header() {
  const [overlay, setOverlay] = useState<Overlay>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileSection, setMobileSection] = useState<number | null>(null);
  const headerRef = useRef<HTMLElement>(null);

  const close = () => setOverlay(null);

  // Escape closes whatever is open; a click outside the header closes the
  // desktop panels the same way the original does.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        close();
        setMobileOpen(false);
      }
    };
    const onClick = (e: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) close();
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, []);

  // Lock the page behind the mobile drawer and the full-screen overlays.
  useEffect(() => {
    const locked = mobileOpen || overlay?.kind === "locale";
    document.body.style.overflow = locked ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen, overlay]);

  const openMenu = overlay?.kind === "menu" ? overlay.index : null;

  return (
    // White since 2026-09-18 (it was carbon). The 1px rule is a box-shadow, not
    // a border, so the bar stays exactly 60/72px: the overlays and the drawer
    // below are positioned at `top-[60px]` / `top-[72px]` against that.
    //
    // Colours on white: text is carbon/dark-stone, and hover/active is teal
    // (5.7:1) rather than the spring-green used on the dark bar — green on
    // white measures 1.75:1 and would be unreadable as text.
    <header
      ref={headerRef}
      className="sticky top-0 z-50 bg-white text-carbon shadow-[0_1px_0_var(--color-line)]"
    >
      {/* `shell`, not its own padding. The bar used to run px-5/lg:px-8/2xl:px-12
          against content capped at 1440, which put the logo 217px to the left of
          everything under it at 1920. Sharing the utility keeps the header, the
          page and the footer on one left edge at every width. */}
      <div className="shell flex h-[60px] items-center gap-4 lg:h-[72px] xl:gap-6">
        {/* Logo. 28px until xl, not 32px.

            Measured on the live site at a 1009px content width: the logo
            (242px at 32px tall), the nav and the right-hand cluster together
            needed exactly the 945px available, so sub-pixel rounding tipped
            "What we do" and "Who we are" onto two lines. 28px takes the logo
            to 212px and gives the row ~30px of slack.

            Production is the case that matters here: it renders an "Employee
            sign in" link that a local dev server without Clerk keys does not,
            so the row is 71px wider live than it looks locally. */}
        <Link href="/" className="shrink-0" aria-label="Vamscore home">
          <Wordmark ground="light" className="h-7 xl:h-8" />
        </Link>

        {/* Primary nav (desktop).

            `px-2.5` until xl, not a flat `px-4`. The desktop row first appears
            at lg (1024) and that is where it is tightest. Measured in the
            browser at a 1009px content width, as the free space between the
            nav and the right-hand cluster (the flex `gap-6` is 24px, so 24
            means none):

              14px type + px-4  →  24   (what shipped before 2026-09-17)
              15px type + px-4  →  24
              15px type + px-3  →  25
              15px type + px-2.5 → 41

            So the header has been running with no slack at 1024 all along,
            and raising the nav to 15px did not cause that. px-2.5 is what
            actually buys headroom, and it only applies in the 1024-1279 band
            — from xl the original padding returns. */}
        <nav className="hidden lg:block" aria-label="Main">
          <ul className="flex items-center">
            {NAV_ITEMS.map((item, i) => (
              <li key={item.label}>
                {item.groups ? (
                  <button
                    type="button"
                    aria-expanded={openMenu === i}
                    onClick={() =>
                      setOverlay(openMenu === i ? null : { kind: "menu", index: i })
                    }
                    className={cx(
                      "flex items-center gap-1.5 px-2.5 py-2 text-[15px] leading-5 transition-colors hover:text-teal xl:px-4",
                      openMenu === i && "text-teal"
                    )}
                  >
                    {item.label}
                    <Chevron
                      className={cx(
                        "transition-transform duration-200",
                        openMenu === i && "rotate-180"
                      )}
                    />
                  </button>
                ) : (
                  <Link
                    href={item.href}
                    className="block px-2.5 py-2 text-[15px] leading-5 transition-colors hover:text-teal xl:px-4"
                  >
                    {item.label}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </nav>

        {/* Right cluster */}
        <div className="ml-auto flex items-center gap-3 lg:gap-4">
          <button
            type="button"
            onClick={() =>
              setOverlay(overlay?.kind === "locale" ? null : { kind: "locale" })
            }
            aria-expanded={overlay?.kind === "locale"}
            // `xl:flex`, not `lg:flex`. Measured live at a 1009px content
            // width the row wanted 1019px and had 945, so everything in it
            // wrapped. This button is the cheapest 81px to give back: LOCALES
            // holds exactly one entry, so the overlay it opens offers only
            // the locale already active. The footer still shows "IN - EN" at
            // every width, and the mobile drawer carries this button.
            //
            // Put it back at lg the day there is a second locale — and find
            // the width somewhere else if so.
            className="hidden items-center gap-1.5 text-[14px] text-dark-stone transition-colors hover:text-carbon xl:flex"
          >
            <GlobeIcon />
            {LOCALE_SHORT}
          </button>

          {authUiEnabled && <AuthSlot />}

          {/* Gated `lg:` to match the two things it sits between: the locale
              button and "Employee sign in" are both `hidden … lg:flex`, so below
              lg there is no sign-in link for this to be beside. The drawer
              carries it instead.

              Borderless: the circled recipe belongs to the grid and search
              buttons at the far right, and a circle here would break the
              cluster's text → pill → circles grouping. `size-9` still gives a
              36px target around a 16px icon, over WCAG 2.2's 24×24 floor.

              Not inside AuthSlot, and not behind `authUiEnabled`: that gate
              exists because AuthSlot calls `useAuth()`, which throws with no
              Clerk keys. This is a plain link and needs neither. */}
          <Link
            href={GMAIL_COMPOSE_URL}
            target="_blank"
            rel="noopener noreferrer"
            // The icon is decorative, so the name has to come from here or the
            // link announces as just "link".
            aria-label="Email Vamscore in Gmail"
            className="hidden size-9 place-items-center text-dark-stone transition-colors hover:text-carbon lg:grid"
          >
            <MailIcon />
          </Link>

          <span className="hidden sm:block">
            {/* The primary Button hovers to white, which on this bar would make it
                disappear under the cursor. Deep forest keeps it a solid pill. */}
            <Button
              href="/contact"
              className="!px-4 !py-2.5 !text-[15px] hover:!bg-deep-forest hover:!text-white xl:!px-5"
            >
              Talk to us
              <Arrow />
            </Button>
          </span>

          <button
            type="button"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((v) => !v)}
            className="grid size-9 place-items-center lg:hidden"
          >
            {mobileOpen ? <CloseIcon /> : <BurgerIcon />}
          </button>
        </div>
      </div>

      {/* ---------------- Desktop mega-menu ----------------
          Carbon under the white bar, by Vamscore's choice (2026-09-18) — the
          phone menu and the locale overlay are white, this panel is not. So
          it keeps the dark-bar colours: spring-green headings and hover,
          white/85 links. The bottom hairline is what ends the panel over the
          dark heroes: without it the last link ran straight into the hero's
          heading below. */}
      {openMenu !== null && NAV_ITEMS[openMenu].groups && (
        <div className="absolute inset-x-0 top-full hidden border-b border-white/15 bg-carbon lg:block">
          {/* Same reason: the panel's columns line up with the nav item that
              opened them, and with the page behind it. */}
          <div className="shell grid grid-cols-2 gap-x-10 gap-y-10 py-12 xl:grid-cols-4">
            {NAV_ITEMS[openMenu].groups.map((group) => (
              <div key={group.heading}>
                <h2 className="eyebrow mb-5 text-spring-green">{group.heading}</h2>
                <ul className="space-y-3">
                  {group.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        onClick={close}
                        className="inline-flex items-center gap-1.5 text-[16px] text-white/85 transition-colors hover:text-spring-green"
                      >
                        {link.label}
                        {link.external && <ExternalIcon />}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ---------------- Search overlay ---------------- */}

      {/* ---------------- Locale overlay ---------------- */}
      {overlay?.kind === "locale" && (
        <div className="fixed inset-x-0 top-[60px] bottom-0 z-40 overflow-y-auto bg-white lg:top-[72px]">
          <div className="shell py-16">
            <h2 className="type-card-lg text-carbon">Select a country or region</h2>
            <ul className="mt-10 grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {LOCALES.map((locale) => (
                <li key={locale}>
                  {/* Not a link. `LOCALES` carries no URLs, and the one entry is
                      already `ACTIVE_LOCALE`, so this was an `href="#"` that
                      "navigated" to the locale you were already on. When real
                      locales exist they will bring hrefs with them and this
                      becomes a <Link> again. */}
                  <span
                    aria-current={locale === ACTIVE_LOCALE ? "true" : undefined}
                    className={cx(
                      "block rounded px-4 py-2.5 text-[16px]",
                      locale === ACTIVE_LOCALE
                        ? "bg-teal text-white"
                        : "text-dark-stone"
                    )}
                  >
                    {locale}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* ---------------- Mobile drawer ---------------- */}
      {mobileOpen && (
        <div className="fixed inset-x-0 top-[60px] bottom-0 z-40 overflow-y-auto bg-white lg:hidden">
          <nav className="px-5 py-6" aria-label="Mobile">
            <ul className="divide-y divide-line">
              {NAV_ITEMS.map((item, i) => (
                <li key={item.label}>
                  {item.groups ? (
                    <>
                      <button
                        type="button"
                        aria-expanded={mobileSection === i}
                        onClick={() => setMobileSection(mobileSection === i ? null : i)}
                        className="flex w-full items-center justify-between py-4 text-left text-lg"
                      >
                        {item.label}
                        <Chevron
                          className={cx(
                            "transition-transform duration-200",
                            mobileSection === i && "rotate-180"
                          )}
                        />
                      </button>
                      {mobileSection === i && (
                        <div className="space-y-6 pb-6">
                          {item.groups.map((group) => (
                            <div key={group.heading}>
                              <h3 className="eyebrow mb-3 text-stone">
                                {group.heading}
                              </h3>
                              <ul className="space-y-2.5">
                                {group.links.map((link) => (
                                  <li key={link.label}>
                                    <Link
                                      href={link.href}
                                      onClick={() => setMobileOpen(false)}
                                      className="text-[16px] text-dark-stone"
                                    >
                                      {link.label}
                                    </Link>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <Link
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className="block py-4 text-lg"
                    >
                      {item.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>

            <div className="mt-8 space-y-4 border-t border-line pt-8">
              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false);
                  setOverlay({ kind: "locale" });
                }}
                className="flex items-center gap-1.5 text-[16px] text-dark-stone"
              >
                <GlobeIcon />
                {LOCALE_SHORT}
              </button>
              {authUiEnabled && (
                <DrawerAuthLink onNavigate={() => setMobileOpen(false)} />
              )}

              {/* The bar's copy of this is `lg:` only, so without this entry the
                  button would not exist on mobile at all. Closes the drawer on
                  activation like every other entry here — otherwise it stays
                  mounted over the page with the scroll lock still engaged. */}
              <Link
                href={GMAIL_COMPOSE_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-1.5 text-[16px] text-dark-stone"
              >
                <MailIcon />
                Email us in Gmail
              </Link>

              <Button
                href="/contact"
                className="w-full hover:!bg-deep-forest hover:!text-white"
              >
                Talk to us
                <Arrow />
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

/* ------------------------------- icons ----------------------------------- */

/* -------------------------------------------------------------------------- */
/* Employee auth                                                              */
/*                                                                            */
/* Clerk Core 3 (@clerk/nextjs v7) removed <SignedIn>/<SignedOut>; the         */
/* replacement <Show> is a SERVER component, so it cannot be used in this      */
/* client header. The hook is the client-side equivalent.                     */
/*                                                                            */
/* These live in their own components, rendered only when `authUiEnabled`, so  */
/* `useAuth()` is never called outside a <ClerkProvider> — which is exactly    */
/* what happens with no keys, since the provider is not mounted then.          */
/* -------------------------------------------------------------------------- */

function AuthSlot() {
  const { isLoaded, isSignedIn } = useAuth();

  return (
    // min-h-9 reserves the row height so the bar does not jump when clerk-js
    // resolves and the slot fills in.
    <div className="flex min-h-9 items-center">
      {!isLoaded ? (
        <span aria-hidden className="size-9" />
      ) : isSignedIn ? (
        // Deliberately outside any responsive gate: a signed-in employee must
        // be able to sign out at every width.
        <UserButton />
      ) : (
        // Same weight and `lg:` gate as the locale picker beside it — below
        // that the drawer carries it. Quiet on purpose: "Talk to us" targets
        // customers and stays the one prominent action.
        <Link
          href="/sign-in"
          className="hidden items-center text-[14px] text-dark-stone transition-colors hover:text-carbon lg:flex"
        >
          Employee sign in
        </Link>
      )}
    </div>
  );
}

function DrawerAuthLink({ onNavigate }: { onNavigate: () => void }) {
  const { isLoaded, isSignedIn } = useAuth();
  if (!isLoaded) return null;

  // Closes the drawer like every other entry — otherwise it stays mounted over
  // the destination and the body scroll lock stays engaged. No <UserButton>
  // here: its popover inside a `fixed overflow-y-auto` panel is a clipping
  // trap, and the one in the bar stays reachable above the drawer anyway.
  return (
    <Link
      href={isSignedIn ? "/portal" : "/sign-in"}
      onClick={onNavigate}
      className="flex items-center gap-1.5 text-[16px] text-dark-stone"
    >
      {isSignedIn ? "Employee portal" : "Employee sign in"}
    </Link>
  );
}


function Chevron({ className }: { className?: string }) {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden className={className}>
      <path d="m2.5 4.5 3.5 3.5 3.5-3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ExternalIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden>
      <path d="M4.5 1.5H10.5V7.5M10.5 1.5 5 7M9 7.5v3H1.5V3h3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function GlobeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <circle cx="8" cy="8" r="6.3" stroke="currentColor" strokeWidth="1.2" />
      <path d="M1.7 8h12.6M8 1.7c1.7 1.7 2.5 3.9 2.5 6.3S9.7 12.6 8 14.3C6.3 12.6 5.5 10.4 5.5 8S6.3 3.4 8 1.7Z" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

/* Gmail's envelope-and-M silhouette, in currentColor. Not the full-colour
   Google mark: every icon in this bar is monochrome, so a coloured logo would
   be the only one and would fight the hover state. 16px at 1.2 matches
   GlobeIcon, its nearest neighbour in the cluster. */
function MailIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <rect
        x="1"
        y="3.1"
        width="14"
        height="9.8"
        rx="1.6"
        stroke="currentColor"
        strokeWidth="1.2"
      />
      <path
        d="M1.4 4 8 8.9 14.6 4"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}



function BurgerIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden>
      <path d="M3 6h16M3 11h16M3 16h16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden>
      <path d="M5 5l12 12M17 5 5 17" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
