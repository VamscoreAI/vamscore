import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";
import { createMetaProvider, verifyMetaSignature } from "@/lib/whatsapp/meta";
import { parseWebhook } from "@/lib/whatsapp/parse";
import { formatNumber, whatsappChatUrl, whatsappContactRow } from "@/lib/whatsapp/links";
import { splitForWhatsApp } from "@/lib/whatsapp/text";
import { WINDOW_MS, windowState } from "@/lib/whatsapp/window";

const SECRET = "test-app-secret";
const sign = (body: string) =>
  "sha256=" + createHmac("sha256", SECRET).update(body, "utf8").digest("hex");

describe("verifyMetaSignature", () => {
  const body = JSON.stringify({ object: "whatsapp_business_account", entry: [] });

  it("accepts a body signed with the app secret", () => {
    expect(verifyMetaSignature(body, sign(body), SECRET)).toBe(true);
  });

  it("rejects the same signature once one byte of the body changes", () => {
    const tampered = body.replace("entry", "entrz");
    expect(tampered).not.toBe(body);
    expect(verifyMetaSignature(tampered, sign(body), SECRET)).toBe(false);
  });

  it("rejects a signature made with a different secret", () => {
    const forged = "sha256=" + createHmac("sha256", "wrong").update(body).digest("hex");
    expect(verifyMetaSignature(body, forged, SECRET)).toBe(false);
  });

  it("rejects missing, malformed or wrong-algorithm headers", () => {
    expect(verifyMetaSignature(body, null, SECRET)).toBe(false);
    expect(verifyMetaSignature(body, "abc", SECRET)).toBe(false);
    expect(verifyMetaSignature(body, sign(body).replace("sha256=", "sha1="), SECRET)).toBe(false);
  });

  it("rejects everything when the secret is empty", () => {
    expect(verifyMetaSignature(body, sign(body), "")).toBe(false);
  });
});

describe("Meta webhook handshake", () => {
  const provider = createMetaProvider({
    phoneNumberId: "1",
    accessToken: "t",
    appSecret: SECRET,
    verifyToken: "verify-me",
  });
  const url = (q: string) => new URL(`https://vamscore.com/api/whatsapp/webhook?${q}`);

  it("echoes the challenge for the right token", () => {
    expect(
      provider.verifyHandshake(url("hub.mode=subscribe&hub.verify_token=verify-me&hub.challenge=12345")),
    ).toBe("12345");
  });

  it("refuses a wrong token or mode", () => {
    expect(provider.verifyHandshake(url("hub.mode=subscribe&hub.verify_token=nope&hub.challenge=1"))).toBeNull();
    expect(provider.verifyHandshake(url("hub.mode=other&hub.verify_token=verify-me&hub.challenge=1"))).toBeNull();
  });
});

// Shapes follow Meta's documented Cloud API webhook payloads.
const inbound = {
  object: "whatsapp_business_account",
  entry: [
    {
      id: "WABA_ID",
      changes: [
        {
          field: "messages",
          value: {
            messaging_product: "whatsapp",
            metadata: { display_phone_number: "15550001111", phone_number_id: "PNID" },
            contacts: [{ profile: { name: "Asha" }, wa_id: "919876543210" }],
            messages: [
              { from: "919876543210", id: "wamid.A", timestamp: "1757570000", type: "text", text: { body: "Do you do BPO?" } },
              { from: "919876543210", id: "wamid.B", timestamp: "1757570010", type: "image", image: { id: "IMG", mime_type: "image/jpeg" } },
              { from: "919876543210", timestamp: "1757570020", type: "text", text: { body: "no id" } },
            ],
          },
        },
      ],
    },
  ],
};

const statuses = {
  object: "whatsapp_business_account",
  entry: [
    {
      id: "WABA_ID",
      changes: [
        {
          field: "messages",
          value: {
            messaging_product: "whatsapp",
            statuses: [
              { id: "wamid.OUT1", status: "read", timestamp: "1757570100", recipient_id: "919876543210" },
              {
                id: "wamid.OUT2",
                status: "failed",
                timestamp: "1757570101",
                errors: [{ code: 131047, title: "Re-engagement message" }],
              },
              { id: "wamid.OUT3", status: "something-new", timestamp: "1757570102" },
            ],
          },
        },
      ],
    },
  ],
};

const echo = {
  object: "whatsapp_business_account",
  entry: [
    {
      id: "102290129340398",
      changes: [
        {
          field: "smb_message_echoes",
          value: {
            messaging_product: "whatsapp",
            metadata: { display_phone_number: "15550783881", phone_number_id: "106540352242922" },
            message_echoes: [
              {
                from: "15550783881",
                to: "16505551234",
                id: "wamid.ECHO",
                timestamp: "1700255121",
                type: "text",
                text: { body: "Here's the info you requested!" },
              },
            ],
          },
        },
      ],
    },
  ],
};

