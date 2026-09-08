import type { Metadata } from "next";
import Image from "next/image";
import { SERVICES, SERVICES_CTA, SERVICES_HERO } from "@/content/services";
import { Arrow, ArrowLink, Button, Eyebrow, cx } from "@/components/ui";
import Reveal from "@/components/ui/Reveal";

export const metadata: Metadata = {
  title: "What we do — Vamscore",
  description: SERVICES_HERO.standfirst,
};

/**
 * The four service lines.
 *
 * **Why this page exists.** The header's Services links used to point at the
 * contact form, so clicking "Business process outsourcing" asked you to get in
 * touch about something the site never described — the copy had gone when the
 * "What we deliver" band was removed. /about was not a home for it either:
 * across that page "outsourcing" appears once and "robotics" once, and the
 * vision statement names none of the four.
 *
 * Each `service.id` is the anchor the header links to, so they must stay
 * stable: `content/nav.ts` hard-codes `/services#bpo` and friends.
 * `scroll-padding-top: 170px` in globals.css keeps a jumped-to heading clear of
 * the sticky header — no per-anchor offset needed here.
 *
 * A ledger of full-width rows rather than cards, following the objectives on
 * /about: four items with three supporting points each fit none of the site's
 * grids, and a row gives the points their own column instead of cramming them
 * into a card.
 *
 * `Reveal` goes on leaves only, never nested — an inner element can otherwise
 * be released while its ancestor is still transparent, so the animation plays
 * invisibly and the content snaps in.
 */
export default function ServicesPage() {
  return (
    <>
      <section className="relative isolate overflow-clip bg-carbon py-20 text-white lg:py-28">
        {SERVICES_HERO.image && (
          <>
            <Image
              src={SERVICES_HERO.image}
              alt=""
              fill
              sizes="100vw"
              priority
              className="-z-10 object-cover opacity-40"
            />
            <div className="absolute inset-0 -z-10 bg-gradient-to-r from-carbon via-carbon/85 to-carbon/40" />
          </>
        )}
        <div className="shell relative">
          <Eyebrow variant="eyelid" className="text-white">
            {SERVICES_HERO.eyebrow}
          </Eyebrow>
          <h1 className="type-hero mt-6 max-w-[18ch] text-white">
            {SERVICES_HERO.title}
          </h1>
          <p className="type-lede mt-6 max-w-[62ch] text-white/80">
            {SERVICES_HERO.standfirst}
          </p>
        </div>
      </section>

      {SERVICES.map((service, i) => (
        <section
          key={service.id}
          id={service.id}
          className={cx(
            "py-16 md:py-20 xl:py-24",
            i % 2 === 1 ? "bg-cloud" : "bg-white"
          )}
        >
          <div className="shell grid gap-8 lg:grid-cols-[1fr_1.15fr] lg:gap-16">
            <div>
              <Reveal variant="left">
                <span aria-hidden className="outline-numeral block">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </Reveal>
              <Reveal variant="soft" delay={100}>
                <h2 className="type-section mt-4 max-w-[16ch] text-carbon">
                  {service.title}
                </h2>
              </Reveal>
            </div>

            <div>
              <Reveal variant="soft" delay={160}>
                <p className="type-lede max-w-[58ch] text-dark-stone">
                  {service.body}
                </p>
              </Reveal>

              <ul className="mt-8 border-t border-line">
                {service.points.map((point, j) => (
                  <Reveal
                    key={point}
                    as="li"
                    variant="left"
                    delay={220 + j * 90}
                    className="border-b border-line py-4"
                  >
                    <span className="type-body text-carbon">{point}</span>
                  </Reveal>
                ))}
              </ul>

              <Reveal delay={500}>
                {/* Lands on the contact form with this line already chosen, so
                    the form does not ask a question the reader just answered by
                    clicking. `topic` must match an option in content/contact.ts. */}
                <ArrowLink
                  href={`/contact?topic=${encodeURIComponent(service.topic)}`}
                  className="mt-8 text-carbon"
                >
                  Talk to us about this
                </ArrowLink>
              </Reveal>
            </div>
          </div>
        </section>
      ))}

      <section className="bg-carbon py-16 text-white md:py-20 xl:py-24">
        <div className="shell flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="type-section text-white">{SERVICES_CTA.title}</h2>
            <p className="type-lede mt-4 max-w-[52ch] text-white/80">
              {SERVICES_CTA.body}
            </p>
          </div>
          <Button href={SERVICES_CTA.cta.href} className="shrink-0">
            {SERVICES_CTA.cta.label}
            <Arrow />
          </Button>
        </div>
      </section>
    </>
  );
}
