import { createHmac, timingSafeEqual } from "node:crypto";
import type { WhatsAppProvider } from "./provider";

/**
 * Direct connection to Meta's WhatsApp Cloud API.
 *
 * Graph API version defaults to v26.0 (released 29 Jul 2026, the latest at the
 * time of writing) and can be pinned with WHATSAPP_GRAPH_VERSION. Meta keeps
 * each version for about two years, so this needs a deliberate bump roughly
 * every year rather than silently rotting.
 */

const GRAPH = "https://graph.facebook.com";
const DEFAULT_VERSION = "v26.0";

/** Constant-time string compare. Unequal lengths are simply unequal. */
export function safeEqual(a: string, b: string): boolean {
  const x = Buffer.from(a, "utf8");
  const y = Buffer.from(b, "utf8");
  return x.length === y.length && timingSafeEqual(x, y);
}

/**
 * Meta signs every webhook with `X-Hub-Signature-256: sha256=<hex>`, an
 * HMAC-SHA256 of the raw body keyed by the app secret. Exported for tests.
 */
export function verifyMetaSignature(
  rawBody: string,
  header: string | null,
  appSecret: string,
): boolean {
  if (!header || !header.startsWith("sha256=") || !appSecret) return false;
  const expected =
    "sha256=" + createHmac("sha256", appSecret).update(rawBody, "utf8").digest("hex");
  return safeEqual(header, expected);
}

export function createMetaProvider(env: {
  phoneNumberId: string;
  accessToken: string;
  appSecret: string;
  verifyToken: string;
  graphVersion?: string;
}): WhatsAppProvider {
  const version = env.graphVersion || DEFAULT_VERSION;

  return {
    name: "meta",

    async sendText(to, body) {
      const res = await fetch(`${GRAPH}/${version}/${env.phoneNumberId}/messages`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to,
          type: "text",
          text: { body, preview_url: false },
        }),
      });
      const json = (await res.json().catch(() => null)) as
        | { messages?: { id?: string }[]; error?: { message?: string } }
        | null;
      const id = json?.messages?.[0]?.id;
      if (!res.ok || !id) {
        throw new Error(json?.error?.message ?? `WhatsApp send failed (${res.status})`);
      }
      return { id };
    },

    verifyRequest(request, rawBody) {
      return verifyMetaSignature(
        rawBody,
        request.headers.get("x-hub-signature-256"),
        env.appSecret,
      );
    },

    verifyHandshake(url) {
      const mode = url.searchParams.get("hub.mode");
      const token = url.searchParams.get("hub.verify_token") ?? "";
      const challenge = url.searchParams.get("hub.challenge");
      if (mode !== "subscribe" || !challenge || !env.verifyToken) return null;
      return safeEqual(token, env.verifyToken) ? challenge : null;
    },
  };
}
