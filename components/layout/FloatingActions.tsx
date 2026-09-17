"use client";

import { usePathname } from "next/navigation";
import { CONTACT } from "@/content/contact";
import { whatsappChatUrl } from "@/lib/whatsapp/links";

/**
 * The floating buttons at the bottom-right: Google Meet above, WhatsApp below.
 *
 * One fixed column rather than two independently positioned buttons, so the
 * spacing between them cannot drift and adding a third later is one more child.
 * WhatsApp keeps the bottom slot: it is the one that actually reaches Vamscore.
 *
 * Hidden on staff and sign-in pages: they are for visitors, and there they
 * would sit over the forms.
 */

const HIDDEN = ["/portal", "/sign-in", "/sign-up"];

const BUTTON =
  "grid size-14 place-items-center rounded-full shadow-[0_6px_20px_rgba(0,0,0,0.28)] transition-transform duration-200 hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-4";

export default function FloatingActions() {
  const pathname = usePathname() ?? "/";
  if (HIDDEN.some((p) => pathname === p || pathname.startsWith(`${p}/`))) return null;

  const whatsapp = whatsappChatUrl();

  return (
    <div className="fixed right-[max(1rem,env(safe-area-inset-right))] bottom-[max(1rem,env(safe-area-inset-bottom))] z-40 flex flex-col gap-3 lg:right-8 lg:bottom-8">
      {/* Google Meet.
          Google's own current mark, fetched from
          gstatic.com/images/branding/productlogos/meet_2026/v2/web/192px.svg
          on 2026-09-17 and inlined unaltered (ids prefixed `gm-` so they
          cannot collide with anything else on the page). Google rebranded
          Meet in 2026: the four-colour camera everyone remembers is the old
          mark, and the one before that was a green outline. Re-check this
          file if the logo on workspace.google.com ever stops matching.

          It is Google's trademark, used here only to label a link to Meet.

          White circle, because the button floats over both the site's white
          sections and its carbon bands — a coloured circle would disappear
          into one or the other. The yellow mark on white is Google's own
          presentation of it; the 1px ring at 40% black measures 3:1 against
          a white page, which is what WCAG 1.4.11 asks of a control's
          boundary. (It was 10% black, about 1.3:1, which did not.) */}
      <a
        href={CONTACT.meet.url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`${CONTACT.meet.label} (opens in a new tab)`}
        className={`${BUTTON} bg-white ring-1 ring-black/40 focus-visible:outline-[#F6A100]`}
      >
        <svg viewBox="0 0 192 192" width="30" height="30" fill="none" aria-hidden>
          <path
            fill="url(#gm-a)"
            d="M110.015 108.88c-6.829-4.718-6.921-14.778-.179-19.62L165 49.643c7.94-5.701 19-.038 19 9.737v77.755c0 9.675-10.861 15.359-18.821 9.859z"
          />
          <path
            fill="url(#gm-b)"
            d="M8 71c0-24.3 19.7-44 44-44h64c11.046 0 20 8.954 20 20v98c0 11.046-8.954 20-20 20H28c-11.046 0-20-8.954-20-20z"
          />
          <mask
            id="gm-e"
            width="129"
            height="138"
            x="8"
            y="27"
            maskUnits="userSpaceOnUse"
            style={{ maskType: "luminance" }}
          >
            <path
              fill="#fff"
              d="M8 71c0-24.3 19.7-44 44-44h64c11.046 0 20 8.954 20 20v98c0 11.046-8.954 20-20 20H28c-11.046 0-20-8.954-20-20z"
            />
          </mask>
          <g filter="url(#gm-c)" mask="url(#gm-e)">
            <path fill="url(#gm-f)" d="m73.906 99.198 110-63.198v124z" />
          </g>
          <circle cx="38" cy="135" r="14" fill="#fff" />
          <defs>
            <linearGradient
              id="gm-a"
              x1="128.8"
              x2="227.2"
              y1="104.44"
              y2="104.44"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#f6a100" />
              <stop offset="1" stopColor="#ffbe00" />
            </linearGradient>
            <linearGradient
              id="gm-f"
              x1="136.22"
              x2="78.5"
              y1="91.32"
              y2="91.19"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset=".15" stopColor="#ffb5e8" />
              <stop offset="1" stopColor="#ffdbf5" stopOpacity="0" />
            </linearGradient>
            <radialGradient
              id="gm-b"
              cx="0"
              cy="0"
              r="1"
              gradientTransform="matrix(-159.725 0 0 -135.852 160.325 96)"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset=".15" stopColor="#ffe921" />
              <stop offset="1" stopColor="#fec700" />
            </radialGradient>
            <filter
              id="gm-c"
              width="166"
              height="180"
              x="45.91"
              y="8"
              colorInterpolationFilters="sRGB"
              filterUnits="userSpaceOnUse"
            >
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
              <feGaussianBlur result="blur" stdDeviation="14" />
            </filter>
          </defs>
        </svg>
      </a>

      {/* WhatsApp.
          Colour is WhatsApp's teal #128C7E, not the brighter #25D366: a white
          glyph on #25D366 measures 1.98:1, under the 3:1 WCAG 1.4.11 asks of an
          icon that identifies a control. #128C7E is still recognisably WhatsApp,
          measures 4.1:1 against the glyph, and holds over both the site's white
          and carbon sections — the button floats over both.

          The reply a visitor gets is the WhatsApp Business app's own Greeting
          message, set up on the phone, so this works with no API behind it.
          Rendered only when the number in content/contact.ts is usable. */}
      {whatsapp && (
        <a
          href={whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat with Vamscore on WhatsApp (opens in a new tab)"
          className={`${BUTTON} bg-[#128C7E] text-white focus-visible:outline-[#128C7E]`}
        >
          {/* The WhatsApp glyph (Simple Icons, CC0). */}
          <svg viewBox="0 0 24 24" width="30" height="30" fill="currentColor" aria-hidden>
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
          </svg>
        </a>
      )}
    </div>
  );
}
