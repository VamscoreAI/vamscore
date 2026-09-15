"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Reveal from "@/components/ui/Reveal";
import { formatCount, istDay } from "@/lib/visits";

export type VisitorCopy = {
  eyebrow: string;
  title: string;
  todayLabel: string;
};

type Counts = {
  total: number;
  today: number;
  day: string;
  since: string | null;
  demo?: boolean;
};

/** The day this browser was last counted — so a visit is only POSTed once a day. */
const STORAGE_KEY = "vamscore:counted-day";
/** Matches the edge cache on GET /api/visits; polling faster would only re-read the cache. */
const POLL_MS = 20_000;
const DEMO_POLL_MS = 6_000;
/** How long to wait for the IntersectionObserver's first report before assuming it will never come. */
const OBSERVER_GRACE_MS = 1_000;
const DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

/**
 * The falling balls, spread across the whole section.
 *
 * Placed by a golden-ratio sequence rather than `Math.random()`: it is
 * deterministic, so server and client render identical markup, and it spaces
 * the balls evenly instead of clumping them the way random draws do. x starts
 * a little off the left edge because every ball drifts right as it falls.
 *
 * 28 at 7–12s per fall keeps the density even — below lg, CSS shows every
 * other one, since a phone has a third of the width to fill.
 */
const fract = (n: number) => n - Math.floor(n);
const BALLS = Array.from({ length: 28 }, (_, i) => ({
  x: (-12 + fract(i * 0.618034) * 106).toFixed(1),
  s: 6 + Math.round(fract(i * 0.754878 + 0.3) * 10),
  t: (7 + fract(i * 0.569840 + 0.1) * 5).toFixed(2),
  delay: (-fract(i * 0.430160 + 0.7) * 12).toFixed(2),
  o: (0.35 + fract(i * 0.891207 + 0.5) * 0.55).toFixed(2),
  c: i % 3 === 0 ? "flame" : "flame-2",
}));

/**
 * A rolling odometer. Each digit is a column holding a 0–9 strip, shifted by
 * `--d` tenths of its height; changing a digit animates the shift. Columns are
 * keyed by their position from the RIGHT, so when the number grows a digit the
 * existing columns keep their identity and roll, and only the new leading
 * column mounts. While `rolled` is false every digit sits on 0 in the target's
 * shape, so the first reveal rolls the whole number up from zero.
 */
function Odometer({ value, rolled }: { value: number; rolled: boolean }) {
  const chars = [...formatCount(value)];
  return (
    <span aria-hidden className="vc-odometer">
      {chars.map((c, i) => {
        const pos = chars.length - i;
        if (!/\d/.test(c)) {
          return (
            <span key={`s${pos}`} className="vc-sep">
              {c}
            </span>
          );
        }
        return (
          <span key={`d${pos}`} className="vc-col vc-col-enter">
            <span
              className="vc-strip"
              style={{ "--d": rolled ? Number(c) : 0, "--i": pos } as React.CSSProperties}
            >
              {DIGITS.map((n) => (
                <span key={n}>{n}</span>
              ))}
            </span>
          </span>
        );
      })}
    </span>
  );
}

