import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { NextResponse } from "next/server";

// Uses the filesystem, so it can't run on the edge runtime.
export const runtime = "nodejs";

/**
 * Receives a job application and stores it on the server.
 *
 * Applications are personal data: CVs land in `applications/` at the project
 * root, deliberately NOT under `public/`, which Next serves to anyone who asks.
 * The folder is gitignored so real people's CVs are never committed.
 *
 * Note this writes to local disk, so it works when the site runs on your own
 * machine or an ordinary VPS. Serverless hosts (Vercel, Netlify) give you a
 * read-only filesystem — moving there means swapping this for object storage or
 * an email service.
 */

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

// Extension -> the MIME types a browser plausibly reports for it.
const ALLOWED: Record<string, string[]> = {
  pdf: ["application/pdf"],
  doc: ["application/msword"],
  docx: [
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ],
};

/**
 * Reduces arbitrary text to a safe path segment. The uploaded filename and the
 * applicant's name are attacker-controlled, so neither is ever used in a path
 * as given — this strips everything outside [a-z0-9-], which makes traversal
 * (`../`), absolute paths and reserved characters impossible by construction.
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

function bad(message: string) {
  return NextResponse.json({ ok: false, error: message }, { status: 400 });
}

export async function POST(request: Request) {
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

  const file = form.get("cv");
  if (!(file instanceof File) || file.size === 0) {
    return bad("Please attach your CV.");
  }
  if (file.size > MAX_BYTES) {
    return bad(`That file is over ${MAX_BYTES / 1024 / 1024} MB. Please attach a smaller one.`);
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
    return bad(`That file is over ${MAX_BYTES / 1024 / 1024} MB. Please attach a smaller one.`);
  }

  const submittedAt = new Date();
  const reference = `${submittedAt.toISOString().replace(/[:.]/g, "-")}__${slug(name, "applicant")}`;
  const dir = join(process.cwd(), "applications", reference);

  try {
    await mkdir(dir, { recursive: true });
    await writeFile(join(dir, `cv.${ext}`), bytes);
    await writeFile(
      join(dir, "application.json"),
      JSON.stringify(
        {
          reference,
          submittedAt: submittedAt.toISOString(),
          name,
          email,
          phone,
          location,
          experience,
          role,
          note,
          // Recorded as data only — never used to build a path.
          originalFilename: file.name,
          fileBytes: bytes.byteLength,
        },
        null,
        2
      ) + "\n",
      "utf8"
    );
  } catch (error) {
    console.error("Failed to store application", error);
    return NextResponse.json(
      { ok: false, error: "We couldn't save your application. Please try again." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, reference });
}
