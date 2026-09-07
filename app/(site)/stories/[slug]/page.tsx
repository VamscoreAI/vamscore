import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { STORIES, STORY_BY_SLUG, STORY_UI } from "@/content/stories";
import { Arrow, Eyebrow } from "@/components/ui";
import Reveal from "@/components/ui/Reveal";
import ReadingProgress from "@/components/stories/ReadingProgress";
import StoryBody from "@/components/stories/StoryBody";

type Params = { params: Promise<{ slug: string }> };

/** All three stories are known at build time, so they prerender. */
export function generateStaticParams() {
  return STORIES.map((story) => ({ slug: story.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const story = STORY_BY_SLUG.get(slug);
  if (!story) return {};
  return {
    title: `${story.client} — UV`,
    description: story.standfirst,
  };
}

export default async function StoryPage({ params }: Params) {
  const { slug } = await params;
  const story = STORY_BY_SLUG.get(slug);
  if (!story) notFound();

  const index = STORIES.findIndex((s) => s.slug === slug);
  const next = STORIES[(index + 1) % STORIES.length];

  return (
    <>
      <ReadingProgress />

      {/* ---------------------------------------------------------------- Hero */}
      <section className="relative isolate min-h-[560px] overflow-hidden bg-carbon text-white lg:min-h-[680px]">
        <div className="absolute inset-0">
          {/* The artwork drifts slowly for as long as it is on screen; the
              scrim is what keeps the white type legible over a photograph we
              don't control the exposure of. */}
          <Image
            src={story.hero}
            alt={story.heroAlt}
            fill
            priority
            sizes="100vw"
            className="story-hero-art object-cover"
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

        <div className="shell relative flex min-h-[560px] flex-col justify-end py-16 lg:min-h-[680px] lg:py-20">
          <Link
            href="/#customer-stories"
            className="story-rise group inline-flex w-fit items-center gap-2 text-[14px] leading-5 text-white/70 transition-colors hover:text-white"
          >
            <span className="transition-transform duration-300 group-hover:-translate-x-1">
              ←
            </span>
            All client stories
          </Link>

          <div className="story-rise mt-10" style={{ "--rise-delay": "120ms" } as React.CSSProperties}>
            <Eyebrow variant="eyelid" className="text-white">
              {story.eyebrow}
            </Eyebrow>
          </div>

          <h1
            className="story-rise type-hero mt-6 max-w-[20ch] text-white"
            style={{ "--rise-delay": "220ms" } as React.CSSProperties}
          >
            {story.title}
          </h1>

          <p
            className="story-rise type-lede mt-6 max-w-[62ch] text-white/80"
            style={{ "--rise-delay": "340ms" } as React.CSSProperties}
          >
            {story.standfirst}
          </p>

          <dl
            className="story-rise mt-14 grid gap-x-8 gap-y-6 border-t border-white/20 pt-8 sm:grid-cols-2 lg:grid-cols-4"
            style={{ "--rise-delay": "460ms" } as React.CSSProperties}
          >
            {story.meta.map((item) => (
              <div key={item.term}>
                <dt className="eyebrow text-white/50 uppercase">{item.term}</dt>
                <dd className="type-body mt-2 text-white">{item.detail}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ---------------------------------------------------------------- Body */}
      <article className="bg-white">
        <StoryBody blocks={story.blocks} />
      </article>

      {/* ----------------------------------------------------------- Next story */}
      <section className="border-t border-line bg-cloud py-16 lg:py-24">
        <div className="shell">
          <Reveal as="p" className="eyebrow text-stone uppercase">
            {STORY_UI.nextLabel}
          </Reveal>
          <Reveal delay={100} className="mt-6">
            <Link
              href={`/stories/${next.slug}`}
              className="group grid items-center gap-8 md:grid-cols-[420px_1fr]"
            >
              <span className="relative block aspect-[16/9] overflow-hidden rounded-lg">
                <Image
                  src={next.hero}
                  alt=""
                  fill
                  sizes="(min-width: 768px) 420px, 100vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
              </span>
              <span className="block">
                <span className="eyebrow block text-flame">{next.eyebrow}</span>
                <span className="type-card-lg mt-3 block text-carbon">
                  {next.title}
                </span>
                <span className="mt-6 inline-flex items-center gap-3 text-[16px] leading-6 text-carbon">
                  Read full story
                  <span className="transition-transform duration-300 group-hover:translate-x-1">
                    <Arrow />
                  </span>
                </span>
              </span>
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ------------------------------------------------------------------ CTA */}
      <section className="bg-carbon py-20 text-white lg:py-28">
        <div className="shell">
          <Reveal as="h2" className="type-hero max-w-[16ch] text-white">
            {STORY_UI.ctaTitle}
          </Reveal>
          <Reveal as="p" delay={120} className="type-lede mt-6 max-w-[52ch] text-white/70">
            {STORY_UI.ctaBody}
          </Reveal>
          <Reveal delay={240}>
            <Link
              href={STORY_UI.ctaHref}
              className="mt-10 inline-flex items-center gap-2 rounded-pill bg-spring-green px-6 py-3 text-[15px] leading-none font-medium text-deep-forest transition-colors hover:bg-white"
            >
              {STORY_UI.ctaLabel}
              <Arrow />
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  );
}
