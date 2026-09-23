import FitText from "@/components/ui/FitText";
import Reveal from "@/components/ui/Reveal";

/**
 * The band that introduces each major section on the home page: the section's
 * name, set once, full width, and ended with a coral full stop.
 *
 * Simple on purpose. Between 2026-09-17 and 09-23 this band was a flat greige
 * bold word, then a gradient with a chapter marker, then three trial designs
 * (a ticker, a scroll-fill, an artwork card). Vamscore found the first plain
 * and the rest overworked; what it asked for was "simple and yet beautiful".
 *
 * So everything that is here does one job:
 * - **Light weight, not bold.** Be Vietnam Pro at 300 and ~200px is thin and
 *   elegant; the bold slab it replaced read as a block of grey.
 * - **Near-black, not greige.** A thin stroke in a pale tone looks faded;
 *   in carbon it looks deliberate.
 * - **One coral full stop.** The site's accent (the tick under every
 *   eyebrow), used once, as punctuation.
 * - **The site's standard fade-in**, nothing more.
 *
 * `aria-hidden`: the word repeats the section's own eyebrow, and every section
 * carries a real heading.
 */
export default function SectionWatermark({ children }: { children: string }) {
  return (
    <div aria-hidden className="bg-white px-5 pt-14 pb-10 md:px-8 lg:pt-24 lg:pb-16">
      <Reveal>
        <FitText
          className="font-display font-light tracking-[-0.02em] text-carbon lowercase"
          accent={{ text: ".", className: "text-flame-2" }}
        >
          {children}
        </FitText>
      </Reveal>
    </div>
  );
}