export default function VisitorCounterLive({ copy }: { copy: VisitorCopy }) {
  const rootRef = useRef<HTMLElement>(null);
  const latest = useRef<Counts | null>(null);
  const inViewRef = useRef(false);
  const observerReported = useRef(false);
  const popSeq = useRef(0);

  const [counts, setCounts] = useState<Counts | null>(null);
  const [failed, setFailed] = useState(false);
  const [inView, setInView] = useState(false);
  const [rolled, setRolled] = useState(false);
  const [pops, setPops] = useState<{ id: number; n: number }[]>([]);

  /** Merge a fresh reading. A cached read can lag a fresh write by up to the
   *  cache window, so the total never runs backwards; "today" only drops when
   *  the day itself changes. A genuine increase floats a +N over the number. */
  const apply = useCallback((next: Counts) => {
    const prev = latest.current;
    const merged: Counts = !prev
      ? next
      : {
          ...next,
          total: Math.max(prev.total, next.total),
          today: next.day === prev.day ? Math.max(prev.today, next.today) : next.today,
        };
    if (prev && merged.total > prev.total) {
      const id = ++popSeq.current;
      setPops((p) => [...p.slice(-2), { id, n: merged.total - prev.total }]);
      window.setTimeout(() => setPops((p) => p.filter((x) => x.id !== id)), 1800);
    }
    latest.current = merged;
    setCounts(merged);
  }, []);

  // Count this visit (once per day), or just read.
  useEffect(() => {
    let cancelled = false;
    const day = istDay(new Date());
    let countedDay: string | null = null;
    try {
      countedDay = localStorage.getItem(STORAGE_KEY);
    } catch {
      /* storage blocked — the server still dedupes */
    }
    const alreadyCounted = countedDay === day;

    fetch("/api/visits", alreadyCounted ? undefined : { method: "POST", keepalive: true })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((data: Counts) => {
        if (cancelled) return;
        if (!alreadyCounted) {
          try {
            localStorage.setItem(STORAGE_KEY, day);
          } catch {
            /* ignore */
          }
        }
        apply(data);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });

    return () => {
      cancelled = true;
    };
  }, [apply]);

  /*
   * Visibility: it starts the roll-up and gates polling.
   *
   * The observer's first callback is not guaranteed. A backgrounded or
   * unfocused page can stop running rendering steps, and with them both
   * IntersectionObserver and requestAnimationFrame — while timers keep going.
   * Measured in exactly that state, the number sat on its starting zeros
   * indefinitely and never polled: a wrong figure on screen, not just a missed
   * animation. So if the observer hasn't reported within a second, treat the
   * section as visible. When the observer does work and the section is below
   * the fold, the roll still waits for the reader to scroll to it.
   */
  useEffect(() => {
    const el = rootRef.current;
    const assumeVisible = () => {
      inViewRef.current = true;
      setInView(true);
    };
    if (!el || typeof IntersectionObserver === "undefined") {
      const t = window.setTimeout(assumeVisible, 0);
      return () => window.clearTimeout(t);
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        observerReported.current = true;
        inViewRef.current = entry.isIntersecting;
        if (entry.isIntersecting) setInView(true);
      },
      { threshold: 0.2 }
    );
    io.observe(el);
    const grace = window.setTimeout(() => {
      if (!observerReported.current) assumeVisible();
    }, OBSERVER_GRACE_MS);
    return () => {
      io.disconnect();
      window.clearTimeout(grace);
    };
  }, []);

  // A timer, not requestAnimationFrame, for the same reason as above: rAF can
  // stop entirely. 80ms is several frames — long enough for the zeros to paint,
  // so the roll has a start state to transition from.
  useEffect(() => {
    if (!inView || !counts || rolled) return;
    const t = window.setTimeout(() => setRolled(true), 80);
    return () => window.clearTimeout(t);
  }, [inView, counts, rolled]);

  // Live updates, only while the section is on screen in a visible tab.
  const hasCounts = counts !== null;
  const demo = counts?.demo ?? false;
  useEffect(() => {
    if (!hasCounts) return;
    const id = window.setInterval(
      () => {
        if (document.visibilityState !== "visible" || !inViewRef.current) return;
        fetch("/api/visits")
          .then((r) => (r.ok ? r.json() : null))
          .then((data: Counts | null) => {
            if (data) apply(data);
          })
          .catch(() => {});
      },
      demo ? DEMO_POLL_MS : POLL_MS
    );
    return () => window.clearInterval(id);
  }, [hasCounts, demo, apply]);

  const totalText = counts ? formatCount(counts.total) : "";
  // Digits and separators have different widths, so the fit rule in
  // globals.css needs them counted apart. Defaults size the skeleton.
  const digitCount = totalText.replace(/\D/g, "").length || 3;
  const sepCount = totalText ? totalText.length - digitCount : 0;
  // On the first day every visit is also today's, so "6 today" under "6"
  // would say the same thing twice. It appears once the two differ.
  const showToday = counts !== null && counts.today > 0 && counts.today < counts.total;

  return (
    <section
      ref={rootRef}
      aria-labelledby="visitors-title"
      data-rolled={rolled}
      className="relative isolate overflow-clip bg-white py-16 text-dark-stone md:py-24 xl:py-28"
    >
      <div aria-hidden className="vc-balls pointer-events-none absolute inset-0 -z-10">
        {BALLS.map((b, i) => (
          <span
            key={i}
            className="vc-ball"
            style={
              {
                "--x": `${b.x}%`,
                "--s": `${b.s}px`,
                "--t": `${b.t}s`,
                "--delay": `${b.delay}s`,
                "--o": b.o,
                "--c": `var(--color-${b.c})`,
              } as React.CSSProperties
            }
          />
        ))}
      </div>

      {/* Heading left, number right at desktop, both sitting on one baseline;
          stacked below that. */}
      <div className="shell grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)] lg:items-end lg:gap-16">
        <Reveal variant="soft">
          <p className="eyebrow flex items-center gap-2.5 tracking-[0.05em] text-carbon uppercase">
            <span className="vc-live-dot" aria-hidden />
            {copy.eyebrow}
            {demo && (
              <span className="rounded-full border border-line px-2.5 py-0.5 text-[12px] tracking-normal text-stone normal-case">
                Demo data — local preview only
              </span>
            )}
          </p>
          <h2 id="visitors-title" className="type-band mt-5 max-w-[16ch] text-carbon">
            {copy.title}
          </h2>
        </Reveal>

        <Reveal variant="wipe" delay={120} className="vc-fit min-w-0 lg:text-right">
          <div className="relative inline-block max-w-full">
            <p
              className="vc-number overflow-clip pr-1 font-display leading-none font-light text-flame-2"
              style={{ "--digits": digitCount, "--seps": sepCount } as React.CSSProperties}
            >
              {counts ? (
                <>
                  {/* No visible label under the number, so screen readers get
                      the unit here instead of a bare figure. */}
                  <span className="sr-only">
                    {totalText} {counts.total === 1 ? "visitor" : "visitors"}
                  </span>
                  <Odometer value={counts.total} rolled={rolled} />
                </>
              ) : failed ? (
                <span aria-label="Visitor count unavailable">—</span>
              ) : (
                <span className="vc-skeleton" aria-label="Loading visitor count" />
              )}
            </p>
            <span aria-hidden className="pointer-events-none absolute -top-2 right-0">
              {pops.map((p) => (
                <span key={p.id} className="vc-pop">
                  +{formatCount(p.n)}
                </span>
              ))}
            </span>
          </div>

          <span aria-hidden className="vc-rule mt-5 block h-[2px] w-full bg-flame-2" />

          {/* Reserves its line while loading, so nothing below jumps. */}
          <p className="mt-5 flex min-h-8 flex-wrap items-center gap-x-4 gap-y-2 text-[clamp(1.125rem,0.95rem+0.5vw,1.5rem)] leading-[1.333] font-light lg:justify-end">
            {showToday && (
              <span className="inline-flex items-center gap-2 rounded-full border border-line bg-cloud px-3 py-1 text-[14px] leading-5 font-normal text-carbon">
                <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-spring-green" />
                {formatCount(counts.today)} {copy.todayLabel}
              </span>
            )}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
