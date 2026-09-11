"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Reveal from "@/components/ui/Reveal";
import { formatCount, formatSince, istDay } from "@/lib/visits";

export type VisitorCopy = {
  eyebrow: string;
  title: string;
  totalLabel: string;
  totalLabelOne: string;
  todayLabel: string;
  sinceLabel: string;
  note: string;
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
  const [bump, setBump] = useState(0);

  /** Merge a fresh reading. A cached read can lag a fresh write by up to the
   *  cache window, so the total never runs backwards; "today" only drops when
   *  the day itself changes. A genuine increase fires the +N and the glow. */
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
      setBump((b) => b + 1);
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

  const since = counts?.since ?? counts?.day ?? null;
  const totalText = counts ? formatCount(counts.total) : "";
  // Digits and separators have different widths, so the fit rule in
  // globals.css needs them counted apart. Defaults size the skeleton.
  const digitCount = totalText.replace(/\D/g, "").length || 5;
  const sepCount = totalText ? totalText.length - digitCount : 1;

  return (
    <section
      ref={rootRef}
      aria-labelledby="visitors-title"
      className="relative isolate overflow-clip bg-carbon py-20 text-white md:py-24 xl:py-28"
    >
      {/* Moving light. Radial gradients rather than blur filters: a blurred
          layer is re-rasterised as it moves; a gradient is just composited. */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <span className="vc-blob vc-blob-a" />
        <span className="vc-blob vc-blob-b" />
        <span className="vc-blob vc-blob-c" />
        <span className="vc-grid" />
      </div>

      <div className="shell">
        {/* Number left, supporting figures right at desktop; stacked below. The
            columns align on their bottom edge, so the cards sit level with the
            foot of the number rather than floating at the top. */}
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)] lg:items-end lg:gap-16">
          <div className="vc-fit min-w-0">
            <Reveal variant="soft">
              <p className="flex flex-wrap items-center gap-3 text-[13px] font-medium tracking-[0.08em] text-spring-green uppercase">
                <span className="vc-live-dot" aria-hidden />
                {copy.eyebrow}
                {demo && (
                  <span className="rounded-full border border-white/30 px-2.5 py-0.5 text-[12px] tracking-normal text-white/80 normal-case">
                    Demo data — local preview only
                  </span>
                )}
              </p>
              <h2 id="visitors-title" className="type-band mt-6 max-w-[22ch] text-white">
                {copy.title}
              </h2>
            </Reveal>

            <Reveal variant="wipe" delay={120} className="mt-10 lg:mt-12">
              <div className="relative inline-block max-w-full">
                {bump > 0 && <span key={bump} aria-hidden className="vc-glow" />}
                <p
                  className="vc-number relative overflow-clip pr-1 font-display leading-none font-light text-white"
                  style={{ "--digits": digitCount, "--seps": sepCount } as React.CSSProperties}
                >
                  {counts ? (
                    <>
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
                  <span aria-hidden className="vc-sheen" />
                </p>
                <span aria-hidden className="pointer-events-none absolute -top-3 right-0">
                  {pops.map((p) => (
                    <span key={p.id} className="vc-pop">
                      +{formatCount(p.n)}
                    </span>
                  ))}
                </span>
              </div>
              <p className="type-lede mt-4 text-white/70">
                {counts?.total === 1 ? copy.totalLabelOne : copy.totalLabel}
              </p>
            </Reveal>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <Reveal variant="up" delay={220} threshold={0.85}>
              <div className="vc-card h-full rounded-lg border border-white/15 bg-white/[0.04] p-6">
                <p className="eyebrow text-white/65 uppercase">{copy.todayLabel}</p>
                <p className="mt-3 font-display text-[clamp(2rem,1.6rem+1.6vw,2.75rem)] leading-none font-light text-white">
                  {counts ? (
                    <>
                      <span className="sr-only">
                        {formatCount(counts.today)} {counts.today === 1 ? "visitor" : "visitors"} today
                      </span>
                      <Odometer value={counts.today} rolled={rolled} />
                    </>
                  ) : (
                    "—"
                  )}
                </p>
              </div>
            </Reveal>
            <Reveal variant="up" delay={340} threshold={0.85}>
              <div className="vc-card h-full rounded-lg border border-white/15 bg-white/[0.04] p-6">
                <p className="eyebrow text-white/65 uppercase">{copy.sinceLabel}</p>
                <p className="mt-3 font-display text-[clamp(2rem,1.6rem+1.6vw,2.75rem)] leading-none font-light text-white">
                  {since ? formatSince(since) : "—"}
                </p>
              </div>
            </Reveal>
          </div>
        </div>

        <p className="mt-10 text-[14px] text-white/60">{copy.note}</p>
      </div>
    </section>
  );
}
