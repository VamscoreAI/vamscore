import {
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

/**
 * The WhatsApp assistant's storage.
 *
 * **Why a database at all:** WhatsApp's Cloud API keeps no history we can read
 * back. Each message reaches the webhook once; if it is not written here it is
 * gone. Unread counts, who took over a chat, the 24-hour reply window and
 * duplicate protection all live here too.
 *
 * **One conversation per contact.** WhatsApp itself is one continuous thread
 * per phone number, so there is nothing to gain from opening a new row per
 * enquiry — resolving and reopening just flips `status`.
 *
 * **Idempotency lives in the constraints, not in code.** Meta retries a webhook
 * until it gets a 200, and the Neon HTTP driver has no interactive
 * transactions, so correctness comes from unique columns plus
 * `ON CONFLICT DO NOTHING`: a retried delivery inserts nothing and therefore
 * triggers nothing.
 */

export const conversationStatus = pgEnum("conversation_status", [
  "open",
  "resolved",
]);

/** `bot` — the assistant answers. `human` — staff have it; the bot is silent. */
export const conversationMode = pgEnum("conversation_mode", ["bot", "human"]);

export const messageDirection = pgEnum("message_direction", ["in", "out"]);

/**
 * Who wrote it. `echo` is a message a person sent from the WhatsApp Business
 * phone app (coexistence only) — it arrives as a webhook, not through us.
 */
export const messageAuthor = pgEnum("message_author", [
  "customer",
  "bot",
  "staff",
  "echo",
]);

export const messageStatus = pgEnum("message_status", [
  "received",
  "sent",
  "delivered",
  "read",
  "failed",
]);

export const callbackStatus = pgEnum("callback_status", ["requested", "done"]);

export const contacts = pgTable("contacts", {
  id: uuid("id").primaryKey().defaultRandom(),
  /** The customer's WhatsApp id — their number in international form, no "+". */
  waId: text("wa_id").notNull().unique(),
  profileName: text("profile_name"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const conversations = pgTable(
  "conversations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    contactId: uuid("contact_id")
      .notNull()
      .unique()
      .references(() => contacts.id, { onDelete: "cascade" }),
    status: conversationStatus("status").notNull().default("open"),
    mode: conversationMode("mode").notNull().default("bot"),
    /** Clerk user id of whoever took it over, if anyone. */
    assignedTo: text("assigned_to"),
    /** Drives the 24-hour free-reply window. Null until the customer writes. */
    lastInboundAt: timestamp("last_inbound_at", { withTimezone: true }),
    lastMessageAt: timestamp("last_message_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    unreadCount: integer("unread_count").notNull().default(0),
    /** Throttles email alerts to one per conversation per 15 minutes. */
    lastAlertedAt: timestamp("last_alerted_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("conversations_last_message_idx").on(t.lastMessageAt)],
);

export const messages = pgTable(
  "messages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    conversationId: uuid("conversation_id")
      .notNull()
      .references(() => conversations.id, { onDelete: "cascade" }),
    direction: messageDirection("direction").notNull(),
    author: messageAuthor("author").notNull(),
    /** "text" for v1; anything else is stored as "unsupported" with no body. */
    type: text("type").notNull(),
    body: text("body"),
    /** WhatsApp's own id. Unique: this is what makes webhook retries harmless.
     *  Null only for an outbound message that failed before WhatsApp took it. */
    providerMessageId: text("provider_message_id").unique(),
    status: messageStatus("status").notNull(),
    error: text("error"),
    /** Clerk user id for staff messages; null for customer, bot and echo. */
    sentBy: text("sent_by"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("messages_conversation_created_idx").on(t.conversationId, t.createdAt),
  ],
);

export const leads = pgTable("leads", {
  id: uuid("id").primaryKey().defaultRandom(),
  conversationId: uuid("conversation_id")
    .notNull()
    .references(() => conversations.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  company: text("company"),
  need: text("need").notNull(),
  email: text("email"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const callbacks = pgTable("callbacks", {
  id: uuid("id").primaryKey().defaultRandom(),
  conversationId: uuid("conversation_id")
    .notNull()
    .references(() => conversations.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  /** In the customer's own words — "tomorrow after 3pm". No calendar in v1. */
  preferredTimeText: text("preferred_time_text").notNull(),
  topic: text("topic").notNull(),
  status: callbackStatus("status").notNull().default("requested"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
