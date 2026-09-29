/**
 * Splits a section's name — the same string its eyebrow and jump link use —
 * into the parts SectionHeading sets differently:
 *
 *   "OUR STORY"        -> light ["our"],          accent "story"
 *   "VISION & MISSION" -> light ["vision", "&"],  accent "mission"
 *   "our track record" -> light ["our", "track"], accent "record"
 *
 * The accent is always the last word. Content is left in whatever case it is
 * written in; the heading lowercases with CSS, and this only normalises so the
 * screen-reader text matches what is seen.
 */
export type HeadingParts = { light: string[]; accent: string };

export function splitHeading(text: string): HeadingParts {
  const words = text.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (words.length === 0) throw new Error("splitHeading: empty heading");
  return { light: words.slice(0, -1), accent: words[words.length - 1] };
}

/**
 * Groups the light words into the runs that must not break across lines.
 * An "&" rides with the word before it, so a narrow screen wraps as
 * "vision &" / "mission." rather than stranding the ampersand at the start of
 * the second line.
 */
export function lightGroups(light: string[]): string[][] {
  const groups: string[][] = [];
  for (const word of light) {
    if (word === "&" && groups.length) groups[groups.length - 1].push(word);
    else groups.push([word]);
  }
  return groups;
}
