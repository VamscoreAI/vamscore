"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { CUSTOMER_STORIES } from "@/content/home";
import { Eyebrow, cx } from "@/components/ui";

/**
 * A 21:9 image band with the featured story overlaid on the left, and three
 * progress segments beneath it that both show and set which story is running.
 *
 * Measured on the original at 1440: section on `#F2F1EE`; heading 40/48 at
 * weight 300; intro 20/28; the band is `aspect-ratio: 21/9`, `background-size:
 * cover`, `background-position: top center`, capped at 1776px; the message
 * column is 35% wide with a 36/44 weight-300 title and 0.8px white 4px-radius
 * buttons. The segments sit 48px below the band at x 20/236/452, 192px wide and
 * 24px apart — the active one 4px tall with a coral fill sweeping across, the
 * rest 2px of `#898888`. Switching cross-fades the image, matching the
 * original's `#customer_stories_main.preparing:after`.
 */
// The original's progress fill runs `transition: width 2.5s linear`, so each
// story holds for 2.5s before the carousel advances.
const DWELL_MS = 2500;

export default function CustomerStories() {
  const { title, body, slides, ctas } = CUSTOMER_STORIES;
  const [active, setActive] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const bandRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = bandRef.current;
    if (!el) return;

    // Rotation only starts once the band is actually on screen, so a reader
    // doesn't arrive to find it already several stories in. Checking
    // synchronously covers a deep link that lands mid-page, where the observer
    // has nothing to report.
    const onScreen = () => {
      const r = el.getBoundingClientRect();
      return r.top < window.innerHeight * 0.9 && r.bottom > 0;
    };
    if (onScreen() || typeof IntersectionObserver === "undefined") {
      setRevealed(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setRevealed(true);
          observer.disconnect();
        }
      },
      { rootMargin: "-10% 0px -20% 0px" }
    );
    observer.observe(el);

    // Belt and braces: a scroll listener covers the case where the observer is
    // throttled and never delivers, so the carousel can't be stranded stopped.
    const onScroll = () => {
      if (onScreen()) {
        setRevealed(true);
        window.removeEventListener("scroll", onScroll);
        observer.disconnect();
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  // Auto-advance once the band is on screen, as on the original. Held while
  // the reader has asked for less motion — a 2.5s rotation is exactly the kind
  // of thing that setting exists for.
  useEffect(() => {
    if (!revealed || slides.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(
      () => setActive((i) => (i + 1) % slides.length),
      DWELL_MS
    );
    return () => clearInterval(id);
  }, [revealed, slides.length]);

  const story = slides[active];

  return (
    <section id="customer-stories" className="bg-[#f2f1ee] py-16 md:py-24 xl:py-28">
      <div className="shell">
        <h2 className="type-section max-w-[58%] min-w-[16rem] text-dark-stone">
          {title}
        </h2>
        <p className="type-lede mt-6 max-w-[58%] min-w-[16rem] text-dark-stone">
          {body}
        </p>
      </div>

      <div
        ref={bandRef}
        className="relative mt-10 aspect-[21/9] max-h-[80vh] min-h-[520px] w-full max-w-[1776px] overflow-hidden lg:mt-14"
      >
        {/* Cross-fading backgrounds, one layer per story */}
        {slides.map((slide, i) => (
          <div
            key={slide.title}
            aria-hidden
            style={{ backgroundImage: `url(${slide.image})` }}
            className={cx(
              "absolute inset-0 bg-cover bg-top transition-opacity duration-700",
              i === active ? "opacity-100" : "opacity-0"
            )}
          />
        ))}
        {/* keeps white text legible over the photograph */}
        <div aria-hidden className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/45 to-black/15" />

        {/* Featured story */}
        <div className="relative z-[8] w-full px-5 pt-12 text-white md:px-8 lg:w-[35%] lg:px-12 lg:pt-16">
          <Eyebrow variant="eyelid" className="text-white">
            {story.eyebrow}
          </Eyebrow>
          <h3 className="mt-4 text-[clamp(1.5rem,1.05rem+1.6vw,2.25rem)] leading-[1.222] font-normal text-white">
            {story.title}
          </h3>
          <div className="mt-4 flex flex-wrap gap-4">
            {ctas.map((cta) => (
              <Link
                key={cta.label}
                /* both buttons open this slide's story page; "Highlights"
                   just lands you further down it */
                href={`/stories/${story.slug}${cta.hash}`}
                className="inline-flex rounded-[4px] border-white px-4 py-3 text-[17px] leading-[26px] text-white transition-colors hover:bg-white hover:text-carbon"
                style={{ borderWidth: "0.8px" }}
              >
                {cta.label}
              </Link>
            ))}
          </div>
        </div>

      </div>

      {/* Pagination below the band: three 192px segments, 24px apart, on the
          same 10px gutter as the band. The active one is 4px tall with a coral
          fill sweeping across; the others are 2px grey. */}
      <div className="mt-9 px-5 md:px-8 xl:px-5">
        <ol className="flex gap-6">
          {slides.map((slide, i) => (
            <li key={slide.title} className="min-w-0 flex-1 sm:flex-none">
              <button
                type="button"
                onClick={() => setActive(i)}
                aria-label={`Show story ${i + 1}: ${slide.eyebrow}`}
                aria-current={i === active}
                /* padding gives the 2px bar a usable hit target without
                   changing how it looks */
                className="block w-full py-3 sm:w-[192px]"
              >
                <span
                  className="block w-full bg-[#898888]"
                  style={{ height: i === active ? 4 : 2 }}
                >
                  {i === active && (
                    <span
                      /* keyed on `active` so the sweep restarts each time */
                      key={active}
                      className="block h-full bg-flame-2/80"
                      style={{ animation: `story-fill ${DWELL_MS}ms linear forwards` }}
                    />
                  )}
                </span>
              </button>
            </li>
          ))}
        </ol>
      </div>

    </section>
  );
}
