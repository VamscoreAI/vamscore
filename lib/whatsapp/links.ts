/**
 * The public "WhatsApp us" entry point.
 *
 * Reads one variable, NEXT_PUBLIC_WHATSAPP_NUMBER (digits only, country code
 * first, e.g. 919490729484). Until it is set — or if it is set to something that
 * is not a phone number — every helper returns nothing and no WhatsApp link
 * renders anywhere. That is the site's convention for unsupplied facts: render
 * nothing rather than a link that goes somewhere wrong. It is also what makes
 * the client's number decision safe to defer: customers only ever see a number
 * once someone has deliberately put one here.
 *
 * `next.config.ts` pins the variable into the build so server and browser agree.
 */

const DIGITS = /^\d{8,15}$/;

export function whatsappNumber(): string | null {
  const n = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "";
  return DIGITS.test(n) ? n : null;
}

/** "+91 94907 29484" for Indian mobiles; "+<digits>" otherwise. */
export function formatNumber(n: string) {
  return /^91\d{10}$/.test(n) ? `+91 ${n.slice(2, 7)} ${n.slice(7)}` : `+${n}`;
}

export function whatsappChatUrl(prefill = "Hi Vamscore") {
  const n = whatsappNumber();
  return n ? `https://wa.me/${n}?text=${encodeURIComponent(prefill)}` : null;
}

/** A row for the contact page's details list, or none. */
export function whatsappContactRow(): { label: string; value: string; href: string }[] {
  const n = whatsappNumber();
  const url = whatsappChatUrl();
  return n && url ? [{ label: "WhatsApp", value: formatNumber(n), href: url }] : [];
}
