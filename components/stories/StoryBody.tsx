import Image from "next/image";
import type { StoryBlock } from "@/content/stories";
import Reveal from "@/components/ui/Reveal";

/**
 * Renders one story's blocks. Everything reuses the measured type utilities in
 * `app/globals.css` rather than introducing a second scale — a story page is
 * the same design system at a longer read length.
 *
 * Each block reveals as it scrolls in, and lists and table rows stagger their
 * children so a section arrives in reading order rather than all at once.
 */

/** The reading column: prose sits narrower than the full shell so lines stay
 *  at a comfortable measure, while images and stat bands run wide. */
const COLUMN = "mx-auto w-full max-w-[860px]";

export default function StoryBody({ blocks }: { blocks: StoryBlock[] }) {
  // The "Highlights" button on the homepage carousel deep-links past the
  // opening prose to the first substantive block, whichever kind that is.
  const highlights = blocks.findIndex(
    (b) => b.kind === "facts" || b.kind === "list"
  );

  return (
    <div className="pb-8">
      {blocks.map((block, i) => (
        <Block key={i} block={block} id={i === highlights ? "highlights" : undefined} />
      ))}
    </div>
  );
}

function Block({ block, id }: { block: StoryBlock; id?: string }) {
  switch (block.kind) {
    case "prose":
      return (
        <section className="shell py-10 lg:py-14">
          <div className={COLUMN}>
            {block.heading && (
              <Reveal as="h2" className="type-card-lg mb-6 text-carbon">
                {block.heading}
              </Reveal>
            )}
            {block.paragraphs.map((p, i) => (
              <Reveal
                key={i}
                as="p"
                delay={i * 90}
                className="type-lede mt-5 text-dark-stone first:mt-0"
              >
                {p}
              </Reveal>
            ))}
          </div>
        </section>
      );

    case "facts":
      return (
        <section id={id} className="bg-cloud py-14 lg:py-20">
          <div className="shell">
            <div className={COLUMN}>
              <Reveal as="h2" className="type-card-lg text-carbon">
                {block.heading}
              </Reveal>
              {block.intro && (
                <Reveal as="p" delay={80} className="type-body mt-3 text-stone">
                  {block.intro}
                </Reveal>
              )}
              <dl className="mt-10">
                {block.rows.map((row, i) => (
                  <Reveal
                    key={row.term}
                    variant="left"
                    delay={i * 110}
                    className="grid gap-2 border-t border-line py-6 md:grid-cols-[200px_1fr] md:gap-8"
                  >
                    <dt className="type-body font-medium text-carbon">
                      {row.term}
                    </dt>
                    <dd className="type-body text-dark-stone">{row.detail}</dd>
                  </Reveal>
                ))}
              </dl>
            </div>
          </div>
        </section>
      );

    case "list":
      return (
        <section id={id} className="py-12 lg:py-20">
          <div className="shell">
            <div className={COLUMN}>
              <Reveal as="h2" className="type-card-lg text-carbon">
                {block.heading}
              </Reveal>
              {block.intro && (
                <Reveal as="p" delay={80} className="type-body mt-3 text-stone">
                  {block.intro}
                </Reveal>
              )}
            </div>
            <ol className="mx-auto mt-12 grid w-full max-w-[1180px] gap-x-10 gap-y-12 md:grid-cols-2">
              {block.items.map((item, i) => (
                <Reveal
                  key={item.title}
                  as="li"
                  delay={i * 110}
                  className="group border-t border-line pt-5 transition-colors duration-500 hover:border-flame-2"
                >
                  <span
                    aria-hidden
                    className="block font-display text-[28px] leading-none font-medium text-flame-2/35 transition-colors duration-500 group-hover:text-flame-2"
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="type-card mt-4 text-carbon">{item.title}</h3>
                  <p className="type-body mt-3 text-dark-stone">{item.body}</p>
                </Reveal>
              ))}
            </ol>
          </div>
        </section>
      );

    case "stats":
      return (
        <section className="bg-carbon py-16 text-white lg:py-24">
          <div className="shell">
            <div className="grid gap-12 md:grid-cols-3">
              {block.stats.map((stat, i) => (
                <Reveal key={stat.label} delay={i * 140}>
                  <span
                    aria-hidden
                    className="mb-6 block h-[2px] w-10 bg-flame-2"
                  />
                  <p className="type-giant text-white">{stat.value}</p>
                  <p className="type-body mt-3 text-white/70">{stat.label}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      );

    case "image":
      return (
        <section className="py-10 lg:py-16">
          <figure className="shell">
            {/* `wipe` opens the frame from the bottom edge while the picture
                settles out of a slight over-scale */}
            <Reveal
              variant="wipe"
              className="relative mx-auto aspect-[16/9] w-full max-w-[1180px] overflow-hidden rounded-lg"
            >
              <Image
                src={block.src}
                alt={block.alt}
                fill
                sizes="(min-width: 1200px) 1180px, 100vw"
                className="object-cover"
              />
            </Reveal>
            {block.caption && (
              <Reveal
                as="figcaption"
                delay={200}
                className="type-body mx-auto mt-4 max-w-[1180px] text-stone"
              >
                {block.caption}
              </Reveal>
            )}
          </figure>
        </section>
      );

    case "quote":
      return (
        <section className="py-14 lg:py-24">
          <div className="shell">
            <Reveal className={COLUMN}>
              <blockquote>
                <span aria-hidden className="mb-8 block h-[2px] w-16 bg-flame-2" />
                <p className="type-section text-carbon">{block.text}</p>
                <footer className="type-body mt-8 text-stone">
                  {block.attribution}
                </footer>
              </blockquote>
            </Reveal>
          </div>
        </section>
      );
  }
}
