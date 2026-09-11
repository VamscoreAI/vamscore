/**
 * Pure helpers for the visitor counter.
 *
 * No Node APIs, so the browser uses the same functions as the server — which is
 * the point for `istDay`: the browser decides "have I already been counted
 * today?" and the server decides which day's tally a visit lands in, and the
 * two must agree on where midnight falls.
 */

/** Visits are counted by the Indian calendar day, not UTC. */
export const COUNT_TIME_ZONE = "Asia/Kolkata";

const DAY_PARTS = new Intl.DateTimeFormat("en-GB", {
  timeZone: COUNT_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/** "2026-09-12" — the day it is in India at `at`. */
export function istDay(at: Date): string {
  // formatToParts rather than a locale pattern: no dependency on how a given
  // ICU build orders or punctuates the date.
  const p = Object.fromEntries(DAY_PARTS.formatToParts(at).map((x) => [x.type, x.value]));
  return `${p.year}-${p.month}-${p.day}`;
}

// A fixed table, not Intl: newer ICU builds write September as "Sept" in
// en-GB, which would change the page depending on the server's Node version.
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "2026-09-12" -> "12 Sep 2026". */
export function formatSince(day: string): string {
  const [y, m, d] = day.split("-").map(Number);
  return `${d} ${MONTHS[m - 1]} ${y}`;
}

const COUNT_FORMAT = new Intl.NumberFormat("en-IN");

/** Indian digit grouping — 1,23,456 — to match the site's IN-EN locale. */
export function formatCount(n: number): string {
  return COUNT_FORMAT.format(n);
}

// Crawlers, link unfurlers, uptime monitors and scripted clients. An empty user
// agent is treated as a bot too: every real browser sends one.
const BOT = /bot|crawl|spider|slurp|facebookexternalhit|embedly|preview|headless|lighthouse|pingdom|uptime|monitor|curl|wget|python-requests|axios|node-fetch|go-http-client/i;

export function isBot(userAgent: string): boolean {
  return !userAgent.trim() || BOT.test(userAgent);
}
