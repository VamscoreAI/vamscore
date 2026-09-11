// All homepage copy and asset paths for Vamscore.
//
// Anything wrapped in [square brackets] is a PLACEHOLDER — a fact Vamscore has not
// supplied yet. Those are deliberately left visible rather than invented,
// because awards, client names and staff quotes are claims a real business
// cannot afford to have made up for it. Search this file for "[" to find them.
//
// Imagery under /assets is still the placeholder set downloaded from
// kyndryl.com — replace it before this goes anywhere public.

const IMG = "/assets/img";
const VIDEO = "/assets/video";
const LOGO = "/assets/logos";

/* -------------------------------------------------------------------------- */
/* 1. Hero — three cross-fading leadspace slides                              */
/* -------------------------------------------------------------------------- */

export type HeroSlide = {
  eyebrow: string;
  title: string;
  body: string;
  video?: string;
  /** Poster for `video`, or the still itself. Omitted when `art` is set. */
  image?: string;
  /** Renders `HeroArt` instead of a photograph — Vamscore's own, generated. */
  art?: boolean;
  ctas: { label: string; href: string; variant: "primary" | "outline" }[];
};

export const HERO_SLIDES: HeroSlide[] = [
  {
    eyebrow: "Vamscore",
    title: "An AI and technology company",
    body: "We combine artificial intelligence, technology and human expertise to build practical, scalable and affordable solutions for business and education.",
    // Vamscore's own footage. The poster is this clip's own first frame, so the
    // still and the video's opening are the same picture and there is no jump
    // when playback takes over. It was a stock photograph of four identifiable
    // people in an office — a bright interior in front of a dark abstract clip,
    // which flashed on every slow load.
    video: `${VIDEO}/hero-ai-company.mp4`,
    image: `${IMG}/hero-ai-company-poster.webp`,
    ctas: [{ label: "Our vision and mission", href: "/about", variant: "outline" }],
  },
  {
    eyebrow: "Vamscore",
    title: "Intelligent automation, not just outsourcing",
    body: "AI agents, workflow automation, analytics and human expertise, combined into operating models that move organisations from traditional outsourcing towards intelligent operations.",
    // Vamscore's own footage, and the only live action of the three slides.
    // Poster is its own first frame, as on slide one — but taken there because
    // that clip fades up from black, and here because it does not: mean
    // luminance holds at 84-97 across the whole 15s, so the opening frame is
    // representative rather than an artefact of a fade.
    video: `${VIDEO}/hero-intelligent-automation.mp4`,
    image: `${IMG}/hero-intelligent-automation-poster.webp`,
    ctas: [{ label: "What we're working towards", href: "/about#objectives", variant: "outline" }],
  },
  {
    eyebrow: "Vamscore",
    title: "Fourteen years of operations behind it",
    body: "Vamscore has run business process operations since 2012 — for Greycells 18 Media and Jio Communications, as an authorised Tata channel partner, and as territory partner on a central government education project across pan India.",
    // Was `anthem-thumb-04.webp`: a Kyndryl photograph of an identifiable person
    // with "unlock new possibilities" — Kyndryl's line — set into the image
    // itself. `HeroArt` draws fourteen ridges instead, one per year.
    art: true,
    ctas: [{ label: "Our track record", href: "#customer-stories", variant: "outline" }],
  },
];

/* -------------------------------------------------------------------------- */
/* 2. Sticky in-page section nav                                              */
/* -------------------------------------------------------------------------- */

/**
 * The on-page jump links. Every label here names the section it lands on, using
 * that section's own eyebrow — so what you click and what you arrive at read the
 * same.
 *
 * They deliberately do NOT reuse the header's top-level labels. Four of these
 * six used to: "Who we are" and "What we do" were word-for-word the header's,
 * pointing at the identical anchor, twenty pixels below it; "Our work" and "Our
 * team" repeated entries inside the mega-menus. Two navigation bars stacked on
 * top of each other saying the same words is read as a bug, not as a hierarchy.
 *
 * The header names the whole site and opens menus. This names this page and
 * scrolls. Keep the two vocabularies apart.
 */
