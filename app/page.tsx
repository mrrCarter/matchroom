import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { HeroSection } from "@/components/landing/HeroSection";
import { BrandCarousel } from "@/components/landing/BrandCarousel";
import { UpcomingGameCard } from "@/components/landing/UpcomingGameCard";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { BriefPreview } from "@/components/landing/BriefPreview";
import { AskAISection } from "@/components/landing/AskAISection";
import { RequestDemo } from "@/components/forms/RequestDemo";
import { FinalCTA } from "@/components/landing/FinalCTA";

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main>
        <HeroSection />
        <BrandCarousel />
        <UpcomingGameCard />
        <HowItWorks />
        <BriefPreview />
        <AskAISection />
        <RequestDemo />
        <FinalCTA />
      </main>
      <SiteFooter />
    </>
  );
}
