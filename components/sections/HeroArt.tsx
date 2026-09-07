/**
 * Hero slide three — "Fourteen years of operations behind it".
 *
 * **What it depicts.** Fourteen ridges, one per year of operation, stacked from
 * the horizon down to the foreground. Each fills with carbon, so a nearer year
 * occludes the ones behind it and the stack reads as accumulated depth rather
 * than as fourteen lines. They start flat and grey at the left, then swell into
 * peaks that warm towards spring-green as they come forward: quiet years of
 * process work building into something with a shape.
 *
 * They stay deliberately flat for the first fifth of the width. That is where
 * the headline sits, and a ridge crossing behind it is the reason most hero
 * artwork ends up needing a heavier scrim than the picture deserves.
 *
 * Deliberately a third motif. The Who-we-are panel resolves a field into lanes;
 * Connect radiates rings from a point; this one accumulates layers. Same
 * palette and the same focal-node grammar, three different sentences.
 *
 * **Why it exists.** It replaced `anthem-thumb-04.webp`: a Kyndryl photograph
 * with an identifiable person in it and the words "unlock new possibilities" —
 * Kyndryl's line, not UV's — baked into the pixels. Being generated, this needs
 * no licence and never needs replacing.
 *
 * **No `Math.sin` anywhere**, and not only out of habit. `Hero` is a client
 * component, so unlike the other two artworks this module's geometry is built
 * on the server AND again in the browser, and the two runs must agree exactly
 * or React reports a hydration mismatch. `Math.sin` is implementation-
 * approximated by spec; every operation below is +, -, * and /, which are not.
 * Coordinates are rounded to 1dp on top of that.
 */

const W = 1600;
const H = 800;

const YEARS = 14;
const CTRL = 13; // control points per ridge

/** Ridges overhang the viewBox so the parallax drift never exposes an end. */
const X0 = -120;
const X1 = 1720;

/** The same integer hash the other two artworks use. */
function hash(a: number, b: number) {
  let h = Math.imul(a + 1, 374761393) ^ Math.imul(b + 1, 668265263);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

const r1 = (n: number) => Math.round(n * 10) / 10;
const r2 = (n: number) => Math.round(n * 100) / 100;
const clamp01 = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n);

type Pt = [number, number];

/** One year: control points along a baseline, pushed up by a hashed height that
 *  is gated to nothing on the left and to full on the right. */
function ridgePoints(i: number): Pt[] {
  const baseY = 176 + i * 43;
  // Peaks outgrow the 43px spacing from about the sixth year on, so the ridges
  // interleave instead of sitting in fourteen tidy bands. That overlap is what
  // makes the stack read as depth.
  const amp = 18 + i * 4.4;
  const pts: Pt[] = [];

  for (let k = 0; k < CTRL; k++) {
    const x = X0 + (k * (X1 - X0)) / (CTRL - 1);
    const u = k / (CTRL - 1);
    // smoothstep, offset so the left fifth stays flat under the headline
    const s = clamp01((u - 0.22) / 0.78);
    const gate = s * s * (3 - 2 * s);
    // two decorrelated draws per point: one alone gives a ridge that reads as
    // regular bumps, which looks generated in the bad sense
    const h = 0.65 * hash(i, k) + 0.35 * hash(k, i * 7 + 3);
    pts.push([x, baseY - amp * gate * h]);
  }
  return pts;
}

/** Catmull-Rom through the points, emitted as cubic Beziers. The endpoints are
 *  duplicated so the curve starts and ends level rather than overshooting. */
function toPath(pts: Pt[]) {
  let d = `M ${r1(pts[0][0])} ${r1(pts[0][1])}`;
  for (let k = 0; k < pts.length - 1; k++) {
    const p0 = pts[k - 1] ?? pts[k];
    const p1 = pts[k];
    const p2 = pts[k + 1];
    const p3 = pts[k + 2] ?? p2;
    d +=
      ` C ${r1(p1[0] + (p2[0] - p0[0]) / 6)} ${r1(p1[1] + (p2[1] - p0[1]) / 6)}` +
      `, ${r1(p2[0] - (p3[0] - p1[0]) / 6)} ${r1(p2[1] - (p3[1] - p1[1]) / 6)}` +
      `, ${r1(p2[0])} ${r1(p2[1])}`;
  }
  return d;
}

type Ridge = {
  line: string;
  fill: string;
  mix: string;
  opacity: number;
  dx: number;
  dur: number;
};

