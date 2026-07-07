import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/landing/HeroSection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { LearningLoopSection } from "@/components/landing/LearningLoopSection";
import { ModulesSection } from "@/components/landing/ModulesSection";
import { AITutorSection } from "@/components/landing/AITutorSection";
import { CTASection } from "@/components/landing/CTASection";

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <FeaturesSection />
        <LearningLoopSection />
        <ModulesSection />
        <AITutorSection />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}
