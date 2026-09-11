/**
 * WhatsApp rejects text messages over 4,096 characters. The assistant is told
 * to be brief, but a staff reply or an unusually long answer must not fail
 * outright, so long text is split — at a line break where possible, then a
 * space, and only mid-word as a last resort. 4,000 leaves headroom.
 */
export function splitForWhatsApp(text: string, max = 4000): string[] {
  let rest = text.trim();
  const parts: string[] = [];
  while (rest.length > max) {
    let cut = rest.lastIndexOf("\n", max);
    if (cut < max / 2) cut = rest.lastIndexOf(" ", max);
    if (cut <= 0) cut = max;
    parts.push(rest.slice(0, cut).trim());
    rest = rest.slice(cut).trim();
  }
  if (rest) parts.push(rest);
  return parts;
}
