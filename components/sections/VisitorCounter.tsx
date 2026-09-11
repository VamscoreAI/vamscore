import { VISITORS } from "@/content/home";
import { counterConfigured } from "@/lib/visitCounter";
import VisitorCounterLive from "./VisitorCounterLive";

/**
 * Renders the live visitor counter only when there is somewhere to count.
 *
 * Decided on the server so the home page stays statically built: with Upstash
 * connected (or in `next dev`, where a labelled demo store stands in) the
 * section is in the page and fills in client-side; without it, the section is
 * simply absent. A counter showing an error or a permanent zero would be worse
 * than no counter.
 *
 * Connecting Upstash takes effect on the next deployment — Vercel only hands a
 * build the environment variables that existed when it started.
 */
export default function VisitorCounter() {
  if (!counterConfigured()) return null;
  return <VisitorCounterLive copy={VISITORS} />;
}
