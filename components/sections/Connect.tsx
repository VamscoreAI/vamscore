import Link from "next/link";
import { CONNECT } from "@/content/home";
import { Arrow, Button, cx } from "@/components/ui";
import ConnectTrellis from "./ConnectTrellis";

/**
 * The page's closing invitation, composed like the original's: a light ground,
 * a coral heading, and the trellis running off the right edge of the viewport.
 *
 * **The trellis is not inside `shell`.** The copy is — capped at 1440 and
 * centred with everything else — but the ornament bleeds to the true viewport
 * edge, which is where the original puts it and the only way it reads as a
 * field rather than as a picture. That is why the upper half is its own
 * `relative overflow-clip` wrapper, outside the shell.
 *
 * `overflow-clip`, not `overflow-hidden`: `hidden` establishes a scroll
 * container, so anything in here that ever wanted a `view()` timeline would
 * resolve against it and silently never progress. Same trap as the band art.
 *
 * The routes row keeps the plain ground beneath it. The original has no
 * equivalent, but it is real content with real destinations and it is what
 * closed the dead space under this band.
 */
export default function Connect() {
  const last = CONNECT.routes.length - 1;

  return (
    <section id="connect" className="bg-[#f9f9f9]">
      <div className="relative overflow-clip">
        {/* Half the band at desktop, and knocked back on small screens where it
            sits under the copy rather than beside it. */}
        {/* The min-height is what sets the lattice's scale at desktop: the
            viewBox is 424 tall and `slice` fits that to the band, so a short
            band shrinks the cells and crowds them. At 520 they land ~59px
            apart, which is the density the original reads at. */}
        <div className="shell relative flex items-center py-16 md:py-24 lg:min-h-[520px] xl:py-28">
          <div className="max-w-[520px]">
            {/* Coral, matching the original. The one heading on the site that
                is not carbon, which is what marks this as the closing
                invitation rather than another content section. */}
            <h2 className="type-section text-flame">{CONNECT.title}</h2>
            <p className="type-lede mt-6 text-dark-stone">{CONNECT.body}</p>
            <Button href={CONNECT.cta.href} className="mt-8">
              {CONNECT.cta.label}
              <Arrow />
            </Button>
          </div>
        </div>

        {/* Below `lg` this stacks under the copy as its own band, which is what
            the original does at 375 — its trellis starts below the heading and
            never sits behind it. That is not decoration: flame on this ground
            is only 3.23:1, and a stroke crossing a letter drops it to 2.07:1,
            under the 3:1 floor for large text. Knocking the opacity back does
            not save it — even at 0.10 it measures 2.86:1.

            `h-full` on the desktop half is load-bearing. An absolutely
            positioned SVG with `top:0; bottom:0` and no height is
            over-constrained, so CSS keeps `height: auto` — the intrinsic ratio
            — and drops `bottom`. Without it the field collapsed to a 160px
            strip across the top and the lattice came out squashed. */}
        <ConnectTrellis className="pointer-events-none h-[340px] w-full lg:absolute lg:inset-y-0 lg:right-0 lg:h-full lg:w-[55%]" />
      </div>

      {/* Below `lg` this needs real space above it — the trellis band ends
          hard against it. At `lg` the trellis is absolute and the band
          above already carries its own bottom padding, so a little does. */}
      <div className="shell pt-14 pb-16 md:pb-24 lg:pt-6 xl:pb-28">
        <ul className="grid border-t border-line sm:grid-cols-3">
          {CONNECT.routes.map((route, i) => (
            <li
              key={route.label}
              className={cx(
                "border-b border-line sm:border-b-0",
                // Dividers between, not around: a border on every cell would
                // close the row into a box and this is a row of routes.
                i > 0 && "sm:border-l sm:border-line"
              )}
            >
              <Link
                href={route.href}
                className={cx(
                  "group block h-full py-7 transition-colors hover:bg-white",
                  // Explicit left/right rather than `px-8` with `first:pl-0`:
                  // Tailwind resolves conflicting utilities by their order in
                  // the generated stylesheet, not by the class attribute, so
                  // px + pl is a coin toss.
                  i > 0 && "sm:pl-8",
                  i < last && "sm:pr-8"
                )}
              >
                <span className="flex items-center gap-2 text-[clamp(1.125rem,1rem+0.35vw,1.25rem)] leading-[1.3] text-carbon">
                  {route.label}
                  <Arrow className="transition-transform duration-200 group-hover:translate-x-1" />
                </span>
                <span className="type-body mt-2 block">{route.body}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