describe("parseWebhook", () => {
  it("reads text messages with the sender's profile name", () => {
    const [first] = parseWebhook(inbound);
    expect(first).toEqual({
      kind: "message",
      providerMessageId: "wamid.A",
      from: "919876543210",
      profileName: "Asha",
      type: "text",
      body: "Do you do BPO?",
      originalType: "text",
      timestamp: new Date(1757570000 * 1000),
    });
  });

  it("records non-text messages as unsupported and skips ones with no id", () => {
    const events = parseWebhook(inbound);
    expect(events).toHaveLength(2);
    expect(events[1]).toMatchObject({ kind: "message", type: "unsupported", body: "image", originalType: "image" });
  });

  it("reads delivery statuses and failure reasons, ignoring unknown statuses", () => {
    const events = parseWebhook(statuses);
    expect(events).toEqual([
      { kind: "status", providerMessageId: "wamid.OUT1", status: "read", error: null, timestamp: new Date(1757570100 * 1000) },
      { kind: "status", providerMessageId: "wamid.OUT2", status: "failed", error: "Re-engagement message", timestamp: new Date(1757570101 * 1000) },
    ]);
  });

  it("reads coexistence echoes from the phone app", () => {
    expect(parseWebhook(echo)).toEqual([
      {
        kind: "echo",
        providerMessageId: "wamid.ECHO",
        to: "16505551234",
        type: "text",
        body: "Here's the info you requested!",
        originalType: "text",
        timestamp: new Date(1700255121 * 1000),
      },
    ]);
  });

  it("returns nothing for malformed input instead of throwing", () => {
    expect(parseWebhook(null)).toEqual([]);
    expect(parseWebhook("nope")).toEqual([]);
    expect(parseWebhook({ entry: [null, 3, { changes: [null, { field: "messages", value: 7 }] }] })).toEqual([]);
  });
});

describe("windowState", () => {
  const last = new Date("2026-09-10T10:00:00Z");
  const at = (ms: number) => new Date(last.getTime() + ms);

  it("is open one second before 24 hours", () => {
    const s = windowState(last, at(WINDOW_MS - 1000));
    expect(s.open).toBe(true);
    expect(s.msLeft).toBe(1000);
  });

  it("is closed at exactly 24 hours and after", () => {
    expect(windowState(last, at(WINDOW_MS)).open).toBe(false);
    expect(windowState(last, at(WINDOW_MS + 1000)).open).toBe(false);
  });

  it("is closed when the customer has never written", () => {
    expect(windowState(null)).toEqual({ open: false, msLeft: 0 });
  });

  it("accepts ISO strings, as the dashboard receives them", () => {
    expect(windowState(last.toISOString(), at(60_000)).open).toBe(true);
  });
});

describe("public WhatsApp links", () => {
  it("formats an Indian mobile the way people write it", () => {
    expect(formatNumber("919490729484")).toBe("+91 94907 29484");
    expect(formatNumber("15550001111")).toBe("+15550001111");
  });

  it("opens a chat with Vamscore's number and the message pre-typed", () => {
    const url = new URL(whatsappChatUrl()!);
    expect(url.origin).toBe("https://wa.me");
    expect(url.pathname).toBe("/919490729484");
    expect(url.searchParams.get("text")).toBe("Hi Vamscore, I'd like to talk about working with you.");
  });

  it("encodes the pre-typed message, so it cannot break the link", () => {
    const url = new URL(whatsappChatUrl("Hi & hello? #1")!);
    expect(url.searchParams.get("text")).toBe("Hi & hello? #1");
  });

  it("gives the contact page one WhatsApp row", () => {
    expect(whatsappContactRow()).toEqual([
      {
        label: "WhatsApp",
        value: "+91 94907 29484",
        href: "https://wa.me/919490729484?text=Hi%20Vamscore%2C%20I'd%20like%20to%20talk%20about%20working%20with%20you.",
      },
    ]);
  });
});

describe("splitForWhatsApp", () => {
  it("leaves short text alone", () => {
    expect(splitForWhatsApp("  hello  ")).toEqual(["hello"]);
    expect(splitForWhatsApp("   ")).toEqual([]);
  });

  it("splits long text into parts under the limit, at line breaks first", () => {
    const para = "word ".repeat(150).trim(); // ~750 chars
    const text = Array.from({ length: 8 }, () => para).join("\n");
    const parts = splitForWhatsApp(text, 1000);
    expect(parts.length).toBeGreaterThan(1);
    for (const p of parts) expect(p.length).toBeLessThanOrEqual(1000);
    expect(parts.join(" ").replace(/\s+/g, " ")).toBe(text.replace(/\s+/g, " "));
  });
});
