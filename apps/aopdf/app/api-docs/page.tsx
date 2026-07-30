import Navbar from '@/components/navbar';
import Footer from '@/components/footer';
import AmbientGlow from '@/components/ambient-glow';
import ApiDocsContent from '@/components/api-docs/api-docs-content';

export default function ApiDocsPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <AmbientGlow />
      <Navbar />
      <main className="flex-1 z-10 max-w-4xl mx-auto px-6 py-16 w-full">
        <ApiDocsContent />
      </main>
      <Footer />
    </div>
  );
}
