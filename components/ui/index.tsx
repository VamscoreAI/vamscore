import Image from "next/image";
import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

export function cx(...parts: (string | false | null | undefined)[]) {
  return parts.filter(Boolean).join(" ");
}

/* -------------------------------------------------------------------------- */
/* Buttons — pill for the green CTA, 4px rect for the hairline CTAs           */
/* -------------------------------------------------------------------------- */

type ButtonVariant = "primary" | "outline" | "ghost" | "dark";

// Two shapes are in play on the real site: the green "Consult an expert" pill
// (66px radius) and the hero's hairline CTA, which is a 4px rectangle.
const BUTTON_VARIANTS: Record<ButtonVariant, string> = {
  primary: "rounded-pill px-6 py-3 text-[15px] bg-spring-green text-deep-forest hover:bg-white",
  outline:
    "rounded-[4px] px-4 py-3 text-[16px] border-[0.8px] border-white text-white hover:bg-white hover:text-carbon",
  ghost:
    "rounded-[4px] px-4 py-3 text-[16px] border-[0.8px] border-dark-stone/50 text-dark-stone hover:border-dark-stone hover:bg-cloud",
  dark: "rounded-pill px-6 py-3 text-[15px] bg-carbon text-white hover:bg-dark-stone",
};

export function Button({
  href,
  variant = "primary",
  className,
  children,
  ...rest
}: {
  href: string;
  variant?: ButtonVariant;
  className?: string;
  children: ReactNode;
} & Omit<ComponentProps<typeof Link>, "href" | "className" | "children">) {
  return (
    <Link
      href={href}
      className={cx(
        "inline-flex items-center justify-center gap-2 leading-none font-medium transition-colors duration-200",
        BUTTON_VARIANTS[variant],
        className
      )}
      {...rest}
    >
      {children}
    </Link>
  );
}

/* -------------------------------------------------------------------------- */
/* Eyebrow — 12px/500 kicker over a 16x2px flame rule                        */
/*                                                                            */
/* The site ships two of these. "eyebrow" (cmp-eyebrow: promo cards, Trends   */
/* and insights) is uppercased and tracked by CSS; "eyelid" (Who we are) is   */
/* neither, so its copy renders exactly as written.                           */
/* -------------------------------------------------------------------------- */

export function Eyebrow({
  children,
  className,
  variant = "eyebrow",
}: {
  children: ReactNode;
  className?: string;
  variant?: "eyebrow" | "eyelid";
}) {
  return (
    <p
      className={cx(
        "eyebrow",
        variant === "eyebrow" && "uppercase tracking-[0.05em]",
        className
      )}
    >
      {children}
      <span
        aria-hidden
        className={cx(
          "mt-2 block h-[2px] w-4",
          variant === "eyelid" ? "bg-flame-2" : "bg-flame"
        )}
      />
    </p>
  );
}

/* -------------------------------------------------------------------------- */
/* Arrow link — the underlined "Read the eBook →" treatment                   */
/* -------------------------------------------------------------------------- */

export function ArrowLink({
  href,
  children,
  external,
  className,
}: {
  href: string;
  children: ReactNode;
  external?: boolean;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cx(
        "group inline-flex items-center gap-2 text-base leading-6 underline decoration-1 underline-offset-4 transition-colors hover:decoration-2",
        className
      )}
    >
      <span>{children}</span>
      <Arrow className="transition-transform duration-200 group-hover:translate-x-1" />
      {external && <span className="sr-only">(opens in a new window)</span>}
    </Link>
  );
}

export function Arrow({ className }: { className?: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M1 8h13m0 0-5-5m5 5-5 5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* -------------------------------------------------------------------------- */
/* Section shell — consistent vertical rhythm                                 */
/* -------------------------------------------------------------------------- */

export function Section({
  id,
  className,
  children,
  tone = "light",
}: {
  id?: string;
  className?: string;
  children: ReactNode;
  tone?: "light" | "cloud" | "dark";
}) {
  const tones = {
    light: "bg-white text-dark-stone",
    cloud: "bg-cloud text-dark-stone",
    dark: "bg-carbon text-white",
  };
  return (
    <section
      id={id}
      className={cx("py-16 md:py-24 xl:py-28", tones[tone], className)}
    >
      {children}
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Wordmark — Vamscore's logo                                                 */
/*                                                                            */
/* The artwork Vamscore supplied on 2026-09-16 is ink on a white page with no  */
/* alpha, and both the header and footer are carbon (#161616), so dropping it  */
/* in unmodified would have shown a white rectangle. The white is keyed out by */
/* un-multiplying each pixel against white — pixel = a*ink + (1-a)*255 solved  */
/* for both — so antialiased edges keep no pale fringe on a dark ground.       */
/*                                                                            */
/* NOTE: the dark half of the gradient (#030047 at its darkest) sits at 1.06:1 */
/* on carbon, so "VAM" reads far weaker than "SCORE" in the header and footer. */
/* Vamscore was shown this and chose to ship it; a light version of the mark   */
/* for dark grounds is the real fix.                                           */
/*                                                                            */
/* Sized by HEIGHT, never width: the mark is 8.05:1, so a width class would    */
/* set the bar's height by accident. Callers pass an `h-*`.                    */
/*                                                                            */
/* `alt=""` on purpose — both call sites wrap this in a link that already      */
/* carries `aria-label="Vamscore home"`, so a filled alt would say the name    */
/* twice.                                                                      */
/* -------------------------------------------------------------------------- */

export function Wordmark({ className }: { className?: string }) {
  return (
    <Image
      src="/assets/logos/vamscore-2026.webp"
      alt=""
      width={758}
      height={96}
      priority
      className={cx("h-6 w-auto lg:h-7", className)}
    />
  );
}
