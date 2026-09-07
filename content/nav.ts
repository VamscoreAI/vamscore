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
    // both the bar and the drawer. Kept pointing somewhere real anyway.
    href: "/contact",
    groups: [
      {
        // The four service lines used to be described in a "What we deliver"
        // band on the home page, and every one of these pointed at it. That
        // section is gone, and nothing else on the site describes them — so
        // rather than scroll to a section that no longer exists, each opens the
        // contact form with its matching topic already chosen. The strings must
        // stay in step with the `topic` options in `content/contact.ts`.
        heading: "Services",
        links: [
          {
            label: "Business process outsourcing",
            href: "/contact?topic=Business+process+operations",
          },
          {
            label: "Robotics and automation",
            href: "/contact?topic=Robotics+and+automation",
          },
          {
            label: "Education and government projects",
            href: "/contact?topic=Education+or+government+projects",
          },
          {
            label: "Tata channel partnership",
            href: "/contact?topic=Channel+partnership",
          },
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
      {
        label: "Business process outsourcing",
        href: "/contact?topic=Business+process+operations",
      },
      { label: "Robotics and automation", href: "/contact?topic=Robotics+and+automation" },
      {
        label: "Education and government projects",
        href: "/contact?topic=Education+or+government+projects",
      },
      { label: "Tata channel partnership", href: "/contact?topic=Channel+partnership" },
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


// Empty until UV has a real profile URL — the icon linked to "#", which looks
// like a social presence and delivers nothing. Add the entry back with a real
// href and the row renders itself.
export const FOOTER_SOCIAL: { label: string; href: string; icon: string }[] = [];

export const COPYRIGHT = `Copyright © ${new Date().getFullYear()} ${COMPANY}. All rights reserved`;
