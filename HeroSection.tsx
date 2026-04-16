import { ContactSection } from "@/components/pfas/ContactSection";
import { FaqSection } from "@/components/pfas/FaqSection";
import { Footer } from "@/components/pfas/Footer";
import { HeroSection } from "@/components/pfas/HeroSection";
import { PricingSection } from "@/components/pfas/PricingSection";
import { ProblemSection } from "@/components/pfas/ProblemSection";
import { TriggerSection } from "@/components/pfas/TriggerSection";

export default function HomePage() {
  return (
    <main>
      <HeroSection />
      <ProblemSection />
      <TriggerSection />
      <PricingSection />
      <FaqSection />
      <ContactSection />
      <Footer />
    </main>
  );
}
