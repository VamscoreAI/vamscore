import { and, count, desc, eq, gt, inArray, sql } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { whatsapp } from "./index";
import type { WhatsAppEvent } from "./provider";
import { splitForWhatsApp } from "./text";

const { contacts, conversations, messages } = schema;

/**
 * Every database read and write the WhatsApp feature makes, in one place.
 *
 * The rule that keeps retries harmless: an event only has consequences — a bot
 * run, an alert — if its message row was *newly inserted*. `ON CONFLICT DO
 * NOTHING … RETURNING` returns nothing for a duplicate, so a redelivered
 * webhook changes nothing downstream.
 */

const ALERT_GAP_MS = 15 * 60 * 1000;

async function upsertContact(waId: string, profileName: string | null) {
  const [row] = await db()
    .insert(contacts)
    .values({ waId, profileName })
    .onConflictDoUpdate({
      target: contacts.waId,
      // Keep a known name if this delivery didn't carry one.
      set: { profileName: sql`coalesce(excluded.profile_name, ${contacts.profileName})` },
    })
    .returning();
  return row;
}

async function ensureConversation(contactId: string) {
  await db().insert(conversations).values({ contactId }).onConflictDoNothing({
    target: conversations.contactId,
  });
  const [row] = await db()
    .select()
    .from(conversations)
    .where(eq(conversations.contactId, contactId));
  return row;
}

export type IngestResult = {
  /** Conversations the assistant should answer, with the message that triggered it. */
  botRuns: { conversationId: string; messageId: string }[];
  /** New messages a person needs to see now. */
  alerts: { conversationId: string; waId: string; name: string | null; preview: string }[];
};

export async function ingestEvents(
  events: WhatsAppEvent[],
  opts: { botEnabled: boolean },
): Promise<IngestResult> {
  const result: IngestResult = { botRuns: [], alerts: [] };

  for (const event of events) {
    if (event.kind === "message") {
      const contact = await upsertContact(event.from, event.profileName);
      const conv = await ensureConversation(contact.id);

      const inserted = await db()
        .insert(messages)
        .values({
          conversationId: conv.id,
          direction: "in",
          author: "customer",
          type: event.type,
          body: event.body,
          providerMessageId: event.providerMessageId,
          status: "received",
          createdAt: event.timestamp,
        })
        .onConflictDoNothing({ target: messages.providerMessageId })
        .returning({ id: messages.id });
      if (!inserted.length) continue; // duplicate delivery

      // A resolved chat that hears from the customer again starts afresh with
      // the assistant, not with whoever handled it last time.
      const mode = conv.status === "resolved" ? "bot" : conv.mode;
      const ts = event.timestamp.toISOString();
      await db()
        .update(conversations)
        .set({
          // greatest(): a late, out-of-order delivery must not pull the reply
          // window backwards.
          lastInboundAt: sql`greatest(coalesce(${conversations.lastInboundAt}, ${ts}::timestamptz), ${ts}::timestamptz)`,
          lastMessageAt: new Date(),
          unreadCount: sql`${conversations.unreadCount} + 1`,
          status: "open",
          mode,
        })
        .where(eq(conversations.id, conv.id));

      if (mode === "bot" && opts.botEnabled) {
        result.botRuns.push({ conversationId: conv.id, messageId: inserted[0].id });
        continue;
      }
      // A person is handling it (or there is no assistant): alert on the first
      // message of a burst, at most once per 15 minutes per conversation.
      const quiet =
        !conv.lastAlertedAt || Date.now() - conv.lastAlertedAt.getTime() > ALERT_GAP_MS;
      if (conv.unreadCount === 0 && quiet) {
        result.alerts.push({
          conversationId: conv.id,
          waId: contact.waId,
          name: contact.profileName,
          preview: event.type === "text" ? event.body : `[${event.originalType}]`,
        });
      }
      continue;
    }

    if (event.kind === "status") {
      // Forward-only: a late "delivered" must not overwrite "read".
      const from =
        event.status === "delivered" ? (["sent"] as const)
        : event.status === "read" ? (["sent", "delivered"] as const)
        : null;
      if (event.status === "failed") {
        await db()
          .update(messages)
          .set({ status: "failed", error: event.error })
          .where(eq(messages.providerMessageId, event.providerMessageId));
      } else if (from) {
        await db()
          .update(messages)
          .set({ status: event.status })
          .where(
            and(
              eq(messages.providerMessageId, event.providerMessageId),
              inArray(messages.status, [...from]),
            ),
          );
      }
      continue;
    }

    // Echo: someone replied from the WhatsApp Business phone app. A person is
    // handling this chat now, so the assistant stands down.
    const contact = await upsertContact(event.to, null);
    const conv = await ensureConversation(contact.id);
    const inserted = await db()
      .insert(messages)
      .values({
        conversationId: conv.id,
        direction: "out",
        author: "echo",
        type: event.type,
        body: event.body,
        providerMessageId: event.providerMessageId,
        status: "sent",
        createdAt: event.timestamp,
      })
      .onConflictDoNothing({ target: messages.providerMessageId })
      .returning({ id: messages.id });
    if (inserted.length) {
      await db()
        .update(conversations)
        .set({ lastMessageAt: new Date(), mode: "human" })
        .where(eq(conversations.id, conv.id));
    }
  }

  return result;
}

