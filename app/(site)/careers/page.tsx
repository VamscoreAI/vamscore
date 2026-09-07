import type { Metadata } from "next";
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
      <section className="bg-carbon py-20 text-white lg:py-28">
        <div className="shell">
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
