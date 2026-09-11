import { NextResponse } from "next/server";
import { esc, sendEmail } from "@/lib/email";

// Resend's SDK and the escaping below both want Node, not the edge runtime.
export const runtime = "nodejs";

/**
 * Contact form endpoint.
 *
 * Sends the enquiry as an email rather than writing it to disk. That is a
 * deliberate difference from `app/api/apply/route.ts`: a CV can sit in a folder
 * until someone runs a hiring round, but a sales enquiry nobody notices is a
 * lost customer, and nothing in this project reads those folders back.
 *
 * Public and unauthenticated by design — it is a contact form. It is not in
 * `proxy.ts`'s matcher, so Clerk never touches it.
 *
 * **Not configured is a visible failure, not a silent one.** With no API key
 * the endpoint returns a clear error the form shows the reader, and logs
 * server-side. A contact form that appears to send and doesn't is the worst
 * possible outcome — the sender believes they have reached you.
 *
 * Sending and escaping live in `lib/email.ts`, shared with the WhatsApp alerts.
 */

const MAX_MESSAGE = 5000;
const MAX_FIELD = 200;

function bad(error: string, status = 400) {
  return NextResponse.json({ ok: false, error }, { status });
}

export async function POST(request: Request) {
  if (!process.env.RESEND_API_KEY || !process.env.CONTACT_TO_EMAIL) {
    console.error(
      "Contact form is not configured: set RESEND_API_KEY and CONTACT_TO_EMAIL in .env.local"
    );
    return bad(
      "The contact form is not set up yet. Please email us directly.",
      503
    );
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return bad("We could not read that submission.");
  }

  const text = (key: string) => {
    const value = form.get(key);
    return typeof value === "string" ? value.trim() : "";
  };

  const name = text("name");
  const email = text("email");
  const company = text("company");
  const phone = text("phone");
  const topic = text("topic");
  const message = text("message");

  if (!name || !email || !message) {
    return bad("Please fill in your name, email and message.");
  }
  // Deliberately loose: the only address that matters is one that can receive a
  // reply, and over-strict patterns reject valid addresses.
  if (!/^[^@\s]+@[^@\s.]+\.[^@\s]+$/.test(email)) {
    return bad("That email address does not look right.");
  }
  if (message.length > MAX_MESSAGE) {
    return bad("That message is too long.");
  }
  if ([name, company, phone, topic].some((v) => v.length > MAX_FIELD)) {
    return bad("One of those fields is too long.");
  }

  const rows: [string, string][] = [
    ["Name", name],
    ["Email", email],
    ["Company", company || "—"],
    ["Phone", phone || "—"],
    ["Topic", topic || "—"],
  ];

  const result = await sendEmail({
    // So a reply in the inbox goes to the enquirer, not to the site.
    replyTo: email,
    subject: `Website enquiry — ${topic || "General"} — ${name}`,
    html: [
      `<h2>New enquiry from the Vamscore website</h2>`,
      `<table cellpadding="6" style="border-collapse:collapse">`,
      ...rows.map(
        ([k, v]) =>
          `<tr><td style="color:#666">${k}</td><td><strong>${esc(v)}</strong></td></tr>`
      ),
      `</table>`,
      `<h3>Message</h3>`,
      `<p style="white-space:pre-wrap">${esc(message)}</p>`,
    ].join(""),
  });

  if (!result.ok) {
    // Logged in full inside sendEmail; the reader gets a generic message.
    return bad("We could not send that just now. Please try again.", 502);
  }

  return NextResponse.json({ ok: true });
}
