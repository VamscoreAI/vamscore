/**
 * The contact page — where "Let's talk" and every Contact link now land.
 *
 * Phone (supplied 2026-09-10) and email (2026-09-11) are real. The office is
 * still `[bracketed]`: Vamscore has not supplied it. It is left visibly
 * unfilled rather than invented, which is the same convention as everywhere
 * else in `content/` — but on this page in particular, **do not publish while
 * it is still bracketed**. A contact page showing `[city, state]` is worse than
 * one showing nothing.
 */

export type ContactField = {
  name: string;
  label: string;
  type: "text" | "email" | "tel" | "textarea" | "select";
  required?: boolean;
  placeholder?: string;
  options?: string[];
  /** Full width in the two-column grid */
  wide?: boolean;
};

const IMG = "/assets/img";

/**
 * Vamscore's email, supplied 2026-09-11. `primary` is on the company's own
 * domain — vamscore.com has GoDaddy MX records (smtp.secureserver.net,
 * checked 2026-09-11), so it receives mail. `alternate` is the Gmail inbox.
 * The contact page lists both; the header's Gmail button addresses `primary`.
 */
export const EMAIL = {
  primary: "info@vamscore.com",
  alternate: "vamscore@gmail.com",
};

/**
 * The header's Gmail button: Gmail's compose window, addressed to Vamscore.
 * `view=cm` is compose, `fs=1` full-screen, `to` the primary address.
 *
 * **No `/u/0/`.** That pins Gmail to the *first* signed-in Google account, so
 * anyone with more than one would compose from the wrong identity. Leaving it
 * out lets Google use the active account.
 *
 * Until 2026-09-11 this deliberately had no `to=`: the only address it could
 * have carried was the placeholder "[email]", and a compose window
 * pre-addressed to a literal "[email]" is the broken link this project removed
 * twice.
 */
export const GMAIL_COMPOSE_URL = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(EMAIL.primary)}`;

export const CONTACT = {
  /**
   * WhatsApp, supplied 2026-09-11: the same number as the phone line, on the
   * WhatsApp Business app. Digits only, country code first. The floating
   * button and the contact-page row both read this; set it to "" to remove
   * every WhatsApp link from the site at once.
   *
   * The auto-reply customers receive is the app's own Greeting message, set up
   * on the phone — nothing here sends it.
   */
  whatsapp: {
    number: "919490729484",
    // Pre-typed in the visitor's WhatsApp so they only have to press send.
    prefill: "Hi Vamscore, I'd like to talk about working with you.",
    // Pre-typed by the internship band's button on the home page (the footer's
    // "Internships" link scrolls to that band). Kept here beside the number.
    internshipPrefill: "Hi Vamscore, I'm interested in an internship.",
  },

  /**
   * The floating Google Meet button.
   *
   * `/new` opens a meeting in the VISITOR's own Google account — Vamscore is
   * not in it, and a visitor who is not signed in lands on Google sign-in
   * first. Vamscore chose this on 2026-09-17 knowing that, which is why the
   * label says "start a Google Meet call" and never claims it reaches us.
   * Swap this one URL for a Calendar booking page or a fixed room when there
   * is one; nothing else has to change.
   */
  meet: {
    url: "https://meet.google.com/new",
    label: "Start a Google Meet call",
  },
  // Sits behind the hero copy at 60% under a left-weighted scrim. Supplied by
  // Vamscore.
  heroImage: `${IMG}/contact-hero.webp`,
  eyebrow: "CONTACT",
  title: "Let's talk",
  standfirst:
    "Tell us what you need run, built or supported. We will read it properly and reply with an honest view of whether we are the right people for it.",

  form: {
    title: "Send us a message",
    intro: "We usually reply within two working days.",
    submit: "Send message",
    sending: "Sending…",
    success:
      "Thanks — your message is with us. We will get back to you within two working days.",
    // Shown when the send fails for any reason. Deliberately tells the reader
    // how to reach Vamscore another way rather than leaving them stuck.
    error:
      "Sorry — we could not send that. Please try again, or email us directly.",
    fields: [
      { name: "name", label: "Your name", type: "text", required: true },
      { name: "email", label: "Email address", type: "email", required: true },
      { name: "company", label: "Company", type: "text" },
      { name: "phone", label: "Phone", type: "tel" },
      {
        name: "topic",
        label: "What is this about?",
        type: "select",
        required: true,
        wide: true,
        options: [
          "Business process operations",
          "Robotics and automation",
          "Education or government projects",
          "Channel partnership",
          // Must match `topic` on the software line in content/services.ts
          // exactly, or /contact?topic= falls back to "Please choose…".
          "Software or website development",
          "Careers",
          "Something else",
        ],
      },
      {
        name: "message",
        label: "Your message",
        type: "textarea",
        required: true,
        wide: true,
        placeholder: "What do you need, and by when?",
      },
    ] satisfies ContactField[],
  },

  details: {
    title: "Other ways to reach us",
    items: [
      { label: "Email", value: EMAIL.primary, href: `mailto:${EMAIL.primary}` },
      { label: "Alternate email", value: EMAIL.alternate, href: `mailto:${EMAIL.alternate}` },
      // Supplied as 9490729484. Shown with +91 and 5-5 grouping, the standard
      // way an Indian mobile is written; `href` carries the same number in
      // E.164 so the link dials correctly from outside India too — without the
      // country code a tel: link only works for callers already in India.
      { label: "Phone", value: "+91 94907 29484", href: "tel:+919490729484" },
      { label: "Office", value: "[city, state]" },
    ],
    careersNote: {
      text: "Looking for a job rather than a supplier?",
      linkLabel: "Careers at Vamscore",
      href: "/careers",
    },
  },
};
