// The service lines, as a page of their own.
//
// This copy lived in a "What we deliver" band on the home page until that band
// was removed. It came back as a page rather than as a section because the
// header's four Services links had nowhere honest to land: they pointed at the
// contact form, so clicking "Business process outsourcing" asked you to get in
// touch about a service the site never described. /about was not the answer
// either — across that whole page "outsourcing" appears once and "robotics"
// once, and the vision statement names none of the four.
//
// Anything in [square brackets] is a placeholder Vamscore still needs to supply.

const IMG = "/assets/img";

export type Service = {
  /** Doubles as the anchor the header links to — keep these stable. */
  id: string;
  title: string;
  body: string;
  /** The two or three things Vamscore actually does under this line. */
  points: string[];
  /** Opens the contact form with the matching topic already chosen. The string
   *  must match an option in `content/contact.ts` exactly, or the form falls
   *  back to "Please choose…". */
  topic: string;
};

export const SERVICES_HERO = {
  eyebrow: "WHAT WE DO",
  title: "Operations, automation and delivery at scale",
  standfirst:
    "Five lines of work, built in the order Vamscore learned them: run the process first, automate it second, take it to market with partners who need reach — and build the software a business runs on.",
  // Vamscore-supplied. Replaced a Kyndryl photograph of two identifiable women,
  // which this page shared with the homepage automation band until that band
  // was swapped. A silhouette, so there is no identifiable face in it either.
  image: `${IMG}/services-hero.webp` as string | null,
};

export const SERVICES: Service[] = [
  {
    id: "bpo",
    title: "Business process outsourcing",
    body: "The service Vamscore was built on in 2012. We run back-office and customer-facing processes for clients who need them handled reliably and at volume.",
    points: [
      "Back-office processing",
      "Customer-facing operations",
      "[Add the specific processes Vamscore runs — this is the question prospects ask first.]",
    ],
    topic: "Business process operations",
  },
  {
    id: "robotics",
    title: "Robotics and automation",
    body: "We moved into the robotics field to automate the work we already understood, applying automation where it removes effort rather than adding tooling.",
    points: [
      "Workflow automation on processes we already run",
      "Robotics built on operational experience, not theory",
      "[Describe the robotics work and the kind of problem it is applied to.]",
    ],
    topic: "Robotics and automation",
  },
  {
    id: "education",
    title: "Education and government projects",
    body: "Vamscore is territory partner for a central government education project, delivering across pan India.",
    points: [
      "Territory partner on a central government education project",
      "Delivery across pan India",
      "Curriculum and digital classroom work — see the Topper story",
    ],
    topic: "Education or government projects",
  },
  {
    id: "channel",
    title: "Tata channel partnership",
    body: "As an authorised Tata channel partner, we take Tata solutions to market and support them for our clients.",
    points: [
      "Authorised Tata channel partner",
      "Sales, distribution and service",
      "[Add which Tata company and which product lines.]",
    ],
    topic: "Channel partnership",
  },
  {
    // Added 2026-09-22, evidenced by the Instant Gold Loan story. Last
    // because it is the newest line, which is the order the hero describes.
    id: "software",
    title: "Software and web development",
    body: "We build web applications and websites for businesses that still run on paper, spreadsheets and phone calls — shaped around how the work is actually done, and handed over in tools the owner already uses.",
    points: [
      "Cloud platforms and business web applications built around a real workflow",
      "Websites",
      "Instant Gold Loan, a gold loan management platform — see the story",
    ],
    topic: "Software or website development",
  },
];

export const SERVICES_CTA = {
  title: "Not sure which of these you need?",
  body: "Tell us the process you want run, automated, built or supported, and we will tell you honestly whether we are the right people for it.",
  cta: { label: "Talk to us", href: "/contact" },
};
