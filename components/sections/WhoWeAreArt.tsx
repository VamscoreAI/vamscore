import { cx } from "@/components/ui";

/**
 * The media half of "Who we are" — Vamscore's own artwork, not a photograph.
 *
 * **What it depicts.** Fourteen dot-columns, one per year of operation, start
 * scattered, dim and grey on the left. Moving right they snap into alignment,
 * warm towards spring-green and pull toward the centreline, then thin out and
 * hand off to four lanes that converge through an aperture. Signal pulses run
 * the lanes left to right.
 *
 * That is the section's own paragraph: many parallel unstructured efforts over
 * fourteen years — BPO, robotics, media, telecom, channel, education —
 * resolving into a few structured flows and finally into one thing that carries
 * signal. Left to right is chronology. Deliberately no dot-to-dot connectors:
 * the connector mesh is the AI-graphic cliché and this is not it.
 *
 * **Why it exists.** This replaced six Kyndryl photographs Vamscore had no right to
 * publish, and a "Watch" button whose href was `"#"`. Being generated, it needs
 * no licence and never needs replacing — unlike everything else under
 * `public/assets`.
 *
 * **Server component, zero client JS.** All motion is time-based CSS. The file
 * this replaced was `"use client"` for one reason, a `setInterval`, and that is
 * gone along with ~450 KB of eagerly-loaded stills.
 *
 * The frame keeps `aspect-[855/481]` deliberately: at `lg` the parent section
 * is `py-0`, so this panel's ratio is the only thing setting the band's height.
 * Change it and the whole section resizes — see the `SectionNav` note in
 * `VisionMission.tsx` for why a shrinking section is a problem.
 */

/** viewBox is 1:1 with the panel's intrinsic size, so every number here reads
 *  directly against the frame. */
const W = 855;
const H = 481;

const COLS = 14; // one per year since 2012
const ROWS = 11;
const CX = 711; // the aperture: exactly the last column
const CY = H / 2;

/**
 * Integer hash, not `Math.random()` — the field is generated at module scope and
 * must stringify identically on server and client or hydration mismatches.
 *
 * Deliberately not the usual `Math.sin(i * 12.9898) * 43758.5453` trick either:
 * `Math.sin` is not guaranteed bit-identical across JS engines, so a coordinate
 * could differ between Node and V8. `Math.imul` is exact by spec.
 */
