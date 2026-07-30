import Navbar from '@/components/navbar';
import AmbientGlow from '@/components/ambient-glow';
import DashboardContent from '@/components/dashboard/dashboard-content';
import { ACCOUNTS_ENABLED } from '@/lib/features';
import Link from 'next/link';

export default function DashboardPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <AmbientGlow />
      <Navbar />
      <main className="flex-1 z-10 max-w-6xl mx-auto px-6 py-12 w-full">
        {ACCOUNTS_ENABLED ? (
          <DashboardContent />
        ) : (
          <section className="mx-auto max-w-xl rounded-3xl border border-zinc-800 bg-zinc-900/70 p-8 text-center">
            <h1 className="text-2xl font-bold text-zinc-100">Dashboard unavailable</h1>
            <p className="mt-3 text-sm leading-6 text-zinc-400">
              Account and billing data are disabled until newly issued infrastructure credentials are configured.
            </p>
            <Link href="/tools" className="mt-6 inline-flex rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-500">
              Use local tools
            </Link>
          </section>
        )}
      </main>
    </div>
  );
}
