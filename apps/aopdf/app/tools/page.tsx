import Navbar from '@/components/navbar';
import Footer from '@/components/footer';
import AmbientGlow from '@/components/ambient-glow';
import ToolsGrid from '@/components/tools/tools-grid';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'PDF Tools',
  description: 'Nine browser-local PDF workflows with explicit limits, from merging and splitting to watermarking and form flattening.',
  alternates: { canonical: '/aopdf/tools/' },
};

export default function ToolsPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <AmbientGlow />
      <Navbar />
      <main className="flex-1 z-10 max-w-6xl mx-auto px-6 py-16 w-full">
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3">PDF Tools</h1>
          <p className="text-zinc-400 max-w-xl mx-auto">Nine governed, browser-local workflows with explicit operating limits. Select a tool to begin.</p>
        </div>
        <ToolsGrid />
      </main>
      <Footer />
    </div>
  );
}
