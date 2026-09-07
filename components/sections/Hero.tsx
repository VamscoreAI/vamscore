"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { HERO_SLIDES } from "@/content/home";
import { Arrow, Button, cx } from "@/components/ui";
import HeroArt from "./HeroArt";

const INTERVAL = 8000;

export default function Hero() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const go = useCallback((i: number) => setActive(i % HERO_SLIDES.length), []);

  // Cross-fades on an 8s cadence, holding while hovered or focused.
  //
  // Held entirely for anyone who has asked for less motion — an auto-advancing
  // carousel with two looping videos is exactly what that setting is for, and
  // `CustomerStories` already behaves this way.
  useEffect(() => {
    if (paused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    timer.current = setInterval(
      () => setActive((i) => (i + 1) % HERO_SLIDES.length),
      INTERVAL
    );
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [paused]);

  return (
    <section
      className="relative isolate min-h-[560px] overflow-hidden bg-carbon text-white lg:min-h-[700px] xl:min-h-[804px]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      // Keyboard users need the same escape hatch a mouse user gets.
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      aria-roledescription="carousel"
      aria-label="Featured stories"
    >
      {HERO_SLIDES.map((slide, i) => {
        const shown = i === active;
        return (
          <div
            key={slide.title}
            aria-hidden={!shown}
            className={cx(
              "absolute inset-0 transition-opacity duration-1000 ease-out",
              shown ? "opacity-100" : "pointer-events-none opacity-0"
            )}
          >
            {slide.art ? (
              <HeroArt />
            ) : slide.video ? (
              <video
                className="size-full object-cover"
                poster={slide.image}
                autoPlay
                muted
                loop
                playsInline
                preload={i === 0 ? "auto" : "none"}
              >
                <source src={slide.video} type="video/mp4" />
              </video>
            ) : slide.image ? (
              <Image
                src={slide.image}
                alt=""
                fill
                sizes="100vw"
                priority={i === 0}
                className="object-cover"
              />
            ) : null}
            {/* left-weighted scrim keeps the headline legible over motion */}
            <div className="absolute inset-0 bg-gradient-to-r from-carbon/80 via-carbon/30 to-transparent" />
          </div>
        );
      })}

      <div className="shell relative flex min-h-[560px] flex-col justify-center py-20 lg:min-h-[700px] xl:min-h-[804px]">
        {HERO_SLIDES.map((slide, i) => (
          <div
            key={slide.title}
            /* `inert` — not `aria-hidden`. The inactive slides stay mounted so
               the cross-fade works, and neither `opacity-0` nor
               `pointer-events-none` takes them out of the tab order: a keyboard
               user was landing on CTAs in slides they could not see. `inert`
               removes them from focus and from the accessibility tree. */
            inert={i !== active ? true : undefined}
            className={cx(
              // 570px is the measured max-width of the live leadspace copy block
              "max-w-[570px] transition-opacity duration-700",
              i === active ? "opacity-100" : "pointer-events-none absolute opacity-0"
            )}
          >
            {/* Only the first slide is an <h1>. All three are in the DOM, and
                crawlers generally ignore `inert`/`aria-hidden`, so three h1s
                would compete. Visually identical — `type-hero` does the work. */}
            {i === 0 ? (
              <h1 className="type-hero text-white">{slide.title}</h1>
            ) : (
              <p className="type-hero text-white">{slide.title}</p>
            )}
            <p className="type-body mt-6 text-white/85">{slide.body}</p>
            <div className="mt-8 flex flex-wrap gap-4">
              {slide.ctas.map((cta) => (
                <Button key={cta.label} href={cta.href} variant={cta.variant}>
                  {cta.label}
                  <Arrow />
                </Button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Dots */}
      <div className="absolute inset-x-0 bottom-4 flex justify-center">
        {HERO_SLIDES.map((slide, i) => (
          /* The dot stays 8px; the BUTTON is 44px. `size-2` alone was an
             8x8 target, well under WCAG 2.2's 24x24 minimum. */
          <button
            key={slide.title}
            type="button"
            onClick={() => go(i)}
            aria-label={`Show slide ${i + 1}: ${slide.title}`}
            aria-current={i === active}
            className="grid size-11 place-items-center rounded-full"
          >
            <span
              aria-hidden
              className={cx(
                "block size-2 rounded-full transition-colors duration-300",
                i === active ? "bg-white" : "bg-white/40 hover:bg-white/70"
              )}
            />
          </button>
        ))}
      </div>
    </section>
  );
}
