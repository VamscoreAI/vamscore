/**
 * Vamscore's vision, mission, core objectives and values — the company as it is now.
 *
 * The vision statement, the mission statement, the five objectives with their
 * fifteen supporting points, and the nine values are **Vamscore's own wording, used
 * verbatim**. Punctuation is theirs too (the unspaced em dash in "Impact", the
 * ampersand in "People & Learning"); do not tidy it. Casing is done in CSS, so
 * nothing here is pre-uppercased.
 *
 * One thing to hold on to when editing the connective copy around them: the
 * objectives are written in the future tense — "Develop", "Build", "Establish".
 * They are what Vamscore is working towards, not a claim about what it already ships.
 * Surrounding copy must not quietly convert an aim into an achievement.
 */

const IMG = "/assets/img";

export type Objective = {
  title: string;
  points: string[];
  /** Artwork for this objective's row. Null renders the row without one, so
   *  objectives can be illustrated as and when Vamscore has a picture for them. */
  image?: string | null;
  imageAlt?: string;
};
export type ValueItem = { title: string; body: string };

export const ABOUT_HERO = {
  eyebrow: "ABOUT Vamscore",
  title: "An AI and technology company, built on fourteen years of operations",
  standfirst:
    "Vamscore runs business process operations, education delivery and a Tata channel partnership — and builds artificial intelligence and automation on top of that experience. This is what we are working towards.",
  image: `${IMG}/about-hero-human-machine.webp`,
  imageAlt:
    "A man reading a document beside a robotic arm on a workbench",
};

export const VISION = {
  eyebrow: "VISION",
  // Supplied by Vamscore. A column of its own beside the statement now, not a scrim
  // backdrop — so unlike the old band art this is not optional, and the type
  // is `string` rather than `string | null`.
  //
  // Cropped before use: the file came with "OUR VISION" set into its left
  // third, which the eyebrow two lines up already says.
  image: `${IMG}/about-vision.webp`,

  statement:
    "To become a globally trusted AI and technology company that transforms businesses and education through intelligent automation, innovative digital solutions, and STEM-driven technology.",
};

export const MISSION = {
  eyebrow: "MISSION",
  statement:
    "Our mission is to combine artificial intelligence, technology, and human expertise to create practical, scalable, and affordable solutions that help organizations improve efficiency, enhance customer experiences, make smarter decisions, and accelerate growth.",
  // Same treatment as VISION.image: Vamscore's own, with the baked-in "OUR MISSION"
  // lettering cropped away.
  image: `${IMG}/about-mission.webp`,
};

export const OBJECTIVES: {
  image: string | null;
  eyebrow: string;
  titleLines: string[];
  intro: string;
  items: Objective[];
} = {
  // Drop a file in public/assets/img and point this at it — it sits behind the
  // copy under a scrim. Null renders no image at all, so there is no 404 and no
  // empty frame; the band simply keeps its flat background.
  // Deliberately null. A 546px-wide graphic stretched full-bleed at 18% read as
  // a smudge behind five rows that now carry their own artwork — one layer too
  // many. `objectives-automation-hud.webp` is still on disk if it finds a home.
  image: null as string | null,
  eyebrow: "core objectives",
  titleLines: ["Five things we are", "working towards"],
  intro:
    "Each objective carries the three commitments we hold ourselves to in getting there.",
  items: [
    {
      title: "AI & Technology Innovation",
      image: `${IMG}/objective-ai-innovation.webp`,
      imageAlt:
        "A human profile formed out of streaming binary code, in blue",
      points: [
        "Develop practical AI, machine learning, generative AI, and automation solutions for real business challenges.",
        "Build AI-powered products and platforms that can scale across multiple industries.",
        "Continuously explore emerging technologies and convert them into commercially viable solutions.",
      ],
    },
    {
      title: "Intelligent Automation",
      image: `${IMG}/objective-intelligent-automation.webp`,
      imageAlt: "A robotic arm at work on a production floor",
      points: [
        "Automate repetitive and time-consuming business processes.",
        "Combine AI agents, workflow automation, analytics, and human expertise to create efficient operating models.",
        "Help organizations move from traditional outsourcing toward intelligent operations.",
      ],
    },
    {
      title: "Build Scalable Products",
      image: `${IMG}/objective-scalable-products.webp`,
      imageAlt:
        "A diagram of an AI agent feeding a workflow and its outputs",
      points: [
        "Develop proprietary AI products rather than relying only on project-based services.",
        "Create reusable technology platforms that can serve multiple customers and markets.",
        "Establish recurring revenue through SaaS, AI platforms, managed services, and technology solutions.",
      ],
    },
    {
      title: "Customer-Centric Growth",
      image: `${IMG}/objective-customer-growth.webp`,
      imageAlt:
        "Two people shaking hands across a desk, overlaid with charts and data",
      points: [
        "Understand each customer's business problem before proposing technology.",
        "Deliver measurable improvements in cost, productivity, quality, speed, and customer experience.",
        "Build long-term strategic relationships rather than short-term engagements.",
      ],
    },
    {
      title: "Global Expansion",
      image: `${IMG}/objective-global-expansion.webp`,
      imageAlt: "A world map with lit connection points across the continents",
      points: [
        "Establish the company as a competitive technology partner in India and international markets.",
        "Initially leverage our Education and Telecom experience as a foundation for expansion into other sectors.",
        "Develop solutions that meet international standards for quality, security, privacy, and reliability.",
      ],
    },
  ],
};

