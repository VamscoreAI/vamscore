import { WHO_WE_ARE } from "@/content/home";
import { Eyebrow } from "@/components/ui";
import WhoWeAreArt from "./WhoWeAreArt";

/**
 * Two-column band: copy on the left, artwork on the right, split 570/855 at 1440
 * to match the original. Deliberately not wrapped in `shell` — the media runs
 * to the right edge, and only the text column carries a gutter.
 */
export default function WhoWeAre() {
  // `lg:py-0` is deliberate: at desktop the artwork panel's aspect ratio sets
  // this band's height, and the text column carries its own py-16.
  return (
    <section id="who-we-are" className="bg-white py-16 lg:py-0">
      <div className="grid items-center gap-10 lg:grid-cols-[570fr_855fr] lg:gap-0">
        {/* Artwork first on small screens, second on desktop */}
        <WhoWeAreArt className="order-1 lg:order-2" />

        <div className="order-2 px-5 lg:order-1 lg:py-16 lg:pr-8 lg:pl-5">
          <Eyebrow variant="eyelid" className="text-dark-stone">
            {WHO_WE_ARE.eyebrow}
          </Eyebrow>

          {/* 24px/30px weight 400 — the small heading this section uses, not
              the larger sizes the statement headings elsewhere use. */}
          <h2 className="mt-6 max-w-[440px] text-2xl leading-[30px] font-normal tracking-[-0.005em] text-dark-stone">
            {WHO_WE_ARE.title}
          </h2>

          <p className="type-body mt-8 max-w-[440px]">{WHO_WE_ARE.body}</p>
        </div>
      </div>
    </section>
  );
}
