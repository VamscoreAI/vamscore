"use client";

import { useEffect, useRef, useState } from "react";
import { SECTION_NAV } from "@/content/home";
import { cx } from "@/components/ui";

/**
 * The pill capsule that tracks which section you're in — the page-level tier of
 * navigation, sitting directly under the site-level tier in `Header`.
 *
 * **It is drawn in the header's own language, deliberately.** Carbon ground,
 * 14px/20px links at `px-4 py-2` — the exact type and metrics of
 * `Header.tsx`'s primary nav — spring-green on hover, and an active pill filled
 * spring-green on deep-forest, which is the header's "Talk to us" treatment.
 * Read together they are one navigation system with two tiers rather than a
 * dark bar with an unrelated white widget floating beneath it.
 *
 * It was a #f9f9f9 track of 12px links with a dark active pill: the inverse of
 * the header in every respect, at a size nothing else on the page used.
 *
 * Both states carry the same font weight on purpose. Bolding the active one
 * changes its measured width, so the capsule twitches as you scroll past each
 * section — a jitter you feel without being able to name.
 *
 * At 375 the capsule holds 643px of links in 323px and hides its scrollbar, so
 * the second effect below keeps the active link in view. Without it the tracker
 * tracks a section you cannot see, which is worse than not tracking at all.
 */
export default function SectionNav() {
  const [active, setActive] = useState(SECTION_NAV[0].id);
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const sections = SECTION_NAV.map((s) => document.getElementById(s.id)).filter(
      (el): el is HTMLElement => el !== null
    );
    if (!sections.length) return;

    // Treat the band just below the sticky chrome as the "current" line:
    // whichever section owns it wins, which is how the original highlights.
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: "-175px 0px -55% 0px", threshold: [0, 0.25, 0.5, 1] }
    );

    sections.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // Scroll the active link into view — horizontally, inside the capsule only.
  // `scrollIntoView` is wrong here: it walks up and scrolls every scrollable
  // ancestor, so it would yank the page itself while the reader is scrolling it.
  useEffect(() => {
    const list = listRef.current;
    const el = list?.querySelector<HTMLElement>('[aria-current="true"]');
    if (!list || !el) return;
    if (list.scrollWidth <= list.clientWidth) return;

    // Rects, not `offsetLeft`. `offsetLeft` is measured from the nearest
    // positioned ancestor — here the sticky wrapper, several boxes and a
    // centring margin away — while `scrollLeft` is measured from the list's own
    // content box. Mixing the two left the last item short of the viewport.
    const listBox = list.getBoundingClientRect();
    const elBox = el.getBoundingClientRect();
    const offset = list.scrollLeft + (elBox.left - listBox.left);

    const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    list.scrollTo({
      left: offset - (list.clientWidth - elBox.width) / 2,
      behavior: smooth ? "smooth" : "auto",
    });
  }, [active]);

  return (
    <div className="sticky top-[60px] z-40 bg-white py-4 lg:top-[72px]">
      <nav aria-label="On this page" className="flex justify-center px-5">
        {/* The shadow is carbon-tinted rather than black so the capsule reads as
            lifted off the white page, not as a dark box with a grey halo. */}
        <div className="max-w-full rounded-full bg-carbon p-1.5 shadow-[0_8px_24px_-8px_rgba(22,22,22,0.45)]">
          <ul ref={listRef} className="no-scrollbar flex max-w-full overflow-x-auto">
            {SECTION_NAV.map((item) => (
              <li key={item.id} className="shrink-0">
                <a
                  href={`#${item.id}`}
                  aria-current={active === item.id ? "true" : undefined}
                  className={cx(
                    // px-4 py-2 / 14px / leading-5 — Header.tsx:88 exactly.
                    // 36px tall, so it clears the 24px target minimum too.
                    "block rounded-full px-4 py-2 text-[15px] leading-5 whitespace-nowrap transition-colors",
                    active === item.id
                      ? "bg-spring-green text-deep-forest"
                      : "text-white/75 hover:text-spring-green"
                  )}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </div>
  );
}
