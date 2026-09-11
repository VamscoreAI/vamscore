import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "@/db/schema";

/**
 * Postgres (Neon) over HTTP — one request per query, no connection to keep
 * alive, which is what a serverless function wants.
 *
 * The HTTP driver has no interactive transactions. Nothing here needs one:
 * every write that must not happen twice is guarded by a unique constraint
 * (see `db/schema.ts`), so retries are safe without them.
 *
 * Built lazily so importing this module never throws. With no DATABASE_URL the
 * site still builds and every page that does not touch WhatsApp keeps working;
 * the WhatsApp routes check `hasDatabase()` and fail closed.
 */

export function hasDatabase() {
  return Boolean(process.env.DATABASE_URL);
}

type Db = ReturnType<typeof create>;
let instance: Db | null = null;

function create(url: string) {
  return drizzle(neon(url), { schema });
}

export function db(): Db {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  return (instance ??= create(url));
}

export { schema };
