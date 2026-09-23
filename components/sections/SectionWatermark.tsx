import FitText from "@/components/ui/FitText";

/**
 * The band that introduces each major section on the home page.
 *
 * Three designs, one per band, live side by side from 2026-09-23 so Vamscore
 * can compare them on the real page and pick one:
 *
 * - "ticker"  — dark band; the word glides sideways on a loop like the
 *               partner strip, alternating solid and outlined, separated by
 *               the four-point star from the VAMSCORE logo.
 * - "fill"    — white band; the word is a thin coral outline (the services
 *               page's numeral idiom) that fills with the logo's purple-to-
 *               pink as it scrolls through the viewport.
 * - "network" — dark band with the flowing green lines and dots of the
 *               site's hero and story artwork; the green line draws itself
 *               in as the band arrives.
 *
 * Once one is chosen, set it on all three bands in app/(site)/page.tsx and
 * delete the other two here and in the "Section bands" block of globals.css.
 *
 * Always `aria-hidden`: the word repeats the section's own eyebrow and every
 * section carries a real heading. All motion is decorative, and each design
 * rests in a complete, readable state where motion is reduced or unsupported.
 */
export type BandVariant = "ticker" | "fill" | "network";

export default function SectionWatermark({
  children,
  index,
  variant = "ticker",
}: {
  children: string;
  /** 1-based chapter number; the network card shows it as 01, 02, … */
  index?: number;
  variant?: BandVariant;
}) {
  if (variant === "fill") return <FillBand word={children} />;
  if (variant === "network") return <NetworkBand word={children} index={index} />;
  return <TickerBand word={children} id={`band-${index ?? 0}`} />;
}

/* ------------------------------------------------------------------ ticker */

const WORD = "font-display font-bold lowercase whitespace-nowrap leading-none";

/** The four-point star from the O in the VAMSCORE wordmark. */
function Star({ gradient }: { gradient: string }) {
  return (
    <svg viewBox="0 0 100 100" className="size-[0.42em] shrink-0" aria-hidden>
      <path
        d="M50 0C53 38 62 47 100 50C62 53 53 62 50 100C47 62 38 53 0 50C38 47 47 38 50 0Z"
        fill={`url(#${gradient})`}
      />
    </svg>
  );
}

function TickerBand({ word, id }: { word: string; id: string }) {
  const gradient = `${id}-star`;
  // Two identical halves: the shared `marquee` keyframes move the track by
  // -50%, so the second half lands exactly where the first began. Four words a
  // half keeps each half wider than a 1920px screen, so there is never a gap.
  const half = (key: string) => (
    <div key={key} className="flex items-center gap-[0.35em] pr-[0.35em]">
      {[0, 1, 2, 3].map((i) => (
        <span key={i} className="flex items-center gap-[0.35em]">
          <span className={i % 2 === 0 ? "text-white" : "band-outline"}>{word}</span>
          <Star gradient={gradient} />
        </span>
      ))}
    </div>
  );

  return (
    // The `marquee` edge fade lives on the inner row, not this div: on the
    // band itself it faded the carbon background out to white at both edges.
    <div
      aria-hidden
      className="bg-carbon py-8 lg:py-12"
      style={{ "--band-stroke": "rgb(255 255 255 / 0.35)" } as React.CSSProperties}
    >
      <svg width="0" height="0" className="absolute">
        <defs>
          <linearGradient id={gradient} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#3b1fd1" />
            <stop offset="0.55" stopColor="#9b3cf0" />
            <stop offset="1" stopColor="#e64bd0" />
          </linearGradient>
        </defs>
      </svg>
      <div className="marquee overflow-clip">
        <div
          className={`marquee-track flex w-max text-[clamp(3.5rem,1.6rem+6vw,8.5rem)] ${WORD}`}
          style={{ animationDuration: "60s" }}
        >
          {half("a")}
          {half("b")}
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------- fill */

function FillBand({ word }: { word: string }) {
  // Two copies of the same fitted word stacked exactly: FitText sizes each to
  // its own wrapper's width, and both wrappers are the same width, so the
  // glyphs line up. The top copy is clipped from the right and uncovered as
  // the band scrolls through the viewport.
  return (
    <div
      aria-hidden
      className="overflow-clip bg-white px-5 py-10 md:px-8 lg:py-16"
      style={{ "--band-stroke": "rgb(251 81 47 / 0.75)" } as React.CSSProperties}
    >
      <div className="relative">
        <FitText className={`band-outline ${WORD}`}>{word}</FitText>
        <FitText className={`band-fill band-brand-ink absolute inset-0 ${WORD}`}>{word}</FitText>
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------- network */

// Fixed, not random: the same dots on every render, so server and client
// markup match and nothing shifts between visits.
const DOTS = Array.from({ length: 64 }, (_, i) => ({
  x: 180 + ((i * 97) % 600),
  y: 24 + ((i * 53) % 252),
  r: 1.6 + (i % 3) * 0.7,
  o: 0.22 + (i % 4) * 0.16,
}));

function NetworkBand({ word, index }: { word: string; index?: number }) {
  return (
    <div aria-hidden className="relative overflow-clip bg-carbon">
      <svg
        viewBox="0 0 800 300"
        preserveAspectRatio="xMaxYMid slice"
        className="absolute inset-y-0 right-0 h-full w-full md:w-[75%] lg:w-[62%]"
      >
        <path d="M0 250 C260 250 420 170 800 175" fill="none" stroke="#fff" strokeOpacity="0.14" strokeWidth="1.5" />
        <path d="M160 40 C360 80 560 140 800 150" fill="none" stroke="#fff" strokeOpacity="0.1" strokeWidth="1.5" />
        {DOTS.map((d, i) => (
          <circle key={i} cx={d.x} cy={d.y} r={d.r} fill="#4cdd84" fillOpacity={d.o} />
        ))}
        {/* pathLength="1" lets the draw-in animate a 0-1 dash offset
            regardless of the curve's real length; at rest it is drawn. */}
        <path
          className="band-draw"
          d="M60 240 C310 240 400 120 800 110"
          fill="none"
          stroke="#4cdd84"
          strokeWidth="2.4"
          pathLength={1}
          strokeDasharray="1"
        />
        <circle cx="520" cy="136" r="6" fill="#fb512f" />
        <circle cx="520" cy="136" r="15" fill="none" stroke="#fb512f" strokeOpacity="0.4" />
      </svg>
      {/* Keeps the art off the word: solid carbon on the left, clear by the
          middle. */}
      <div className="absolute inset-0 bg-gradient-to-r from-carbon via-carbon/70 via-40% to-transparent" />

      <div className="shell relative py-12 lg:py-16">
        <p className="eyebrow flex items-center gap-3 text-spring-green tabular-nums">
          <span className="h-[2px] w-6 bg-spring-green" />
          {index !== undefined ? String(index).padStart(2, "0") : null}
        </p>
        {/* Floor low enough for "our track record" to fit a 375px phone
            (38px); the old 48px floor ran 61px past the column. */}
        <p className={`mt-4 text-[clamp(2.25rem,0.5rem+8vw,8rem)] text-white ${WORD}`}>{word}</p>
      </div>
    </div>
  );
}
