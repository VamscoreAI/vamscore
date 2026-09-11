import { NextResponse } from "next/server";
import { counterConfigured, isDemo, readCounts, recordVisit } from "@/lib/visitCounter";
import { isBot } from "@/lib/visits";

// node:crypto for the dedupe HMAC.
export const runtime = "nodejs";
// Never prerendered: the counts change constantly. Caching is done at the edge
// through the Cache-Control header below instead.
export const dynamic = "force-dynamic";

/**
 * The home page's visitor counter.
 *
 * GET  — the current counts. Cached at the edge for 20s, so every watching tab
 *        shares one Redis read.
 * POST — count this visitor (once per day), then return the counts. Sent once
 *        per browser per day; the server dedupes again regardless.
 *
 * Public by design and not in `proxy.ts`'s matcher. Unconfigured returns 503
 * and the section is not rendered at all in production.
 */

function unavailable(status: number) {
  return NextResponse.json({ configured: status !== 503 }, { status, headers: { "Cache-Control": "no-store" } });
}

export async function GET() {
  if (!counterConfigured()) return unavailable(503);
  try {
    const counts = await readCounts();
    return NextResponse.json(
      { configured: true, demo: isDemo(), ...counts },
      {
        headers: {
          "Cache-Control": isDemo()
            ? "no-store"
            : "public, s-maxage=20, stale-while-revalidate=40",
        },
      }
    );
  } catch (error) {
    console.error("Visitor counter read failed", error);
    return unavailable(502);
  }
}

export async function POST(request: Request) {
  if (!counterConfigured()) return unavailable(503);

  // Only this site may count a visit. A browser always sends Origin on a
  // cross-site POST, so a mismatch means another page is trying to inflate it.
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  if (origin && host) {
    let originHost: string | null = null;
    try {
      originHost = new URL(origin).host;
    } catch {
      /* "null" or malformed — treat as foreign */
    }
    if (originHost !== host) return unavailable(403);
  }

  const userAgent = request.headers.get("user-agent") ?? "";
  // Vercel sets both; the first x-forwarded-for entry is the client.
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";

  try {
    const result = isBot(userAgent)
      ? { ...(await readCounts()), counted: false }
      : await recordVisit(`${ip}|${userAgent}`);
    return NextResponse.json(
      { configured: true, demo: isDemo(), ...result },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("Visitor counter write failed", error);
    return unavailable(502);
  }
}
