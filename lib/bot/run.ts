import Anthropic from "@anthropic-ai/sdk";
import { db, schema } from "@/lib/db";
import { alertCallback, alertHandoff, alertLead } from "@/lib/whatsapp/alerts";
import {
  botRepliesSince,
  getConversation,
  latestInboundId,
  recentMessages,
  sendAndRecord,
  setMode,
} from "@/lib/whatsapp/store";
import { runLoop, type ToolOutcome } from "./loop";
import { HANDOFF_TEXT, SYSTEM_PROMPT } from "./prompt";
import { TOOLS, validateCallback, validateHandoff, validateLead } from "./tools";

/**
 * Runs the assistant for one conversation, after the webhook has answered.
 *
 * Model: Claude Opus 5 at low effort — chat-shaped traffic does well at low,
 * and it keeps replies quick. Switching to a cheaper model is this one constant
 * (re-run the eval when you do; Haiku 4.5 also needs a different thinking
 * config and a ≥4,096-token prefix to cache).
 *
 * Refusal fallbacks are on (`fallbacks: "default"`): if Opus declines a message
 * the API retries it on a fallback model in the same call. If the whole chain
 * declines, `runLoop` hands the chat to a person.
 *
 * Caching: the system prompt — instructions plus all of Vamscore's knowledge —
 * is identical on every request and cached for an hour, because WhatsApp
 * traffic comes in bursts separated by long quiet stretches that would outlast
 * the 5-minute default. The conversation tail gets the 5-minute automatic
 * cache, which covers the loop's second call and quick back-and-forth.
 */

export const BOT_MODEL = "claude-opus-5";
/** A spammer can't run up the bill: past this, the chat goes to a person. */
const MAX_BOT_REPLIES_PER_HOUR = 20;

export function isBotConfigured() {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

let client: Anthropic | null = null;
const anthropic = () => (client ??= new Anthropic());

type Param = Anthropic.Beta.BetaMessageParam;

/** Stored messages → model turns. Customer is `user`; bot, staff and echo are `assistant`. */
function toHistory(rows: Awaited<ReturnType<typeof recentMessages>>): Param[] {
  const turns: Param[] = rows
    .map((r): Param => {
      const fromCustomer = r.author === "customer";
      const content =
        r.type === "text"
          ? (r.body ?? "").trim()
          : fromCustomer
            ? `[The customer sent a ${r.body ?? "file"}, which this assistant cannot open.]`
            : "[A file was sent.]";
      return { role: fromCustomer ? "user" : "assistant", content };
    })
    .filter((t) => typeof t.content === "string" && t.content.length > 0);
  // The API requires the first turn to be the user's.
  while (turns.length && turns[0].role !== "user") turns.shift();
  return turns;
}

async function handOff(
  conv: { id: string; waId: string; name: string | null },
  reason: string,
  alreadySwitched: boolean,
) {
  if (!alreadySwitched) await setMode(conv.id, "human");
  await sendAndRecord({ conversationId: conv.id, to: conv.waId, body: HANDOFF_TEXT, author: "bot" });
  await alertHandoff({ name: conv.name, waId: conv.waId, reason });
}

export async function runBot(conversationId: string, triggerMessageId: string) {
  const conv = await getConversation(conversationId);
  if (!conv || conv.mode !== "bot") return;

  // Several messages in a burst each start a run. Only the run for the newest
  // one answers — it sees the whole burst — so the customer gets one reply,
  // not three in a random order.
  if ((await latestInboundId(conversationId)) !== triggerMessageId) return;

  const since = new Date(Date.now() - 60 * 60 * 1000);
  if ((await botRepliesSince(conversationId, since)) >= MAX_BOT_REPLIES_PER_HOUR) {
    await handOff(conv, "Reply limit reached for this hour.", false);
    return;
  }

  const executeTool = async (name: string, input: unknown): Promise<ToolOutcome> => {
    if (name === "save_lead") {
      const v = validateLead(input);
      if (!v.ok) return { content: v.error, isError: true };
      await db().insert(schema.leads).values({ conversationId, ...v.value });
      await alertLead({ waId: conv.waId, lead: v.value });
      return { content: "Saved. The Vamscore team will follow up." };
    }
    if (name === "request_callback") {
      const v = validateCallback(input);
      if (!v.ok) return { content: v.error, isError: true };
      await db().insert(schema.callbacks).values({ conversationId, ...v.value });
      await alertCallback({ waId: conv.waId, callback: v.value });
      return { content: "Call-back request recorded. The team will confirm the time." };
    }
    if (name === "handoff_to_human") {
      const v = validateHandoff(input);
      const reason = v.ok ? v.value.reason : "Customer asked for a person.";
      await setMode(conversationId, "human");
      return { content: reason, handedOff: true };
    }
    return { content: `Unknown tool: ${name}`, isError: true };
  };

  const callModel = (messages: Param[]) =>
    anthropic().beta.messages.create({
      model: BOT_MODEL,
      max_tokens: 16000,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      output_config: { effort: "low" },
      cache_control: { type: "ephemeral" },
      system: [
        { type: "text", text: SYSTEM_PROMPT, cache_control: { type: "ephemeral", ttl: "1h" } },
      ],
      tools: TOOLS,
      messages,
    });

  let result;
  try {
    const history = toHistory(await recentMessages(conversationId));
    if (!history.length) return;
    result = await runLoop(history, callModel, executeTool);
  } catch (error) {
    // Claude unreachable, rate-limited, or misconfigured: a person takes over
    // rather than the customer hearing nothing.
    const detail =
      error instanceof Anthropic.APIError ? `API error ${error.status}` : "unexpected error";
    console.error("WhatsApp assistant failed", error);
    await handOff(conv, `The assistant is unavailable (${detail}).`, false);
    return;
  }

  // Re-check before acting — staff may have taken over, or the customer may
  // have written again, while the model was thinking.
  const now = await getConversation(conversationId);
  if (!now) return;

  if (result.kind === "handoff") {
    // A handoff always completes, even if a newer message has arrived: that
    // newer message's own run will see "human" and stand down, so skipping here
    // would leave the customer with no reply and staff with no alert.
    // The one exception is staff taking over mid-run on their own — then a
    // person already has it and "passing you to the team" would be wrong.
    const staffAlreadyHaveIt = now.mode === "human" && !result.alreadyHandedOff;
    if (!staffAlreadyHaveIt) await handOff(conv, result.reason, result.alreadyHandedOff);
    return;
  }

  // A normal reply is dropped if staff took over, or if a newer message will
  // start its own run that answers the whole burst.
  if (now.mode !== "bot") return;
  if ((await latestInboundId(conversationId)) !== triggerMessageId) return;
  await sendAndRecord({ conversationId, to: conv.waId, body: result.text, author: "bot" });
}
