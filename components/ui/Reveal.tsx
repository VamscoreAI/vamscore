"use client";

import { useEffect, useRef, type ElementType, type ReactNode } from "react";

/** `soft` adds a clearing blur to the rise — used on band headings only, never
 *  in bulk: blur forces an extra composited surface per element. */
/** `soft` adds a clearing blur to the rise — used on band headings only, never
 *  in bulk: blur forces an extra composited surface per element.
 *  `none` animates nothing itself; it is a trigger, handing `data-shown` down
 *  to children that carry their own staged animation. */
type Variant = "up" | "left" | "right" | "scale" | "wipe" | "soft" | "none";

/**
 * Reveals its children once they scroll into view.
 *
 * The hidden state lives in CSS (`[data-reveal]` in globals.css) and this only
 * adds `data-shown`, so content is styled correctly before hydration rather
 * than flashing in and then animating.
 *
 * Two deliberate details:
 *
 * - It reveals **once** and then unobserves. Content that re-hides when you
 *   scroll back up is disorienting on a page you are reading rather than
 *   scanning.
 * - It checks position synchronously on mount and keeps a scroll listener as a
 *   fallback, so a deep link that lands mid-page — or an environment where the
 *   observer is throttled — can never leave a section stuck invisible. Getting
 *   this wrong doesn't degrade an animation, it hides the copy.
 */
export default function Reveal({
  children,
  as: Tag = "div",
  variant = "up",
  delay = 0,
  threshold = 0.92,
  className,
}: {
  children: ReactNode;
  as?: ElementType;
  variant?: Variant;
  delay?: number;
  /**
   * How far down the viewport an element must come before it is released, as a
   * fraction of viewport height. The 0.92 default fires almost as soon as the
   * top edge appears, which is right for big single blocks but makes a grid of
   * small cards finish animating before the reader has looked at it — pass
   * something lower (0.75-0.8) for those so the motion is actually seen.
   */
  threshold?: number;
  className?: string;
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const show = () => el.setAttribute("data-shown", "");

    const onScreen = () => {
      // A zero-height viewport (a hidden tab, an offscreen embed) means nothing
      // can ever intersect and no scroll will ever fire. Reveal everything
      // rather than leave the copy permanently invisible.
      if (!window.innerHeight) return true;
      const r = el.getBoundingClientRect();
      return r.top < window.innerHeight * threshold && r.bottom > 0;
    };

    if (onScreen() || typeof IntersectionObserver === "undefined") {
      show();
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          show();
          cleanup();
        }
      },
      // Mirrors `threshold` — trimming the observer's bottom edge by whatever
      // fraction of the viewport the check above leaves out.
      { rootMargin: `0px 0px -${Math.round((1 - threshold) * 100)}% 0px` }
    );
    observer.observe(el);

    const onScroll = () => {
      if (onScreen()) {
        show();
        cleanup();
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    function cleanup() {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
    }
    return cleanup;
  }, [threshold]);

  return (
    <Tag
      ref={ref}
      data-reveal={variant}
      style={delay ? ({ "--reveal-delay": `${delay}ms` } as React.CSSProperties) : undefined}
      className={className}
    >
      {children}
    </Tag>
  );
}
