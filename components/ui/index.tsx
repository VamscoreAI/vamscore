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
/* Wordmark — Vamscore's placeholder logo                                           */
/*                                                                            */
/* Plain type until the real mark is wired in. The company was renamed from UV */
/* to Vamscore, and the supplied logo is a caps wordmark on a gradient — this  */
/* stands in with the same weight and tracking so the header keeps its shape.  */
/* Swap for the artwork in public/assets/logos once it is in the repo.         */
/* -------------------------------------------------------------------------- */

export function Wordmark({ className }: { className?: string }) {
  return (
    <span
      className={cx(
        "font-display text-[26px] leading-none font-semibold tracking-[-0.02em]",
        className
      )}
    >
      Vamscore
    </span>
  );
}
