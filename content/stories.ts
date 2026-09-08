/**
 * Full client-story pages, reached from "Read full story" in the customer-
 * stories band on the homepage.
 *
 * The factual material — dates, ownership, the shape of each partner role, the
 * regulatory framing — comes from the briefing documents Vamscore supplied for
 * Greycells18/Topper, Jio and Tata Docomo. Anything that would be a *claim
 * about Vamscore's own results* (volumes, headcount, coverage, revenue, named people)
 * is left in [square brackets], exactly as elsewhere in `content/`. Those are
 * facts only Vamscore can supply, and inventing them for a real business would be
 * worse than leaving a gap. `grep -n '\[' content/stories.ts` lists them.
 */

const IMG = "/assets/img";

export type StoryBlock =
  /**
   * `aside` puts a picture in the space to the right of the reading column.
   * The column is capped at 860px for measure, so on a 1376px shell there is
   * roughly 500px of empty page beside every prose block — this fills it
   * without widening the text.
   *
   * Optional on purpose: a block with nothing worth showing stays one column
   * rather than reaching for a decorative filler.
   */
  | {
      kind: "prose";
      heading?: string;
      paragraphs: string[];
      aside?: { src: string; alt: string };
    }
  | {
      kind: "facts";
      heading: string;
      intro?: string;
      rows: { term: string; detail: string }[];
      /** Same optional side picture as `prose` — see the note there. */
      aside?: { src: string; alt: string };
    }
  | {
      kind: "list";
      heading: string;
      intro?: string;
      items: { title: string; body: string }[];
    }
  | { kind: "stats"; stats: { value: string; label: string }[] }
  | { kind: "image"; src: string; alt: string; caption?: string }
  | { kind: "quote"; text: string; attribution: string };

export type Story = {
  slug: string;
  eyebrow: string;
  client: string;
  title: string;
  standfirst: string;
  hero: string;
  heroAlt: string;
  meta: { term: string; detail: string }[];
  blocks: StoryBlock[];
};

