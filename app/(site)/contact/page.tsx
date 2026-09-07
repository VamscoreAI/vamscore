import type { Metadata } from "next";
import { Suspense } from "react";
import { CONTACT } from "@/content/contact";
import { ArrowLink, Eyebrow } from "@/components/ui";
import Reveal from "@/components/ui/Reveal";
import ContactForm from "@/components/contact/ContactForm";

export const metadata: Metadata = {
  title: "Contact — UV",
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
      <section className="bg-carbon py-20 text-white lg:py-28">
        <div className="shell">
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
                  <dd className="type-body mt-2 text-carbon">{item.value}</dd>
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
