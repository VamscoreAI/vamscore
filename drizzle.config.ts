import { defineConfig } from "drizzle-kit";

/**
 * `npm run db:generate` writes SQL migrations to db/migrations from
 * db/schema.ts — no database needed, so migrations are reviewed in git before
 * they touch anything. `npm run db:migrate` applies them to DATABASE_URL.
 */
export default defineConfig({
  schema: "./db/schema.ts",
  out: "./db/migrations",
  dialect: "postgresql",
  dbCredentials: { url: process.env.DATABASE_URL ?? "" },
});
