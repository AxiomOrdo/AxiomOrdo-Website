'use client';

import { motion } from 'framer-motion';
import { CheckCircle2, Clock3, CreditCard } from 'lucide-react';
import Link from 'next/link';

export default function PricingContent() {
  return (
    <div>
      <div className="mb-12 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-400">
          Billing disabled during launch
        </p>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
          AOPDF launch access
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-zinc-400">
          Available browser-local tools can be used without an account. No
          subscription will be sold until new Stripe credentials, entitlements,
          webhook handling, and billing recovery flows are verified.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        {[
          {
            icon: CheckCircle2,
            title: 'Launch access',
            detail: 'Available local tools, no account required, and no document retention.',
            accent: 'text-emerald-400',
          },
          {
            icon: Clock3,
            title: 'Account plans',
            detail: 'Usage history and account features will open after the new database and authentication environment is commissioned.',
            accent: 'text-amber-400',
          },
          {
            icon: CreditCard,
            title: 'Paid plans',
            detail: 'Pricing remains provisional until Stripe products and complete subscription lifecycle tests are in place.',
            accent: 'text-indigo-400',
          },
        ].map((item, index) => (
          <motion.article
            key={item.title}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08 }}
            className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6"
          >
            <item.icon className={`h-6 w-6 ${item.accent}`} />
            <h2 className="mt-4 font-semibold text-zinc-200">{item.title}</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-500">{item.detail}</p>
          </motion.article>
        ))}
      </div>

      <div className="mt-10 text-center">
        <Link
          href="/tools"
          className="inline-flex rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-500"
        >
          Use available tools
        </Link>
      </div>
    </div>
  );
}
