import Image from "next/image";
import { GET_THERE_TOGETHER } from "@/content/home";
import { ArrowLink, Section } from "@/components/ui";

export default function GetThereTogether() {
  return (
    <Section tone="cloud">
      <div className="shell">
        <h2 className="type-giant text-carbon">{GET_THERE_TOGETHER.title}</h2>

        <div className="mt-14 grid gap-8 md:grid-cols-3">
          {GET_THERE_TOGETHER.cards.map((card) => (
            <article
              key={card.title}
              className="group flex flex-col bg-white transition-shadow hover:shadow-lg"
            >
              <Image
                src={card.image}
                alt=""
                width={560}
                height={360}
                className="aspect-[3/2] w-full object-cover"
              />
              <div className="flex flex-1 flex-col p-8">
                <h3 className="type-section text-carbon">{card.title}</h3>
                <p className="mt-3 text-[clamp(1.125rem,0.95rem+0.5vw,1.5rem)] leading-[1.333] font-normal">{card.body}</p>
                <ArrowLink href={card.href} className="mt-8 text-carbon">
                  {card.cta}
                </ArrowLink>
              </div>
            </article>
          ))}
        </div>
      </div>
    </Section>
  );
}
