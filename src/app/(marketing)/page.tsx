import { HeroSection } from "@/features/marketing/components/hero-section";
import { CafeSection } from "@/features/marketing/components/cafe-section";
import { RoomsShowcase } from "@/features/marketing/components/rooms-showcase";
import { AmenitiesSection } from "@/features/marketing/components/amenities-section";
import { StatsSection } from "@/features/marketing/components/stats-section";
import { CommunitySection } from "@/features/marketing/components/community-section";
import { GallerySection } from "@/features/marketing/components/gallery-section";
import { CTASection } from "@/features/marketing/components/cta-section";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <StatsSection />
      <CafeSection />
      <RoomsShowcase />
      <AmenitiesSection />
      <CommunitySection />
      <GallerySection />
      <CTASection />
    </>
  );
}
