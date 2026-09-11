import { CONTACT } from "@/content/contact";

/**
 * The public "WhatsApp us" links — the floating button and the contact-page row.
 *
 * The number lives in `content/contact.ts` beside the phone number, not in an
 * environment variable: it is a public fact about the business, decided on
 * 2026-09-11, and belongs where the rest of the contact details are edited.
 * An empty or malformed value makes every helper return nothing, so no link
 * renders anywhere rather than one that opens the wrong chat.
 *
 * These are plain wa.me links. The reply a customer gets is the WhatsApp
 * Business app's own Greeting message, set up on the phone — nothing on this
 * site sends or receives WhatsApp messages.
 */

const DIGITS = /^\d{8,15}$/;

export function whatsappNumber(): string | null {
  const n = CONTACT.whatsapp.number;
  return DIGITS.test(n) ? n : null;
}

/** "+91 94907 29484" for Indian mobiles; "+<digits>" otherwise. */
export function formatNumber(n: string) {
  return /^91\d{10}$/.test(n) ? `+91 ${n.slice(2, 7)} ${n.slice(7)}` : `+${n}`;
}

export function whatsappChatUrl(prefill: string = CONTACT.whatsapp.prefill) {
  const n = whatsappNumber();
  return n ? `https://wa.me/${n}?text=${encodeURIComponent(prefill)}` : null;
}

/** A row for the contact page's details list, or none. */
export function whatsappContactRow(): { label: string; value: string; href: string }[] {
  const n = whatsappNumber();
  const url = whatsappChatUrl();
  return n && url ? [{ label: "WhatsApp", value: formatNumber(n), href: url }] : [];
}
