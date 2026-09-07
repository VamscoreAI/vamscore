import Image from "next/image";
import Link from "next/link";
import { Wordmark } from "@/components/ui";
import {
  COPYRIGHT,
  FOOTER_COLUMNS,
  FOOTER_SOCIAL,
  LOCALE_SHORT,
} from "@/content/nav";

export default function Footer() {
  return (
    <footer className="bg-carbon text-white">
      <div className="shell py-16 lg:py-20">
        <Link href="/" aria-label="UV home" className="inline-block">
          <Wordmark className="text-[32px] text-white" />
        </Link>

        {/* A landmark: this is the site's secondary navigation and had none. */}
        <nav
          aria-label="Footer"
          className="mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-4"
        >
          {FOOTER_COLUMNS.map((column) => (
            <div key={column.heading}>
              <h2 className="mb-5 text-[clamp(1.5rem,1.3rem+0.55vw,1.75rem)] leading-[1.214] font-normal text-white">
                {column.heading}
              </h2>
              <ul className="space-y-1">
                {column.links.map((link) => (
                  <li key={link.label}>
                    {/* `block py-1.5` lifts each row from 19px to ~31px. Inline
                        text links are exempt from the target-size rule, but a
                        stacked column of 19px taps is genuinely fiddly. */}
                    <Link
                      href={link.href}
                      className="block py-1.5 text-base leading-6 text-white/85 transition-colors hover:text-spring-green"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="lg:col-span-2">
            <h2 className="mb-5 text-[clamp(1.5rem,1.3rem+0.55vw,1.75rem)] leading-[1.214] font-normal text-white">
              Follow us
            </h2>
            <ul className="flex gap-4">
              {FOOTER_SOCIAL.map((social) => (
                <li key={social.label}>
                  <Link
                    href={social.href}
                    aria-label={social.label}
                    className="grid size-11 place-items-center rounded-full border border-white/25 transition-colors hover:border-spring-green"
                  >
                    {/* the DAM icons are drawn dark-on-transparent, so invert them */}
                    <Image
                      src={social.icon}
                      alt=""
                      width={20}
                      height={20}
                      className="h-5 w-5 invert"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </nav>
      </div>

      {/* Privacy / Terms / Accessibility used to sit here, all three pointing at
          `#`. Those pages do not exist, so the links are gone rather than
          leading nowhere — an "Accessibility" link that goes nowhere being the
          worst of the three. Put them back when the pages do. */}
      <div className="border-t border-white/15">
        <div className="shell flex flex-col gap-4 py-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[14px] text-white/70">{COPYRIGHT}</p>
          <span className="text-[14px] text-white/70">{LOCALE_SHORT}</span>
        </div>
      </div>
    </footer>
  );
}
