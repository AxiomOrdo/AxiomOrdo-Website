import type { Metadata } from 'next';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';
import AmbientGlow from '@/components/ambient-glow';
import { PDF_TOOLS } from '@/lib/pdf-tools';
import { TOOL_LIMITS } from '@/governance/tool-limits';

export const metadata: Metadata = {
  title: 'Operating Limits',
  description: 'Governed input, processing and output limits for all nine AO-PDF workflows.',
};

export default function LimitsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <AmbientGlow />
      <Navbar />
      <main className="z-10 mx-auto w-full max-w-6xl flex-1 px-4 py-12 sm:px-6 sm:py-16">
        <header className="mx-auto max-w-3xl text-center">
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            AO-PDF Operating Limits
          </h1>
          <p className="mt-4 text-sm leading-7 text-zinc-400 sm:text-base">
            Every workflow processes locally in a dedicated browser worker. The
            common boundary is 100 MiB per file, 250 MiB aggregate, 500 PDF
            pages, a 120-second timeout and a 1,024 MiB estimated working-memory
            limit. Encrypted PDFs are unsupported.
          </p>
        </header>

        <section className="mt-10 overflow-x-auto rounded-2xl border border-zinc-800 bg-zinc-900/60">
          <table className="w-full min-w-[720px] text-left text-sm">
            <caption className="sr-only">Tool-specific operating limits</caption>
            <thead className="border-b border-zinc-800 text-xs uppercase tracking-wider text-zinc-500">
              <tr>
                <th className="px-5 py-4">Tool</th>
                <th className="px-5 py-4">Inputs</th>
                <th className="px-5 py-4">Page limit</th>
                <th className="px-5 py-4">Material limitations</th>
              </tr>
            </thead>
            <tbody>
              {PDF_TOOLS.map((tool) => {
                const limits = TOOL_LIMITS[tool.slug];
                return (
                  <tr key={tool.slug} className="border-b border-zinc-800/70 align-top last:border-0">
                    <th className="px-5 py-5 font-semibold text-zinc-200">{tool.name}</th>
                    <td className="px-5 py-5 text-zinc-400">
                      {limits.minFiles}–{limits.maxFiles}
                    </td>
                    <td className="px-5 py-5 text-zinc-400">{limits.maxAggregatePages}</td>
                    <td className="px-5 py-5 text-zinc-400">
                      <ul className="list-disc space-y-1 pl-4">
                        {limits.limitations.map((limitation) => (
                          <li key={limitation}>{limitation}</li>
                        ))}
                      </ul>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>

        <section className="mt-8 rounded-2xl border border-indigo-500/20 bg-indigo-500/5 p-6 text-sm leading-7 text-zinc-400">
          <h2 className="font-semibold text-zinc-200">Estimated memory is not measured memory</h2>
          <p className="mt-2">
            AO-PDF conservatively estimates working bytes from input size, decoded
            image pixels, page-object overhead, simultaneous outputs,
            serialization duplication and operation multipliers. Browsers do not
            expose a reliable cross-browser measurement of PDF-library memory.
            Passing admission does not guarantee that a device can complete an
            operation.
          </p>
        </section>
      </main>
      <Footer />
    </div>
  );
}
