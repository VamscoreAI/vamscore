// Copy for the /careers page.
//
// `roles` is empty until Vamscore has a real opening. With no roles the page
// shows `noRoles` — an honest "not hiring for a specific role" message with a
// general-application button — instead of cards. To advertise a role, add an
// entry to `roles`; the cards, the "Role" dropdown and the hero button's
// wording all switch back on their own.

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

  // The hero button: points at the roles when there are some, at the form when
  // there are none.
  heroCtaRoles: "See open roles",
  heroCtaNoRoles: "Send us your CV",

  rolesTitle: "Open roles",
  // Shown under the title only when there are roles to list.
  rolesNote:
    "Nothing here that fits? Send a general application and tell us what you do — we read every one.",

  // Shown instead of role cards while `roles` is empty.
  noRoles: {
    title: "No open roles right now",
    body: "We aren't hiring for a specific position at the moment. If you'd like to work with us when something opens up, send us your CV — we read every application and will be in touch if there's a fit.",
    cta: "Send a general application",
  },

  // Vamscore's real openings. Empty until there is one — see the note at the
  // top of this file. Shape: { id, title, team, location, type, summary }.
  roles: [] as Role[],

  form: {
    title: "Apply",
    intro:
      "Attach your CV and we will come back to you. Fields marked with an asterisk are required.",
    generalRoleLabel: "General application",
    accept: ".pdf,.doc,.docx",
    // 4, not 5: Vercel refuses request bodies over 4.5 MB before the route
    // runs, and the upload also carries the other fields. The route reads this
    // same number.
    maxMb: 4,
    dropHint: "Drag your CV here, or click to browse",
    dropMeta: "PDF, DOC or DOCX · up to 4 MB",
    submitLabel: "Send application",
    submittingLabel: "Sending…",
    successTitle: "Application received",
    successBody:
      "Thanks — your application is with us. If there's a fit, we'll be in touch by email.",
    errorGeneric:
      "Something went wrong sending your application. Please try again, or email us instead.",
  },
};
