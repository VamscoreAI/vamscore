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
        heading: "Sectors",
        links: [
          { label: "Media", href: "/#customer-stories" },
          { label: "Telecom", href: "/#customer-stories" },
          { label: "Education", href: "/#customer-stories" },
          { label: "Government", href: "/#customer-stories" },
        ],
      },
      {
        heading: "How we work",
        links: [
          { label: "Our approach", href: "/#who-we-are" },
          { label: "Delivery across India", href: "/#customer-stories" },
        ],
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
