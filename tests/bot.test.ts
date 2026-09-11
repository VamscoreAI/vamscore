import type Anthropic from "@anthropic-ai/sdk";
import { describe, expect, it, vi } from "vitest";
import { buildKnowledge, KNOWLEDGE, PLACEHOLDER } from "@/lib/bot/knowledge";
import { MAX_ITERATIONS, runLoop, type ToolOutcome } from "@/lib/bot/loop";
import { SYSTEM_PROMPT } from "@/lib/bot/prompt";
import { TOOLS, validateCallback, validateLead } from "@/lib/bot/tools";

describe("knowledge", () => {
  it("never contains a [placeholder]", () => {
    expect(KNOWLEDGE).not.toMatch(PLACEHOLDER);
    expect(KNOWLEDGE).not.toContain("[");
    expect(SYSTEM_PROMPT).not.toMatch(PLACEHOLDER);
  });

  it("is byte-identical on every build, so the prompt cache holds", () => {
    expect(buildKnowledge()).toBe(KNOWLEDGE);
    expect(buildKnowledge()).toBe(buildKnowledge());
  });

  it("carries the real facts and none of the placeholder roles", () => {
    expect(KNOWLEDGE).toContain("+91 94907 29484");
    expect(KNOWLEDGE).toContain("Business process outsourcing");
    expect(KNOWLEDGE).toContain("Tata");
    expect(KNOWLEDGE).not.toContain("Role title");
    expect(KNOWLEDGE).toContain("No specific openings are listed");
  });
});

describe("tool definitions", () => {
  it("are strict, closed and require only declared fields", () => {
    for (const tool of TOOLS) {
      expect(tool.strict).toBe(true);
      const schema = tool.input_schema as unknown as {
        properties: Record<string, unknown>;
        required: string[];
        additionalProperties: boolean;
      };
      expect(schema.additionalProperties).toBe(false);
      for (const r of schema.required) expect(schema.properties).toHaveProperty(r);
      // No tool may take a phone number: the server supplies the recipient.
      expect(Object.keys(schema.properties).join(" ")).not.toMatch(/phone|number|to\b|wa_id/i);
    }
  });
});

describe("validateLead", () => {
  it("requires a name and a need", () => {
    expect(validateLead({ need: "x" }).ok).toBe(false);
    expect(validateLead({ name: "Asha" }).ok).toBe(false);
  });

  it("rejects an email that can't receive mail, but allows none", () => {
    expect(validateLead({ name: "Asha", need: "BPO", email: "not-an-email" }).ok).toBe(false);
    expect(validateLead({ name: "Asha", need: "BPO" })).toEqual({
      ok: true,
      value: { name: "Asha", need: "BPO", company: null, email: null },
    });
  });

  it("trims and caps field lengths", () => {
    const v = validateLead({ name: `  ${"a".repeat(500)}  `, need: " help " });
    expect(v.ok && v.value.name.length).toBe(100);
    expect(v.ok && v.value.need).toBe("help");
  });
});

describe("validateCallback", () => {
  it("needs a name, a time and a topic", () => {
    expect(validateCallback({ name: "Asha", topic: "BPO" }).ok).toBe(false);
    expect(validateCallback({ name: "Asha", preferred_time_text: "tomorrow 3pm", topic: "BPO" }).ok).toBe(true);
  });
});

/* ---- the tool loop ------------------------------------------------------- */

type Block =
  | { type: "text"; text: string }
  | { type: "tool_use"; id: string; name: string; input: unknown };

const reply = (stop_reason: string, content: Block[]) =>
  ({
    id: "msg",
    type: "message",
    role: "assistant",
    model: "claude-opus-5",
    stop_reason,
    stop_sequence: null,
    content: content.map((b) => (b.type === "text" ? { ...b, citations: null } : b)),
    usage: { input_tokens: 0, output_tokens: 0 },
  }) as unknown as Anthropic.Beta.BetaMessage;

const history: Anthropic.Beta.BetaMessageParam[] = [{ role: "user", content: "Hi" }];
const noTools = async (): Promise<ToolOutcome> => ({ content: "unused" });

describe("runLoop", () => {
  it("returns the model's text as the reply", async () => {
    const call = vi.fn().mockResolvedValue(reply("end_turn", [{ type: "text", text: "Hello!" }]));
    expect(await runLoop(history, call, noTools)).toEqual({ kind: "reply", text: "Hello!" });
    expect(call).toHaveBeenCalledTimes(1);
  });

  it("runs a tool, returns its result to the model, then replies", async () => {
    const call = vi
      .fn()
      .mockResolvedValueOnce(
        reply("tool_use", [{ type: "tool_use", id: "t1", name: "save_lead", input: { name: "Asha", need: "BPO" } }]),
      )
      .mockResolvedValueOnce(reply("end_turn", [{ type: "text", text: "Saved — the team will be in touch." }]));
    const exec = vi.fn().mockResolvedValue({ content: "Saved." });

    const result = await runLoop(history, call, exec);

    expect(exec).toHaveBeenCalledWith("save_lead", { name: "Asha", need: "BPO" });
    const secondCall = call.mock.calls[1][0] as Anthropic.Beta.BetaMessageParam[];
    expect(secondCall.at(-1)).toEqual({
      role: "user",
      content: [{ type: "tool_result", tool_use_id: "t1", content: "Saved." }],
    });
    expect(result).toEqual({ kind: "reply", text: "Saved — the team will be in touch." });
  });

  it("marks failed tool results as errors so the model can recover", async () => {
    const call = vi
      .fn()
      .mockResolvedValueOnce(reply("tool_use", [{ type: "tool_use", id: "t1", name: "save_lead", input: {} }]))
      .mockResolvedValueOnce(reply("end_turn", [{ type: "text", text: "What's your name?" }]));
    await runLoop(history, call, async () => ({ content: "Name needed.", isError: true }));
    const last = (call.mock.calls[1][0] as Anthropic.Beta.BetaMessageParam[]).at(-1);
    expect(last).toMatchObject({ content: [{ is_error: true }] });
  });

  it("stops immediately when the handoff tool runs", async () => {
    const call = vi
      .fn()
      .mockResolvedValue(
        reply("tool_use", [{ type: "tool_use", id: "h", name: "handoff_to_human", input: { reason: "wants a person" } }]),
      );
    const result = await runLoop(history, call, async () => ({ content: "wants a person", handedOff: true }));
    expect(result).toEqual({ kind: "handoff", reason: "wants a person", alreadyHandedOff: true });
    expect(call).toHaveBeenCalledTimes(1);
  });

  it("hands off after the iteration cap instead of looping forever", async () => {
    const call = vi
      .fn()
      .mockResolvedValue(reply("tool_use", [{ type: "tool_use", id: "x", name: "save_lead", input: {} }]));
    const result = await runLoop(history, call, async () => ({ content: "again", isError: true }));
    expect(call).toHaveBeenCalledTimes(MAX_ITERATIONS);
    expect(result).toMatchObject({ kind: "handoff", alreadyHandedOff: false });
  });

  it("hands off on a refusal, a truncated reply, or an empty one", async () => {
    for (const [stop, blocks] of [
      ["refusal", []],
      ["max_tokens", [{ type: "text", text: "Half a sen" }]],
      ["end_turn", [{ type: "text", text: "   " }]],
    ] as [string, Block[]][]) {
      const result = await runLoop(history, vi.fn().mockResolvedValue(reply(stop, blocks)), noTools);
      expect(result).toMatchObject({ kind: "handoff", alreadyHandedOff: false });
    }
  });
});
