import { after, NextResponse } from "next/server";
import { isBotConfigured, runBot } from "@/lib/bot/run";
import { isWhatsAppConfigured, whatsapp } from "@/lib/whatsapp";
import { alertNewMessage } from "@/lib/whatsapp/alerts";
import { parseWebhook } from "@/lib/whatsapp/parse";
import { ingestEvents, markAlerted } from "@/lib/whatsapp/store";

// node:crypto for signature checks, and the Neon/Anthropic SDKs.
export const runtime = "nodejs";
// `after()` work runs within this budget. A reply is a few seconds of model
// time plus a WhatsApp send; 60s leaves room for the tool loop's three calls.
export const maxDuration = 60;

/**
 * Where WhatsApp delivers every message and status update.
 *
 * **Public, and deliberately not in `proxy.ts`'s matcher** — Meta has no Clerk
 * session. Authenticity comes from the provider's signature instead
 * (`verifyRequest`), checked against the raw body before anything is parsed.
 *
 * **Answer first, think later.** Meta expects a fast 200 and retries slow or
 * failing endpoints — eventually disabling the webhook. So this stores the
 * events, responds, and only then, in `after()`, sends alerts and runs the
 * assistant. Storing happens *before* the 200 so that nothing acknowledged can
 * be lost; a failure there returns 500 and Meta's retry is harmless because
 * every insert is idempotent.
 */

export async function GET(request: Request) {
  const provider = whatsapp();
  if (!provider) return new NextResponse("Not configured", { status: 503 });
  const challenge = provider.verifyHandshake(new URL(request.url));
  if (challenge === null) return new NextResponse("Forbidden", { status: 403 });
  return new NextResponse(challenge, { status: 200, headers: { "Content-Type": "text/plain" } });
}

export async function POST(request: Request) {
  const provider = whatsapp();
  if (!provider || !isWhatsAppConfigured()) {
    return new NextResponse("Not configured", { status: 503 });
  }

  const raw = await request.text();
  if (!provider.verifyRequest({ headers: request.headers, url: request.url }, raw)) {
    return new NextResponse("Invalid signature", { status: 401 });
  }

  let payload: unknown;
  try {
    payload = JSON.parse(raw);
  } catch {
    // Authentic but unreadable: retrying will not fix it, so acknowledge.
    console.error("WhatsApp webhook: signed body was not JSON");
    return NextResponse.json({ ok: true });
  }

  let result: Awaited<ReturnType<typeof ingestEvents>>;
  try {
    result = await ingestEvents(parseWebhook(payload), { botEnabled: isBotConfigured() });
  } catch (error) {
    console.error("WhatsApp webhook: failed to store events", error);
    return new NextResponse("Error", { status: 500 });
  }

  after(async () => {
    for (const alert of result.alerts) {
      await alertNewMessage(alert);
      await markAlerted(alert.conversationId);
    }
    for (const run of result.botRuns) {
      try {
        await runBot(run.conversationId, run.messageId);
      } catch (error) {
        console.error("WhatsApp assistant run failed", error);
      }
    }
  });

  return NextResponse.json({ ok: true });
}
