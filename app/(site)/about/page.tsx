import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ABOUT_CTA,
  ABOUT_HERO,
  FOUNDATION,
  MISSION,
  OBJECTIVES,
  VALUES,
  VISION,
} from "@/content/about";
import { Arrow, ArrowLink, Eyebrow, cx } from "@/components/ui";
import Reveal from "@/components/ui/Reveal";
import ReadingProgress from "@/components/stories/ReadingProgress";
import SectionWatermark from "@/components/sections/SectionWatermark";

export const metadata: Metadata = {
  title: "About Vamscore — vision, mission, objectives and values",
  description: ABOUT_HERO.standfirst,
  alternates: { canonical: "/about" },
};

/**
 * The company as it is now: vision, mission, the five core objectives and the
 * nine values, with the fourteen-year operations record framed as the
 * foundation underneath rather than as the offer itself.
 *
 * Bands alternate white → carbon → white so the page carries the same rhythm as
 * the homepage. Two layout decisions worth keeping:
 *
 * - **Objectives are a ledger, one full-width row each**, not cards. Five items
 *   fit none of the site's grids (3 and 4 are the established counts), and a
 *   row gives each objective's three supporting points their own sub-grid.
 * - **Values are a 3x3 hairline grid.** Nine divides only by 3, so a 2-column
 *   step would orphan the ninth on every mid-size screen.
 *
 * `Reveal` is never nested inside another `Reveal`: each instance observes
 * independently, so an inner element can be released while its ancestor is
 * still transparent — the animation then plays invisibly and the content snaps
 * in. Reveals go on leaves only.
 */
/**
 * Optional artwork behind a light band. Renders nothing at all while `image` is
 * null — no <Image>, no empty frame, no 404 — so the band just keeps its flat
 * background until Vamscore supplies a file.
 *
 * The scrim is deliberately light-side (white, not carbon): these bands have
 * dark type on them, so the image has to sit well back rather than darken the
 * field the way the hero and mission scrims do.
 */
function BandArt({ image }: { image: string | null }) {
  if (!image) return null;
  return (
    <div aria-hidden className="absolute inset-0">
      <Image
        src={image}
        alt=""
        fill
        sizes="100vw"
        className="band-art object-cover opacity-[0.18]"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-white via-white/85 to-white/55" />
    </div>
  );
}