const RIDGES: Ridge[] = [];
for (let i = 0; i < YEARS; i++) {
  const line = toPath(ridgePoints(i));
  RIDGES.push({
    line,
    // down past the bottom edge and back: the fill is what occludes the year behind
    fill: `${line} L ${X1} ${H + 60} L ${X0} ${H + 60} Z`,
    // grey operations at the back, green intelligence at the front — the same
    // reading as the Who-we-are field, quantised to deciles to compress well
    mix: `${Math.round((i / (YEARS - 1)) * 10) * 10}%`,
    // Floor at 0.24, not 0.14: a grey stroke at 0.14 on carbon is invisible, so
    // the early years dropped out entirely and the hero read as six years.
    opacity: r2(0.24 + (i / (YEARS - 1)) * 0.62),
    // nearer ridges travel further: that difference is the whole parallax
    dx: r1(3 + i * 0.9),
    dur: r1(19 + (i % 5) * 2.4),
  });
}

/** The ridges that carry a travelling pulse, spread through the stack. */
const CRESTS = [2, 5, 7, 9, 11, 13];

/** The focal node sits on a real peak rather than a guessed coordinate: the
 *  highest control point of ridge 9 within the right-hand half. */
const FOCUS = (() => {
  const pts = ridgePoints(9).filter((p) => p[0] > 900 && p[0] < 1500);
  return pts.reduce((best, p) => (p[1] < best[1] ? p : best), pts[0]);
})();

/** A sparse field above the horizon, so the top third is not dead carbon. */
const SKY: { cx: number; cy: number; r: number; o: number }[] = [];
for (let i = 0; i < 26; i++) {
  for (let j = 0; j < 5; j++) {
    const x = 40 + i * 62 + (hash(i, j) - 0.5) * 34;
    const y = 44 + j * 46 + (hash(j, i) - 0.5) * 26;
    SKY.push({
      cx: r1(x),
      cy: r1(y),
      r: r1(1.1 + hash(i + j, j) * 1.5),
      // fades out to the left, where the copy is
      o: r2(0.08 + clamp01((x - 260) / 1200) * 0.34),
    });
  }
}

export default function HeroArt() {
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      // `xMin`, not the usual `xMid`. At 375 the frame is 1120 units wide
      // against a 1600 viewBox, so centring showed x 532-1068 — the peaks,
      // cropping away the flat left third the headline was given. Anchoring the
      // left edge shows x 0-536 instead: the calm part sits behind the copy on
      // a phone, and the peaks arrive as the viewport widens.
      // `YMid` stays: the ridges occupy y 158-735 of 800, so centring the
      // vertical crop trims sky and empty floor rather than years.
      preserveAspectRatio="xMinYMid slice"
      aria-hidden
      className="absolute inset-0 size-full bg-carbon"
    >
      <defs>
        <radialGradient id="uv-hero-glow" cx="74%" cy="62%" r="52%">
          <stop offset="0%" stopColor="var(--color-spring-green)" stopOpacity="0.13" />
          <stop offset="100%" stopColor="var(--color-spring-green)" stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect width={W} height={H} fill="url(#uv-hero-glow)" />

      <g className="uv-field-b">
        {SKY.map((d, i) => (
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

      {/* Back to front. Paint order IS the occlusion: each fill hides the year
          behind it, which is what turns fourteen strokes into a landscape. */}
      {RIDGES.map((ridge, i) => (
        <g
          key={i}
          className="uv-ridge-layer"
          style={
            {
              "--dx": `${ridge.dx}px`,
              "--dur": `${ridge.dur}s`,
              animationDelay: `${r1(i * -1.7)}s`,
            } as React.CSSProperties
          }
        >
          <path d={ridge.fill} fill="var(--color-carbon)" />
          <path
            d={ridge.line}
            className="uv-ridge"
            fill="none"
            strokeWidth="1.2"
            strokeOpacity={ridge.opacity}
            vectorEffect="non-scaling-stroke"
            style={{ "--m": ridge.mix } as React.CSSProperties}
          />

          {CRESTS.includes(i) && (
            <path
              d={ridge.line}
              className="uv-crest"
              pathLength="100"
              fill="none"
              stroke="var(--color-spring-green)"
              strokeWidth="2.4"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
              style={
                {
                  "--park": -14 - CRESTS.indexOf(i) * 15,
                  animationDelay: `${r1(CRESTS.indexOf(i) * 1.55)}s`,
                } as React.CSSProperties
              }
            />
          )}
        </g>
      ))}

      {/* The one coral mark, on a real crest — the same single focal point the
          other two artworks resolve to. */}
      <g>
        <circle
          className="uv-halo"
          cx={r1(FOCUS[0])}
          cy={r1(FOCUS[1])}
          r="6"
          fill="var(--color-flame-2)"
          opacity="0.85"
        />
        <circle
          cx={r1(FOCUS[0])}
          cy={r1(FOCUS[1])}
          r="22"
          fill="none"
          stroke="var(--color-flame-2)"
          strokeOpacity="0.32"
          strokeWidth="1"
          vectorEffect="non-scaling-stroke"
        />
        <circle cx={r1(FOCUS[0])} cy={r1(FOCUS[1])} r="3" fill="var(--color-flame-2)" />
      </g>
    </svg>
  );
}
