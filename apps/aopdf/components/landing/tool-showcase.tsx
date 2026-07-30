'use client';

import { motion } from 'framer-motion';
import { Upload, Cog, Download, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const steps = [
  { icon: Upload, title: 'Upload', desc: 'Drag and drop your PDF files into the workspace.', color: 'from-indigo-500 to-indigo-600' },
  { icon: Cog, title: 'Process', desc: 'Select your tool and configure settings. Everything runs locally.', color: 'from-purple-500 to-purple-600' },
  { icon: Download, title: 'Download', desc: 'Get your processed file instantly — no waiting, no uploads.', color: 'from-emerald-500 to-emerald-600' },
];

export default function ToolShowcase() {
  return (
    <section className="py-20 bg-zinc-900/30">
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold tracking-tight mb-3">How It Works</h2>
          <p className="text-zinc-400">Three simple steps. No account required for free tools.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((s: any, i: number) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className="text-center"
            >
              <div className={`w-16 h-16 mx-auto mb-5 rounded-2xl bg-gradient-to-br ${s.color} flex items-center justify-center shadow-lg`}>
                <s.icon className="w-7 h-7 text-white" />
              </div>
              <div className="text-2xl font-bold text-zinc-300 mb-1">Step {i + 1}</div>
              <h3 className="text-lg font-semibold text-zinc-200 mb-2">{s.title}</h3>
              <p className="text-sm text-zinc-500">{s.desc}</p>
            </motion.div>
          ))}
        </div>
        <div className="text-center mt-12">
          <Link href="/tools" className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-indigo-600/25">
            Browse All Tools <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
