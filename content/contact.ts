/**
 * The contact page — where "Let's talk" and every Contact link now land.
 *
 * The phone number is real (supplied 2026-09-10). Email and office are still
 * `[bracketed]`: Vamscore has not supplied them. They are left visibly
 * unfilled rather than invented, which is the same convention as everywhere
 * else in `content/` — but on this page in particular, **do not publish while
 * they are still brackets**. A contact page showing `[email]` is worse than one
 * showing nothing.
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
      { label: "Email", value: "[email]" },
      // Supplied as 9490729484. Shown with +91 and 5-5 grouping, the standard
      // way an Indian mobile is written; `href` carries the same number in
      // E.164 so the link dials correctly from outside India too — without the
      // country code a tel: link only works for callers already in India.
      { label: "Phone", value: "+91 94907 29484", href: "tel:+919490729484" },
      { label: "Office", value: "[city, state]" },
    ],
    careersNote: {
      text: "Looking for a job rather than a supplier?",
      linkLabel: "See open roles",
      href: "/careers",
    },
  },
};
