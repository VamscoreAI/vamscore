import FitText from "@/components/ui/FitText";
import Reveal from "@/components/ui/Reveal";

/**
 * The full-bleed band that introduces the major sections — a single lowercase
 * word-set scaled to the viewport width, under a chapter marker.
 *
 * **On the contrast.** This started as a true tone-on-tone watermark (cloud on
 * white, white on cloud), which measured **1.13:1** — below the threshold where
 * the eye resolves an edge at all, so the words simply could not be read.
 *
 * The lettering now carries a gradient rather than one flat greige, but its
 * midpoint is the same tone as before, about **2.3:1** against the band. That
 * is deliberately short of the 4.5:1 WCAG asks for body copy: this is display
 * type at ~200px, where far less contrast is needed to read comfortably, and
 * pushing it to 4.5:1 would make the watermark compete with the real `<h2>`
 * directly beneath it (which runs about 17:1) — at which point it stops reading
 * as a background element and starts looking like two headings stacked.
 *
 * The gradient runs warm-to-light across the word: it starts near the coral the
 * eyebrows use, so the band belongs to the palette instead of looking like grey
 * placeholder text, and fades out to the right so the word settles back into
 * the page rather than sitting on it as a slab.
 *
 * The marker above it — coral tick, section number, hairline to the edge — is
 * the same vocabulary as `Eyebrow`'s 2px rule, and it gives the band something
 * to sit against. Without it the word floated in the middle of a lot of white.
 *
 * Still `aria-hidden`: the words repeat the section's own eyebrow, every
 * section carries a real heading, and the number is decoration, not a count a
 * reader needs.
 */
export default function SectionWatermark({
  children,
  index,
  tone = "onWhite",
}: {
  children: string;
  /** 1-based; rendered as 01, 02, … Omit it and the marker shows the rule only. */
  index?: number;
  tone?: "onWhite" | "onCloud";
}) {
  // `--wm-mid` is the old flat tone, so the word's overall weight on the page
  // is unchanged; `--wm-from` is that tone warmed toward the coral accent.
  const tones = {
    onWhite: {
      band: "bg-white",
      rule: "bg-[#e2ddd7]",
      vars: { "--wm-from": "#c2907a", "--wm-mid": "#b2aaa0", "--wm-to": "#e6e1db" },
    },
    onCloud: {
      band: "bg-[#f2f1ee]",
      rule: "bg-[#d9d4cc]",
      vars: { "--wm-from": "#b5836d", "--wm-mid": "#a79f96", "--wm-to": "#dbd5cd" },
    },
  }[tone];

  return (
    <div
      aria-hidden
      className={`overflow-hidden px-5 pt-10 pb-8 md:px-8 md:pb-12 lg:pt-16 lg:pb-20 ${tones.band}`}
      style={tones.vars as React.CSSProperties}
    >
      <Reveal className="mb-5 flex items-center gap-4 lg:mb-7">
        {/* The same 2px coral tick the eyebrows carry, then the number, then a
            hairline out to the edge. */}
        <span className="h-[2px] w-4 shrink-0 bg-flame-2" />
        {index !== undefined && (
          <span className="eyebrow shrink-0 text-flame-2 tabular-nums">
            {String(index).padStart(2, "0")}
          </span>
        )}
        <span className={`h-px flex-1 ${tones.rule}`} />
      </Reveal>

      {/* Slides a little as you scroll past, where the browser supports
          scroll-driven timelines. Decorative only — the band is aria-hidden. */}
      <FitText className="watermark-drift watermark-ink font-display font-bold lowercase">
        {children}
      </FitText>
    </div>
  );
}
