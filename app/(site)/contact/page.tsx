import type { Metadata } from "next";
import Image from "next/image";
import { Suspense } from "react";
import { CONTACT } from "@/content/contact";
import { ArrowLink, Eyebrow } from "@/components/ui";
import Reveal from "@/components/ui/Reveal";
import ContactForm from "@/components/contact/ContactForm";

export const metadata: Metadata = {
  title: "Contact — Vamscore",
  description: CONTACT.standfirst,
};

/**
 * Where "Let's talk" and every Contact link now land. Before this page existed
 * that button pointed at `mailto:[email]` — a live broken link that opened a
 * mail client addressed to the literal string `[email]`.
 *
 * The details column is deliberately still bracketed; see `content/contact.ts`.
 */
export default function ContactPage() {
  return (
    <>
      {/* The picture is already dark where the copy sits — the left half means
          rgb(44,47,51) — so unlike the careers hero this needs a light touch:
          the image at 60% under a left-weighted gradient leaves white text at
          about 10:1 even against the brightest pixel in that half, while the
          right side stays legible as a photograph.

          `min-h` because the section had none; with only copy in it the band
          was short enough to crop the picture to a strip. */}
      <section className="relative isolate min-h-[460px] overflow-clip bg-carbon py-20 text-white lg:min-h-[560px] lg:py-28">
        <Image
          src={CONTACT.heroImage}
          alt=""
          fill
          priority
          sizes="100vw"
          className="-z-10 object-cover opacity-60"
        />
        <div
          aria-hidden
          // Two ramps. Below lg the copy runs to 95% of the width, where the
          // desktop ramp had thinned to 34% and left white text at 4.82:1 —
          // over the 4.5 floor, but with almost no margin. The small-screen
          // ramp holds more carbon across the whole width (7.9:1 at the same
          // point); the lg ramp opens back up so the photograph still reads
          // beside the copy.
          className="absolute inset-0 -z-10 bg-gradient-to-r from-carbon via-carbon/80 to-carbon/55 lg:via-carbon/70 lg:to-carbon/30"
        />
        <div className="shell relative">
          <Eyebrow variant="eyelid" className="text-white">
            {CONTACT.eyebrow}
          </Eyebrow>
          <h1 className="type-hero mt-6 max-w-[14ch] text-white">
            {CONTACT.title}
          </h1>
          <p className="type-lede mt-6 max-w-[58ch] text-white/80">
            {CONTACT.standfirst}
          </p>
        </div>
      </section>

      <section className="bg-white py-16 lg:py-24">
        <div className="shell grid gap-14 lg:grid-cols-[7fr_4fr] lg:gap-20">
          <div>
            <Reveal as="h2" variant="soft" className="type-section text-carbon">
              {CONTACT.form.title}
            </Reveal>
            <Reveal as="p" delay={100} className="type-body mt-3 text-stone">
              {CONTACT.form.intro}
            </Reveal>
            {/* ContactForm reads `?topic=` to preselect "What is this about?",
                which makes it a client-rendered subtree. Without this boundary
                the whole route would opt out of static rendering. */}
            <div className="mt-10">
              <Suspense fallback={null}>
                <ContactForm />
              </Suspense>
            </div>
          </div>

          <aside>
            <Reveal as="h2" variant="soft" className="type-card-lg text-carbon">
              {CONTACT.details.title}
            </Reveal>
            <dl className="mt-8">
              {CONTACT.details.items.map((item, i) => (
                <Reveal
                  key={item.label}
                  variant="left"
                  delay={i * 110}
                  className="border-t border-line py-5"
                >
                  <dt className="eyebrow text-stone uppercase">{item.label}</dt>
                  <dd className="type-body mt-2 text-carbon">
                    {/* A plain <a>, not next/link: tel: is not a route. Only
                        items with a real `href` become links, so the
                        still-bracketed ones cannot turn into live links to
                        nowhere. */}
                    {"href" in item && item.href ? (
                      <a
                        href={item.href}
                        className="underline-offset-4 transition-colors hover:text-flame hover:underline"
                      >
                        {item.value}
                      </a>
                    ) : (
                      item.value
                    )}
                  </dd>
                </Reveal>
              ))}
            </dl>

            <Reveal delay={360} className="mt-10 border-t border-line pt-8">
              <p className="type-body text-dark-stone">
                {CONTACT.details.careersNote.text}
              </p>
              <ArrowLink
                href={CONTACT.details.careersNote.href}
                className="mt-3 text-carbon"
              >
                {CONTACT.details.careersNote.linkLabel}
              </ArrowLink>
            </Reveal>
          </aside>
        </div>
      </section>
    </>
  );
}
