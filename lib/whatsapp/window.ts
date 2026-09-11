/**
 * WhatsApp's 24-hour customer service window.
 *
 * Free-form replies are allowed — and free — for 24 hours after the customer's
 * last message. After that only paid, pre-approved templates can be sent, and
 * v1 sends none, so a closed window means "wait for the customer to write
 * again".
 *
 * One pure function, used by the send API (to refuse) and the dashboard (to
 * disable the composer and show time left), so the two cannot disagree about
 * whether a chat is still open.
 */

export const WINDOW_MS = 24 * 60 * 60 * 1000;

export function windowState(
  lastInboundAt: Date | string | null,
  now: Date = new Date(),
): { open: boolean; msLeft: number } {
  if (!lastInboundAt) return { open: false, msLeft: 0 };
  const since = now.getTime() - new Date(lastInboundAt).getTime();
  const msLeft = WINDOW_MS - since;
  // Strictly less than 24h: at exactly 24:00:00 Meta treats the window as shut.
  return { open: since >= 0 && msLeft > 0, msLeft: Math.max(0, msLeft) };
}
