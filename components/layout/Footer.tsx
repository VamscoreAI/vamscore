import Link from "next/link";
import { Wordmark } from "@/components/ui";
import type { Platform } from "@/content/nav";
import {
  COPYRIGHT,
  FOOTER_COLUMNS,
  FOOTER_SOCIAL,
  LOCALE_SHORT,
} from "@/content/nav";

export default function Footer() {
  return (
    <footer className="bg-carbon text-white">
      <div className="shell py-16 lg:py-20">
        <Link href="/" aria-label="Vamscore home" className="inline-block">
          <Wordmark className="h-7 lg:h-8" />
        </Link>

        {/* A landmark: this is the site's secondary navigation and had none. */}
        <nav
          aria-label="Footer"
          className="mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-4"
        >
          {FOOTER_COLUMNS.map((column) => (
            <div key={column.heading}>
              <h2 className="mb-5 text-[clamp(1.5rem,1.3rem+0.55vw,1.75rem)] leading-[1.214] font-normal text-white">
                {column.heading}
              </h2>
              <ul className="space-y-1">
                {column.links.map((link) => (
                  <li key={link.label}>
                    {/* `block py-1.5` lifts each row from 19px to ~31px. Inline
                        text links are exempt from the target-size rule, but a
                        stacked column of 19px taps is genuinely fiddly. */}
                    <Link
                      href={link.href}
                      className="block py-1.5 text-base leading-6 text-white/85 transition-colors hover:text-spring-green"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="lg:col-span-2">
            <h2 className="mb-5 text-[clamp(1.5rem,1.3rem+0.55vw,1.75rem)] leading-[1.214] font-normal text-white">
              Follow us
            </h2>
            {/* Each mark is a link once its real profile URL is in place, and a
                plain span until then — visible, but not pretending to go
                anywhere. An icon that looks clickable and either does nothing
                or lands on a guessed handle is worse than one that is simply
                not wired yet.

                The span is `aria-hidden` on purpose: a screen reader announcing
                "Instagram" with nothing to activate is a dead end. Sighted
                readers still see the row.

                Styling is identical in both states, so supplying the URLs
                changes nothing but the markup underneath. */}
            <ul className="flex gap-4">
              {FOOTER_SOCIAL.map((social) => {
                const live = social.href.startsWith("https://");
                return (
                  <li key={social.label}>
                    {live ? (
                      <Link
                        href={social.href}
                        // These leave the site, so they open in a new tab.
                        // `noopener` is what stops the opened page reaching
                        // back through `window.opener`.
                        target="_blank"
                        rel="noopener noreferrer"
                        // The icon is decorative, so the accessible name has to
                        // come from here or the link announces as just "link".
                        aria-label={`Vamscore on ${social.label}`}
                        className={`${SOCIAL_RING} transition-colors hover:border-spring-green hover:text-spring-green`}
                      >
                        <SocialIcon platform={social.platform} />
                      </Link>
                    ) : (
                      <span aria-hidden className={SOCIAL_RING}>
                        <SocialIcon platform={social.platform} />
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </nav>
      </div>

      {/* Privacy / Terms / Accessibility used to sit here, all three pointing at
          `#`. Those pages do not exist, so the links are gone rather than
          leading nowhere — an "Accessibility" link that goes nowhere being the
          worst of the three. Put them back when the pages do. */}
      <div className="border-t border-white/15">
        {/* Three columns, not `justify-center`. With the locale still sitting on
            the right, centring a two-item flex row would push the copyright off
            the container's centre by half the locale's width — close enough to
            look like a mistake rather than a choice. The empty first cell
            balances the locale so the middle column is centred for real.

            Below `sm` it collapses to one centred column and the spacer goes. */}
        <div className="shell grid gap-4 py-8 text-center sm:grid-cols-3 sm:items-center">
          <span aria-hidden className="hidden sm:block" />
          <p className="text-[14px] text-white/70">{COPYRIGHT}</p>
          <span className="text-[14px] text-white/70 sm:text-right">
            {LOCALE_SHORT}
          </span>
        </div>
      </div>
    </footer>
  );
}

/* -------------------------------------------------------------------------- */
/* Social marks                                                               */
/*                                                                            */
/* Inline rather than image files: they inherit `currentColor`, so the hover   */
/* state is one class on the link instead of a second asset, and there is no   */
/* logo file to keep in sync. Each is on a 24 viewBox and drawn at 20px.       */
/* -------------------------------------------------------------------------- */

/** Shared by the linked and not-yet-linked states so they are pixel-identical. */
const SOCIAL_RING =
  "grid size-11 place-items-center rounded-full border border-white/25 text-white/85";

/**
 * The marks, keyed by platform rather than resolved through an if-chain.
 *
 * The chain this replaced ended in a bare `return` of the Facebook mark, so any
 * platform without its own branch silently rendered as Facebook. Adding
 * "linkedin" to the union would have done exactly that. A `Record<Platform, …>`
 * makes the same mistake a compile error instead.
 */
function SocialIcon({ platform }: { platform: Platform }) {
  const common = { width: 20, height: 20, viewBox: "0 0 24 24", "aria-hidden": true } as const;

  const marks: Record<Platform, React.ReactElement> = {
    instagram: (
      <svg {...common} fill="none" stroke="currentColor" strokeWidth="1.7">
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none" />
      </svg>
    ),
    x: (
      <svg {...common} fill="currentColor">
        <path d="M17.53 3h2.98l-6.51 7.44L21.66 21h-5.99l-4.7-6.14L5.6 21H2.62l6.96-7.96L2.34 3h6.14l4.25 5.62L17.53 3Zm-1.05 16.2h1.65L7.6 4.71H5.83l10.65 14.49Z" />
      </svg>
    ),
    facebook: (
      <svg {...common} fill="currentColor">
        <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5.02 3.66 9.19 8.44 9.94v-7.03H7.9v-2.91h2.54V9.85c0-2.51 1.49-3.9 3.77-3.9 1.09 0 2.23.2 2.23.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.89h2.78l-.45 2.91h-2.33v7.03c4.78-.75 8.44-4.92 8.44-9.94Z" />
      </svg>
    ),
    linkedin: (
      <svg {...common} fill="currentColor">
        <path d="M6.94 5.5a1.94 1.94 0 1 1-3.88 0 1.94 1.94 0 0 1 3.88 0ZM3.4 8.9h3.2V21H3.4V8.9Zm5.2 0h3.07v1.65h.04a3.37 3.37 0 0 1 3.03-1.66c3.24 0 3.84 2.13 3.84 4.9V21h-3.2v-5.5c0-1.31-.02-3-1.83-3-1.83 0-2.11 1.43-2.11 2.9V21H8.6V8.9Z" />
      </svg>
    ),
  };

  return marks[platform];
}
