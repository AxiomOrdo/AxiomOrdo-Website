'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Shield, Zap, Lock } from 'lucide-react';

export default function HeroSection() {
  return (
    <section className="relative pt-20 pb-24 overflow-hidden">
      <div className="max-w-5xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-8">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Available tools process locally — your documents stay on your device
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">Browser-Local Document Assurance</span>
            <br />With Explicit Boundaries
          </h1>

          <p className="text-lg text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Inspect, compare, hash, redact supported content, and transform PDFs with visible limits, stable failures, and no document upload.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/tools" className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-indigo-600/25 flex items-center gap-2 active:scale-[0.98]">
              Start Processing <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/limits" className="px-8 py-3.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold rounded-xl transition-all border border-zinc-700 flex items-center gap-2">
              Review Limits
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-16 flex flex-wrap justify-center gap-8 text-sm text-zinc-500"
        >
          <div className="flex items-center gap-2"><Shield className="w-4 h-4 text-indigo-400" /> Local processing boundary</div>
          <div className="flex items-center gap-2"><Zap className="w-4 h-4 text-purple-400" /> Dedicated worker execution</div>
          <div className="flex items-center gap-2"><Lock className="w-4 h-4 text-emerald-400" /> No document retention</div>
        </motion.div>
      </div>
    </section>
  );
}
