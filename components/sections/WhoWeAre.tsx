import { SECTION_NAV, WHO_WE_ARE } from "@/content/home";
import Reveal from "@/components/ui/Reveal";
import SectionHeading, { SectionBackdrop } from "./SectionHeading";
import WhoWeAreArt from "./WhoWeAreArt";

/**
 * "Our story" — the first of the three stacked home-page sections (z-index 1;
 * Vision & mission overlaps its last 48px, which is why the bottom padding
 * runs 120px on desktop: 72px of air plus the overlap).
 *
 * The section opens on its SectionHeading, with the story's one-line summary
 * as the lead beside it; the longer paragraph and the network artwork follow.
 * Since 2026-09-29 the artwork sits in the shell as a rounded panel rather
 * than bleeding off the right edge, so its left edge lines up with everything
 * above it at every width, 1920 included.
 */
export default function WhoWeAre() {
  return (
    <section
      id="who-we-are"
      className="relative z-[1] overflow-clip bg-white pt-14 pb-[104px] lg:pt-[88px] lg:pb-[120px]"
    >
      <SectionBackdrop variant="story" />

      <div className="shell relative">
        <SectionHeading
          index="01"
          label={SECTION_NAV[0].label}
          text={WHO_WE_ARE.eyebrow}
          aside={
            <p className="max-w-[500px] font-display text-[clamp(1.25rem,0.95rem+0.8vw,1.625rem)] leading-[1.35] text-dark-stone">
              {WHO_WE_ARE.title}
            </p>
          }
        />

        <div className="mt-12 grid items-center gap-10 lg:mt-16 lg:grid-cols-[minmax(0,440px)_minmax(0,1fr)] lg:gap-16">
          <Reveal as="p" className="type-body text-dark-stone">
            {WHO_WE_ARE.body}
          </Reveal>
          <Reveal variant="wipe" delay={120}>
            <WhoWeAreArt className="overflow-clip rounded-[24px]" />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
