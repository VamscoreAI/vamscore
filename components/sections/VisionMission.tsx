import Image from "next/image";
import { MISSION, VISION, VISION_MISSION_BAND } from "@/content/about";
import { ArrowLink, Eyebrow } from "@/components/ui";
import Reveal from "@/components/ui/Reveal";

/**
 * The condensed vision and mission, sitting between "Who we are" and the
 * company's record — the point on the homepage where Vamscore says what it is now,
 * before the page goes on to show what it has done.
 *
 * **Why this band is carbon.** As a light band it was one of a run of
 * near-identical white fields and nothing drew the eye to it. Carbon breaks
 * that run, the same alternation `/about` uses.
 *
 * `VISION_MISSION_BAND.image` is null until Vamscore supplies artwork; nothing is
 * rendered while it is, so there is no 404 and no empty frame — the band simply
 * stays flat carbon.
 *
 * Kept deliberately tall (`py-20 lg:py-28`): `SectionNav` decides the active
 * pill with `rootMargin: "-175px 0px -55% 0px"`, which is only a ~230px strip
 * at a 900px viewport, so a short band can scroll straight past without ever
 * becoming the current section.
 */
export default function VisionMission() {
  const { image, eyebrow, cta } = VISION_MISSION_BAND;

  return (
    <section
      id="vision-mission"
      className="relative isolate overflow-clip bg-carbon py-16 md:py-24 xl:py-28 text-white"
    >
      {image && (
        <div aria-hidden className="absolute inset-0">
          {/* `band-art` carries the scale that keeps the edges out of frame,
              and drifts on scroll where the browser supports it */}
          <Image
            src={image}
            alt=""
            fill
            sizes="100vw"
            className="band-art object-cover"
          />
          {/* Tuned for the blue target-and-hands artwork (2026-09-22). Its
              subject is bright and sits on the right, which is exactly where
              the heading and mission paragraph run at 1280-1536: at 1280 the
              heading reaches ~92% of the width.

              Measured by compositing the picture under candidate scrims at
              1280, 1536 and 1920 and taking the brightest pixel behind each
              block of text. The old stops (80 / 62 at 55% / 10) gave white
              text 2.3:1 over the target. These (80 / 70 at 55% / 40), with the
              image baked at 85% brightness, give 5.3:1 behind the heading and
              4.9:1 behind the paragraph at all three — the most visible
              setting of the 46 that pass. Re-measure if either the image or
              the stops change. */}
          <div className="absolute inset-0 bg-gradient-to-r from-carbon/80 via-carbon/70 via-55% to-carbon/40" />
        </div>
      )}

      <div className="shell relative grid gap-10 lg:grid-cols-[240px_1fr] lg:gap-16">
        <Reveal variant="left">
          <Eyebrow variant="eyelid" className="text-white">
            {eyebrow}
          </Eyebrow>
        </Reveal>

        <div>
          <Reveal variant="soft" delay={100}>
            <p className="type-section max-w-[900px] text-white">
              {VISION.statement}
            </p>
          </Reveal>

          <Reveal delay={200} className="mt-10 border-t border-white/20 pt-8">
            <p className="type-lede max-w-[70ch] text-white/75">
              {MISSION.statement}
            </p>
          </Reveal>

          <Reveal delay={300} className="mt-8">
            <ArrowLink href={cta.href} className="text-white">
              {cta.label}
            </ArrowLink>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
