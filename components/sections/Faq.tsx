"use client";

import { useId, useState } from "react";
import { FAQ } from "@/content/home";
import { ArrowLink, Section, cx } from "@/components/ui";

/**
 * Topics on the left, answers on the right.
 *
 * **The left column used to run out.** A two-line heading and a wrapped row of
 * four pills came to 366px beside a 715px stack of answers — 349px of nothing,
 * which is what you saw. Three things fill it, all of them content rather than
 * padding:
 *
 * - the topics are a vertical index with question counts, not a pill wrap, so
 *   they read as a table of contents and occupy the column properly;
 * - a route out for anyone whose question is not on the list;
 * - and the whole column is sticky on desktop, so opening answers grows the
 *   right side while the index stays with you instead of scrolling away.
 *
 * The heading is static again. It used to append the active tab's label to
 * "Answers to questions about", which read "…about About Vamscore" on the tab that
 * opens by default. The tab name now sits over the answers it belongs to.
 *
 * **Answers open by default.** No topic here holds more than three questions and
 * none of the answers runs past four lines, so collapsing them hid a screen of
 * copy behind three clicks and left the column shorter than the index next to
 * it. They still collapse — the control is for putting an answer away, not for
 * getting at it.
 */
export default function Faq() {
  // Tab 0 is "About Vamscore" — the only tab whose answers are real copy. This was
  // 1 ("Services"), inherited from the original, whose two answers are both
  // still bracketed placeholders, so the FAQ opened on nothing useful.
  const [tab, setTab] = useState(0);
  const [open, setOpen] = useState<Set<number>>(() => allOpen(0));
  const uid = useId();

  const items = FAQ.tabs[tab].items;

  const toggle = (i: number) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (!next.delete(i)) next.add(i);
      return next;
    });

  return (
    <Section id="faq" tone="light">
      <div className="shell grid gap-12 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-5">
          {/* 168px = the 72px header plus the 80px section-nav band, plus a
              breath. Anything less and the index slides under the chrome. */}
          <div className="lg:sticky lg:top-[168px]">
            <h2 className="text-[clamp(1.375rem,1.15rem+0.6vw,1.7rem)] leading-[1.324] font-normal text-carbon">
              <span className="block">{FAQ.titleLines[0]}</span>
              <span className="block">{FAQ.titleLines[1]}</span>
            </h2>

            <ul
              role="tablist"
              aria-label="FAQ topics"
              aria-orientation="vertical"
              className="mt-8 border-t border-line"
            >
              {FAQ.tabs.map((t, i) => {
                const selected = tab === i;
                return (
                  <li key={t.label} role="presentation">
                    <button
                      type="button"
                      role="tab"
                      id={`${uid}-tab-${i}`}
                      aria-selected={selected}
                      aria-controls={`${uid}-panel`}
                      onClick={() => {
                        setTab(i);
                        setOpen(allOpen(i));
                      }}
                      className={cx(
                        "flex w-full items-center justify-between gap-4 border-b border-line py-4 text-left transition-colors",
                        selected ? "text-carbon" : "text-stone hover:text-carbon"
                      )}
                    >
                      <span className="flex min-w-0 items-center gap-3">
                        {/* The rule doubles in length and turns coral on the
                            active row — the same marker the objectives ledger
                            on /about uses. Colour is not carrying this alone:
                            the label darkens to carbon as well. */}
                        <span
                          aria-hidden
                          className={cx(
                            "h-px shrink-0 transition-all duration-300",
                            selected ? "w-10 bg-flame" : "w-5 bg-line"
                          )}
                        />
                        <span className="truncate text-[17px] leading-6">
                          {t.label}
                        </span>
                      </span>
                      <span className="shrink-0 text-[13px] tabular-nums text-stone">
                        {t.items.length}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>

          </div>
        </div>

        <div
          id={`${uid}-panel`}
          role="tabpanel"
          aria-labelledby={`${uid}-tab-${tab}`}
          className="lg:col-span-6 lg:col-start-7"
        >
          {/* Names the topic the answers belong to, now the heading no longer
              does. Not a heading element itself — the questions below are the
              h3s and this would sit between h2 and h3 for no reason. */}
          <p className="eyebrow text-stone uppercase">{FAQ.tabs[tab].label}</p>

          <ul className="mt-6 border-t border-line">
            {items.map((item, i) => {
              const expanded = open.has(i);
              return (
                <li key={item.q} className="border-b border-line">
                  <h3>
                    <button
                      type="button"
                      aria-expanded={expanded}
                      aria-controls={`${uid}-a-${i}`}
                      onClick={() => toggle(i)}
                      className="flex w-full items-start justify-between gap-6 py-6 text-left"
                    >
                      <span className="min-w-0 flex-1 text-[clamp(1.125rem,1rem+0.35vw,1.25rem)] leading-[1.4] font-normal text-carbon">{item.q}</span>
                      <span
                        aria-hidden
                        className={cx(
                          "mt-1 shrink-0 transition-transform duration-300",
                          expanded && "rotate-45"
                        )}
                      >
                        <PlusIcon />
                      </span>
                    </button>
                  </h3>
                  <div
                    id={`${uid}-a-${i}`}
                    hidden={!expanded}
                    className="pb-7 text-base leading-6"
                  >
                    {item.a}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {/* The way out, as a full-width row rather than a block under the index.
          Two reasons: it uses the width instead of stacking more into a column
          that was already the taller of the two, and it leaves the index short
          enough that its `sticky` finally has somewhere to travel — with the
          columns near-equal it had none and simply sat there. */}
      <div className="shell mt-14 xl:mt-20">
        <div className="flex flex-col gap-4 border-t border-line pt-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[17px] leading-6 text-carbon">
              {FAQ.fallback.heading}
            </p>
            <p className="type-body mt-2">{FAQ.fallback.body}</p>
          </div>
          <ArrowLink
            href={FAQ.fallback.cta.href}
            className="shrink-0 text-carbon"
          >
            {FAQ.fallback.cta.label}
          </ArrowLink>
        </div>
      </div>
    </Section>
  );
}

/** Every answer in a topic, open. Used on load and whenever the topic changes. */
function allOpen(tabIndex: number) {
  return new Set(FAQ.tabs[tabIndex].items.map((_, i) => i));
}

function PlusIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M9 2v14M2 9h14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}
