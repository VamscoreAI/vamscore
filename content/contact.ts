/**
 * The contact page — where "Let's talk" and every Contact link now land.
 *
 * The details block below is still `[bracketed]`: UV has not supplied a public
 * email, phone number or address. They are left visibly unfilled rather than
 * invented, which is the same convention as everywhere else in `content/` —
 * but on this page in particular, **do not publish while they are still
 * brackets**. A contact page showing `[email]` is worse than one showing
 * nothing.
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

export const CONTACT = {
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
    // how to reach UV another way rather than leaving them stuck.
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
      { label: "Phone", value: "[phone]" },
      { label: "Office", value: "[city, state]" },
    ],
    careersNote: {
      text: "Looking for a job rather than a supplier?",
      linkLabel: "See open roles",
      href: "/careers",
    },
  },
};
