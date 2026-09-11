import type { MetadataRoute } from "next";
import { STORIES } from "@/content/stories";
import { SITE_URL } from "@/lib/site";

/**
 * Every public page, for search engines. Submitted in Google Search Console
 * and referenced from robots.txt.
 *
 * The staff routes (/portal, /sign-in, /sign-up) are left out on purpose —
 * they are disallowed in robots.ts and marked noindex. No `lastModified`: the
 * build date would claim every page changed on every deploy, which teaches
 * crawlers to ignore the field.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["", "/services", "/about", "/careers", "/contact"];
  return [
    ...pages.map((path) => ({
      url: `${SITE_URL}${path}`,
      priority: path === "" ? 1 : 0.8,
    })),
    ...STORIES.map((story) => ({
      url: `${SITE_URL}/stories/${story.slug}`,
      priority: 0.6,
    })),
  ];
}
