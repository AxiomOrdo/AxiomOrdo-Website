import Navbar from '@/components/navbar';
import Footer from '@/components/footer';
import AmbientGlow from '@/components/ambient-glow';
import PricingContent from '@/components/pricing/pricing-content';

export default function PricingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <AmbientGlow />
      <Navbar />
      <main className="flex-1 z-10 max-w-6xl mx-auto px-6 py-16 w-full">
        <PricingContent />
      </main>
      <Footer />
    </div>
  );
}
