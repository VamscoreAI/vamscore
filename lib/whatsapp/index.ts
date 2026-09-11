import { hasDatabase } from "@/lib/db";
import { create360dialogProvider } from "./dialog360";
import { createMetaProvider } from "./meta";
import type { ProviderName, WhatsAppProvider } from "./provider";

/**
 * Picks the provider from WHATSAPP_PROVIDER. This is where "which number, which
 * route" stops being a code question: the client's decision becomes a handful
 * of environment variables, nothing else.
 *
 * **Fails closed**, like `isAuthConfigured()` in `lib/auth.ts`. A half-set
 * configuration returns null here, and every WhatsApp route treats null as
 * "not connected" — it never limps along with, say, a send key but no webhook
 * verification.
 */

function readProvider(): WhatsAppProvider | null {
  const name = process.env.WHATSAPP_PROVIDER as ProviderName | undefined;

  if (name === "meta") {
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
    const appSecret = process.env.WHATSAPP_APP_SECRET;
    const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN;
    if (!phoneNumberId || !accessToken || !appSecret || !verifyToken) return null;
    return createMetaProvider({
      phoneNumberId,
      accessToken,
      appSecret,
      verifyToken,
      graphVersion: process.env.WHATSAPP_GRAPH_VERSION,
    });
  }

  if (name === "360dialog") {
    const apiKey = process.env.D360_API_KEY;
    const webhookSecret = process.env.WHATSAPP_WEBHOOK_SECRET;
    if (!apiKey || !webhookSecret) return null;
    return create360dialogProvider({ apiKey, webhookSecret });
  }

  return null;
}

let cached: WhatsAppProvider | null | undefined;

export function whatsapp(): WhatsAppProvider | null {
  if (cached === undefined) cached = readProvider();
  return cached;
}

/** Provider fully configured AND somewhere to store messages. */
export function isWhatsAppConfigured(): boolean {
  return whatsapp() !== null && hasDatabase();
}

export type { WhatsAppProvider } from "./provider";
