import { Resend } from "resend";

/**
 * The one place the site sends email, shared by the contact form and the
 * WhatsApp alerts. Extracted from `app/api/contact/route.ts` so the escaping and
 * the "not configured" handling are written once.
 */

/** Minimal HTML escape — every value interpolated into an email body is
 *  attacker-controlled (a form field, a WhatsApp message). */
export function esc(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export type SendResult = { ok: true } | { ok: false; reason: "unconfigured" | "failed" };

/**
 * Never throws. Callers decide whether a failed email matters: the contact form
 * must tell the visitor, but a WhatsApp alert must never break the webhook.
 */
export async function sendEmail(opts: {
  to?: string;
  subject: string;
  html: string;
  replyTo?: string;
}): Promise<SendResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const to = opts.to ?? process.env.CONTACT_TO_EMAIL;
  const from = process.env.CONTACT_FROM_EMAIL ?? "onboarding@resend.dev";
  if (!apiKey || !to) return { ok: false, reason: "unconfigured" };

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from: `Vamscore website <${from}>`,
      to: [to],
      subject: opts.subject,
      html: opts.html,
      ...(opts.replyTo ? { replyTo: opts.replyTo } : {}),
    });
    if (error) {
      console.error("Resend rejected an email", error);
      return { ok: false, reason: "failed" };
    }
    return { ok: true };
  } catch (error) {
    console.error("Failed to send email", error);
    return { ok: false, reason: "failed" };
  }
}
