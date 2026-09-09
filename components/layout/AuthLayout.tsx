import Link from "next/link";
import type { ReactNode } from "react";
import { Arrow, Eyebrow } from "@/components/ui";
import ConnectTrellis from "@/components/sections/ConnectTrellis";

type Copy = {
  eyebrow: string;
  title: string;
  body: string;
  escape: { label: string; href: string };
};

/**
 * The frame around `<SignIn>` and `<SignUp>`.
 *
 * **The problem it solves.** Both routes used to be a bare Clerk card dropped
 * into the middle of an otherwise empty carbon page. A login screen with no
 * surrounding context is the one place on a site where emptiness actively
 * costs something: a visitor who arrives at a form asking for their work email,
 * on a page that says nothing about who is asking or why, has no way to tell a
 * real staff door from a phishing page. The panel is not decoration.
 *
 * **The split.** Explanation left, action right — the order the page is read in
 * and the same left-weighted rhythm the marketing pages use. The columns are
 * `1.05fr / 1fr` rather than even: the panel carries three blocks of text and
 * the card is a fixed-width component, so an even split leaves the right column
 * padded with air.
 *
 * **The panel's title is a `<p>`, not a heading, and that is deliberate.** Clerk
 * renders its own card title as an `<h1>` ("Sign in to Vamscore"), which is the
 * accurate heading for this page. Marking the panel title up as a heading too
 * gave the document two `<h1>`s — verified in the rendered page — and demoting
 * it to `<h2>` would have put an `h2` before the `h1` in source order, which is
 * worse. So the card keeps the outline and the panel is styled prose.
 *
 * **The artwork is `display: none` below `lg`, not removed.** Its ~3.6KB of
 * static markup still ships on mobile. That is a deliberate trade rather than
 * an oversight: dropping it from the tree would take a client-side breakpoint
 * hook, and shipping JS to save 3.6KB of gzip-friendly SVG is a bad exchange.
 */
export default function AuthLayout({
  copy,
  children,
}: {
  copy: Copy;
  children: ReactNode;
}) {
  return (
    <section className="relative isolate overflow-clip bg-carbon text-white">
      {/*
        Two things are load-bearing on this element.

        `min-h` is gated to `lg`. Applied at every width it stretched the
        stacked mobile layout to a full screen, spreading the panel out and
        pushing the form's first field to y=800 on an 812px-tall phone — the
        whole form below the fold on the one page where the form is the point.
        Unset, the rows take their content height and the card starts near it.
        The 72px is the header's measured height; it is not derived from
        anything, so a change to the header's height has to be mirrored here.

        The left gutter lives HERE rather than on the panel, and uses `100%`
        rather than `100vw`, because `100vw` includes the scrollbar and
        `shell`'s `margin-inline: auto` does not. With the gutter on the panel
        as `calc((100vw - 1440px)/2 + 2rem)` the heading sat 7.5px right of the
        header's logo at 1600 — exactly half the 15px scrollbar, measured. A
        percentage resolves against this element's containing block, which is
        the full-width section, so it tracks `shell` exactly.
      */}
      <div className="grid lg:min-h-[calc(100dvh-72px)] lg:grid-cols-[1.05fr_1fr] lg:pl-[max(2rem,calc((100%-1440px)/2+2rem))]">
        {/* Explanation. `lg:pl-0` because the gutter above already provides it;
            without this the two would add. */}
        <div className="relative flex flex-col justify-center px-5 py-10 md:px-8 lg:py-24 lg:pl-0 lg:pr-16">
          {/* Masked rather than merely narrow. A fixed width still crossed the
              heading at some viewports — measured 200px of overlap at 1280 —
              because the copy column is `ch`-based and the artwork is a
              percentage, so the two meet at a different point on every screen.
              The gradient makes the lattice fade to nothing before it reaches
              text at any width, which no amount of width-tuning can promise.

              No `aria-hidden` here: ConnectTrellis sets it on its own `<svg>`,
              and its props are `{ className }` only, so anything else passed in
              is dropped. TypeScript will not catch that — it does not check
              hyphenated JSX attributes against a component's props. */}
          <ConnectTrellis className="pointer-events-none absolute inset-y-0 right-0 hidden h-full w-[62%] opacity-[0.22] [mask-image:linear-gradient(to_right,transparent_0%,#000_55%)] [-webkit-mask-image:linear-gradient(to_right,transparent_0%,#000_55%)] lg:block" />

          <div className="relative max-w-[46ch]">
            <Eyebrow variant="eyelid" className="text-white">
              {copy.eyebrow}
            </Eyebrow>
            <p className="type-section mt-6 text-white">{copy.title}</p>
            <p className="type-lede mt-6 text-white/75">{copy.body}</p>

            <Link
              href={copy.escape.href}
              className="mt-8 inline-flex items-center gap-2 text-[15px] text-white/70 underline-offset-4 transition-colors hover:text-white hover:underline lg:mt-10"
            >
              {copy.escape.label}
              <Arrow />
            </Link>
          </div>
        </div>

        {/* Action. The hairline is the only thing separating two dark columns,
            so it runs the full height rather than bracketing the card. */}
        <div className="flex items-center justify-center border-t border-white/10 px-5 py-10 lg:border-l lg:border-t-0 lg:py-24">
          {children}
        </div>
      </div>
    </section>
  );
}