export const SECTION_NAV = [
  { label: "Our story", id: "who-we-are" },
  { label: "Vision & mission", id: "vision-mission" },
  { label: "Our track record", id: "customer-stories" },
  { label: "FAQ", id: "faq" },
];

/* -------------------------------------------------------------------------- */
/* 3. Who we are                                                              */
/* -------------------------------------------------------------------------- */

export const WHO_WE_ARE = {
  // Was "WHO WE ARE" — the header's own top-level label. Renamed so the page's
  // section and the site's category stop competing for the same three words.
  // This one string drives the eyebrow, the watermark and the jump link.
  eyebrow: "OUR STORY",
  title: "An AI and technology company with fourteen years of operations behind it",
  body: "Vamscore started as a BPO business in 2012 and later stepped into the robotics field. We have worked for Greycells 18 Media and Jio Communications, become a channel partner for Tata, and serve as territory partner for a central government education project across pan India. Today we build artificial intelligence and automation on that experience — designed by people who have run the processes themselves.",
};

/* -------------------------------------------------------------------------- */
/* 4. Client work — PLACEHOLDER                                               */
/*                                                                            */
/* Greycells 18 Media and Jio Communications are named because Vamscore named them,  */
/* but the scope and outcome of each engagement still need filling in.         */
/* -------------------------------------------------------------------------- */

export const CUSTOMER_STORIES = {
  eyebrow: "our track record",
  title: "Progress, one client at a time",
  body: "We work alongside our clients and partners to run and improve the operations they depend on.",
  // Each slide is the front of a full story page in `content/stories.ts`; the
  // band image and that page's hero are deliberately the same picture, so
  // clicking through lands you somewhere you recognise.
  slides: [
    {
      eyebrow: "MEDIA & EDTECH",
      title:
        "Greycells 18 Media — running Topper as a curriculum channel and a digital classroom at once",
      image: `${IMG}/story-education-project.webp`,
      slug: "topper-greycells18",
    },
    {
      eyebrow: "TELECOM",
      title:
        "Jio — running a territory: distribution, retail expansion and field teams",
      image: `${IMG}/story-jio-telecom.webp`,
      slug: "jio-territory-partner",
    },
    {
      eyebrow: "CHANNEL PARTNERSHIP",
      title:
        "Tata Docomo — an authorised channel across sales, distribution and service",
      // Supplied by Vamscore. Dark and text-free, which is what this band needs: the
      // slide's own headline is rendered as live text over the picture under a
      // left-weighted scrim, so anything busy or already-lettered on the left
      // fights it.
      image: `${IMG}/story-tata-channel.webp`,
      slug: "tata-docomo-channel-partner",
    },
  ],
  // `href` is completed per slide in the component from the slug above.
  ctas: [
    { label: "Highlights", hash: "#highlights" },
    { label: "Read full story", hash: "" },
  ],
};

/* -------------------------------------------------------------------------- */
/* 5. Automation band                                                         */
/* -------------------------------------------------------------------------- */

export const AI_NATIVE = {
  title: "Intelligent operations, built on operational experience",
  body: "Having run these processes ourselves since 2012, we know where AI and automation genuinely help and where they just add moving parts.",
  cta: { label: "Start a conversation", href: "#connect" },
  // Vamscore-supplied illustration. Replaced a Kyndryl photograph of two
  // identifiable women, which this band showed at 60% behind the copy.
  // Composition suits the band: the subject sits right of centre and the left
  // third is near-empty, which is exactly where the heading and CTA land.
  image: `${IMG}/ai-native-automation.webp`,
};

