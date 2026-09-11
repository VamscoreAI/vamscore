import { safeEqual } from "./meta";
import type { WhatsAppProvider } from "./provider";

/**
 * 360dialog — only needed if Vamscore keeps its number on the WhatsApp
 * Business phone app *and* the dashboard ("coexistence"), which Meta allows
 * only through a Solution Partner.
 *
 * Same Cloud API payloads as Meta; different endpoint and an API-key header
 * instead of a bearer token.
 *
 * **Webhook authenticity.** Unlike Meta, 360dialog does not document an HMAC
 * signature we can verify. So the webhook URL registered with 360dialog carries
 * a long random secret — `…/api/whatsapp/webhook?token=<WHATSAPP_WEBHOOK_SECRET>`
 * — and a request without it is refused. Weaker than a signature (the URL is
 * the secret, so keep it out of logs and screenshots), which is one reason the
 * direct Meta route is the default. Re-check 360dialog's docs before enabling;
 * if they have added signing, verify that instead.
 */

const ENDPOINT = "https://waba-v2.360dialog.io/messages";

export function create360dialogProvider(env: {
  apiKey: string;
  webhookSecret: string;
}): WhatsAppProvider {
  return {
    name: "360dialog",

    async sendText(to, body) {
      const res = await fetch(ENDPOINT, {
        method: "POST",
        headers: {
          "D360-API-KEY": env.apiKey,
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

    verifyRequest(request) {
      const token = new URL(request.url).searchParams.get("token") ?? "";
      return Boolean(env.webhookSecret) && safeEqual(token, env.webhookSecret);
    },

    // 360dialog registers webhooks through its own API; there is no handshake.
    verifyHandshake() {
      return null;
    },
  };
}
