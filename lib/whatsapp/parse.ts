import type { WhatsAppEvent } from "./provider";

/**
 * Turns a Cloud API webhook body into a flat list of events.
 *
 * Shared by both providers: 360dialog forwards Meta's payloads unchanged. The
 * shapes are Meta's documented ones —
 *
 *   entry[].changes[].field === "messages"
 *     value.contacts[]   { wa_id, profile.name }
 *     value.messages[]   { id, from, timestamp, type, text.body }
 *     value.statuses[]   { id, status, timestamp, errors[] }
 *
 *   entry[].changes[].field === "smb_message_echoes"   (coexistence only)
 *     value.message_echoes[]  { id, from, to, timestamp, type, text.body }
 *
 * **Defensive by design.** This parses attacker-reachable input that has only
 * been authenticated, not validated. Anything malformed is skipped rather than
 * thrown on: one bad entry must not stop the rest of a batched delivery from
 * being stored, and a throw here would return 500 and make Meta retry the whole
 * batch forever.
 */

type Json = Record<string, unknown>;

const isObj = (v: unknown): v is Json =>
  typeof v === "object" && v !== null && !Array.isArray(v);
const arr = (v: unknown): unknown[] => (Array.isArray(v) ? v : []);
const str = (v: unknown): string | null => (typeof v === "string" ? v : null);

/** WhatsApp timestamps are Unix seconds, as strings. Falls back to now. */
function time(v: unknown): Date {
  const n = Number(str(v));
  return Number.isFinite(n) && n > 0 ? new Date(n * 1000) : new Date();
}

/** v1 handles text; every other type is recorded but not shown in full. */
function content(m: Json): { type: "text" | "unsupported"; body: string; originalType: string } {
  const originalType = str(m.type) ?? "unknown";
  const text = isObj(m.text) ? str(m.text.body) : null;
  if (originalType === "text" && text !== null) {
    return { type: "text", body: text, originalType };
  }
  return { type: "unsupported", body: originalType, originalType };
}

const STATUSES = new Set(["sent", "delivered", "read", "failed"]);

export function parseWebhook(payload: unknown): WhatsAppEvent[] {
  const events: WhatsAppEvent[] = [];
  if (!isObj(payload)) return events;

  for (const entry of arr(payload.entry)) {
    if (!isObj(entry)) continue;
    for (const change of arr(entry.changes)) {
      if (!isObj(change) || !isObj(change.value)) continue;
      const value = change.value;

      if (change.field === "messages") {
        // Names come in a parallel `contacts` array, keyed by wa_id.
        const names = new Map<string, string>();
        for (const c of arr(value.contacts)) {
          if (!isObj(c)) continue;
          const id = str(c.wa_id);
          const name = isObj(c.profile) ? str(c.profile.name) : null;
          if (id && name) names.set(id, name);
        }

        for (const m of arr(value.messages)) {
          if (!isObj(m)) continue;
          const id = str(m.id);
          const from = str(m.from);
          if (!id || !from) continue;
          events.push({
            kind: "message",
            providerMessageId: id,
            from,
            profileName: names.get(from) ?? null,
            ...content(m),
            timestamp: time(m.timestamp),
          });
        }

        for (const s of arr(value.statuses)) {
          if (!isObj(s)) continue;
          const id = str(s.id);
          const status = str(s.status);
          if (!id || !status || !STATUSES.has(status)) continue;
          const firstError = arr(s.errors).find(isObj);
          events.push({
            kind: "status",
            providerMessageId: id,
            status: status as "sent" | "delivered" | "read" | "failed",
            error: firstError
              ? str(firstError.title) ?? str(firstError.message) ?? "Delivery failed"
              : null,
            timestamp: time(s.timestamp),
          });
        }
      }

      if (change.field === "smb_message_echoes") {
        for (const m of arr(value.message_echoes)) {
          if (!isObj(m)) continue;
          const id = str(m.id);
          const to = str(m.to);
          if (!id || !to) continue;
          events.push({
            kind: "echo",
            providerMessageId: id,
            to,
            ...content(m),
            timestamp: time(m.timestamp),
          });
        }
      }
    }
  }
  return events;
}
