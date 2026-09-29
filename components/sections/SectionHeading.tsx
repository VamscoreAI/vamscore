import { Fragment, type CSSProperties, type ReactNode } from "react";
import { cx } from "@/components/ui";
import Reveal from "@/components/ui/Reveal";
import { lightGroups, splitHeading } from "@/lib/sectionHeading";

/**
 * The large heading that opens each home-page section:
 *
 *   ── 01 / OUR STORY
 *   our story●
 *
 * Every word but the last is ExtraLight (200); the last is Bold (700) in the
 * logo's gradient; an "&" is flame; a flame dot with a soft ring ends it.
 * `text` is the section's own name from content/, so no copy lives here.
 *
 * **Motion** (styles in globals.css, "Section headings"). `Reveal` in its
 * `none` mode is the trigger: one IntersectionObserver, fires once, and hands
 * `data-shown` to this block. Each word then rises out of its own mask, 80ms
 * apart; the dot pops in last with a small overshoot; the label and `aside`
 * fade up after. Under reduced motion all of it is simply there.
 *
 * **Masks and descenders.** A word mask is a clip-path, not `overflow:hidden`:
 * clip-path can reach past the box (so the "y" of "story" is not cut at the
 * 1.0 line height) and, unlike overflow, leaves the inline-block's baseline on
 * the text, which is what seats the dot on the baseline like a full stop.
 *
 * **Screen readers** get the plain phrase once, from an sr-only span; the
 * split, per-word spans are aria-hidden, as is the "01 /" label, which only
 * repeats the heading.
 */

/** ms between one word starting to rise and the next. */
const STAGGER = 80;

export default function SectionHeading({
  index,
  label,
  text,
  theme = "light",
  aside,
  className,
}: {
  /** "01", "02", … */
  index: string;
  /** The section's name as the pill nav writes it, e.g. "Our story". */
  label: string;
  /** The heading phrase; its last word becomes the accent. */
  text: string;
  theme?: "light" | "dark";
  /** Sits beside the heading on wide screens, bottom-aligned; below it on narrow. */
  aside?: ReactNode;
  className?: string;
}) {
  const { light, accent } = splitHeading(text);

  // Each rising word gets its place in the stagger.
  let n = 0;
  const groups = lightGroups(light).map((group) => group.map((word) => ({ word, i: n++ })));
  const accentIndex = n;
  // The dot lands as the accent word settles; label and aside follow.
  const settle = accentIndex * STAGGER;
  const vars = (v: Record<string, string | number>) => v as CSSProperties;

  const word = (w: string, i: number, kind: "light" | "amp" | "accent") => (
    <span className="sh-mask">
      <span className={`sh-word sh-${kind}`} style={vars({ "--i": i })}>
        {w}
      </span>
    </span>
  );

  return (
    <Reveal variant="none" className={cx("sh", theme === "dark" && "sh--dark", className)}>
      <div className="sh-row">
        <div className="min-w-0">
          <p aria-hidden className="sh-label sh-fade" style={vars({ "--fade-delay": `${settle + 240}ms` })}>
            {index} / {label}
          </p>

          <h2 className="sh-heading">
            <span className="sr-only">{[...light, accent].join(" ")}</span>
            <span aria-hidden>
              {groups.map((group, g) => (
                <Fragment key={g}>
                  <span className="whitespace-nowrap">
                    {group.map(({ word: w, i }, k) => (
                      <Fragment key={i}>
                        {k > 0 && " "}
                        {word(w, i, w === "&" ? "amp" : "light")}
                      </Fragment>
                    ))}
                  </span>{" "}
                </Fragment>
              ))}
              {/* The accent and the dot never part company across a line break. */}
              <span className="whitespace-nowrap">
                {word(accent, accentIndex, "accent")}
                <span className="sh-dot" style={vars({ "--dot-delay": `${settle + 420}ms` })} />
              </span>
            </span>
          </h2>
        </div>

        {aside && (
          <div className="sh-aside sh-fade" style={vars({ "--fade-delay": `${settle + 360}ms` })}>
            {aside}
          </div>
        )}
      </div>
    </Reveal>
  );
}

/**
 * The decorative layer behind a section: a dot grid that fades out downward,
 * plus one or two soft colour glows. Absolutely positioned, aria-hidden and
 * click-through; the section clips it (`overflow-clip`), so the glows can
 * overhang the edges without ever adding horizontal scroll.
 */
export function SectionBackdrop({ variant }: { variant: "story" | "vision" | "record" }) {
  return (
    <div aria-hidden className={`sh-backdrop sh-backdrop--${variant}`}>
      <div className="sh-dots" />
      <div className="sh-glow sh-glow-1" />
      {variant === "vision" && <div className="sh-glow sh-glow-2" />}
    </div>
  );
}
