// Header, mega-menu, locale picker and footer data for UV.
//
// Anything in [square brackets] is a placeholder UV still needs to supply.
// Links point at on-page anchors until the inner pages exist.

export type NavLink = { label: string; href: string; external?: boolean };
export type NavGroup = { heading: string; links: NavLink[] };
export type NavItem = { label: string; href: string; groups?: NavGroup[] };

export const COMPANY = "UV";

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
          { label: "About UV", href: "/about" },
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

export const SEARCH_SUGGESTIONS = [
  "What processes can UV run for us?",
  "How does UV's robotics and automation work?",
  "How do I become a partner?",
];

// UV operates pan India, so the locale picker is a single entry rather than
// Kyndryl's 40-country list. Add more if UV opens other markets.
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
      { label: "About UV", href: "/about" },
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
 * **`href` must be UV's real profile URL.** Until it is an `https://` link the
 * footer still draws the mark, but as a plain span rather than an anchor — so
 * the row is visible while nothing claims to lead anywhere. Replace the
 * bracketed values below and each becomes a real link, with no other change.
 *
 * Do not guess a handle to fill the gap: `instagram.com/uv` is a stranger's
 * account, and sending UV's visitors there is hard to walk back. That is also
 * why the old LinkedIn entry went — it pointed at "#", which looked like a
 * social presence and delivered nothing.
 */
export type SocialLink = {
  label: string;
  href: string;
  platform: "instagram" | "x" | "facebook";
};

export const FOOTER_SOCIAL: SocialLink[] = [
  { label: "Instagram", href: "[UV Instagram URL]", platform: "instagram" },
  { label: "X (formerly Twitter)", href: "[UV X URL]", platform: "x" },
  { label: "Facebook", href: "[UV Facebook URL]", platform: "facebook" },
];

export const COPYRIGHT = `Copyright © ${new Date().getFullYear()} ${COMPANY}. All rights reserved`;
