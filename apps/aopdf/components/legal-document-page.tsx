import Navbar from '@/components/navbar';
import Footer from '@/components/footer';
import AmbientGlow from '@/components/ambient-glow';
import type { LegalDocument } from '@/lib/legal-documents';

export default function LegalDocumentPage({
  document,
}: {
  document: LegalDocument;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <AmbientGlow />
      <Navbar />
      <main className="z-10 mx-auto w-full max-w-3xl flex-1 px-4 py-12 sm:px-6 sm:py-16">
        <header className="border-b border-zinc-800 pb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-400">
            {document.reviewStatus.replace('-', ' ')}
          </p>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
            {document.title}
          </h1>
          <p className="mt-4 text-sm text-zinc-500">
            Effective {document.effectiveDate} · Revision {document.revisionId}
          </p>
        </header>
        <div className="space-y-9 py-9">
          {document.sections.map((section, index) => (
            <section key={`${section.heading ?? 'introduction'}-${index}`}>
              {section.heading ? (
                <h2 className="text-xl font-bold text-zinc-200">{section.heading}</h2>
              ) : null}
              <div className="mt-3 space-y-4 text-sm leading-7 text-zinc-400 sm:text-base">
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
