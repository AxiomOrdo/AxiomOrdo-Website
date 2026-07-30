import Navbar from '@/components/navbar';
import Footer from '@/components/footer';
import AmbientGlow from '@/components/ambient-glow';
import HeroSection from '@/components/landing/hero-section';
import FeaturesGrid from '@/components/landing/features-grid';
import ToolShowcase from '@/components/landing/tool-showcase';
import PricingPreview from '@/components/landing/pricing-preview';
import CtaSection from '@/components/landing/cta-section';

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <AmbientGlow />
      <Navbar />
      <main className="flex-1 z-10">
        <HeroSection />
        <FeaturesGrid />
        <ToolShowcase />
        <PricingPreview />
        <CtaSection />
      </main>
      <Footer />
    </div>
  );
}