/* -------------------------------------------------------------------------- */
/* 6. Partners                                                                */
/*                                                                            */
/* Rendered as plain wordmarks, not the partners' actual logos: reproducing    */
/* their trademarks would imply an endorsement Vamscore has not shown it has.        */
/* -------------------------------------------------------------------------- */

export const PARTNERS = {
  title: "Who we work with",
  cta: { label: "Talk to us about partnering", href: "#connect" },
  // `logo` is optional: with a file the mark renders, without one the name
  // falls back to plain type, so a partner can be added before its artwork is.
  // Each mark carries its OWN intrinsic size. One shared width/height would
  // make the browser apply a single aspect ratio to all of them, letterboxing
  // the square marks inside a wordmark-shaped box.
  logos: [
    // 102x101 after re-centring: the supplied file had the mark jammed into
    // its top-left corner with 34px of dead blue on the right and 15px below,
    // so at `h-10` normalisation it read visibly smaller than the marks beside
    // it. Trimmed to content and re-padded evenly on the same Tata blue.
    { name: "Tata", logo: `${LOGO}/partner-tata.webp`, w: 102, h: 101 },
    { name: "Jio Communications", logo: `${LOGO}/partner-jio.webp`, w: 96, h: 96 },
    {
      name: "Greycells 18 Media",
      logo: `${LOGO}/partner-greycells18.webp`,
      w: 340,
      h: 96,
    },
  ] as { name: string; logo?: string | null; w?: number; h?: number }[],
};

/* -------------------------------------------------------------------------- */
/* 7. Let's get there together                                                */
/* -------------------------------------------------------------------------- */

// Pictures supplied by Vamscore. These were `people-02/07/10.webp` — Kyndryl
// portraits, the last three of that set anywhere on the site. Each card now
// shows what it is asking for rather than a stranger's face.
export const GET_THERE_TOGETHER = {
  title: "Let's get there together",
  cards: [
    {
      title: "Work with us",
      body: "Tell us the process you need run, automated or supported, and we'll tell you honestly whether we're the right fit.",
      cta: "Start a conversation",
      href: "#connect",
      image: `${IMG}/card-work-with-us.webp`,
    },
    {
      title: "Careers",
      body: "We hire people who like work that has to actually run. See what is open.",
      cta: "See open roles",
      href: "/careers",
      image: `${IMG}/card-careers.webp`,
    },
    {
      title: "Partner with us",
      body: "We work as a channel and territory partner. If you're looking for delivery reach in India, let's talk.",
      cta: "Contact us",
      href: "#connect",
      image: `${IMG}/card-partner.webp`,
    },
  ],
};

/* -------------------------------------------------------------------------- */
/* 8. FAQ                                                                     */
/* -------------------------------------------------------------------------- */

