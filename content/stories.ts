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
 *
 * Mahaveer Instant Loan is different: Vamscore built the software, and that
 * story was written from the application's own source code
 * (MahaveerPawnBroker-main, supplied 2026-09-22). Every capability it lists is
 * something the code does. It makes no claim about results, and — because the
 * app's API does not check who is calling it — no claim that customer
 * records are access-controlled. Keep it that way until the code changes.
 *
 * Named and framed as a product at Vamscore's request (2026-09-22). "Cloud"
 * and "nothing to install" are true of how it is delivered. It does not say
 * or imply that other businesses subscribe to it: the code serves one
 * business and its owners. Change that only if it becomes true.
 *
 * "Loan agreement", not "pawn ticket" (Vamscore's call, same day). It is an
 * accurate name for what the app produces — borrower details, principal,
 * redemption period, a declaration and both signatures — in the language
 * a lender's customers expect. Its number is the "loan number".
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
      /**
       * A before/after list under the paragraphs, in the same column. Made for
       * a prose block whose aside is taller than its copy: it fills the space
       * beside the picture with the point of the story rather than padding.
       * Keep each phrase short — at phone width a column is ~120px.
       */
      shift?: {
        fromLabel: string;
        toLabel: string;
        rows: { from: string; to: string }[];
      };
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
  /** Replaces any part of the closing band's copy (STORY_UI) for this story. */
  cta?: Partial<{ title: string; body: string; label: string; href: string }>;
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
  /* ---------------------------------------------------------------------- */
  {
    // Was "mahaveer-pawn-broker"; next.config.ts redirects the old address.
    slug: "mahaveer-instant-loan",
    eyebrow: "FINTECH",
    client: "Mahaveer Instant Loan",
    title: "Mahaveer Instant Loan: a cloud platform for gold lending",
    standfirst:
      "Gold lending still runs on paper forms, a calculator and a ledger. Mahaveer Instant Loan replaces all three with one cloud platform — loan pricing, digital loan agreements, customer history and payment reminders — that runs in any browser, at the counter or on a phone.",
    // The project's own artwork: jewellery on a dark table, with the calm left
    // third the carousel's headline needs.
    hero: `${IMG}/story-mahaveer-gold.webp`,
    heroAlt:
      "Gold bangles, rings and a chain necklace heaped on a dark wooden table in warm light",
    meta: [
      { term: "Product", detail: "Mahaveer Instant Loan" },
      { term: "Category", detail: "Gold loan management software" },
      { term: "Delivery", detail: "Cloud web app, nothing to install" },
      { term: "Vamscore's role", detail: "Product design, development and deployment" },
    ],
    blocks: [
      {
        kind: "prose",
        paragraphs: [
          "A gold loan is a simple transaction with a lot of paperwork behind it. The jewellery is weighed, the day's gold rate applied, a loan amount and a redemption period agreed, and a loan agreement written out by hand — the customer's name, their father's or husband's name, address and identity number, and a line for every article with its gross and net weight.",
          "The difficulty is everything after that. The agreement goes into a file and the figures into a ledger. When the same customer comes back months later with another piece, the only way to see what they already owe is to go looking. Reminding someone that a loan is due means finding their number and typing the message by hand.",
        ],
        // Each row restates a capability from "What we built" below; nothing
        // here claims more than that list does.
        shift: {
          fromLabel: "On paper",
          toLabel: "With the app",
          rows: [
            { from: "Handwritten loan agreement", to: "Filled in on screen, ready to print" },
            { from: "Loan worked out on a calculator", to: "Calculated as the details are entered" },
            { from: "Searching files for past loans", to: "Every earlier loan, in seconds" },
            { from: "Reminders typed by hand", to: "Sent over WhatsApp in one tap" },
          ],
        },
        // A crop of the client's banner: the bars only, with the advertising
        // line that sat to their left cut away.
        aside: {
          src: `${IMG}/story-mahaveer-bars.webp`,
          alt: "A stack of fine gold bars, each stamped 999.9 and 1000 g",
        },
      },
      {
        kind: "list",
        heading: "What we built",
        intro:
          "One platform for the whole loan desk, used on the counter's computer and the owner's phone alike.",
        items: [
          {
            title: "Owner sign-in",
            // Deliberately "the counter screens", not "the records": the
            // sign-in gates the pages, and the API behind them does not check
            // it. See the note at the top of this file.
            body: "The counter screens open only after one of the business's owners signs in with their mobile number and PIN.",
          },
          {
            title: "The loan calculator",
            body: "Enter the gold weight, the day's price per gram, the tenure and the interest rate, and the loan amount and total due are worked out. The figures carry straight into the agreement and stay editable, because the final number is still the owner's call.",
          },
          {
            title: "Digital loan agreements",
            body: "Every field of the paper form — loan number, date, customer and guardian name, phone, Aadhaar, address, the principal in figures and in words, the time agreed for redemption, and each article's gross and net weight — with the declaration and signature lines, ready to print.",
          },
          {
            title: "Photographs with every loan",
            body: "A photo of the customer and of the jewellery is attached to every loan, and uploads even on a weak phone connection.",
          },
          {
            title: "Customer history before every new loan",
            body: "Search by phone number, name, loan number or Aadhaar and see every earlier loan with its payment status — before a new loan is issued, not after.",
          },
          {
            title: "Reminders in one tap",
            body: "The reminder message is written from the loan's own details and sent over WhatsApp or SMS from whichever phone the owner is using.",
          },
          {
            title: "Closing a loan",
            body: "When a loan is repaid it is marked paid, and the customer's history shows it from then on.",
          },
        ],
      },
      {
        kind: "facts",
        // Benefits, not stack, at Vamscore's request (2026-09-23): a prospect
        // should come away wanting the result, not reading a spec sheet.
        heading: "Built to run itself",
        intro: "Nothing to install, nothing to maintain, and nothing locked away.",
        // Drawn for this page, not client artwork. Shows only what the rows
        // below say: two devices, one app, Sheets and Drive. The host is not
        // named, here or in the rows (Vamscore's call, 2026-09-22).
        aside: {
          src: `${IMG}/story-mahaveer-architecture.webp`,
          alt: "Diagram: the counter computer and the owner's phone both connect to the Mahaveer Instant Loan platform, which reads and writes the loan register in Google Sheets and stores loan photos in Google Drive",
        },
        rows: [
          {
            term: "Works anywhere",
            detail:
              "Opens in any browser, on the counter's computer or the owner's phone, with a layout made for each. Nothing to install and nothing to update.",
          },
          {
            term: "Records you own",
            detail:
              "Every loan lands in the business's own Google Sheet and every photo in its own Google Drive. The register can be opened, searched and exported any time, with or without us.",
          },
          {
            term: "No IT to run",
            detail:
              "No servers, databases or IT staff for the business to look after. The owner opens it and gets on with the day.",
          },
          {
            term: "Built around the desk",
            detail:
              "Designed from how the counter actually works: the same fields, the same order, the same agreement. There was nothing new to learn.",
          },
        ],
      },
      {
        kind: "prose",
        heading: "The register stays yours",
        // Drawn for this page. Customer names are grey bars on purpose: made-up
        // names on a loan register would read as a leak of real customers.
        aside: {
          src: `${IMG}/story-mahaveer-register.webp`,
          alt: "Illustration of the loan register as a spreadsheet, with loan numbers, loan amounts, due dates and paid or due status, and a reminder-sent message beside a loan that is due",
        },
        paragraphs: [
          "A lending business's register is its most valuable record, so we kept it where the owner can always reach it: a Google Sheet in their own account. It can be opened, sorted and shared like any spreadsheet, and it never depends on the software to be read.",
          "The platform does everything a spreadsheet does badly — holding every agreement to the same format, doing the arithmetic, attaching the photographs, finding a customer's past loans in seconds, and turning a due date into a reminder.",
        ],
      },
    ],
    // Opens the contact form on the software topic. The string must match an
    // option in content/contact.ts; tests/links.test.ts checks it.
    cta: {
      title: "Still running on paper?",
      body: "Mahaveer Instant Loan took a gold loan desk from forms and ledgers to one platform. Tell us how your business runs today, and we will show you what it could look like.",
      label: "Talk to us about your platform",
      href: "/contact?topic=Software%20or%20website%20development",
    },
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
