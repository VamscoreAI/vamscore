import { CUSTOMER_STORIES, WHO_WE_ARE } from "@/content/home";
import { VISION_MISSION_BAND } from "@/content/about";
import AiNativeBand from "@/components/sections/AiNativeBand";
import Connect from "@/components/sections/Connect";
import CustomerStories from "@/components/sections/CustomerStories";
import Faq from "@/components/sections/Faq";
import GetThereTogether from "@/components/sections/GetThereTogether";
import Hero from "@/components/sections/Hero";
import InternshipBand from "@/components/sections/InternshipBand";
import PartnerMarquee from "@/components/sections/PartnerMarquee";
import SectionNav from "@/components/sections/SectionNav";
import SectionWatermark from "@/components/sections/SectionWatermark";
import WhoWeAre from "@/components/sections/WhoWeAre";
import VisionMission from "@/components/sections/VisionMission";
import VisitorCounter from "@/components/sections/VisitorCounter";
import type { Metadata } from "next";
import { EMAIL } from "@/content/contact";
import { COMPANY, FOOTER_SOCIAL, SITE_DESCRIPTION } from "@/content/nav";
import { SITE_URL } from "@/lib/site";

// The title comes from the root layout.
export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

/**
 * Tells search engines who Vamscore is: the WebSite entry is what Google uses
 * for the site name shown above the result, and `sameAs` ties the four social
 * profiles to this domain as one organisation.
 *
 * `logo` is the wordmark on white, 1200x244 (Google wants at least 112x112),
 * from the artwork Vamscore supplied on 2026-09-17. Flattened onto white
 * rather than left transparent: the purple ink all but disappears if a
 * reader composites it on a dark ground.
 *
 * The browser-tab and home-screen icons (app/favicon.ico, app/icon.png,
 * app/apple-icon.png) are a different piece of artwork: the standalone V
 * mark Vamscore supplied on 2026-09-17 as "VamScore Letter V.png", squared
 * and set on a white rounded tile. Regenerate all three together from that
 * file if it is ever replaced, or the tab and the phone icon will diverge.
 */
const STRUCTURED_DATA = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: COMPANY,
      url: SITE_URL,
      logo: `${SITE_URL}/assets/logos/vamscore-mark.png`,
      description: SITE_DESCRIPTION,
      email: EMAIL.primary,
      // The same line as the contact page's Phone row, in E.164.
      telephone: "+919490729484",
      areaServed: "IN",
      sameAs: FOOTER_SOCIAL.map((s) => s.href),
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      name: COMPANY,
      url: SITE_URL,
      inLanguage: "en-IN",
      publisher: { "@id": `${SITE_URL}/#organization` },
    },
  ],
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        // Escaped per the Next.js JSON-LD guide, so no string in the data can
        // close the script tag.
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(STRUCTURED_DATA).replace(/</g, "\\u003c"),
        }}
      />
      <Hero />
      <SectionNav />
      <SectionWatermark>{WHO_WE_ARE.eyebrow}</SectionWatermark>
      <WhoWeAre />
      <SectionWatermark>{VISION_MISSION_BAND.eyebrow}</SectionWatermark>
      <VisionMission />
      <SectionWatermark>{CUSTOMER_STORIES.eyebrow}</SectionWatermark>
      <CustomerStories />
      <AiNativeBand />
      <PartnerMarquee />
      <VisitorCounter />
      <GetThereTogether />
      <InternshipBand />
      <Faq />
      <Connect />
    </>
  );
}
