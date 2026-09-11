// Header, mega-menu, locale picker and footer data for Vamscore.
//
// Anything in [square brackets] is a placeholder Vamscore still needs to supply.
// Links point at on-page anchors until the inner pages exist.

export type NavLink = { label: string; href: string; external?: boolean };
export type NavGroup = { heading: string; links: NavLink[] };
export type NavItem = { label: string; href: string; groups?: NavGroup[] };

export const COMPANY = "Vamscore";

export const NAV_ITEMS: NavItem[] = [
  {
    label: "What we do",
    // Unused: an item with `groups` renders as a menu button, not a link, in
    // both the bar and the drawer. Points at the page it heads regardless.
    href: "/services",
    groups: [
      {
        // These pointed at the contact form for a while, after the "What we
        // deliver" band that described the four lines was removed. That asked
        // the reader to get in touch about something the site never explained.
        // They now land on the paragraph about the line they clicked; the
        // contact form is the step after, from a link on that page.
        //
        // The fragments are `Service.id` in `content/services.ts` — keep them
        // in step.
        heading: "Services",
        links: [
          { label: "Business process outsourcing", href: "/services#bpo" },
          { label: "Robotics and automation", href: "/services#robotics" },
          {
            label: "Education and government projects",
            href: "/services#education",
          },
          { label: "Tata channel partnership", href: "/services#channel" },
        ],
      },
      {
        // Was "Sectors": Media / Telecom / Education / Government, all four
        // pointing at `/#customer-stories` — four labels for one anchor, and
        // "Government" promised a sector the track record has no story for.
        //
        // Each entry now opens the story page that evidences it. Those pages
        // already existed and nothing in either menu linked to them.
        //
        // Not "Sectors" any more, because channel partnership is a business
        // model rather than a sector and the heading would be lying about one
        // of its own three entries.
        heading: "Where we've worked",
        links: [
          // Topper is the education story as well as the media one — a
          // curriculum channel and a digital classroom. A separate "Education"
          // entry would be a second label for this same page; the sector is
          // still named under Services.
          { label: "Media and edtech", href: "/stories/topper-greycells18" },
          { label: "Telecom", href: "/stories/jio-territory-partner" },
          {
            label: "Channel partnership",
            href: "/stories/tata-docomo-channel-partner",
          },
        ],
      },
      {
        heading: "How we work",
        // "Delivery across India" was here and is gone: no page and no section
        // describes it, so it was the sixth link landing on the track record.
        links: [{ label: "Our approach", href: "/#who-we-are" }],
      },
    ],
  },
  {
    label: "Who we are",
    href: "/#who-we-are",
    groups: [
      {
        heading: "Our company",
        links: [
          { label: "About Vamscore", href: "/about" },
          { label: "Vision and mission", href: "/about#vision" },
          { label: "Our values", href: "/about#values" },
          { label: "Partners", href: "/#partners" },
          { label: "Contact us", href: "/contact" },
        ],
      },
      {
        heading: "Our work",
        links: [
          { label: "Client work", href: "/#customer-stories" },
        ],
      },
    ],
  },
  { label: "Careers", href: "/careers" },
  { label: "Contact", href: "/contact" },
];

// The header's Gmail button, addressed to Vamscore. Built in content/contact.ts
// from the email address, so the address lives in exactly one place;
// re-exported here because the header reads all of its links from this file.
export { GMAIL_COMPOSE_URL } from "@/content/contact";

// Vamscore operates pan India, so the locale picker is a single entry rather than
// Kyndryl's 40-country list. Add more if Vamscore opens other markets.
export const LOCALES = ["India - English"] as const;

export const ACTIVE_LOCALE = "India - English";
export const LOCALE_SHORT = "IN - EN";

export const FOOTER_COLUMNS: NavGroup[] = [
  {
    heading: "Services",
    links: [
      { label: "Business process outsourcing", href: "/services#bpo" },
      { label: "Robotics and automation", href: "/services#robotics" },
      {
        label: "Education and government projects",
        href: "/services#education",
      },
      { label: "Tata channel partnership", href: "/services#channel" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About Vamscore", href: "/about" },
      { label: "Our work", href: "/#customer-stories" },
      { label: "Partners", href: "/#partners" },
      { label: "Careers", href: "/careers" },
      { label: "Contact us", href: "/contact" },
    ],
  },
];


/**
 * The "Follow us" row.
 *
 * `platform` picks the mark; the icons are drawn inline in `Footer.tsx` rather
 * than loaded as files, so they inherit `currentColor` and need no asset.
 *
 * **`href` must be Vamscore's real profile URL.** The footer switches on it:
 * an `https://` value renders an anchor, anything else renders the same mark as
 * a plain span, so a missing URL shows the row without claiming to lead
 * anywhere. All four were supplied by Vamscore on 2026-09-09 and are live.
 *
 * Do not guess a handle to fill a future gap: `instagram.com/uv` is a
 * stranger's account, and sending Vamscore's visitors there is hard to walk
 * back. An earlier LinkedIn entry was removed for pointing at "#", which looked
 * like a social presence and delivered nothing — this one points at a real
 * profile.
 */
export type SocialLink = {
  label: string;
  href: string;
  platform: Platform;
};

/** Exported so `SocialIcon` can be keyed exhaustively: adding a platform here
 *  without drawing its mark is then a compile error rather than a silent
 *  fallback to whichever icon happened to be last in the chain. */
export type Platform = "instagram" | "x" | "facebook" | "linkedin";

export const FOOTER_SOCIAL: SocialLink[] = [
  { label: "Instagram", href: "https://www.instagram.com/vamscore/", platform: "instagram" },
  { label: "X (formerly Twitter)", href: "https://x.com/Vamscore", platform: "x" },
  {
    label: "Facebook",
    // Numeric profile URL rather than a vanity one. It resolves, but a named
    // URL would be tidier if Vamscore ever claims one in Facebook's settings.
    href: "https://www.facebook.com/profile.php?id=61594112137099",
    platform: "facebook",
  },
  {
    label: "LinkedIn",
    // An `/in/` URL — a personal profile, not a `/company/` page.
    href: "https://www.linkedin.com/in/vamscore-ai-0a06a1435/",
    platform: "linkedin",
  },
];

/**
 * The site's one-sentence description of itself.
 *
 * Used twice: as the document `description` meta tag in `app/layout.tsx` and as
 * the footer's brand blurb. It lives here so those two cannot drift — the
 * footer previously had no blurb and the sentence existed only inside the
 * metadata object, where nothing else could reach it.
 */
export const SITE_DESCRIPTION =
  "Vamscore runs business process operations, builds robotics and automation, and delivers education and channel-partner projects across India.";

export const COPYRIGHT = `Copyright © ${new Date().getFullYear()} ${COMPANY}. All rights reserved`;
