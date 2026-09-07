import { HOW_WE_HELP } from "@/content/home";
import { ArrowLink } from "@/components/ui";

/**
 * Four service cards, each led by a giant outlined numeral that cross-fades to
 * a photo on hover — the original's `.outlinechars` treatment.
 *
 * Measured on the original at 1440. This section runs on a 10px gutter rather
 * than the 32px page gutter the rest of the site uses, so the four cards come
 * out 351px wide with 331px of content:
 *
 *   section        padding-top 128 (an empty spacer row), padding-bottom 96
 *   heading row    padding-bottom 10, border-bottom 0.8px rgba(0,0,0,.1)
 *   cards row      padding-top 16
 *   numeral        padding 32px 0                       -> 232 tall
 *   heading        margin-top 16, padding-bottom 32, min-height 135
 *   body           margin 32 0 32, padding-right 48
 *   link           padding-top 32                       -> 56 tall
 *
 * `card.image` is null until UV supplies artwork; the numeral simply stays put,
 * which is exactly what the original shows before you hover it.
 */
export default function HowWeHelp() {
  return (
    <section id="how-we-help" className="bg-white py-16 md:py-24 xl:py-28">
      {/* 10px gutter at desktop, opened up on small screens so the copy isn't
          jammed against the edge */}
      <div className="mx-auto w-full max-w-[1920px] px-5 md:px-8 xl:px-[10px]">
        {/* The hairline is the heading row's own border-bottom, not a separate
            rule — so it sits 10px under the heading rather than floating. */}
        <div
          // Tailwind drops sub-pixel arbitrary border widths (`border-b-[0.8px]`
          // emits no rule at all), so the measured 0.8px is set directly here.
          style={{ borderBottomWidth: "0.8px" }}
          className="border-b border-solid border-black/10 pb-[10px]"
        >
          <h2 className="type-hero max-w-[937px] text-flame-2">
            {HOW_WE_HELP.titleLines.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </h2>
        </div>

        <div className="grid gap-y-12 pt-4 md:grid-cols-2 xl:grid-cols-4">
          {HOW_WE_HELP.cards.map((card, i) => (
            <article
              key={card.title}
              // The 10px inset belongs to the desktop gutter scheme; below xl it
              // would just push card copy out of line with the heading.
              className="group flex flex-col xl:px-[10px]"
            >
              <div className="relative">
                <span aria-hidden className="outline-numeral block">
                  {String(i + 1).padStart(2, "0")}
                </span>

                {card.image && (
                  <span
                    aria-hidden
                    style={{ backgroundImage: `url(${card.image})` }}
                    className="absolute top-0 left-0 aspect-[16/9] w-full rounded-lg bg-cover bg-center bg-no-repeat opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                  />
                )}
              </div>

              {/* min-height includes the padding (border-box), so this block is
                  135px tall exactly as on the original */}
              <h3 className="type-card-lg mt-4 pb-8 text-dark-stone xl:min-h-[135px]">
                {card.title}
              </h3>

              <p className="type-body mt-8 mb-8 pr-12">{card.body}</p>

              <ArrowLink href={card.href} className="mt-auto pt-8 text-carbon">
                {card.cta}
              </ArrowLink>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
