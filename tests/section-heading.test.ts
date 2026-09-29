import { describe, expect, it } from "vitest";
import { lightGroups, splitHeading } from "@/lib/sectionHeading";
import { CUSTOMER_STORIES, PARTNERS, SECTION_NAV, TRACK_RECORD_STATS, WHO_WE_ARE } from "@/content/home";
import { VISION_MISSION_BAND } from "@/content/about";
import { SERVICES, SERVICES_HERO } from "@/content/services";

describe("section headings", () => {
  // The three home-page headings, from the same strings the eyebrows use.
  it("makes the last word the accent", () => {
    expect(splitHeading(WHO_WE_ARE.eyebrow)).toEqual({ light: ["our"], accent: "story" });
    expect(splitHeading(VISION_MISSION_BAND.eyebrow)).toEqual({
      light: ["vision", "&"],
      accent: "mission",
    });
    expect(splitHeading(CUSTOMER_STORIES.eyebrow)).toEqual({
      light: ["our", "track"],
      accent: "record",
    });
  });

  // So a narrow screen wraps "vision &" / "mission." and never starts a line on "&".
  it("keeps an ampersand with the word before it", () => {
    expect(lightGroups(["vision", "&"])).toEqual([["vision", "&"]]);
    expect(lightGroups(["our", "track"])).toEqual([["our"], ["track"]]);
  });

  // The "01 / …" labels are the pill nav's own labels, in order.
  it("labels the sections as the pill nav does", () => {
    expect(SECTION_NAV.slice(0, 3).map((s) => s.label)).toEqual([
      "Our story",
      "Vision & mission",
      "Our track record",
    ]);
  });
});

describe("track-record stat cards", () => {
  // Only figures the site already states elsewhere. If the copy changes, this
  // should fail before a card starts claiming something the site does not.
  it("uses only figures the site already states", () => {
    const [years, lines, brands] = TRACK_RECORD_STATS;

    expect(years).toEqual({ value: 14, label: "Years of operations" });
    expect(WHO_WE_ARE.title).toContain("fourteen years");

    expect(lines.value).toBe(SERVICES.length);
    expect(SERVICES_HERO.standfirst).toMatch(/^Five lines of work/);
    expect(lines.value).toBe(5);

    expect(brands.value).toBe(PARTNERS.logos.length);
    expect(PARTNERS.title).toBe("Who we work with");
  });
});
