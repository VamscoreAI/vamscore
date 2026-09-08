import { cx } from "@/components/ui";

/**
 * The lattice beside "Connect with us".
 *
 * **What it is.** Interlocking steep diagonals over full-height verticals — the
 * ornament the original runs in this band, where it is called a "trellis".
 * Generated here from the rule below rather than shipped as their file, in Vamscore's
 * own `flame` token. That token is already the identical hex (#ff462d): Vamscore's
 * whole palette was transcribed from the same source.
 *
 * **The rule.** At each step of `PITCH`, one unit is drawn as a single path:
 *
 *   1. start on the midline
 *   2. climb right to the top edge, `REACH` across
 *   3. drop straight down the full height
 *   4. return to the midline, landing `RETURN` from where it started
 *
 * The two diagonals are deliberately at **different** slopes — the climb covers
 * `REACH` (96) and the descent only `REACH - RETURN` (72). That asymmetry is
 * what keeps the field from reading as a plain zigzag; matched slopes give a
 * regular chevron, which is a noticeably duller texture.
 *
 * Every `SEAM` units the vertical is lifted out of the unit and drawn on its
 * own, so the weave breaks and restarts. Without it the eye locks onto a single
 * repeating cell and the whole panel flattens.
 *
 * Static by design: it is a background ornament behind a heading, and the
 * original does not animate it either.
 */

const PITCH = 48;
const H = 424;
const TOP = 1;
const BOTTOM = H - TOP;
const MID = H / 2;

/** How far right a diagonal climbs before turning down: two full pitches. */
const REACH = PITCH * 2;
/** Where the descending diagonal lands back on the midline. */
const RETURN = PITCH / 2;
/** Units between the standalone full-height verticals that break the weave. */
const SEAM = 11;

/** Only ~15 units are ever on screen once `slice` has scaled the field, so this
 *  is sized to cover that with a margin rather than to fill the whole viewBox —
 *  46 units meant 50 paths in the DOM to show 16. Two seams still fall inside. */
const UNITS = 22;
const W = UNITS * PITCH + REACH;

type Line = { d: string; key: string };
const LINES: Line[] = [];

for (let i = 0; i < UNITS; i++) {
  const x = i * PITCH + 1;
  const seam = (i + 1) % SEAM === 0;

  if (seam) {
    // Diagonals without the connecting vertical, plus a clean full-height rule
    // on its own — this is the break in the weave.
    LINES.push({
      key: `s${i}`,
      d: `M ${x} ${MID} L ${x + REACH} ${TOP} M ${x + REACH} ${BOTTOM} L ${x + RETURN} ${MID}`,
    });
    LINES.push({ key: `v${i}`, d: `M ${x + REACH} ${TOP} V ${BOTTOM}` });
  } else {
    LINES.push({
      key: `u${i}`,
      d: `M ${x} ${MID} L ${x + REACH} ${TOP} V ${BOTTOM} L ${x + RETURN} ${MID}`,
    });
  }
}

export default function ConnectTrellis({ className }: { className?: string }) {
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      // Anchored right and sliced: the field bleeds off the right edge of the
      // viewport the way the original does, rather than being fitted into a box.
      preserveAspectRatio="xMaxYMid slice"
      aria-hidden
      className={cx("text-flame", className)}
    >
      {LINES.map((line) => (
        <path
          key={line.key}
          d={line.d}
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          vectorEffect="non-scaling-stroke"
        />
      ))}
    </svg>
  );
}