export const FAQ = {
  // Both lines are used again. The heading used to render line 0 followed by
  // the *active tab's* label, which on the first tab produced "Answers to
  // questions about About Vamscore" and left `titleLines[1]` dead in the file. The
  // tab name now sits over the answers, where it belongs.
  titleLines: ["Answers to questions about", "Vamscore"],

  // A way out for anyone whose question is not on the list. It also gives the
  // left column something to end on: with four topics and a two-line heading it
  // ran about 350px shorter than the answers beside it.
  fallback: {
    heading: "Not answered here?",
    body: "Tell us what you are trying to do and we will come back to you directly.",
    cta: { label: "Ask us directly", href: "/contact" },
  },

  tabs: [
    {
      label: "About Vamscore",
      items: [
        {
          q: "What does Vamscore do?",
          a: "Vamscore runs business process operations, builds robotics and automation, delivers a central government education project as territory partner across pan India, and operates as an authorised Tata channel partner.",
        },
        {
          q: "How long has Vamscore been operating?",
          a: "Since 2012, when the company started as a BPO business. The robotics and partnership work came later.",
        },
        {
          q: "Where does Vamscore operate?",
          a: "Delivery for the central government education project covers pan India. [Add head office location and any other sites.]",
        },
      ],
    },
    {
      label: "Services",
      items: [
        {
          q: "What kind of processes does Vamscore take on?",
          a: "[List the specific back-office and customer-facing processes Vamscore runs — this is the question prospects ask first.]",
        },
        {
          q: "What does Vamscore's robotics work involve?",
          a: "[Describe the robotics and automation Vamscore builds, and the kind of problem it is applied to.]",
        },
      ],
    },
    {
      label: "Partnerships",
      items: [
        {
          q: "What does being a Tata channel partner mean?",
          a: "It means Vamscore is authorised to take Tata solutions to market and support them for clients. [Add which Tata company and which product lines.]",
        },
        {
          q: "Can Vamscore act as a territory partner for our organisation?",
          a: "Vamscore already serves as territory partner on a central government education project covering pan India. Get in touch to discuss coverage and scope.",
        },
      ],
    },
    {
      label: "Working with Vamscore",
      items: [
        {
          q: "How do engagements usually start?",
          a: "[Describe the first step — a scoping call, a pilot, a site visit.]",
        },
        {
          q: "How is Vamscore's work priced?",
          a: "[Outline the commercial models Vamscore offers, e.g. per-seat, per-transaction, or fixed-scope.]",
        },
      ],
    },
  ],
};

/* -------------------------------------------------------------------------- */
/* 9. Connect — the closing invitation                                        */
/* -------------------------------------------------------------------------- */

export const CONNECT = {
  title: "Connect with us",
  body: "Have a process you need run, automated or supported? Or want to talk about partnering? Get in touch.",
  // Was `mailto:[email]` — a live broken link that opened a mail client
  // addressed to the literal string "[email]". Now the contact page.
  cta: { label: "Let's talk", href: "/contact" },

  // The three reasons anyone actually gets in touch. The closing band was a
  // heading, one line of copy and a button beside a 420px graphic — most of the
  // column doing nothing — and this row gives it a job.
  //
  // Each goes somewhere different, and the two that share /contact arrive with
  // the form's "What is this about?" already set, so they are not the same link
  // wearing two labels. ContactForm only accepts a `topic` that matches one of
  // its own options, so these strings must stay in step with
  // `content/contact.ts`.
  routes: [
    {
      label: "Start a project",
      // Not "a process you need run, automated or supported" — that is
      // `CONNECT.body` verbatim, sitting 200px above this in the same band.
      body: "Operations to run, or automation to build.",
      href: "/contact?topic=Business+process+operations",
    },
    {
      label: "Partner with Vamscore",
      body: "Channel, territory and delivery partnerships.",
      href: "/contact?topic=Channel+partnership",
    },
    {
      label: "Join the team",
      body: "Open roles and how we hire.",
      href: "/careers",
    },
  ],

  // NOT RENDERED ANYWHERE. An earlier comment here said these "flow through to
  // the footer too"; nothing reads them. The contact page takes its details
  // from `content/contact.ts`, which is the copy that matters — update that one.
  // Kept in step so this cannot mislead, but it is a candidate for deletion.
  email: "[email]",
  phone: "+91 94907 29484",
  address: "[city, state]",
};

/* -------------------------------------------------------------------------- */
/* Visitor counter — between "Who we work with" and "Let's get there together" */
/* -------------------------------------------------------------------------- */

// Every number shown is real: the count starts at zero on the day Upstash is
// connected and never seeds from an invented baseline. "Counting since" shows
// that first day, so an early small number reads as new rather than quiet.
export const VISITORS = {
  eyebrow: "Live",
  title: "People who have visited vamscore.com",
  totalLabel: "visitors so far",
  // The count starts at zero, so "1" is a real state the page will show.
  totalLabelOne: "visitor so far",
  todayLabel: "Visitors today",
  sinceLabel: "Counting since",
  note: "One visit per browser per day. The count updates on its own while you watch.",
};
