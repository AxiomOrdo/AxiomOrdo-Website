'use client';

import { motion } from 'framer-motion';
import { CheckCircle2, CircleDashed, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

const releaseLayers = [
  {
    icon: CheckCircle2,
    title: 'Admission first',
    detail: 'File, page, geometry, image and estimated-memory limits are checked before worker execution.',
    color: 'text-emerald-400',
  },
  {
    icon: CircleDashed,
    title: 'Controlled execution',
    detail: 'A dedicated worker is cancelled or terminated on demand, timeout, navigation and unmount.',
    color: 'text-amber-400',
  },
  {
    icon: ShieldCheck,
    title: 'Contained telemetry',
    detail: 'Only admitted tool, outcome, capped duration and governed error code can enter custom events.',
    color: 'text-indigo-400',
  },
];

export default function PricingPreview() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight">Built in Governed Layers</h2>
          <p className="mx-auto mt-3 max-w-2xl text-zinc-400">
            AO-PDF exposes the operating boundary before a document is selected and keeps document-derived data out of telemetry.
          </p>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {releaseLayers.map((layer, index) => (
            <motion.article
              key={layer.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
              className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6"
            >
              <layer.icon className={`h-6 w-6 ${layer.color}`} />
              <h3 className="mt-4 font-semibold text-zinc-200">{layer.title}</h3>
              <p className="mt-2 text-sm leading-6 text-zinc-500">{layer.detail}</p>
            </motion.article>
          ))}
        </div>
        <div className="mt-9 text-center">
          <Link
            href="/tools"
            className="inline-flex rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-500"
          >
            See tool status
          </Link>
        </div>
      </div>
    </section>
  );
}
