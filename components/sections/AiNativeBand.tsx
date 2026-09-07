import Image from "next/image";
import { AI_NATIVE } from "@/content/home";
import { Arrow, Button } from "@/components/ui";

export default function AiNativeBand() {
  return (
    <section className="relative isolate overflow-hidden bg-carbon text-white">
      <Image
        src={AI_NATIVE.image}
        alt=""
        fill
        sizes="100vw"
        className="object-cover opacity-60"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-carbon via-carbon/70 to-carbon/20" />

      <div className="shell relative py-24 lg:py-32">
        <h2 className="type-band max-w-2xl text-white">{AI_NATIVE.title}</h2>
        <p className="type-lede mt-6 max-w-xl text-white/85">
          {AI_NATIVE.body}
        </p>
        <Button href={AI_NATIVE.cta.href} className="mt-10">
          {AI_NATIVE.cta.label}
          <Arrow />
        </Button>
      </div>
    </section>
  );
}