export async function markAlerted(conversationId: string) {
  await db()
    .update(conversations)
    .set({ lastAlertedAt: new Date() })
    .where(eq(conversations.id, conversationId));
}

export async function getConversation(id: string) {
  const [row] = await db()
    .select({
      id: conversations.id,
      status: conversations.status,
      mode: conversations.mode,
      assignedTo: conversations.assignedTo,
      lastInboundAt: conversations.lastInboundAt,
      unreadCount: conversations.unreadCount,
      waId: contacts.waId,
      name: contacts.profileName,
    })
    .from(conversations)
    .innerJoin(contacts, eq(contacts.id, conversations.contactId))
    .where(eq(conversations.id, id));
  return row ?? null;
}

export async function latestInboundId(conversationId: string) {
  const [row] = await db()
    .select({ id: messages.id })
    .from(messages)
    .where(and(eq(messages.conversationId, conversationId), eq(messages.direction, "in")))
    .orderBy(desc(messages.createdAt))
    .limit(1);
  return row?.id ?? null;
}

export async function botRepliesSince(conversationId: string, since: Date) {
  const [row] = await db()
    .select({ n: count() })
    .from(messages)
    .where(
      and(
        eq(messages.conversationId, conversationId),
        eq(messages.author, "bot"),
        gt(messages.createdAt, since),
      ),
    );
  return row?.n ?? 0;
}

/** The last `limit` messages, oldest first. */
export async function recentMessages(conversationId: string, limit = 40) {
  const rows = await db()
    .select({
      author: messages.author,
      type: messages.type,
      body: messages.body,
    })
    .from(messages)
    .where(eq(messages.conversationId, conversationId))
    .orderBy(desc(messages.createdAt))
    .limit(limit);
  return rows.reverse();
}

export async function setMode(
  conversationId: string,
  mode: "bot" | "human",
  assignedTo?: string | null,
) {
  await db()
    .update(conversations)
    .set({ mode, ...(assignedTo !== undefined ? { assignedTo } : {}) })
    .where(eq(conversations.id, conversationId));
}

/**
 * Sends over WhatsApp and records the result, success or failure. A failed
 * send is still stored, with its error, so the dashboard shows what did not go
 * out instead of it vanishing.
 *
 * Known gap: WhatsApp can report "delivered" before this insert lands, in which
 * case that status update finds no row. It is rare, only ever loses a tick in
 * the UI, and "read" nearly always arrives later.
 */
export async function sendAndRecord(opts: {
  conversationId: string;
  to: string;
  body: string;
  author: "bot" | "staff";
  sentBy?: string | null;
}) {
  const provider = whatsapp();
  if (!provider) throw new Error("WhatsApp is not configured");

  const stored = [];
  for (const part of splitForWhatsApp(opts.body)) {
    let providerMessageId: string | null = null;
    let error: string | null = null;
    try {
      providerMessageId = (await provider.sendText(opts.to, part)).id;
    } catch (e) {
      error = e instanceof Error ? e.message : "Send failed";
      console.error("WhatsApp send failed", error);
    }
    const [row] = await db()
      .insert(messages)
      .values({
        conversationId: opts.conversationId,
        direction: "out",
        author: opts.author,
        type: "text",
        body: part,
        providerMessageId,
        status: error ? "failed" : "sent",
        error,
        sentBy: opts.sentBy ?? null,
      })
      .returning();
    stored.push(row);
  }

  await db()
    .update(conversations)
    .set({ lastMessageAt: new Date() })
    .where(eq(conversations.id, opts.conversationId));
  return stored;
}

/** Sum of unread across all conversations — the portal card's badge. */
export async function totalUnread() {
  const [row] = await db()
    .select({ n: sql<number>`coalesce(sum(${conversations.unreadCount}), 0)::int` })
    .from(conversations);
  return row?.n ?? 0;
}
