import { describe, expect, it } from "vitest";
import { formatCount, formatSince, isBot, istDay, PREVIOUS_SITE_VISITS, withPreviousSite } from "@/lib/visits";
import { seenKey } from "@/lib/visitCounter";

describe("withPreviousSite", () => {
  it("adds the previous website's 4,000 visits to this site's count", () => {
    expect(PREVIOUS_SITE_VISITS).toBe(4000);
    expect(withPreviousSite(0)).toBe(4000);
    expect(withPreviousSite(57)).toBe(4057);
  });
});

describe("istDay", () => {
  it("rolls over at midnight in India, not at midnight UTC", () => {
    expect(istDay(new Date("2026-09-12T18:29:59Z"))).toBe("2026-09-12"); // 23:59:59 IST
    expect(istDay(new Date("2026-09-12T18:30:00Z"))).toBe("2026-09-13"); // 00:00:00 IST
  });

  it("is the Indian date even when it is still yesterday in UTC", () => {
    expect(istDay(new Date("2026-12-31T20:00:00Z"))).toBe("2027-01-01"); // 01:30 IST
  });
});

describe("formatCount", () => {
  it("groups the Indian way, to match the site's IN-EN locale", () => {
    expect(formatCount(0)).toBe("0");
    expect(formatCount(999)).toBe("999");
    expect(formatCount(1000)).toBe("1,000");
    expect(formatCount(123456)).toBe("1,23,456");
    expect(formatCount(12345678)).toBe("1,23,45,678");
  });
});

describe("formatSince", () => {
  it("writes the first day in a fixed, ICU-independent form", () => {
    expect(formatSince("2026-09-12")).toBe("12 Sep 2026");
    expect(formatSince("2027-01-01")).toBe("1 Jan 2027");
  });
});

describe("isBot", () => {
  it("does not count crawlers, unfurlers, monitors or scripts", () => {
    for (const ua of [
      "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
      "facebookexternalhit/1.1",
      "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/120.0",
      "curl/8.4.0",
      "python-requests/2.31",
      "",
    ]) {
      expect(isBot(ua), ua || "(empty)").toBe(true);
    }
  });

  it("counts real browsers", () => {
    for (const ua of [
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36",
      "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1",
    ]) {
      expect(isBot(ua)).toBe(false);
    }
  });
});

describe("seenKey", () => {
  const fp = "203.0.113.7|Mozilla/5.0";

  it("is stable for the same visitor on the same day", () => {
    expect(seenKey("secret", "2026-09-12", fp)).toBe(seenKey("secret", "2026-09-12", fp));
  });

  it("changes every day, so it cannot follow anyone across days", () => {
    expect(seenKey("secret", "2026-09-12", fp)).not.toBe(seenKey("secret", "2026-09-13", fp));
  });

  it("does not contain the IP address, and depends on the secret", () => {
    const key = seenKey("secret", "2026-09-12", fp);
    expect(key).not.toContain("203.0.113.7");
    expect(key).toMatch(/^[0-9a-f]{32}$/);
    expect(seenKey("other-secret", "2026-09-12", fp)).not.toBe(key);
  });
});
