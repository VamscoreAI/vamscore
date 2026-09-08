// Copy for the /careers page.
//
// As elsewhere, anything in [square brackets] is a placeholder Vamscore still needs to
// fill in — here that is the open roles themselves.

export type Role = {
  id: string;
  title: string;
  team: string;
  location: string;
  type: string;
  summary: string;
};

export const GENERAL_ROLE_ID = "general";

const IMG = "/assets/img";

export const CAREERS = {
  eyebrow: "CAREERS",
  // Vamscore's own illustration, not a licensed stock photo — which is why it is the
  // one file under public/assets that .gitignore lets through.
  image: `${IMG}/careers-paths.webp`,
  title: "Build the operations other businesses depend on",
  intro:
    "Vamscore has run business process operations since 2012 and now builds robotics and automation alongside them. If you like work that has to actually run — every day, at volume — talk to us.",

  why: {
    title: "Why Vamscore",
    points: [
      {
        title: "Work that runs",
        body: "Our clients depend on these processes daily. Nothing here is a pilot that quietly gets shelved.",
      },
      {
        title: "Room to move",
        body: "People who started on the operations floor now lead automation work. We would rather grow someone than replace them.",
      },
      {
        title: "Reach across India",
        body: "Delivery on the central government education project is pan-India, so the work is not confined to one city.",
      },
    ],
  },

  rolesTitle: "Open roles",
  rolesNote:
    "Nothing here that fits? Send a general application and tell us what you do — we read every one.",

  // PLACEHOLDER — replace with Vamscore's real openings.
  roles: [
    {
      id: "bpo-team-lead",
      title: "[Role title — e.g. BPO Team Lead]",
      team: "Business process outsourcing",
      location: "[City]",
      type: "Full time",
      summary:
        "[Two lines on what this person will run day to day, and what experience matters.]",
    },
    {
      id: "automation-engineer",
      title: "[Role title — e.g. Automation Engineer]",
      team: "Robotics and automation",
      location: "[City]",
      type: "Full time",
      summary:
        "[Two lines on the automation work, the tools involved, and the level you are hiring at.]",
    },
    {
      id: "delivery-coordinator",
      title: "[Role title — e.g. Delivery Coordinator]",
      team: "Education and government projects",
      location: "[City / travel expected]",
      type: "Full time",
      summary:
        "[Two lines on coordinating delivery across districts, and what you need from this person.]",
    },
  ] as Role[],

  form: {
    title: "Apply",
    intro:
      "Attach your CV and we will come back to you. Fields marked with an asterisk are required.",
    generalRoleLabel: "General application",
    accept: ".pdf,.doc,.docx",
    maxMb: 5,
    dropHint: "Drag your CV here, or click to browse",
    dropMeta: "PDF, DOC or DOCX · up to 5 MB",
    submitLabel: "Send application",
    submittingLabel: "Sending…",
    successTitle: "Application received",
    successBody:
      "Thanks — we have your CV. If there is a fit we will be in touch by email.",
    errorGeneric:
      "Something went wrong sending your application. Please try again, or email us instead.",
  },
};