function hash(a: number, b: number) {
  let h = Math.imul(a + 1, 374761393) ^ Math.imul(b + 1, 668265263);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

const r1 = (n: number) => Math.round(n * 10) / 10;
const r2 = (n: number) => Math.round(n * 100) / 100;

type Dot = { cx: number; cy: number; r: number; o: number; m: string };

/** Built once, on the server. Never re-run in the browser. */
const FIELD: Dot[][] = [[], [], []];

for (let i = 0; i < COLS; i++) {
  const t = i / (COLS - 1);
  // smoothstep: slow start, hard resolve — the years "click" into place late
  const e = t * t * (3 - 2 * t);
  // the last three columns fade out so the field BECOMES the flow rather than
  // piling into a blob where the lanes begin
  const fade = t <= 0.78 ? 1 : 1 - ((t - 0.78) / 0.22) * 0.72;
  const group = i < 5 ? 0 : i < 10 ? 1 : 2;

  for (let j = 0; j < ROWS; j++) {
    const x = 48 + i * 51;
    const y = 40 + j * 40;
    // swapped args give a second, decorrelated stream so x and y scatter
    // independently; both die out as `e` rises
    const jx = (hash(i, j) - 0.5) * 26 * (1 - e);
    const jy = (hash(j, i) - 0.5) * 30 * (1 - e);
    const y0 = y + jy;

    FIELD[group].push({
      cx: r1(x + jx),
      cy: r1(y0 + (CY - y0) * e * 0.62),
      r: r1((1.7 + 1.3 * e) * (0.55 + 0.45 * fade)),
      // Floor at 0.26, not 0.14: grey at 0.14 on carbon is effectively
      // invisible, so the early years disappeared and the panel read as seven
      // years rather than fourteen. The ramp still doubles across the field.
      o: r2((0.26 + 0.4 * e) * fade),
      // quantised to deciles: fewer distinct values, better compression
      m: `${Math.round(e * 10) * 10}%`,
    });
  }
}

/** Four lanes, entering and exiting off-canvas so no stub ends show, all
 *  arriving in a tight bundle at the aperture. */
const LANES = [
  "M -20 84 C 150 84 250 120 360 176 C 470 232 560 238 875 238",
  "M -20 190 C 140 190 240 200 360 214 C 470 227 560 236 875 240",
  "M -20 300 C 150 300 250 292 360 268 C 470 244 560 242 875 242",
  "M -20 408 C 160 408 260 366 360 306 C 470 242 570 244 875 244",
];

/** Where each pulse rests when it is not animating. Reduced-motion readers get
 *  four bright segments spread along the lanes, not an empty frame. */
const PARK = [-20, -40, -58, -76];

export default function WhoWeAreArt({ className }: { className?: string }) {
  return (
    <div className={cx("relative aspect-[855/481] w-full bg-carbon", className)}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="xMidYMid slice"
        aria-hidden
        className="absolute inset-0 size-full"
      >
        <defs>
          <radialGradient id="uv-glow" cx="83%" cy="50%" r="42%">
            <stop offset="0%" stopColor="var(--color-spring-green)" stopOpacity="0.1" />
            <stop offset="100%" stopColor="var(--color-spring-green)" stopOpacity="0" />
          </radialGradient>
        </defs>

        <rect width={W} height={H} fill="url(#uv-glow)" />

        {/* The field. Three groups drifting on different periods. */}
        {FIELD.map((dots, g) => (
          <g
            key={g}
            className={`uv-field uv-field-${"abc"[g]}`}
          >
            {dots.map((d, k) => (
              <circle
                key={k}
                cx={d.cx}
                cy={d.cy}
                r={d.r}
                opacity={d.o}
                style={{ "--m": d.m } as React.CSSProperties}
              />
            ))}
          </g>
        ))}

        {/* Lanes: the structure the field resolves into. */}
        {LANES.map((d, i) => (
          <path
            key={`lane-${i}`}
            d={d}
            fill="none"
            stroke="var(--color-stone)"
            strokeOpacity="0.38"
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
          />
        ))}

        {/* Pulses, phased so no two are ever in the same place. */}
        {LANES.map((d, i) => (
          <path
            key={`pulse-${i}`}
            d={d}
            className="uv-pulse"
            pathLength="100"
            fill="none"
            stroke="var(--color-spring-green)"
            strokeWidth="2"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
            style={
              {
                "--park": PARK[i],
                animationDelay: `${i * 1.4}s`,
              } as React.CSSProperties
            }
          />
        ))}

        {/* The aperture — the one place coral appears. Spring-green carries the
            flow; flame-2 is reserved for this single focal point. */}
        <g>
          <circle
            className="uv-halo"
            cx={CX}
            cy={CY}
            r="7"
            fill="var(--color-flame-2)"
            opacity="0.85"
          />
          <circle
            cx={CX}
            cy={CY}
            r="26"
            fill="none"
            stroke="var(--color-flame-2)"
            strokeOpacity="0.3"
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
          />
          <circle
            className="uv-orbit"
            cx={CX}
            cy={CY}
            r="44"
            fill="none"
            stroke="var(--color-flame-2)"
            strokeOpacity="0.5"
            strokeWidth="1"
            strokeDasharray="2 10"
            vectorEffect="non-scaling-stroke"
          />
          <circle cx={CX} cy={CY} r="3.5" fill="var(--color-flame-2)" />
        </g>
      </svg>
    </div>
  );
}
