import Image from "next/image";
import { INTERNSHIP } from "@/content/home";
import { Arrow, Button } from "@/components/ui";
import { whatsappChatUrl } from "@/lib/whatsapp/links";

/**
 * Internship enquiries, straight into WhatsApp.
 *
 * The same band as `AiNativeBand` — picture behind, left-weighted gradient,
 * heading, one line, a pill — so the two read as one family on the home page.
 * The button is a wa.me link with the message pre-typed; the conversation then
 * happens in the WhatsApp Business app, whose Greeting message answers first.
 *
 * Renders nothing if the WhatsApp number is removed from `content/contact.ts`,
 * rather than a button that opens the wrong chat or none.
 */
export default function InternshipBand() {
  const href = whatsappChatUrl(INTERNSHIP.prefill);
  if (!href) return null;

  return (
    <section
      aria-labelledby="internship-title"
      className="relative isolate overflow-hidden bg-carbon text-white"
    >
      {INTERNSHIP.image ? (
        <>
          <Image
            src={INTERNSHIP.image}
            alt=""
            fill
            sizes="100vw"
            className="object-cover opacity-60"
            style={{ objectPosition: INTERNSHIP.imagePosition }}
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-r from-carbon via-carbon/70 to-carbon/20"
          />
        </>
      ) : (
        /* Until Vamscore's picture arrives: a soft coral glow from the right,
           so the band isn't a flat block. The copy sits on plain carbon. */
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_50%,rgb(251_81_47/0.18),transparent_60%)]"
        />
      )}

      <div className="shell relative py-24 lg:py-32">
        <h2 id="internship-title" className="type-band max-w-2xl text-white">
          {INTERNSHIP.title}
        </h2>
        <p className="type-lede mt-6 max-w-xl text-white/85">{INTERNSHIP.body}</p>
        <Button href={href} target="_blank" rel="noopener noreferrer" className="mt-10">
          {INTERNSHIP.cta}
          <span className="sr-only"> (opens WhatsApp)</span>
          <Arrow />
        </Button>
      </div>
    </section>
  );
}