export const STORIES: Story[] = [
  /* ---------------------------------------------------------------------- */
  {
    slug: "topper-greycells18",
    eyebrow: "MEDIA & EDTECH",
    client: "Greycells18 Media Ltd",
    title: "Topper: a curriculum channel and a digital classroom, run as one",
    standfirst:
      "Greycells18 Media built Topper as India's first curriculum-based educational television channel, with a learning portal running alongside it. Two very different delivery systems, one syllabus, and a school calendar that will not wait.",
    hero: `${IMG}/story-education-project.webp`,
    heroAlt:
      "School students in uniform gathered around a laptop, working through a lesson together",
    meta: [
      { term: "Client", detail: "Greycells18 Media Ltd" },
      { term: "Sector", detail: "Media and education technology" },
      { term: "Network", detail: "Network18 ecosystem" },
      { term: "Vamscore's role", detail: "[engagement scope Vamscore wants stated here]" },
    ],
    blocks: [
      {
        kind: "prose",
        paragraphs: [
          "Topper — spanning Topper TV on air and TopperLearning online — is an educational content and e-learning platform operated by Greycells18 Media Ltd. It sits inside the Network18 ecosystem as a specialised EdTech arm, and its whole reason for existing is a bridge: broadcast reach on one side, targeted digital curriculum delivery on the other.",
          "That bridge is the interesting part. A television channel and a learning portal look like the same product to a student and nothing like the same product to the people running them. One is a schedule that must be filled to the minute; the other is a library that must be complete, searchable and correct. Topper committed to both, against the same syllabus.",
        ],
        aside: {
          src: `${IMG}/story-topper-classroom.webp`,
          alt: "Students and a teacher around a school library table, subject textbooks stacked beside an open laptop",
        },
      },
      {
        kind: "facts",
        heading: "The brand at a glance",
        intro: "The fixed points the delivery model had to work around.",
        aside: {
          src: `${IMG}/story-topper-reach.webp`,
          alt: "The earth at night from orbit, city lights spread across the continents",
        },
        rows: [
          { term: "Launched", detail: "Founded and launched around 2007–2008." },
          {
            term: "Core offering",
            detail:
              "Promoted as India's first curriculum-based educational television channel, running parallel with an integrated digital learning portal at topperlearning.com.",
          },
          {
            term: "Audience",
            detail:
              "K-12 students, and specifically Classes 9 to 12 — the years where the stakes rise sharply.",
          },
          {
            term: "Subjects",
            detail:
              "Core science tracks — Physics, Chemistry and Mathematics — alongside competitive entrance exam preparation.",
          },
        ],
      },
      {
        kind: "prose",
        heading: "Why Classes 9 to 12 changes the operating model",
        paragraphs: [
          "Choosing the senior secondary years sets the difficulty. These students are working to a board syllabus with a fixed examination date, and many are preparing for competitive entrance exams on top of it. Content cannot be approximately right, cannot arrive late, and cannot drift from the board's prescribed sequence.",
          "It also compresses the calendar. Demand is not evenly spread across the year — it climbs steeply towards examinations and falls away afterwards. Everything behind the product, from content production to the desk that answers student questions, has to be staffed for a curve rather than a flat line.",
          "Physics, Chemistry and Mathematics raise a further problem: they are worked, not watched. A recorded explanation of a derivation is only half the delivery. The portal has to carry the other half — practice, solutions and revision a student can return to at eleven at night, which is exactly when a broadcast schedule is no help at all.",
        ],
        aside: {
          src: `${IMG}/story-topper-demand.webp`,
          alt: "A rising line and bar chart, climbing steeply toward a peak",
        },
      },
      {
        kind: "image",
        // Was `people-04.webp` — a Kyndryl portrait, a head-and-shoulders of a
        // man filling the frame on a story about curriculum delivery to Indian
        // school students. This is the paragraph above it made literal: the
        // half of the delivery a broadcast cannot carry.
        src: `${IMG}/story-topper-practice.webp`,
        alt: "A student's hands working through a printed science worksheet beside an open textbook",
        caption:
          "Physics, Chemistry and Maths are worked, not watched — which is the half a schedule cannot deliver.",
      },
      {
        kind: "list",
        heading: "What running this actually involves",
        intro:
          "The workstreams behind a curriculum platform of this shape. Vamscore should confirm which of these sat inside its scope.",
        items: [
          {
            title: "Curriculum mapping",
            body: "Holding every asset — broadcast and digital — against the board's prescribed sequence, so a chapter on screen matches the chapter a student is sitting in class.",
          },
          {
            title: "Content production and review",
            body: "Scripting, recording, subject-matter checking and correction. In science and mathematics an error is not a blemish; it teaches the wrong thing.",
          },
          {
            title: "Schedule and library management",
            body: "Filling an air schedule while keeping the portal's catalogue complete and correctly tagged, so the same lesson is findable in two entirely different ways.",
          },
          {
            title: "Student support",
            body: "Handling queries, doubts and access problems at the volume the examination calendar produces, not the volume an average week produces.",
          },
          {
            title: "Platform operations",
            body: "Keeping the portal available through peak revision periods, when concurrent load bears no resemblance to the annual mean.",
          },
        ],
      },
    ],
  },

  /* ---------------------------------------------------------------------- */
  {
    slug: "jio-territory-partner",
    eyebrow: "TELECOM",
    client: "Jio",
    title: "Running a Jio territory: distribution, retail and field teams",
    standfirst:
      "A territory partner is the operational backbone of a geographic zone — the layer that turns a national strategy into outlets opened, targets tracked, and field teams that know their catchment.",
    hero: `${IMG}/story-jio-telecom.webp`,
    heroAlt: "A telecom retail counter serving customers",
    meta: [
      { term: "Client", detail: "Jio" },
      { term: "Sector", detail: "Telecommunications" },
      { term: "Model", detail: "Territory partnership" },
      { term: "Territory", detail: "[zones or districts Vamscore covers]" },
    ],
    blocks: [
      {
        kind: "prose",
        paragraphs: [
          "A Jio territory partner oversees sales, distribution and retail expansion within a specific geographic zone or catchment area. The role sits deliberately between two altitudes: corporate sets the strategic objective, and the territory converts it into local market execution — the work that decides whether market leadership is sustained on the ground or only on a slide.",
          "It is an operations job wearing a sales title. Growth in a territory is not won by a campaign; it is won by how many outlets are live, how well stocked they are, how quickly a customer complaint is closed, and whether the field team turned up.",
        ],
        aside: {
          src: `${IMG}/story-jio-partnership.webp`,
          alt: "Two people shaking hands across a meeting table while colleagues look on",
        },
      },
      {
        kind: "list",
        heading: "Core roles and responsibilities",
        intro: "The four mandates a territory operation is held to.",
        items: [
          {
            title: "Channel expansion",
            body: "Driving growth in retail outlets, distributor touchpoints and customer acquisition channels across the assigned territory — the width of the network, and the rate at which it widens.",
          },
          {
            title: "Performance monitoring",
            body: "Tracking sales targets in real time against gross and net revenue goals, market-share benchmarks, and the productivity of every local retail and channel partner.",
          },
          {
            title: "Operations management",
            body: "Overseeing local Jio Points, micro-distribution hubs and service centres — holding brand hygiene, service delivery quality and the customer satisfaction index to the corporate standard rather than a local approximation of it.",
          },
          {
            title: "Team leadership",
            body: "Training, evaluating, mentoring and managing local field teams, territory sales managers and feet-on-street representatives, so market coverage is a function of people who stay rather than people who churn.",
          },
        ],
      },
      {
        kind: "image",
        // Was `hero-alpitour.webp` — a Kyndryl asset from their Alpitour work,
        // which is why a Jio territory story carried a photograph of two
        // tourists pointing at Budapest. Supplied by Vamscore and actually about the
        // subject: network reach over a city at dusk.
        src: `${IMG}/story-jio-network.webp`,
        alt: "A telecom tower above a city at dusk, with data links fanning out across a globe",
        caption:
          "A territory is the ground layer of a national network: towers, outlets and the people who keep both running.",
      },
      {
        kind: "prose",
        heading: "Why the territory layer is hard to do well",
        paragraphs: [
          "Every one of those four mandates pulls against the others. Expanding the channel fast makes brand hygiene harder to hold. Pushing revenue targets down to feet-on-street makes retention harder. Chasing a market-share benchmark can quietly cost you the customer satisfaction index. A territory operation that optimises only one of the four will show it in the other three within a quarter.",
          "The other difficulty is distance. Corporate standards are written centrally and experienced locally — in a shop with its own footfall, its own competition and its own staffing reality. The partner's job is to make those standards survive contact with that, which is largely a people problem: recruiting, training and keeping a field force in a market where the alternative employer is usually across the road.",
        ],
        aside: {
          src: `${IMG}/story-jio-customer.webp`,
          alt: "A man on a phone call at home, laptop open beside him",
        },
      },
    ],
  },

  /* ---------------------------------------------------------------------- */
  {
    slug: "tata-docomo-channel-partner",
    eyebrow: "CHANNEL PARTNERSHIP",
    client: "Tata Docomo — Tata Teleservices Limited",
    title:
      "Tata Docomo: an authorised channel across sales, distribution and service",
    standfirst:
      "Channel partners were the extended arm of Tata Teleservices — acquiring subscribers, moving stock, running local marketing and answering customers, all inside a licensing regime that left no room for improvisation.",
    // Same picture as the band slide on the home page, per the note in
    // `CUSTOMER_STORIES`: clicking through should land you somewhere you
    // recognise.
    hero: `${IMG}/story-tata-channel.webp`,
    heroAlt:
      "A city at dusk under a web of connecting lines spanning a world map",
    meta: [
      { term: "Client", detail: "Tata Teleservices Limited" },
      { term: "Brand", detail: "Tata Docomo" },
      { term: "Launched", detail: "2009, as a TTSL–NTT DOCOMO joint venture" },
      { term: "Model", detail: "Authorised channel partner" },
    ],
    blocks: [
      {
        kind: "prose",
        paragraphs: [
          "Tata Docomo was a prominent Indian telecommunications brand operated by Tata Teleservices Limited. It launched in 2009 through a strategic joint venture between TTSL and Japan's NTT DOCOMO, and carried a wide spectrum of services across India — mobile, fixed-wireless, broadband and enterprise.",
          "A Tata Docomo channel partner was an authorised commercial entity: the party responsible for driving localised business growth, managing market distribution and maintaining customer relations. Partners extended the operational reach of Tata Teleservices into markets a national organisation cannot staff directly.",
        ],
        aside: {
          src: `${IMG}/story-tata-reach.webp`,
          alt: "An abstract wireframe landscape of connected data points",
        },
      },
      {
        kind: "list",
        heading: "The role of a channel partner",
        intro: "Four market activities, run together rather than in sequence.",
        items: [
          {
            title: "Sales and customer acquisition",
            body: "Onboarding new prepaid, postpaid and enterprise subscribers — three quite different sales motions sharing one brand and one target.",
          },
          {
            title: "Distribution and logistics",
            body: "Managing inventory channels: recharge vouchers, SIM cards and hardware devices moving reliably to local retail outlets.",
          },
          {
            title: "Marketing and promotion",
            body: "Running localised brand visibility campaigns and promotions that work in the market in front of you while staying inside corporate guidelines.",
          },
          {
            title: "Customer servicing",
            body: "Acting as a direct service node — resolving subscriber queries, processing bill payments and handling value-added service requests.",
          },
        ],
      },
      {
        kind: "list",
        heading: "Types of partner entity",
        intro:
          "The distribution and network architecture ran on several specialised partner formats.",
        items: [
          {
            title: "Distributors",
            body: "Managing bulk logistics and product routing into multi-brand retail shops within a defined geographic territory.",
          },
          {
            title: "Direct sales agents",
            body: "Specialised sales teams working direct consumer acquisition, corporate accounts and doorstep connections.",
          },
          {
            title: "System integrators and value-added resellers",
            body: "Partners building tailored B2B enterprise infrastructure, combining network lines with hardware or software utilities.",
          },
        ],
      },
      {
        kind: "image",
        // Was `anthem-thumb-03.webp` — a Kyndryl asset with "unlock new value",
        // Kyndryl's line rather than Vamscore's, set into the pixels beside a coral
        // panel. The third of these found on the site; the hero carried
        // `anthem-thumb-04` with "unlock new possibilities" on it.
        src: `${IMG}/story-tata-network.webp`,
        alt: "A dark globe strung with glowing network links and signal nodes",
        caption:
          "A national footprint is reached through partners: the operator's brand, carried into markets it cannot staff directly.",
      },
      {
        kind: "list",
        heading: "Regulatory framework and the DoT",
        intro:
          "Tata Teleservices operated under strictly defined unified licences issued by the Department of Telecommunications. That framework set hard boundaries around the channel network.",
        items: [
          {
            title: "Licensing boundaries",
            body: "Channel partners operated purely as extended arms of the operator's distribution network. They were commercial contractors and did not independently hold telecom licences.",
          },
          {
            title: "Compliance",
            body: "Every subscriber verification workflow — KYC — managed by a channel partner was strictly bound by rules mandated by the DoT and monitored by the Telecom Regulatory Authority of India.",
          },
          {
            title: "Information custody",
            body: "As clarified by TRAI, core regulatory data and official licensing matters remain under the legal custody and jurisdiction of the DoT.",
          },
        ],
      },
      {
        kind: "prose",
        heading: "What that meant day to day",
        paragraphs: [
          "The licensing position is easy to read past, and it is the thing that shaped the work most. A partner carried the operator's brand, handled the operator's subscribers and performed identity verification on the operator's behalf — while holding no licence of its own. Every process therefore had to be auditable back to the operator's standard, because the operator, not the partner, answered for it.",
          "KYC is the clearest example. It looks like a form. It is in fact a regulated control with a defined evidence trail, applied at the counter, at volume, by staff who need training and supervision to apply it consistently. Getting acquisition numbers up while keeping verification quality intact is the real test of a channel operation, and the two pull in opposite directions.",
        ],
        aside: {
          src: `${IMG}/story-tata-kyc.webp`,
          alt: "An identity record on screen behind a shield and padlock",
        },
      },
    ],
  },
];

export const STORY_BY_SLUG = new Map(STORIES.map((s) => [s.slug, s]));

/** Copy for the story-page chrome that isn't part of any one story. */
export const STORY_UI = {
  nextLabel: "Next story",
  ctaTitle: "Work with Vamscore",
  ctaBody:
    "Tell us what you need run, and we will tell you honestly whether we are the right people to run it.",
  ctaLabel: "Start a conversation",
  ctaHref: "/contact",
};
