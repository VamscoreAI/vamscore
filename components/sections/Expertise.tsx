import Image from "next/image";
import { EXPERTISE } from "@/content/home";
import { Section } from "@/components/ui";

export default function Expertise() {
  return (
    <Section id="our-expertise" tone="light">
      <div className="shell">
        <h2 className="type-card-lg text-carbon">{EXPERTISE.title}</h2>
        <p className="type-lede mt-6 max-w-2xl">{EXPERTISE.body}</p>

        <div className="mt-16 grid gap-12 md:grid-cols-3">
          {EXPERTISE.people.map((person, i) => (
            <article key={i} className="flex flex-col">
              <Image
                src={person.image}
                alt={person.name}
                width={640}
                height={320}
                className="aspect-[2/1] w-full object-cover"
              />
              <h3 className="type-card-lg mt-6 text-carbon">{person.title}</h3>
              <p className="mt-4 leading-relaxed">{`“${person.quote}”`}</p>

              <div className="mt-6 border-t border-line pt-5">
                <p className="font-medium text-carbon">{person.name}</p>
                <p className="text-[14px] text-stone">{person.role}</p>
                {person.org && <p className="text-[14px] text-stone">{person.org}</p>}
              </div>
            </article>
          ))}
        </div>
      </div>
    </Section>
  );
}
