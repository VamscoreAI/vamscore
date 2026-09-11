/**
 * The seam that keeps the number decision a configuration change.
 *
 * Whether Vamscore connects directly to Meta or through a Solution Partner
 * (360dialog, for keeping the number on the phone app as well), the payloads
 * are Meta's Cloud API format. Only three things differ, and they are exactly
 * what this interface covers: where to send, how to authenticate, and how to
 * tell a genuine webhook from a forged one. Parsing is shared — see `parse.ts`.
 */

export type ProviderName = "meta" | "360dialog";

export interface WhatsAppProvider {
  readonly name: ProviderName;

  /** Sends a free-form text message. Resolves with WhatsApp's message id. */
  sendText(to: string, body: string): Promise<{ id: string }>;

  /**
   * True only for a request that genuinely came from the provider. Receives the
   * raw body because a signature is computed over the exact bytes sent —
   * re-serialising parsed JSON would change them.
   */
  verifyRequest(request: { headers: Headers; url: string }, rawBody: string): boolean;

  /**
   * Meta's one-time webhook subscription handshake. Returns the challenge to
   * echo back, or null to refuse. Providers without a handshake return null.
   */
  verifyHandshake(url: URL): string | null;
}

/** A message as the rest of the app sees it, whichever provider carried it. */
export type InboundMessage = {
  kind: "message";
  providerMessageId: string;
  /** Customer's WhatsApp id (their number, no "+"). */
  from: string;
  profileName: string | null;
  /** "text", or "unsupported" for anything v1 does not handle. */
  type: "text" | "unsupported";
  /** Text body; for unsupported types, the original WhatsApp type name. */
  body: string;
  originalType: string;
  timestamp: Date;
};

/** Delivery progress for a message we sent. */
export type StatusUpdate = {
  kind: "status";
  providerMessageId: string;
  status: "sent" | "delivered" | "read" | "failed";
  error: string | null;
  timestamp: Date;
};

/** A message someone sent from the WhatsApp Business phone app (coexistence). */
export type EchoMessage = {
  kind: "echo";
  providerMessageId: string;
  /** The customer it was sent to. */
  to: string;
  type: "text" | "unsupported";
  body: string;
  originalType: string;
  timestamp: Date;
};

export type WhatsAppEvent = InboundMessage | StatusUpdate | EchoMessage;
