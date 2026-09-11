import { esc, sendEmail } from "@/lib/email";

/**
 * Staff email alerts.
 *
 * Sent only when a person is actually needed: a handoff, a lead, a call-back,
 * or a new message in a chat a person has taken over. A chat the assistant is
 * handling does not email anyone — alerting on every bot conversation would
 * train staff to ignore these within a day, which defeats the one that matters.
 *
 * Never throws and never blocks: every caller runs after the webhook has
 * already answered Meta, and a missing Resend key only means no email.
 */

const SITE = process.env.SITE_URL ?? "https://vamscore.com";
const INBOX = `${SITE}/portal/inbox`;
const to = () => process.env.WHATSAPP_ALERT_TO || undefined; // else CONTACT_TO_EMAIL

const who = (name: string | null, waId: string) =>
  name ? `${name} (+${waId})` : `+${waId}`;

function page(heading: string, rows: [string, string][], note?: string) {
  return [
    `<h2>${esc(heading)}</h2>`,
    `<table cellpadding="6" style="border-collapse:collapse">`,
    ...rows.map(
      ([k, v]) =>
        `<tr><td style="color:#666;vertical-align:top">${esc(k)}</td><td style="white-space:pre-wrap"><strong>${esc(v)}</strong></td></tr>`,
    ),
    `</table>`,
    note ? `<p>${esc(note)}</p>` : "",
    `<p><a href="${INBOX}">Open the WhatsApp inbox</a></p>`,
  ].join("");
}

async function send(subject: string, html: string) {
  const result = await sendEmail({ to: to(), subject, html });
  if (!result.ok && result.reason === "unconfigured") {
    console.warn(`WhatsApp alert not emailed (Resend not configured): ${subject}`);
  }
}

export function alertNewMessage(c: { name: string | null; waId: string; preview: string }) {
  return send(
    `WhatsApp: new message from ${who(c.name, c.waId)}`,
    page("New WhatsApp message", [["From", who(c.name, c.waId)], ["Message", c.preview]]),
  );
}

export function alertHandoff(c: { name: string | null; waId: string; reason: string }) {
  return send(
    `WhatsApp: ${who(c.name, c.waId)} needs a person`,
    page(
      "The assistant handed a conversation to the team",
      [["Customer", who(c.name, c.waId)], ["Why", c.reason]],
      "The assistant has stopped replying in this chat. Reply from the inbox.",
    ),
  );
}

export function alertLead(c: {
  waId: string;
  lead: { name: string; need: string; company: string | null; email: string | null };
}) {
  return send(`WhatsApp lead: ${c.lead.name}`, page("New lead from WhatsApp", [
    ["Name", c.lead.name],
    ["WhatsApp", `+${c.waId}`],
    ["Company", c.lead.company ?? "—"],
    ["Email", c.lead.email ?? "—"],
    ["Needs", c.lead.need],
  ]));
}

export function alertCallback(c: {
  waId: string;
  callback: { name: string; preferredTimeText: string; topic: string };
}) {
  return send(`WhatsApp call-back request: ${c.callback.name}`, page("Call-back requested", [
    ["Name", c.callback.name],
    ["Call", `+${c.waId}`],
    ["When", c.callback.preferredTimeText],
    ["About", c.callback.topic],
  ], "The time is in the customer's own words — confirm it with them."));
}
