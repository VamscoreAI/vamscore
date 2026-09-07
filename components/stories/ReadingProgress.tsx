"use client";

import { useEffect, useRef } from "react";

/**
 * A coral hairline across the top of the story page showing how far through it
 * you are. Written straight to the node's custom property on each frame rather
 * than through state — this fires on every scroll event, and a re-render per
 * frame would be the most expensive thing on the page.
 */
export default function ReadingProgress() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      const doc = document.documentElement;
      const scrollable = doc.scrollHeight - window.innerHeight;
      const ratio = scrollable > 0 ? window.scrollY / scrollable : 0;
      el.style.setProperty("--progress", String(Math.min(1, Math.max(0, ratio))));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-[3px] bg-transparent"
    >
      <div ref={ref} className="story-progress h-full w-full bg-flame-2" />
    </div>
  );
}
