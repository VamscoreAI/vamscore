import { NextResponse } from "next/server";
import { Resend } from "resend";
import { CAREERS, GENERAL_ROLE_ID } from "@/content/careers";

// Resend's SDK and Buffer both want Node, not the edge runtime.
export const runtime = "nodejs";

/**
 * Receives a job application and emails it to Vamscore with the CV attached.
 *
 * **Why email, not disk.** This route used to write each CV to `applications/`
 * on the server. Vercel's functions have a read-only filesystem, so on the live
 * site every application failed with "We couldn't save your application" and
 * none ever reached Vamscore. Email works on any host and lands where someone
 * reads it: the same inbox (`CONTACT_TO_EMAIL`) and Resend setup as the contact
 * form in `app/api/contact/route.ts`. CVs are personal data; nothing is kept on
 * the server.
 *
 * **Size.** Vercel rejects request bodies over 4.5 MB before this code runs, so
 * the CV limit is `CAREERS.form.maxMb` (4 MB) — the form enforces the same
 * number — leaving room for the other fields.
 *
 * **Not configured is a visible failure**, as with the contact form: without a
 * key the applicant gets a clear 503 telling them to email instead, never a
 * success message for an application that went nowhere.
 */

const MAX_BYTES = CAREERS.form.maxMb * 1024 * 1024;
const MAX_FIELD = 200;
const MAX_NOTE = 5000;

// Extension -> the MIME types a browser plausibly reports for it.
const ALLOWED: Record<string, string[]> = {
  pdf: ["application/pdf"],
  doc: ["application/msword"],
  docx: [
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ],
};

/**
 * Reduces arbitrary text to a safe filename segment. The applicant's name is
 * attacker-controlled, so it is never used in the attachment name as given.
 */
function slug(input: string, fallback: string): string {
  const cleaned = input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return cleaned || fallback;
}

/** Very small escape — every field is attacker-controlled and lands in HTML. */
function esc(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function bad(error: string, status = 400) {
  return NextResponse.json({ ok: false, error }, { status });
}

export async function POST(request: Request) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  const from = process.env.CONTACT_FROM_EMAIL ?? "onboarding@resend.dev";

  if (!apiKey || !to) {
    console.error(
      "Applications are not configured: set RESEND_API_KEY and CONTACT_TO_EMAIL"
    );
    return bad(
      "Applications can't be sent right now. Please email your CV to us instead.",
      503
    );
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return bad("Could not read the submitted form.");
  }

  const text = (key: string) => {
    const v = form.get(key);
    return typeof v === "string" ? v.trim() : "";
  };

  const name = text("name");
  const email = text("email");
  const phone = text("phone");
  const location = text("location");
  const experience = text("experience");
  const role = text("role");
  const note = text("note");

  if (!name) return bad("Please give your name.");
  if (!email) return bad("Please give an email address.");
  // Deliberately loose: real addresses are far more varied than most regexes
  // allow, and the only real proof is a message that arrives.
  if (!/^[^@\s]+@[^@\s.]+\.[^@\s]+$/.test(email)) {
    return bad("That email address doesn't look right.");
  }
  if ([name, email, phone, location, experience].some((v) => v.length > MAX_FIELD)) {
    return bad("One of those fields is too long.");
  }
  if (note.length > MAX_NOTE) return bad("That note is too long.");

  const file = form.get("cv");
  if (!(file instanceof File) || file.size === 0) {
    return bad("Please attach your CV.");
  }
  if (file.size > MAX_BYTES) {
    return bad(`That file is over ${CAREERS.form.maxMb} MB. Please attach a smaller one.`);
  }

  const ext = (file.name.split(".").pop() ?? "").toLowerCase();
  const allowedTypes = ALLOWED[ext];
  if (!allowedTypes) {
    return bad("Please attach a PDF, DOC or DOCX file.");
  }
  // Browsers occasionally send an empty type; accept that rather than reject a
  // genuine CV, but refuse a type that positively contradicts the extension.
  if (file.type && !allowedTypes.includes(file.type)) {
    return bad("That file's contents don't match its extension.");
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  // Re-check after reading: file.size is a claim until the bytes are in hand.
  if (bytes.byteLength > MAX_BYTES) {
    return bad(`That file is over ${CAREERS.form.maxMb} MB. Please attach a smaller one.`);
  }

  // Only a known role id is named in the email; anything else is a general
  // application, so a crafted value can't put arbitrary text in the subject.
  const roleTitle =
    CAREERS.roles.find((r) => r.id === role && role !== GENERAL_ROLE_ID)?.title ??
    CAREERS.form.generalRoleLabel;

  const submittedAt = new Date();
  const who = slug(name, "applicant");
  const reference = `${submittedAt.toISOString().replace(/[:.]/g, "-")}__${who}`;

  const rows: [string, string][] = [
    ["Name", name],
    ["Email", email],
    ["Phone", phone || "—"],
    ["Current location", location || "—"],
    ["Years of experience", experience || "—"],
    ["Role", roleTitle],
    ["Reference", reference],
  ];

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from: `Vamscore website <${from}>`,
      to: [to],
      // So a reply in the inbox goes to the applicant, not to the site.
      replyTo: email,
      subject: `Job application — ${roleTitle} — ${name}`,
      html: [
        `<h2>New job application from the Vamscore website</h2>`,
        `<table cellpadding="6" style="border-collapse:collapse">`,
        ...rows.map(
          ([k, v]) =>
            `<tr><td style="color:#666">${k}</td><td><strong>${esc(v)}</strong></td></tr>`
        ),
        `</table>`,
        note ? `<h3>Note from the applicant</h3><p style="white-space:pre-wrap">${esc(note)}</p>` : "",
        `<p style="color:#666">The CV is attached.</p>`,
      ].join(""),
      attachments: [{ filename: `CV-${who}.${ext}`, content: bytes }],
    });

    if (error) {
      // Logged in full server-side; the applicant gets a generic message.
      console.error("Resend rejected the application email", error);
      return bad("We couldn't send your application just now. Please try again.", 502);
    }
  } catch (error) {
    console.error("Failed to send application email", error);
    return bad("We couldn't send your application just now. Please try again.", 502);
  }

  return NextResponse.json({ ok: true, reference });
}
