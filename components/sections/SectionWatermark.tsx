import FitText from "@/components/ui/FitText";

/**
 * The full-bleed band that introduces the major sections — a single lowercase
 * word-set scaled to the viewport width.
 *
 * **On the contrast.** This started as a true tone-on-tone watermark (cloud on
 * white, white on cloud), which measured **1.13:1** — below the threshold where
 * the eye resolves an edge at all, so the words simply could not be read.
 *
 * Both variants now sit at roughly **2.3:1** against their own band. That is
 * deliberately short of the 4.5:1 WCAG asks for body copy: this is display type
 * at ~200px, where far less contrast is needed to read comfortably, and pushing
 * it to 4.5:1 would make the watermark compete with the real `<h2>` directly
 * beneath it (which runs about 17:1) — at which point it stops reading as a
 * background element and starts looking like two headings stacked.
 *
 * Both tones now go *darker* than their band rather than one lighter and one
 * darker, so the treatment reads the same way in both places. The greige leans
 * very slightly warm, toward the coral accent, so it belongs to the palette
 * instead of looking like grey placeholder text.
 *
 * Still `aria-hidden`: the words repeat the section's own eyebrow, and every
 * section carries a real heading.
 */
export default function SectionWatermark({
  children,
  tone = "onWhite",
}: {
  children: string;
  tone?: "onWhite" | "onCloud";
}) {
  const tones = {
    // 2.29:1 against #ffffff
    onWhite: "bg-white text-[#b2aaa0]",
    // 2.31:1 against #f2f1ee
    onCloud: "bg-[#f2f1ee] text-[#a79f96]",
  };

  return (
    <div
      aria-hidden
      className={`overflow-hidden px-5 py-12 md:px-8 lg:py-28 ${tones[tone]}`}
    >
      {/* Slides a little as you scroll past, where the browser supports
          scroll-driven timelines. Decorative only — the band is aria-hidden. */}
      <FitText className="watermark-drift font-display font-bold lowercase">
        {children}
      </FitText>
    </div>
  );
}
