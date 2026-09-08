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

/**
 * The reading column: prose sits narrower than the shell so lines stay at a
 * comfortable measure — 860px at `type-lede`'s 20px ceiling is about 72
 * characters.
 *
 * **Left-aligned, not centred.** It used to be `mx-auto`, which put prose at
 * x=282 while the hero above it, the stat band and the closing CTA all sat at
 * the shell edge, x=32 — and wide images centred at a third edge, x=122. Four
 * left edges down one page, so the eye had to re-find the start of every block.
 * Everything now begins at the same edge and only the right-hand extent
 * changes.
 */
const COLUMN = "w-full max-w-[860px]";

/**
 * Vertical rhythm, two values and no more. The blocks previously carried five
 * between them — 56, 64, 80, 96 and 112 — with no rule for which got what.
 *
 * Bands take the larger value: they have a background, so their padding is the
 * only thing keeping the colour off the type.
 */
const FLOW = "py-14 lg:py-20";
const BAND = "py-16 lg:py-24";

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

/** The picture that fills the column beside a reading block. Enters from the
 *  right, the side it occupies — the same rule the Vision and Mission bands
 *  follow — and rides along with the copy at lg. */
function Aside({ src, alt }: { src: string; alt: string }) {
  return (
    <Reveal variant="right" delay={180} className="lg:sticky lg:top-28">
      <Image
        src={src}
        alt={alt}
        width={1000}
        height={563}
        sizes="(min-width: 1024px) 32vw, 100vw"
        className="h-auto w-full rounded-lg"
      />
    </Reveal>
  );
}

function Block({ block, id }: { block: StoryBlock; id?: string }) {
  switch (block.kind) {
    case "prose": {
      const copy = (
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
      );

      if (!block.aside) {
        return <section className={`shell ${FLOW}`}>{copy}</section>;
      }

      return (
        // `overflow-clip` because the aside reveals from `translate3d(28px,0,0)`.
        // At phone width the picture is full-bleed within the gutter, so those
        // 28px hung 8px past the viewport and gave the page a horizontal
        // scrollbar until the reveal fired. `clip`, not `hidden`: hidden would
        // make this a scroll container and break the `lg:sticky` below.
        <section className={`shell overflow-clip ${FLOW}`}>
          {/* `items-start` so a short picture sits with the top of the copy
              rather than floating in the middle of it. The reading column keeps
              its own 860px cap inside the first track, so the measure does not
              change when an aside is present — the picture only occupies space
              that was already empty. */}
          <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,860px)_minmax(0,1fr)] lg:gap-12">
            {copy}
            <Aside {...block.aside} />
          </div>
        </section>
      );
    }

    case "facts":
      return (
        // overflow-clip for the same reason as the prose block: the aside
        // reveals from translate3d(28px,0,0), which hangs past a phone viewport
        // until it fires.
        <section id={id} className={`bg-cloud overflow-clip ${BAND}`}>
          <div className="shell">
            <div
              className={
                block.aside
                  ? "grid items-start gap-8 lg:grid-cols-[minmax(0,860px)_minmax(0,1fr)] lg:gap-12"
                  : ""
              }
            >
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
            {block.aside && <Aside {...block.aside} />}
            </div>
          </div>
        </section>
      );

    case "list":
      return (
        <section id={id} className={FLOW}>
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
            <ol className="mt-12 grid w-full gap-x-10 gap-y-12 md:grid-cols-2">
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
        <section className={`bg-carbon text-white ${BAND}`}>
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
        <section className={FLOW}>
          <figure className="shell">
            {/* `wipe` opens the frame from the bottom edge while the picture
                settles out of a slight over-scale */}
            <Reveal
              variant="wipe"
              className="relative aspect-[16/9] w-full overflow-hidden rounded-lg"
            >
              <Image
                src={block.src}
                alt={block.alt}
                fill
                sizes="(min-width: 1440px) 1376px, 100vw"
                className="object-cover"
              />
            </Reveal>
            {block.caption && (
              <Reveal
                as="figcaption"
                delay={200}
                className="type-body mt-4 text-stone"
              >
                {block.caption}
              </Reveal>
            )}
          </figure>
        </section>
      );

    case "quote":
      return (
        <section className={FLOW}>
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
