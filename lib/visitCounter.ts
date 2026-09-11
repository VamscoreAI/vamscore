import { createHmac } from "node:crypto";
import { Redis } from "@upstash/redis";
import { istDay } from "@/lib/visits";

/**
 * The visitor count, stored in Upstash Redis.
 *
 * **What counts as a visit:** one per browser per day (Indian calendar day).
 * The browser remembers the day it was counted, so repeat page loads don't
 * even ask; the server enforces it again, so clearing storage or scripting the
 * endpoint can't inflate the number.
 *
 * **What is stored about a visitor: nothing readable.** The server-side check
 * keys on an HMAC of the day, IP address and user agent. It can't be reversed
 * into an IP, it changes every day by construction, and it expires after 36
 * hours. The totals are plain integers.
 *
 * **Keys:** `visits:total`, `visits:day:<YYYY-MM-DD>` (kept 3 days),
 * `visits:since` (the first day anything was counted), `visits:seen:<hash>`.
 *
 * **Cost:** a counted visit is 2 requests (6 commands); a read is 1 command,
 * and reads are cached at the edge for 20s, so however many tabs are watching
 * the counter there's at most one read every 20s. Well inside Upstash's free
 * 500K commands a month.
 */

export type Counts = {
  total: number;
  today: number;
  /** The day these counts belong to, so the client can tell when "today" rolls over. */
  day: string;
  /** The first day anything was counted, or null before the first visit. */
  since: string | null;
};

const SEEN_TTL_SECONDS = 36 * 60 * 60;
const DAY_TTL_SECONDS = 3 * 24 * 60 * 60;

const K = {
  total: "visits:total",
  since: "visits:since",
  day: (day: string) => `visits:day:${day}`,
  seen: (hash: string) => `visits:seen:${hash}`,
};

// The same names `Redis.fromEnv()` reads — UPSTASH_* first, then the KV_* names
// the Vercel Marketplace integration sets.
const url = () => process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
const token = () => process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;

function redisConfigured() {
  return Boolean(url() && token());
}

/**
 * Local development without Upstash: an in-memory stand-in, so the section can
 * be seen and its transitions checked before the database exists. It is never
 * active in a production build (NODE_ENV is "production" there), and every
 * response it produces carries `demo: true`, which the section shows as a
 * visible "demo data" label.
 */
function demoMode() {
  return process.env.NODE_ENV === "development" && !redisConfigured();
}

export function counterConfigured() {
  return redisConfigured() || demoMode();
}

export function isDemo() {
  return demoMode();
}

/** The dedupe key for one visitor on one day. Exported for tests. */
export function seenKey(secret: string, day: string, fingerprint: string) {
  return createHmac("sha256", secret).update(`${day}|${fingerprint}`).digest("hex").slice(0, 32);
}

let client: Redis | null = null;
const redis = () => (client ??= Redis.fromEnv());

export async function readCounts(now = new Date()): Promise<Counts> {
  const day = istDay(now);
  if (demoMode()) return demoRead(day);

  const [total, today, since] = await redis().mget<[number | null, number | null, string | null]>(
    K.total,
    K.day(day),
    K.since
  );
  return { total: Number(total ?? 0), today: Number(today ?? 0), day, since: since ?? null };
}

export async function recordVisit(
  fingerprint: string,
  now = new Date()
): Promise<Counts & { counted: boolean }> {
  const day = istDay(now);
  if (demoMode()) return demoRecord(day, fingerprint);

  const fresh = await redis().set(K.seen(seenKey(token()!, day, fingerprint)), 1, {
    nx: true,
    ex: SEEN_TTL_SECONDS,
  });
  if (!fresh) return { ...(await readCounts(now)), counted: false };

  const p = redis().pipeline();
  p.incr(K.total);
  p.incr(K.day(day));
  p.expire(K.day(day), DAY_TTL_SECONDS);
  p.set(K.since, day, { nx: true });
  p.get<string>(K.since);
  const [total, today, , , since] = await p.exec<[number, number, number, string | null, string | null]>();

  return { total, today, day, since: since ?? day, counted: true };
}

/* -------------------------------------------------------------------------- */
/* Demo store — `next dev` only                                               */
/* -------------------------------------------------------------------------- */

const demo = {
  total: 12480,
  today: new Map<string, number>(),
  seen: new Set<string>(),
  // Today, not a hard-coded date, so the demo can never claim a start day that
  // hasn't happened yet.
  since: istDay(new Date()),
};

function demoRead(day: string): Counts {
  // Other "visitors" trickle in, so the live increment can be watched locally.
  if (Math.random() < 0.6) {
    const n = 1 + Math.floor(Math.random() * 3);
    demo.total += n;
    demo.today.set(day, (demo.today.get(day) ?? 37) + n);
  }
  return { total: demo.total, today: demo.today.get(day) ?? 37, day, since: demo.since };
}

function demoRecord(day: string, fingerprint: string): Counts & { counted: boolean } {
  const key = `${day}|${fingerprint}`;
  const counted = !demo.seen.has(key);
  if (counted) {
    demo.seen.add(key);
    demo.total += 1;
    demo.today.set(day, (demo.today.get(day) ?? 37) + 1);
  }
  return { total: demo.total, today: demo.today.get(day) ?? 37, day, since: demo.since, counted };
}
