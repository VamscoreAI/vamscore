import { desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db, schema } from "@/lib/db";
import { isUuid, readJson, requireStaff } from "@/lib/whatsapp/api";
import { getConversation } from "@/lib/whatsapp/store";

export const runtime = "nodejs";

const { callbacks, conversations, leads, messages } = schema;

type Ctx = { params: Promise<{ id: string }> };

/** One conversation: its messages (latest 200), and any leads or call-backs. */
export async function GET(_request: Request, ctx: Ctx) {
  const gate = await requireStaff();
  if (gate instanceof NextResponse) return gate;

  const { id } = await ctx.params;
  if (!isUuid(id)) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const conversation = await getConversation(id);
  if (!conversation) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const [rows, leadRows, callbackRows] = await Promise.all([
    db()
      .select({
        id: messages.id,
        direction: messages.direction,
        author: messages.author,
        type: messages.type,
        body: messages.body,
        status: messages.status,
        error: messages.error,
        createdAt: messages.createdAt,
      })
      .from(messages)
      .where(eq(messages.conversationId, id))
      .orderBy(desc(messages.createdAt))
      .limit(200),
    db().select().from(leads).where(eq(leads.conversationId, id)).orderBy(desc(leads.createdAt)),
    db()
      .select()
      .from(callbacks)
      .where(eq(callbacks.conversationId, id))
      .orderBy(desc(callbacks.createdAt)),
  ]);

  return NextResponse.json({
    conversation,
    messages: rows.reverse(),
    leads: leadRows,
    callbacks: callbackRows,
  });
}

/**
 * Staff actions on a conversation. Each is a single, explicit state change —
 * there is no generic "update any field" path for a client to abuse.
 */
export async function PATCH(request: Request, ctx: Ctx) {
  const gate = await requireStaff();
  if (gate instanceof NextResponse) return gate;

  const { id } = await ctx.params;
  if (!isUuid(id)) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { action } = await readJson(request);
  const changes =
    action === "read" ? { unreadCount: 0 }
    : action === "resolve" ? { status: "resolved" as const, unreadCount: 0 }
    : action === "reopen" ? { status: "open" as const }
    : action === "takeover" ? { mode: "human" as const, assignedTo: gate.userId }
    : action === "handback" ? { mode: "bot" as const, assignedTo: null }
    : null;
  if (!changes) return NextResponse.json({ error: "Unknown action" }, { status: 400 });

  const updated = await db()
    .update(conversations)
    .set(changes)
    .where(eq(conversations.id, id))
    .returning({ id: conversations.id });
  if (!updated.length) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
