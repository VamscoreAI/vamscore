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
    // Same reason as above: the public WhatsApp link renders only when this is
    // set, so an unpinned value would render it on the server and drop it in
    // the browser. See lib/whatsapp/links.ts.
    NEXT_PUBLIC_WHATSAPP_NUMBER: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "",
  },

  /**
   * One canonical hostname: `vamscore.com`, without the `www`.
   *
   * Both hostnames resolve to this deployment, so without this they are two
   * sites serving identical content — which splits search ranking between them
   * and makes analytics report the same visit under two origins.
   *
   * Matched on `host` rather than by rewriting every link, so it costs nothing
   * on the 99% of requests that already arrive at the apex. The match is the
   * exact production hostname: `localhost`, the `*.vercel.app` preview URLs and
   * any future domain are all left alone, so this cannot loop or fire in dev.
   *
   * `permanent: true` emits 308, which is the correct signal for a canonical
   * host and is what search engines need to fold the two together. Note that
   * browsers cache 308 hard: reversing this later means the `www` redirect will
   * persist in the caches of anyone who has already hit it.
   */
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.vamscore.com" }],
        destination: "https://vamscore.com/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
