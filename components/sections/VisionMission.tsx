import { MISSION, VISION, VISION_MISSION_BAND } from "@/content/about";
import { SECTION_NAV } from "@/content/home";
import { ArrowLink } from "@/components/ui";
import Reveal from "@/components/ui/Reveal";
import SectionHeading, { SectionBackdrop } from "./SectionHeading";

/**
 * "Vision & mission" — the second stacked home-page section (z-index 2). It
 * rises 48px over "Our story" on a rounded top, and "Our track record" rises
 * over its last 48px in turn, hence the 120px bottom padding on desktop.
 *
 * Night ground with a dot grid and two glows (see `.sh-backdrop--vision`):
 * that replaced the dartboard photograph on 2026-09-29, per the section-heading
 * spec. The photo file is still in public/assets/img if it is wanted back.
 *
 * Height matters here. `SectionNav` picks the active pill with
 * `rootMargin: "-175px 0px -55% 0px"`, only a ~230px strip at a 900px
 * viewport, so a short section could scroll past without ever becoming
 * current. Heading, statement, mission and link keep it well over that.
 */
export default function VisionMission() {
  const { eyebrow, cta } = VISION_MISSION_BAND;

  return (
    <section
      id="vision-mission"
      className="relative z-[2] -mt-12 overflow-clip rounded-t-[32px] bg-night pt-16 pb-[104px] text-white md:rounded-t-[48px] lg:pt-[88px] lg:pb-[120px]"
    >
      <SectionBackdrop variant="vision" />

      <div className="shell relative">
        <SectionHeading index="02" label={SECTION_NAV[1].label} text={eyebrow} theme="dark" />

        <Reveal delay={200}>
          <p className="mt-8 max-w-[900px] font-display text-[clamp(1.5rem,1.1rem+1.2vw,2rem)] leading-[1.35] text-[#cfd0dc] lg:mt-10">
            {VISION.statement}
          </p>
        </Reveal>

        <Reveal delay={280} className="mt-10 max-w-[900px] border-t border-white/15 pt-8">
          <p className="type-lede text-[#a3a4b5]">{MISSION.statement}</p>
        </Reveal>

        <Reveal delay={360} className="mt-8">
          <ArrowLink href={cta.href} className="text-white">
            {cta.label}
          </ArrowLink>
        </Reveal>
      </div>
    </section>
  );
}