export default function AboutPage() {
  return (
    <>
      <ReadingProgress />

      {/* ---------------------------------------------------------------- Hero */}
      <section className="relative isolate min-h-[520px] overflow-clip bg-carbon text-white lg:min-h-[640px]">
        <div className="absolute inset-0">
          <Image
            src={ABOUT_HERO.image}
            alt={ABOUT_HERO.imageAlt}
            fill
            priority
            sizes="100vw"
            className="story-hero-art band-art object-cover"
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-r from-carbon/90 via-carbon/60 to-carbon/25"
          />
          <div
            aria-hidden
            className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-carbon/80 to-transparent"
          />
        </div>

        <div className="shell relative flex min-h-[520px] flex-col justify-end py-16 lg:min-h-[640px] lg:py-20">
          <div className="story-rise">
            <Eyebrow variant="eyelid" className="text-white">
              {ABOUT_HERO.eyebrow}
            </Eyebrow>
          </div>
          <h1
            className="story-rise type-hero mt-6 max-w-[18ch] text-white"
            style={{ "--rise-delay": "120ms" } as React.CSSProperties}
          >
            {ABOUT_HERO.title}
          </h1>
          <p
            className="story-rise type-lede mt-6 max-w-[62ch] text-white/80"
            style={{ "--rise-delay": "240ms" } as React.CSSProperties}
          >
            {ABOUT_HERO.standfirst}
          </p>
        </div>
      </section>

      {/* -------------------------------------------------------------- Vision */}
      {/* Copy left, picture right — and mirrored on Mission below, so the two
          statements read as a pair rather than as two identical bands.

          Both pictures were supplied with "OUR VISION" / "OUR MISSION" set into
          their left third. That lettering is cropped off: the eyebrow beside
          each one already says it, and a picture captioning itself next to a
          live heading is the same word twice.

          The order swap is CSS only (`lg:order-*`). In the DOM the copy comes
          first in both, so the reading order is heading-then-image either way
          and does not invert for a screen reader or for anyone tabbing. */}
      <section id="vision" className="overflow-clip bg-white py-20 lg:py-28">
        <div className="shell grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <Reveal variant="left">
              <Eyebrow variant="eyelid">{VISION.eyebrow}</Eyebrow>
            </Reveal>
            <Reveal variant="soft" delay={120}>
              <p className="type-section mt-8 text-carbon">{VISION.statement}</p>
            </Reveal>
          </div>

          <Reveal variant="right" delay={200} className="lg:order-2">
            <Image
              src={VISION.image}
              alt=""
              width={1104}
              height={941}
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="h-auto w-full"
            />
          </Reveal>
        </div>
      </section>

      {/* ------------------------------------------------------------- Mission */}
      <section
        id="mission"
        className="overflow-clip bg-carbon py-20 text-white lg:py-28"
      >
        <div className="shell grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <Reveal variant="right">
              <Eyebrow variant="eyelid" className="text-white">
                {MISSION.eyebrow}
              </Eyebrow>
            </Reveal>
            <Reveal variant="soft" delay={120}>
              <p className="type-band mt-8 text-white">{MISSION.statement}</p>
            </Reveal>
          </div>

          {/* `lg:order-first` puts the picture on the left here — the mirror of
              Vision — while leaving it second in the DOM. */}
          <Reveal variant="left" delay={200} className="lg:order-first">
            <Image
              src={MISSION.image}
              alt=""
              width={1070}
              height={941}
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="h-auto w-full"
            />
          </Reveal>
        </div>
      </section>

      <SectionWatermark>{OBJECTIVES.eyebrow}</SectionWatermark>

      {/* ---------------------------------------------------------- Objectives */}
      <section
        id="objectives"
        className="relative isolate overflow-clip bg-white pb-20 lg:pb-28"
      >
        <BandArt image={OBJECTIVES.image} />
        <div className="shell relative">
          {/* The hairline is the heading row's own border, as on HowWeHelp.
              Tailwind v4 drops sub-pixel arbitrary border widths, so the
              measured 0.8px is set inline. */}
          <div
            style={{ borderBottomWidth: "0.8px" }}
            className="border-b border-solid border-black/10 pb-[10px]"
          >
            <Reveal as="h2" variant="soft" className="type-hero max-w-[937px] text-flame-2">
              {OBJECTIVES.titleLines.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </Reveal>
          </div>
          <Reveal as="p" delay={100} className="type-body mt-6 max-w-[60ch] text-stone">
            {OBJECTIVES.intro}
          </Reveal>

          <ol className="mt-6">
            {OBJECTIVES.items.map((objective, i) => (
              <li
                key={objective.title}
                /* Everything that describes the objective — numeral, title and
                   its three points — now lives in ONE column, with the picture
                   opposite. Previously the left column stacked image + numeral +
                   title and ran ~765px tall while the right held three short
                   paragraphs, so the row was sized by the left and the right
                   half was mostly void. Centred, because the two sides are
                   deliberately near-equal in height rather than exactly equal. */
                className="group grid items-center gap-10 border-t border-line py-12 transition-colors duration-500 last:border-b hover:border-flame-2/40 lg:grid-cols-[minmax(280px,5fr)_7fr] lg:gap-16 lg:py-16"
              >
                {objective.image && (
                  <Reveal
                    variant="wipe"
                    /* Sides alternate down the ledger so five rows read as a
                       composition rather than five copies of one row. */
                    className={cx(
                      "relative aspect-[4/3] w-full max-w-[520px] overflow-clip rounded-lg",
                      i % 2 === 1 && "lg:order-2 lg:justify-self-end"
                    )}
                  >
                    <span className="art-settle absolute inset-0 block">
                      <Image
                        src={objective.image}
                        alt={objective.imageAlt ?? ""}
                        fill
                        sizes="(min-width: 1024px) 520px, 100vw"
                        className="band-art object-cover"
                      />
                    </span>
                  </Reveal>
                )}

                <div>
                  {/* the wrapper only triggers; `numeral-land` is the beat */}
                  <Reveal variant="none">
                    <span
                      aria-hidden
                      className="numeral-land outline-numeral block"
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </Reveal>

                  <Reveal
                    as="h3"
                    variant="up"
                    delay={objective.image ? 360 : 140}
                    className="type-card-lg mt-2 text-carbon"
                  >
                    {objective.title}
                  </Reveal>

                  <ul className="mt-10 grid gap-8 md:grid-cols-3">
                    {objective.points.map((point, p) => (
                      <Reveal
                        as="li"
                        key={point}
                        /* after the title they describe; rows with no picture
                           skip the beats that picture would have occupied */
                        delay={(objective.image ? 460 : 240) + p * 110}
                        threshold={0.78}
                      >
                        <span
                          aria-hidden
                          className="reveal-rule mb-4 block h-[2px] w-10 bg-flame-2/70 group-hover:bg-flame-2"
                        />
                        <p className="type-body text-dark-stone">{point}</p>
                      </Reveal>
                    ))}
                  </ul>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ---------------------------------------------------------- Foundation */}
      <section id="foundation" className="bg-cloud py-20 lg:py-28">
        <div className="shell grid gap-12 lg:grid-cols-2 lg:gap-20">
          <div>
            <Reveal>
              <Eyebrow variant="eyelid">{FOUNDATION.eyebrow}</Eyebrow>
            </Reveal>
            <Reveal as="h2" variant="soft" delay={100} className="type-section mt-6 text-carbon">
              {FOUNDATION.title}
            </Reveal>
            {FOUNDATION.paragraphs.map((paragraph, i) => (
              <Reveal
                as="p"
                key={i}
                delay={180 + i * 90}
                className="type-body mt-5 text-dark-stone"
              >
                {paragraph}
              </Reveal>
            ))}
            <Reveal delay={460} className="mt-8">
              <ArrowLink href={FOUNDATION.cta.href} className="text-carbon">
                {FOUNDATION.cta.label}
              </ArrowLink>
            </Reveal>
          </div>

          {/* The wrapper animates clip-path (the wipe), the image animates
              transform (the drift) — different properties, so they compose.
              Deliberately no hover zoom: this image is not a link, and scaling
              it under the cursor would imply it leads somewhere. */}
          <Reveal
            variant="wipe"
            className="relative aspect-[4/3] w-full overflow-clip rounded-lg"
          >
            <Image
              src={FOUNDATION.image}
              alt={FOUNDATION.imageAlt}
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="band-art object-cover"
            />
          </Reveal>
        </div>
      </section>

      <SectionWatermark>{VALUES.eyebrow}</SectionWatermark>

      {/* -------------------------------------------------------------- Values */}
      <section
        id="values"
        className="relative isolate overflow-clip bg-white pb-20 lg:pb-28"
      >
        <BandArt image={VALUES.image} />
        <div className="shell relative">
          <Reveal as="h2" variant="soft" className="type-section text-carbon">
            {VALUES.title}
          </Reveal>
          <Reveal as="p" delay={100} className="type-body mt-4 max-w-[60ch] text-stone">
            {VALUES.intro}
          </Reveal>

          {/* Hairline grid: the 1px gaps let the container's `bg-line` show
              through, and the outer border closes the frame. */}
          <ul className="mt-14 grid gap-px border border-line bg-line md:grid-cols-3">
            {VALUES.items.map((value, i) => (
              /* staggered by column, not by index — `i * 90` across nine items
                 leaves the last row trailing by most of a second */
              <Reveal
                as="li"
                key={value.title}
                delay={(i % 3) * 110}
                /* Released well down the viewport, so each row is actually
                   watched arriving rather than having finished before the
                   reader's eye gets there. */
                threshold={0.78}
                className="group bg-white p-8 transition-colors duration-500 hover:bg-cloud lg:p-10"
              >
                {/* draws across as this card lands */}
                <span
                  aria-hidden
                  className="reveal-rule mb-5 block h-[2px] w-12 bg-flame-2"
                />
                <span
                  aria-hidden
                  className="font-display block text-[20px] leading-none font-medium text-flame-2/40 transition-colors duration-500 group-hover:text-flame-2"
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="type-card mt-3 text-carbon">{value.title}</h3>
                <p className="type-body mt-3 text-dark-stone">{value.body}</p>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* ----------------------------------------------------------------- CTA */}
      <section className="bg-carbon py-20 text-white lg:py-28">
        <div className="shell">
          <Reveal as="h2" variant="soft" className="type-hero max-w-[16ch] text-white">
            {ABOUT_CTA.title}
          </Reveal>
          <Reveal as="p" delay={120} className="type-lede mt-6 max-w-[52ch] text-white/70">
            {ABOUT_CTA.body}
          </Reveal>
          <Reveal delay={240}>
            <Link
              href={ABOUT_CTA.cta.href}
              className="mt-10 inline-flex items-center gap-2 rounded-pill bg-spring-green px-6 py-3 text-[15px] leading-none font-medium text-deep-forest transition-colors hover:bg-white"
            >
              {ABOUT_CTA.cta.label}
              <Arrow />
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  );
}
