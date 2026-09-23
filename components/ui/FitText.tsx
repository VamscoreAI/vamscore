"use client";

import { useLayoutEffect, useRef, useState } from "react";

/**
 * Scales a single line of text so it exactly fills its container's width.
 *
 * The section-header bands on kyndryl.com do this: "how kyndryl helps" renders
 * at 157px and "kyndryl expertise" at 164px at the same 1425px width, because
 * each is sized to fit rather than set at a fixed size. Measuring at runtime is
 * the only way to reproduce that across viewports and font fallbacks.
 */
export default function FitText({
  children,
  className,
  max = 260,
  accent,
}: {
  children: string;
  className?: string;
  max?: number;
  /** Trailing characters in their own colour, e.g. a coral full stop.
   *  Inside the measured span, so the fit accounts for them. */
  accent?: { text: string; className: string };
}) {
  const wrap = useRef<HTMLDivElement>(null);
  const text = useRef<HTMLSpanElement>(null);
  const [measured, setMeasured] = useState(false);

  useLayoutEffect(() => {
    const wrapEl = wrap.current;
    const textEl = text.current;
    if (!wrapEl || !textEl) return;

    // The size is written straight to the node rather than held in state: the
    // probe below mutates the same property, so a state round-trip could leave
    // the probe value on screen whenever React bails on an unchanged value.
    const fit = () => {
      const PROBE = 100;
      textEl.style.fontSize = `${PROBE}px`;
      // inline-block, so this is the width of the glyphs, not the container
      const glyphs = textEl.getBoundingClientRect().width;
      const available = wrapEl.clientWidth;
      if (!glyphs || !available) return;
      textEl.style.fontSize = `${Math.min((available / glyphs) * PROBE, max)}px`;
      setMeasured(true);
    };

    fit();
    // Observing the wrapper (a plain block) is safe: its width doesn't depend
    // on the text size, so resizing the text can't retrigger this.
    const ro = new ResizeObserver(fit);
    ro.observe(wrapEl);
    // Re-fit once the webfont swaps in, or we've measured the fallback face.
    document.fonts?.ready.then(fit).catch(() => {});
    return () => ro.disconnect();
  }, [children, max, accent?.text]);

  return (
    <div ref={wrap} className={className}>
      <span
        ref={text}
        className="inline-block whitespace-nowrap leading-[0.75]"
        style={measured ? undefined : { fontSize: "12vw", visibility: "hidden" }}
      >
        {children}
        {accent && <span className={accent.className}>{accent.text}</span>}
      </span>
    </div>
  );
}
