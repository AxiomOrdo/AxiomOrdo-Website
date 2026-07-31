'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function CtaSection() {
  return (
    <section className="py-20">
      <div className="max-w-4xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600/20 via-purple-600/10 to-zinc-900/80 border border-indigo-500/20 p-10 sm:p-16 text-center"
        >
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">Process the Document, Not the Promise</h2>
          <p className="text-zinc-400 mb-8 max-w-lg mx-auto">Choose one of nine local workflows and review its limits before processing begins.</p>
          <Link href="/tools" className="inline-flex items-center gap-2 px-8 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-indigo-600/25">
            Get Started Free <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
