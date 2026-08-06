import { PDF_TOOLS } from '@/lib/pdf-tools';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';
import AmbientGlow from '@/components/ambient-glow';
import ToolWorkspace from '@/components/tools/tool-workspace';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

export function generateStaticParams() {
  return PDF_TOOLS.map((tool) => ({ slug: tool.slug }));
}

export async function generateMetadata(
  props: { params: Promise<{ slug: string }> },
): Promise<Metadata> {
  const { slug } = await props.params;
  const tool = PDF_TOOLS.find((candidate) => candidate.slug === slug);
  if (!tool) return {};
  return {
    title: tool.name,
    description: `${tool.description} Process locally in your browser with AO-PDF.`,
  };
}

export default async function ToolPage(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const tool = PDF_TOOLS.find((candidate) => candidate.slug === params?.slug);
  if (!tool) return notFound();

  return (
    <div className="flex flex-col min-h-screen">
      <AmbientGlow />
      <Navbar />
      <main className="flex-1 z-10 max-w-4xl mx-auto px-6 py-12 w-full">
        <ToolWorkspace tool={tool} />
      </main>
      <Footer />
    </div>
  );
}
