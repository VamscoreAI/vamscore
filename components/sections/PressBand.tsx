import Image from "next/image";
import { PRESS_BAND } from "@/content/home";
import { ArrowLink } from "@/components/ui";

export default function PressBand() {
  return (
    <section className="bg-white">
      <div className="shell grid items-center gap-10 py-16 md:py-24 xl:py-28 lg:grid-cols-2 lg:gap-20">
        <Image
          src={PRESS_BAND.image}
          alt=""
          width={880}
          height={560}
          className="aspect-[4/3] w-full object-cover lg:order-2"
        />
        <div>
          <h2 className="type-hero text-carbon">{PRESS_BAND.title}</h2>
          <p className="type-lede mt-6 max-w-lg">{PRESS_BAND.body}</p>
          <ArrowLink href={PRESS_BAND.cta.href} className="mt-8 text-carbon">
            {PRESS_BAND.cta.label}
          </ArrowLink>
        </div>
      </div>
    </section>
  );
}
