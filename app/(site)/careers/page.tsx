import type { Metadata } from "next";
import Image from "next/image";
import { CAREERS } from "@/content/careers";
import { Arrow, Eyebrow } from "@/components/ui";
import ApplySection from "@/components/careers/ApplySection";

export const metadata: Metadata = {
  title: "Careers — UV",
  description:
    "Open roles at UV across business process operations, robotics and automation, and education delivery.",
};

export default function CareersPage() {
  return (
    <>
      {/* The illustration sits behind the hero rather than in a band of its own.

          It is a bright picture under white text, so it needs both dampeners
          the site already uses for this: the image carried at 45% and a
          left-weighted gradient over it. Measured on the left half, where the
          copy sits, that leaves white text at roughly 14:1 even against the
          picture's brightest pixel — while the right side stays light enough
          that the roads still read.

          `min-h` because the section had none: with only copy in it the band
          was short enough to crop the illustration to a strip. */}
      <section className="relative isolate min-h-[540px] overflow-clip bg-carbon py-20 text-white lg:min-h-[640px] lg:py-28">
        <Image
          src={CAREERS.image}
          alt=""
          fill
          priority
          sizes="100vw"
          className="-z-10 object-cover opacity-45"
        />
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-gradient-to-r from-carbon via-carbon/80 to-carbon/30"
        />
        <div className="shell relative">
          <Eyebrow className="text-white">{CAREERS.eyebrow}</Eyebrow>
          <h1 className="type-hero mt-6 max-w-[16ch] text-white">{CAREERS.title}</h1>
          <p className="type-lede mt-6 max-w-xl text-white/80">{CAREERS.intro}</p>
          <a
            href="#roles"
            className="mt-10 inline-flex items-center gap-2 rounded-pill bg-spring-green px-6 py-3 text-[15px] leading-none font-medium text-deep-forest transition-colors hover:bg-white"
          >
            See open roles
            <Arrow />
          </a>
        </div>
      </section>

      <section className="bg-white py-16 lg:py-24">
        <div className="shell">
          <h2 className="type-band text-carbon">{CAREERS.why.title}</h2>
          <ul className="mt-12 grid gap-10 md:grid-cols-3">
            {CAREERS.why.points.map((point) => (
              <li key={point.title} className="border-t border-line pt-6">
                <h3 className="type-card text-carbon">{point.title}</h3>
                <p className="type-body mt-3">{point.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <ApplySection />
    </>
  );
}
