import { ABOUT_HERO, FOUNDATION, MISSION, OBJECTIVES, VALUES, VISION } from "@/content/about";
import { CAREERS } from "@/content/careers";
import { CONTACT } from "@/content/contact";
import { FAQ, WHO_WE_ARE } from "@/content/home";
import { SITE_DESCRIPTION } from "@/content/nav";
import { SERVICES, SERVICES_HERO } from "@/content/services";
import { STORIES } from "@/content/stories";

/**
 * What the WhatsApp assistant knows: the website's own content, and nothing
 * else.
 *
 * **One source for site and bot.** Built from the same `content/` modules the
 * pages render, so the assistant cannot tell a customer something the website
 * contradicts — edit the site copy and the bot follows on the next deploy.
 *
 * **Placeholders never reach the model.** `content/` keeps unsupplied facts
 * visibly `[bracketed]`. Any entry containing one is dropped whole, not trimmed:
 * a half-answer with the bracket cut out ("Delivery covers pan India.") reads as
 * complete and quietly misleads. With the entry gone, the model has no answer
 * and hands the question to the team — which is the honest outcome. The test
 * suite fails if a `[` ever survives into this output.
 *
 * **Byte-stable.** Built from constant arrays in a fixed order, with no dates or
 * ids, so the system prompt is identical on every request and stays cached.
 */

export const PLACEHOLDER = /\[[^\]]*\]/;
const SITE = "https://vamscore.com";

/** Usable text: a non-empty string with no placeholder in it. */
const real = (s: string | null | undefined): s is string =>
  typeof s === "string" && s.trim() !== "" && !PLACEHOLDER.test(s);

export function buildKnowledge(): string {
  const out: string[] = [];
  const section = (title: string, lines: string[]) => {
    const kept = lines.filter(real);
    if (kept.length) out.push(`## ${title}\n${kept.join("\n")}`);
  };

  section("Company", [
    SITE_DESCRIPTION,
    WHO_WE_ARE.body,
    ABOUT_HERO.standfirst,
    ...FOUNDATION.paragraphs,
  ]);

  section("Services", [
    SERVICES_HERO.standfirst,
    ...SERVICES.filter((s) => real(s.title) && real(s.body)).map((s) => {
      const points = s.points.filter(real).map((p) => `- ${p}`);
      return [`### ${s.title}`, s.body, ...points, `More: ${SITE}/services#${s.id}`].join("\n");
    }),
  ]);

  section(
    "Client work",
    STORIES.map((s) => `- ${s.client}: ${s.title}. ${s.standfirst}`),
  );

  section("Vision and mission", [
    `Vision: ${VISION.statement}`,
    `Mission: ${MISSION.statement}`,
  ]);

  // The objectives are written as aims ("Develop…", "Build…"). Labelled so the
  // model does not present them as things Vamscore already ships.
  section(
    "Objectives — what Vamscore is working towards (aims, not delivered products)",
    OBJECTIVES.items.flatMap((o) => [`### ${o.title}`, ...o.points.map((p) => `- ${p}`)]),
  );

  section("Values", VALUES.items.map((v) => `- ${v.title}: ${v.body}`));

  const roles = CAREERS.roles.filter((r) =>
    [r.title, r.team, r.location, r.summary].every(real),
  );
  section("Careers", [
    CAREERS.intro,
    ...CAREERS.why.points.map((p) => `- ${p.title}: ${p.body}`),
    roles.length
      ? `Open roles:\n${roles.map((r) => `- ${r.title} (${r.team}, ${r.location}, ${r.type}): ${r.summary}`).join("\n")}`
      : "No specific openings are listed at the moment. Anyone interested can send a general application with their CV on the careers page.",
    `Careers page: ${SITE}/careers`,
  ]);

  section(
    "Frequently asked questions",
    FAQ.tabs
      .flatMap((t) => t.items)
      .filter((i) => real(i.q) && real(i.a))
      .map((i) => `Q: ${i.q}\nA: ${i.a}`),
  );

  section("Contact", [
    ...CONTACT.details.items
      .filter((i) => real(i.value))
      .map((i) => `${i.label}: ${i.value}`),
    `Contact form: ${SITE}/contact`,
    `Website: ${SITE}`,
  ]);

  return out.join("\n\n");
}

export const KNOWLEDGE = buildKnowledge();
