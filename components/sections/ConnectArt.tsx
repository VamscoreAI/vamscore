import { cx } from "@/components/ui";

/**
 * The closing artwork beside "Connect with us" — UV's own, generated here.
 *
 * **What it depicts.** Rings expanding outward from a single point, passing
 * through a quiet dot grid. A signal going out, which is exactly what the
 * section is asking the reader to answer.
 *
 * Deliberately a *different* motif from `WhoWeAreArt` — that one resolves left
 * to right into a flow; this one radiates from a point. The same idiom twice on
 * one page would read as a tic rather than a system.
 *
 * **Why it exists.** It replaced a newsletter form that was demo-only and said
 * so out loud: submitting it printed "this demo form doesn't send anything."
 * Removing it also let `Connect` drop `"use client"`.
 *
 * Server component, zero client JS. All motion is time-based CSS, declared
 * inside the reduced-motion `no-preference` guard.
 */

const W = 560;
const H = 420;
const CX = W / 2;
const CY = H / 2;

/** Same integer hash as the Who-we-are field: deterministic across server and
 *  client, and unlike `Math.sin` it is exact by spec in every engine. */
function hash(a: number, b: number) {
  let h = Math.imul(a + 1, 374761393) ^ Math.imul(b + 1, 668265263);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

const r1 = (n: number) => Math.round(n * 10) / 10;
const r2 = (n: number) => Math.round(n * 100) / 100;

/** A quiet grid for the rings to pass through. Dots fade with distance from the
 *  centre, so the field reads as depth rather than wallpaper. */
const DOTS: { cx: number; cy: number; r: number; o: number }[] = [];
for (let i = 0; i < 13; i++) {
  for (let j = 0; j < 10; j++) {
    const x = 20 + i * 43;
    const y = 20 + j * 43;
    const d = Math.hypot(x - CX, y - CY) / Math.hypot(CX, CY);
    DOTS.push({
      cx: r1(x + (hash(i, j) - 0.5) * 7),
      cy: r1(y + (hash(j, i) - 0.5) * 7),
      r: r1(1.4 + (1 - d) * 1.1),
      o: r2(0.5 - d * 0.36),
    });
  }
}

/** Four rings, evenly phased across the 6.4s cycle. `rest` is where each sits
 *  when nothing is animating, so reduced-motion readers get concentric rings
 *  rather than four invisible ones. */
const RINGS = [
  { delay: 0, rest: 0.4 },
  { delay: 1.6, rest: 0.6 },
  { delay: 3.2, rest: 0.8 },
  { delay: 4.8, rest: 1 },
];

export default function ConnectArt({ className }: { className?: string }) {
  return (
    <div className={cx("relative aspect-[4/3] w-full", className)}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        aria-hidden
        className="absolute inset-0 size-full"
      >
        <g>
          {DOTS.map((d, i) => (
            <circle
              key={i}
              cx={d.cx}
              cy={d.cy}
              r={d.r}
              fill="var(--color-stone)"
              opacity={d.o}
            />
          ))}
        </g>

        {RINGS.map((ring, i) => (
          <circle
            key={i}
            className="uv-ring"
            cx={CX}
            cy={CY}
            r="168"
            fill="none"
            stroke="var(--color-flame-2)"
            strokeWidth="1.5"
            vectorEffect="non-scaling-stroke"
            style={
              {
                "--rest": ring.rest,
                animationDelay: `${ring.delay}s`,
              } as React.CSSProperties
            }
          />
        ))}

        {/* The origin of the signal. The one coral solid, matching the single
            focal point in the Who-we-are panel. */}
        <circle cx={CX} cy={CY} r="26" fill="var(--color-cloud)" />
        <circle
          cx={CX}
          cy={CY}
          r="26"
          fill="none"
          stroke="var(--color-flame-2)"
          strokeOpacity="0.35"
          strokeWidth="1"
          vectorEffect="non-scaling-stroke"
        />
        <circle cx={CX} cy={CY} r="5" fill="var(--color-flame-2)" />
      </svg>
    </div>
  );
}
