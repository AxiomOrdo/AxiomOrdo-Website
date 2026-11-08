import Link from 'next/link';
import Footer from '@/components/footer';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-16">
        <h1 className="text-3xl font-semibold">Page not found</h1>
        <p className="mt-4 text-zinc-400">This AO-PDF page could not be found.</p>
        <nav aria-label="AO-PDF navigation" className="mt-6 flex gap-6">
          <Link href="/" className="underline">AO-PDF home</Link>
          <Link href="/tools" className="underline">PDF tools</Link>
        </nav>
      </main>
      <Footer />
    </div>
  );
}