/**
 * The history band. Everything here is drawn from what Vamscore has already stated
 * elsewhere on the site (`WHO_WE_ARE`, `CUSTOMER_STORIES`) — no new claims.
 */
export const FOUNDATION = {
  eyebrow: "OUR FOUNDATION",
  title: "Fourteen years of running the work, not just advising on it",
  paragraphs: [
    "Vamscore started as a business process operation in 2012 and later stepped into robotics and automation. We have worked for Greycells 18 Media and Jio Communications, become an authorised channel partner for Tata, and served as territory partner on a central government education project across pan India.",
    "That record is why the technology side of the company looks the way it does. We have run these processes at volume, under someone else's service standard, so we know where automation genuinely removes work and where it only adds moving parts.",
    "Education and telecom are where that experience is deepest, which is why they are named in the objectives as the foundation to expand from.",
  ],
  cta: { label: "Read the client stories", href: "/#customer-stories" },
  image: `${IMG}/foundation-people-together.webp`,
  imageAlt: "A line of people holding hands against a sunset sky",
};

export const VALUES: {
  image: string | null;
  eyebrow: string;
  title: string;
  intro: string;
  items: ValueItem[];
} = {
  // Drop a file in public/assets/img and point this at it — it sits behind the
  // copy under a scrim. Null renders no image at all, so there is no 404 and no
  // empty frame; the band simply keeps its flat background.
  image: `${IMG}/values-customer-satisfaction.webp`,
  eyebrow: "our values",
  title: "How we work",
  intro: "The nine commitments that decide how we take on work and how we run it.",
  items: [
    {
      title: "Innovation",
      body: "We continuously challenge conventional approaches and look for better ways to solve problems through technology.",
    },
    {
      title: "Customer First",
      body: "Our success is measured by the value and measurable outcomes we create for our customers.",
    },
    {
      title: "Integrity",
      body: "We operate with honesty, transparency, accountability, and respect in every relationship.",
    },
    {
      title: "Responsible AI",
      body: "We develop and use AI with a strong commitment to privacy, security, fairness, transparency, and human oversight.",
    },
    {
      title: "Excellence",
      body: "We strive for high standards in technology, service delivery, quality, and customer experience.",
    },
    {
      title: "People & Learning",
      body: "We believe our people are our greatest asset and encourage continuous learning, collaboration, and professional growth.",
    },
    {
      title: "Impact",
      body: "Technology should create meaningful outcomes—not simply be technology for technology's sake.",
    },
    {
      title: "Collaboration",
      body: "We bring together people, technology, customers, educators, and industry partners to create better solutions.",
    },
    {
      title: "Agility",
      body: "We respond quickly to changing customer needs, market conditions, and technological developments.",
    },
  ],
};

export const ABOUT_CTA = {
  title: "Work with Vamscore",
  body: "Tell us what you need built or run, and we will tell you honestly whether we are the right people for it.",
  cta: { label: "Start a conversation", href: "/contact" },
};

/** The condensed vision/mission band on the homepage. */
export const VISION_MISSION_BAND = {
  eyebrow: "VISION & MISSION",
  // Sits behind the copy at 60% under a carbon scrim. Set to null to render no
  // image at all — no 404, no empty frame, the band just goes flat carbon.
  image: `${IMG}/vision-mission-target.webp` as string | null,

  cta: { label: "Read our objectives and values", href: "/about" },
};
