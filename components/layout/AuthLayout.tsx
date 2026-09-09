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
 * **Below `lg` the artwork is dropped entirely**, not merely hidden with the
 * DOM left in place — `ConnectTrellis` renders 40-odd paths and someone signing
 * in on a phone wants the form, not an ornament above it pushing the form
 * below the fold.
 *
 * **The height.** `min-h` is on the section, not the columns, so the panel and
 * the card each centre against the same box. `100dvh` minus the header, using
 * dvh rather than vh so mobile browsers' collapsing toolbars do not leave a
 * scrollbar on a page that otherwise fits.
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
      {/* `min-h` is gated to `lg` on purpose. Applied at every width it also
          stretched the stacked mobile layout to a full screen, which spread the
          panel out and pushed the form's first field to y=800 on a 812px-tall
          phone — the whole form below the fold on the one page where the form
          is the point. Unset, the rows take their content height and the card
          starts around the fold instead. */}
      <div className="grid lg:min-h-[calc(100dvh-72px)] lg:grid-cols-[1.05fr_1fr]">
        {/* Explanation */}
        <div className="relative flex flex-col justify-center px-5 py-10 md:px-8 lg:py-24 lg:pl-[max(2rem,calc((100vw-1440px)/2+2rem))] lg:pr-16">
          {/* Masked rather than merely narrow. A fixed width still crossed the
              heading at some viewports — measured 200px of overlap at 1280 —
              because the copy column is `ch`-based and the artwork is a
              percentage, so the two meet at a different point on every screen.
              The gradient makes the lattice fade to nothing before it reaches
              text at any width, which no amount of width-tuning can promise. */}
          <ConnectTrellis
            aria-hidden
            className="pointer-events-none absolute inset-y-0 right-0 hidden h-full w-[62%] opacity-[0.22] [mask-image:linear-gradient(to_right,transparent_0%,#000_55%)] [-webkit-mask-image:linear-gradient(to_right,transparent_0%,#000_55%)] lg:block"
          />

          <div className="relative max-w-[46ch]">
            <Eyebrow variant="eyelid" className="text-white">
              {copy.eyebrow}
            </Eyebrow>
            <h1 className="type-section mt-6 text-white">{copy.title}</h1>
            <p className="type-lede mt-6 text-white/75">{copy.body}</p>

            <Link
              href={copy.escape.href}
              className="mt-8 inline-flex lg:mt-10 items-center gap-2 text-[15px] text-white/70 underline-offset-4 transition-colors hover:text-white hover:underline"
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
