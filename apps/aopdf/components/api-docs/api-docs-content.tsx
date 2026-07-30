'use client';

import { motion } from 'framer-motion';
import { Code, LockKeyhole, ShieldCheck } from 'lucide-react';

export default function ApiDocsContent() {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-400">
          API not yet admitted
        </p>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
          AOPDF API
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-zinc-400">
          Public processing endpoints are intentionally disabled. The earlier
          prototype documented routes that did not exist; AOPDF will not publish
          an API contract before authentication, rate limits, file handling, and
          output validation are implemented and tested.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {[
          {
            icon: Code,
            title: 'Versioned contract',
            body: 'Every released endpoint will have a stable request schema, response schema, and documented error model.',
          },
          {
            icon: LockKeyhole,
            title: 'Hashed credentials',
            body: 'API keys will be shown once and stored only as one-way hashes with revocation and audit metadata.',
          },
          {
            icon: ShieldCheck,
            title: 'Verified processing',
            body: 'An endpoint will be published only after its file limits, deterministic behavior, and negative cases are tested.',
          },
        ].map((item, index) => (
          <motion.article
            key={item.title}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08 }}
            className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6"
          >
            <item.icon className="mb-4 h-6 w-6 text-indigo-400" />
            <h2 className="font-semibold text-zinc-200">{item.title}</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-500">{item.body}</p>
          </motion.article>
        ))}
      </div>
    </div>
  );
}
