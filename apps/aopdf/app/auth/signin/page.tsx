import Navbar from '@/components/navbar';
import AmbientGlow from '@/components/ambient-glow';
import SignInForm from '@/components/auth/signin-form';
import { ACCOUNTS_ENABLED } from '@/lib/features';
import Link from 'next/link';

export default function SignInPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <AmbientGlow />
      <Navbar />
      <main className="flex-1 z-10 flex items-center justify-center px-6 py-16">
        {ACCOUNTS_ENABLED ? (
          <SignInForm />
        ) : (
          <section className="max-w-xl rounded-3xl border border-zinc-800 bg-zinc-900/70 p-8 text-center">
            <h1 className="text-2xl font-bold text-zinc-100">Accounts are not yet enabled</h1>
            <p className="mt-3 text-sm leading-6 text-zinc-400">
              New database and authentication credentials must be commissioned before sign-in opens.
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
