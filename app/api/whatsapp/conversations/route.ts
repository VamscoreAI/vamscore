import { desc, eq, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db, schema } from "@/lib/db";
import { requireStaff } from "@/lib/whatsapp/api";

export const runtime = "nodejs";

const { contacts, conversations } = schema;

/** The inbox list: newest activity first, with a one-line preview. */
export async function GET() {
  const gate = await requireStaff();
  if (gate instanceof NextResponse) return gate;

  const rows = await db()
    .select({
      id: conversations.id,
      status: conversations.status,
      mode: conversations.mode,
      unreadCount: conversations.unreadCount,
      lastMessageAt: conversations.lastMessageAt,
      lastInboundAt: conversations.lastInboundAt,
      waId: contacts.waId,
      name: contacts.profileName,
      preview: sql<string | null>`(select m.body from messages m where m.conversation_id = ${conversations.id} order by m.created_at desc limit 1)`,
      previewType: sql<string | null>`(select m.type from messages m where m.conversation_id = ${conversations.id} order by m.created_at desc limit 1)`,
    })
    .from(conversations)
    .innerJoin(contacts, eq(contacts.id, conversations.contactId))
    .orderBy(desc(conversations.lastMessageAt))
    .limit(100);

  const totalUnread = rows.reduce((n, r) => n + r.unreadCount, 0);
  return NextResponse.json({ conversations: rows, totalUnread });
}
