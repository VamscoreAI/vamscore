import type { MetadataRoute } from "next";

/**
 * The site had no robots.txt at all, which meant the staff routes were
 * indexable the moment they existed. A sign-in page in search results is a free
 * target list, so disallow them here as well as via `robots: { index: false }`
 * on each of those pages — belt and braces, because the two mechanisms cover
 * slightly different crawlers.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/portal", "/sign-in", "/sign-up"],
    },
  };
}
