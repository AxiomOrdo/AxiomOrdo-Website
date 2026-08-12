import Navbar from '@/components/navbar';
import Footer from '@/components/footer';
import AmbientGlow from '@/components/ambient-glow';
import ToolsGrid from '@/components/tools/tools-grid';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Document Assurance Workspace',
  description: 'Thirteen browser-local PDF workflows for document assurance and controlled transformation, with explicit limits.',
  alternates: { canonical: '/ao-pdf/tools/' },
};

export default function ToolsPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <AmbientGlow />
      <Navbar />
      <main className="flex-1 z-10 max-w-6xl mx-auto px-6 py-16 w-full">
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3">Document Assurance Workspace</h1>
          <p className="text-zinc-400 max-w-2xl mx-auto">Inspect, compare, hash, redact supported content, or transform PDFs inside one browser-local workspace with shared limits, source/output separation, and session-local history.</p>
        </div>
        <ToolsGrid />
      </main>
      <Footer />
    </div>
  );
}
