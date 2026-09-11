import type Anthropic from "@anthropic-ai/sdk";

/**
 * The three things the assistant can do besides talk.
 *
 * `strict: true` makes the API guarantee the arguments match the schema, but the
 * handlers still re-validate: the schema bounds shape, not content, and these
 * values end up in the database and in staff emails. Defence in depth costs a
 * few lines.
 *
 * None of them takes a phone number. The conversation's own WhatsApp number is
 * supplied by the server, so nothing the customer types can point a tool at
 * somebody else.
 *
 * The array order is fixed: tool definitions sit at the very front of the
 * cached prompt prefix, so reordering them is a cache miss for everyone.
 */

export const TOOLS: Anthropic.Beta.BetaTool[] = [
  {
    name: "save_lead",
    description:
      "Record a sales lead for the Vamscore team to follow up. Use when the customer wants Vamscore to contact them about work. Collect their name and what they need before calling.",
    strict: true,
    input_schema: {
      type: "object",
      properties: {
        name: { type: "string", description: "The customer's name." },
        need: {
          type: "string",
          description: "What they need, in a sentence or two, in their words.",
        },
        company: { type: "string", description: "Their company, if they gave one." },
        email: { type: "string", description: "Their email, if they gave one." },
      },
      required: ["name", "need"],
      additionalProperties: false,
    },
  },
  {
    name: "request_callback",
    description:
      "Record a request for a phone call back from the Vamscore team. Use when the customer asks to be called. Collect a name and a preferred time first.",
    strict: true,
    input_schema: {
      type: "object",
      properties: {
        name: { type: "string", description: "The customer's name." },
        preferred_time_text: {
          type: "string",
          description: "When they would like the call, in their own words, e.g. 'tomorrow after 3pm'.",
        },
        topic: { type: "string", description: "What the call is about." },
      },
      required: ["name", "preferred_time_text", "topic"],
      additionalProperties: false,
    },
  },
  {
    name: "handoff_to_human",
    description:
      "Pass the conversation to a Vamscore staff member. Use when the customer asks for a person, is unhappy, or you cannot help. After this you stop replying in this conversation.",
    strict: true,
    input_schema: {
      type: "object",
      properties: {
        reason: { type: "string", description: "Why a person is needed, for the staff member." },
      },
      required: ["reason"],
      additionalProperties: false,
    },
  },
];

type Valid<T> = { ok: true; value: T } | { ok: false; error: string };
type Obj = Record<string, unknown>;

const field = (o: Obj, key: string, max: number) => {
  const v = o[key];
  return typeof v === "string" ? v.trim().slice(0, max) : "";
};
const asObj = (input: unknown): Obj =>
  typeof input === "object" && input !== null ? (input as Obj) : {};
// Deliberately loose: the only address that matters is one that can receive mail.
const EMAIL = /^[^@\s]+@[^@\s.]+\.[^@\s]+$/;

export type Lead = { name: string; need: string; company: string | null; email: string | null };

export function validateLead(input: unknown): Valid<Lead> {
  const o = asObj(input);
  const name = field(o, "name", 100);
  const need = field(o, "need", 1000);
  const company = field(o, "company", 200) || null;
  const email = field(o, "email", 200) || null;
  if (!name) return { ok: false, error: "A name is needed before saving the lead." };
  if (!need) return { ok: false, error: "What the customer needs is required." };
  if (email && !EMAIL.test(email)) {
    return { ok: false, error: "That email address doesn't look right — ask the customer to check it, or save without it." };
  }
  return { ok: true, value: { name, need, company, email } };
}

export type Callback = { name: string; preferredTimeText: string; topic: string };

export function validateCallback(input: unknown): Valid<Callback> {
  const o = asObj(input);
  const name = field(o, "name", 100);
  const preferredTimeText = field(o, "preferred_time_text", 200);
  const topic = field(o, "topic", 300);
  if (!name) return { ok: false, error: "A name is needed before booking the call-back." };
  if (!preferredTimeText) return { ok: false, error: "Ask when they would like the call." };
  if (!topic) return { ok: false, error: "Ask what the call is about." };
  return { ok: true, value: { name, preferredTimeText, topic } };
}

export function validateHandoff(input: unknown): Valid<{ reason: string }> {
  const reason = field(asObj(input), "reason", 500) || "Customer asked for a person.";
  return { ok: true, value: { reason } };
}
