import { desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db, schema } from "@/lib/db";
import { isUuid, readJson, requireStaff } from "@/lib/whatsapp/api";

export const runtime = "nodejs";

const { callbacks, contacts, conversations, leads } = schema;

/** Leads and call-back requests the assistant has captured, newest first. */
export async function GET() {
  const gate = await requireStaff();
  if (gate instanceof NextResponse) return gate;

  const [leadRows, callbackRows] = await Promise.all([
    db()
      .select({
        id: leads.id,
        conversationId: leads.conversationId,
        name: leads.name,
        company: leads.company,
        need: leads.need,
        email: leads.email,
        createdAt: leads.createdAt,
        waId: contacts.waId,
      })
      .from(leads)
      .innerJoin(conversations, eq(conversations.id, leads.conversationId))
      .innerJoin(contacts, eq(contacts.id, conversations.contactId))
      .orderBy(desc(leads.createdAt))
      .limit(50),
    db()
      .select({
        id: callbacks.id,
        conversationId: callbacks.conversationId,
        name: callbacks.name,
        preferredTimeText: callbacks.preferredTimeText,
        topic: callbacks.topic,
        status: callbacks.status,
        createdAt: callbacks.createdAt,
        waId: contacts.waId,
      })
      .from(callbacks)
      .innerJoin(conversations, eq(conversations.id, callbacks.conversationId))
      .innerJoin(contacts, eq(contacts.id, conversations.contactId))
      .orderBy(desc(callbacks.createdAt))
      .limit(50),
  ]);

  return NextResponse.json({ leads: leadRows, callbacks: callbackRows });
}

/** Mark a call-back done (or undo it). */
export async function PATCH(request: Request) {
  const gate = await requireStaff();
  if (gate instanceof NextResponse) return gate;

  const { callbackId, status } = await readJson(request);
  if (!isUuid(callbackId) || (status !== "done" && status !== "requested")) {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
  const updated = await db()
    .update(callbacks)
    .set({ status })
    .where(eq(callbacks.id, callbackId))
    .returning({ id: callbacks.id });
  if (!updated.length) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
