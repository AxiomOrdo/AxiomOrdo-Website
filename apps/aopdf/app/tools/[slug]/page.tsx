import { PDF_TOOLS } from '@/lib/pdf-tools';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';
import AmbientGlow from '@/components/ambient-glow';
import ToolWorkspace from '@/components/tools/tool-workspace';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export function generateStaticParams() {
  return PDF_TOOLS.map((t: any) => ({ slug: t.slug }));
}

export default async function ToolPage(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const tool = PDF_TOOLS.find((t: any) => t.slug === params?.slug);
  if (!tool) return notFound();

  return (
    <div className="flex flex-col min-h-screen">
      <AmbientGlow />
      <Navbar />
      <main className="flex-1 z-10 max-w-4xl mx-auto px-6 py-12 w-full">
        {tool.status === 'planned' ? (
          <section className="mx-auto max-w-2xl rounded-3xl border border-amber-500/20 bg-zinc-900/70 p-8 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-400">Planned capability</p>
            <h1 className="mt-3 text-3xl font-bold text-zinc-100">{tool.name}</h1>
            <p className="mt-4 text-sm leading-6 text-zinc-400">{tool.statusNote ?? tool.description}</p>
            <p className="mt-4 text-sm text-zinc-500">
              This workspace is intentionally disabled until its processing behavior and output are verified.
            </p>
            <Link
              href="/tools"
              className="mt-7 inline-flex rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-500"
            >
              Browse available tools
            </Link>
          </section>
        ) : (
          <ToolWorkspace tool={tool} />
        )}
      </main>
      <Footer />
    </div>
  );
}
