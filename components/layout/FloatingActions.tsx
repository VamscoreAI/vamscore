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
          White circle with the mark in Meet's green, which is how Google shows
          it on light chrome. The ring is not decoration: over the site's white
          sections a white button would have no visible edge at all, and WCAG
          1.4.11 asks 3:1 for the boundary of a control.
          The glyph is Simple Icons' Google Meet path (icon data CC0; the mark
          itself is Google's trademark, used here only to label a link to Meet). */}
      <a
        href={CONTACT.meet.url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`${CONTACT.meet.label} (opens in a new tab)`}
        className={`${BUTTON} bg-white text-[#00832D] ring-1 ring-black/10 focus-visible:outline-[#00832D]`}
      >
        <svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor" aria-hidden>
          <path d="M5.53 2.13 0 7.75h5.53zm.398 0v5.62h7.608v3.65l5.47-4.45c-.014-1.22.031-2.25-.025-3.46-.148-1.09-1.287-1.47-2.236-1.36zM23.1 4.32c-.802.295-1.358.995-2.047 1.49-2.506 2.05-4.982 4.12-7.468 6.19 3.025 2.59 6.04 5.18 9.065 7.76 1.218.671 1.428-.814 1.328-1.64v-13a.828.828 0 0 0-.877-.825zM.038 8.15v7.7h5.53v-7.7zm13.577 8.1H6.008v5.62c3.864-.006 7.737.011 11.58-.009 1.02-.07 1.618-1.12 1.468-2.07v-2.51l-5.47-4.68v3.65zm-13.577 0c.02 1.44-.041 2.88.033 4.31.162.948 1.158 1.43 2.047 1.31h3.464v-5.62z" />
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
