import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db, schema } from "@/lib/db";
import { whatsapp } from "@/lib/whatsapp";
import { isUuid, readJson, requireStaff } from "@/lib/whatsapp/api";
import { getConversation, sendAndRecord } from "@/lib/whatsapp/store";
import { windowState } from "@/lib/whatsapp/window";

export const runtime = "nodejs";

const MAX_BODY = 10_000; // split into ≤4,000-character WhatsApp messages on send

/**
 * A staff reply.
 *
 * Sending as staff takes the conversation over: the assistant stops answering
 * it until someone hands it back. Otherwise a customer could get a person's
 * reply and then an automated one seconds later, answering a question the
 * person already handled.
 *
 * **409 when the 24-hour window has closed.** WhatsApp only allows free-form
 * replies within 24 hours of the customer's last message; after that it would
 * reject the send anyway, and the only alternative — a paid template — is not
 * in this version. `windowState` is the same function the dashboard uses to
 * disable the composer, so the UI and this check cannot disagree.
 */
export async function POST(request: Request) {
  const gate = await requireStaff();
  if (gate instanceof NextResponse) return gate;
  if (!whatsapp()) {
    return NextResponse.json({ error: "WhatsApp is not connected yet." }, { status: 503 });
  }

  const input = await readJson(request);
  const conversationId = input.conversationId;
  const body = typeof input.body === "string" ? input.body.trim() : "";
  if (!isUuid(conversationId)) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!body) return NextResponse.json({ error: "Write a message first." }, { status: 400 });
  if (body.length > MAX_BODY) {
    return NextResponse.json({ error: "That message is too long." }, { status: 400 });
  }

  const conv = await getConversation(conversationId);
  if (!conv) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (!windowState(conv.lastInboundAt).open) {
    return NextResponse.json(
      {
        error:
          "The 24-hour reply window has closed. The customer needs to message again before you can reply.",
      },
      { status: 409 },
    );
  }

  const stored = await sendAndRecord({
    conversationId,
    to: conv.waId,
    body,
    author: "staff",
    sentBy: gate.userId,
  });

  await db()
    .update(schema.conversations)
    .set({ mode: "human", assignedTo: gate.userId, unreadCount: 0 })
    .where(eq(schema.conversations.id, conversationId));

  const failed = stored.find((m) => m.status === "failed");
  if (failed) {
    return NextResponse.json(
      { error: failed.error ?? "WhatsApp did not accept the message.", messages: stored },
      { status: 502 },
    );
  }
  return NextResponse.json({ messages: stored });
}
