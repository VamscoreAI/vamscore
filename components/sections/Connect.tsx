import Link from "next/link";
import { CONNECT } from "@/content/home";
import { Arrow, Button, cx } from "@/components/ui";
import ConnectArt from "./ConnectArt";

/**
 * The page's closing invitation.
 *
 * The right column used to hold a newsletter sign-up. It was demo-only and said
 * so on submit — "this demo form doesn't send anything" — so it collected
 * addresses nowhere and told the reader as much. It is replaced by artwork, and
 * with the form went `useState` and the `"use client"` boundary: this is now a
 * server component.
 *
 * **The routes row underneath.** The band was a heading, one line and a button
 * beside a 420px graphic, so the last thing on the page read as half-empty. The
 * row states the three reasons anyone gets in touch and sends each somewhere
 * different — the two that share `/contact` arrive with the form's topic
 * already chosen, so they are not one link wearing three labels. See the note
 * on `CONNECT.routes`.
 */
export default function Connect() {
  const last = CONNECT.routes.length - 1;

  return (
    <section id="connect" className="bg-white">
      <div className="shell py-16 md:py-24 xl:py-28">
        <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
          <div>
            <h2 className="type-hero text-carbon">{CONNECT.title}</h2>
            <p className="mt-6 max-w-md text-[clamp(1.125rem,1rem+0.35vw,1.25rem)] leading-[1.2] font-light">
              {CONNECT.body}
            </p>
            <Button href={CONNECT.cta.href} className="mt-8">
              {CONNECT.cta.label}
              <Arrow />
            </Button>
          </div>

          <ConnectArt className="mx-auto max-w-[560px]" />
        </div>

        <ul className="mt-14 grid border-t border-line sm:grid-cols-3 xl:mt-20">
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
                  "group block h-full py-7 transition-colors hover:bg-cloud",
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
