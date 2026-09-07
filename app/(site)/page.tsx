import { CUSTOMER_STORIES, WHO_WE_ARE } from "@/content/home";
import { VISION_MISSION_BAND } from "@/content/about";
import AiNativeBand from "@/components/sections/AiNativeBand";
import Connect from "@/components/sections/Connect";
import CustomerStories from "@/components/sections/CustomerStories";
import Faq from "@/components/sections/Faq";
import GetThereTogether from "@/components/sections/GetThereTogether";
import Hero from "@/components/sections/Hero";
import PartnerMarquee from "@/components/sections/PartnerMarquee";
import SectionNav from "@/components/sections/SectionNav";
import SectionWatermark from "@/components/sections/SectionWatermark";
import WhoWeAre from "@/components/sections/WhoWeAre";
import VisionMission from "@/components/sections/VisionMission";

export default function HomePage() {
  return (
    <>
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
      <GetThereTogether />
      <Faq />
      <Connect />
    </>
  );
}
