import type Anthropic from "@anthropic-ai/sdk";

/**
 * The assistant's tool loop, with no I/O of its own.
 *
 * The model call and the tool execution are injected, so the control flow —
 * which is where the hard guarantees live — is unit-tested without a network,
 * a database or a WhatsApp account. `run.ts` wires in the real ones.
 *
 * A manual loop rather than the SDK's Tool Runner, for two reasons that are
 * specific to this bot: a handoff must end the turn *immediately*, even if the
 * model would have kept going, and the loop needs a hard iteration cap that
 * turns into a handoff rather than an error.
 *
 * Every non-happy path ends in a handoff, never in silence: a customer who
 * gets no reply cannot tell a bug from being ignored.
 */

type Message = Anthropic.Beta.BetaMessage;
type Param = Anthropic.Beta.BetaMessageParam;

export type ToolOutcome = {
  /** Returned to the model as the tool result. */
  content: string;
  isError?: boolean;
  /** The tool handed the chat to a person: stop now. */
  handedOff?: boolean;
};

export type LoopResult =
  | { kind: "reply"; text: string }
  | {
      kind: "handoff";
      reason: string;
      /** True when the handoff tool already switched the chat to a person. */
      alreadyHandedOff: boolean;
    };

export const MAX_ITERATIONS = 3;

export async function runLoop(
  history: Param[],
  callModel: (messages: Param[]) => Promise<Message>,
  executeTool: (name: string, input: unknown) => Promise<ToolOutcome>,
  maxIterations = MAX_ITERATIONS,
): Promise<LoopResult> {
  const messages: Param[] = [...history];

  for (let i = 0; i < maxIterations; i++) {
    const response = await callModel(messages);

    // Checked before reading content. With `fallbacks: "default"` a decline has
    // already been retried on another model, so this is the whole chain saying no.
    if (response.stop_reason === "refusal") {
      return { kind: "handoff", reason: "The assistant declined to answer.", alreadyHandedOff: false };
    }

    if (response.stop_reason === "tool_use") {
      // The full content goes back, not just the tool calls: it carries the
      // thinking and any fallback blocks the next request needs.
      messages.push({ role: "assistant", content: response.content });

      const results: Anthropic.Beta.BetaToolResultBlockParam[] = [];
      let handoffReason: string | null = null;
      for (const block of response.content) {
        if (block.type !== "tool_use") continue;
        const outcome = await executeTool(block.name, block.input);
        results.push({
          type: "tool_result",
          tool_use_id: block.id,
          content: outcome.content,
          ...(outcome.isError ? { is_error: true } : {}),
        });
        if (outcome.handedOff) handoffReason = outcome.content;
      }

      if (handoffReason !== null) {
        return { kind: "handoff", reason: handoffReason, alreadyHandedOff: true };
      }
      messages.push({ role: "user", content: results });
      continue;
    }

    const text = response.content
      .filter((b): b is Anthropic.Beta.BetaTextBlock => b.type === "text")
      .map((b) => b.text)
      .join("")
      .trim();

    // A reply cut off by max_tokens, or an empty one, is not something to send.
    if (response.stop_reason === "max_tokens" || !text) {
      return { kind: "handoff", reason: "The assistant could not produce a reply.", alreadyHandedOff: false };
    }
    return { kind: "reply", text };
  }

  return {
    kind: "handoff",
    reason: `The assistant used ${maxIterations} steps without finishing.`,
    alreadyHandedOff: false,
  };
}
