import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // The project sits under a parent folder that has an unrelated lockfile;
  // pinning the root stops Turbopack from walking up to find it.
  turbopack: { root: path.resolve(".") },

  // Pin the Clerk publishable key into the build as a literal, even when it is
  // unset. Next only emits a static replacement for NEXT_PUBLIC_* variables
  // that are PRESENT at build time; absent, the reference survives as a live
  // `process.env` lookup, which resolves to undefined in the browser but to the
  // real value on the Node server. That would render the header's login link
  // during SSR, omit it during hydration, and throw a hydration error on every
  // page. Emitting "" keeps both sides identical. See lib/auth.ts.
  env: {
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "",
  },
};

export default nextConfig;
