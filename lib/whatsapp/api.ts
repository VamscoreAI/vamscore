import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { isAuthConfigured } from "@/lib/auth";
import { hasDatabase } from "@/lib/db";

/**
 * The gate every staff-facing WhatsApp API route passes first.
 *
 * Authorisation is checked here, in the route, next to the data — not inherited
 * from `proxy.ts`, which only establishes Clerk's request context (see the note
 * in `app/(site)/portal/page.tsx`). These routes ARE listed in the proxy
 * matcher, because `auth()` throws without it; the webhook is deliberately not.
 *
 * Order matters and fails closed: no Clerk keys → the route does not exist;
 * no session → 401; no database → 503.
 */
export async function requireStaff(): Promise<{ userId: string } | NextResponse> {
  if (!isAuthConfigured()) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }
  if (!hasDatabase()) {
    return NextResponse.json({ error: "WhatsApp is not connected yet." }, { status: 503 });
  }
  return { userId };
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
/** Rejects a malformed id before it reaches Postgres as a cast error. */
export const isUuid = (s: unknown): s is string => typeof s === "string" && UUID.test(s);

export async function readJson(request: Request): Promise<Record<string, unknown>> {
  try {
    const body = await request.json();
    return typeof body === "object" && body !== null ? (body as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}
