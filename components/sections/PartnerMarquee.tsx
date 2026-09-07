import Image from "next/image";
import { PARTNERS } from "@/content/home";
import { ArrowLink } from "@/components/ui";

export default function PartnerMarquee() {
  // Repeated enough times that the -50% keyframe still lands on a seamless
  // loop with only three partners in the list.
  const track = [...PARTNERS.logos, ...PARTNERS.logos, ...PARTNERS.logos];
  const half = track.length;

  // Deliberately tighter than the site's py-16 md:py-24 xl:py-28 rhythm:
  // this is a compact logo strip, not a content band.
  return (
    <section id="partners" className="border-y border-line bg-white py-16 lg:py-20">
      <div className="shell flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <h2 className="type-band text-carbon">{PARTNERS.title}</h2>
        <ArrowLink href={PARTNERS.cta.href} className="text-carbon">
          {PARTNERS.cta.label}
        </ArrowLink>
      </div>

      <div className="marquee mt-12 overflow-hidden">
        {/* These are the partners' own marks, supplied by UV. Displaying another
            company's trademark states a relationship — make sure each of these
            partnerships is current and that UV is comfortable claiming it. */}
        <ul className="marquee-track flex w-max items-center gap-16 px-8">
          {[...track, ...track].map((partner, i) => (
            <li
              key={`${partner.name}-${i}`}
              className="flex shrink-0 items-center"
              aria-hidden={i >= half}
            >
              {partner.logo ? (
                /* Normalised by height, not width, so marks of different
                   proportions sit on one optical line. `w-auto` lets each keep
                   its own aspect ratio. */
                <Image
                  src={partner.logo}
                  alt={partner.name}
                  width={partner.w ?? 340}
                  height={partner.h ?? 96}
                  sizes="200px"
                  className="h-10 w-auto lg:h-12"
                />
              ) : (
                /* No artwork yet — the name as type, which is what the whole
                   strip used to be. */
                <span className="font-display text-2xl font-medium whitespace-nowrap text-stone lg:text-3xl">
                  {partner.name}
                </span>
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
