"use client";

import { memo, useEffect, useRef } from "react";
import { cx } from "@/components/ui";

type Stat = { value: number; label: string };

/** How long the numbers take to count up, in ms. */
const DURATION = 1200;

/**
 * The track-record figures: three cards, each a gradient bar, a large
 * ExtraLight number and a label.
 *
 * The numbers count up from 0 once the row scrolls into view, one time only.
 * They are written straight to the DOM from requestAnimationFrame rather than
 * through state: a count is ~70 frames, and there is no reason to re-render
 * React for each. The server renders the final figures, so without JavaScript,
 * under reduced motion, or when the row is already on screen at load, the real
 * numbers simply show — the count only runs for a row that is still below the
 * fold, where zeroing it first is invisible.
 *
 * The animated digits are aria-hidden; each card carries the final value in an
 * sr-only span, so a screen reader never hears a number mid-count.
 */
function StatCards({ stats, className }: { stats: Stat[]; className?: string }) {
  const listRef = useRef<HTMLUListElement>(null);
  const numberRefs = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // Same robustness as Reveal: a zero-height viewport (hidden tab) or a row
    // already in view never animates, so the figures can't get stuck at 0.
    const inView = () => {
      if (!window.innerHeight) return true;
      const r = list.getBoundingClientRect();
      return r.top < window.innerHeight * 0.85 && r.bottom > 0;
    };
    if (inView() || typeof IntersectionObserver === "undefined") return;

    const write = (progress: number) =>
      stats.forEach((s, i) => {
        const el = numberRefs.current[i];
        if (el) el.textContent = String(Math.round(s.value * progress));
      });
    write(0);

    let frame = 0;
    let started = false;
    const run = () => {
      if (started) return;
      started = true;
      stop();
      const t0 = performance.now();
      const tick = (t: number) => {
        const p = Math.min(1, (t - t0) / DURATION);
        write(1 - Math.pow(1 - p, 3)); // ease-out cubic
        if (p < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) run();
      },
      { rootMargin: "0px 0px -15% 0px" }
    );
    observer.observe(list);
    const onScroll = () => {
      if (inView()) run();
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    function stop() {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
    }
    return () => {
      stop();
      cancelAnimationFrame(frame);
      // Leave the real figures behind if the effect is torn down mid-count.
      write(1);
    };
  }, [stats]);

  return (
    <ul ref={listRef} className={cx("grid gap-6 md:grid-cols-3", className)}>
      {stats.map((s, i) => (
        <li
          key={s.label}
          className="rounded-[24px] border border-[#e2dfd8] bg-white px-8 py-7"
        >
          <span aria-hidden className="brand-gradient block h-1 w-12 rounded-full" />
          <p className="mt-6 font-display text-[80px] leading-none font-extralight tracking-[-0.04em] text-carbon tabular-nums">
            <span
              aria-hidden
              ref={(el) => {
                numberRefs.current[i] = el;
              }}
            >
              {s.value}
            </span>
            <span className="sr-only">{s.value}</span>
          </p>
          <p className="mt-3 text-[16px] leading-6 font-medium text-stone">{s.label}</p>
        </li>
      ))}
    </ul>
  );
}

// The track-record section re-renders every 2.5s as its carousel advances;
// these cards have nothing to do with that.
export default memo(StatCards);
