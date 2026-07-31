'use client';

import { motion } from 'framer-motion';
import { Layers, Scissors, Minimize2, RotateCw, Hash, Stamp, Image, Table } from 'lucide-react';

const features = [
  { icon: Layers, title: 'Merge PDFs', desc: 'Combine local PDF files in a selected source-file order.', color: 'text-indigo-400' },
  { icon: Scissors, title: 'Split & Extract', desc: 'Extract pages by range or split into individual files.', color: 'text-purple-400' },
  { icon: Minimize2, title: 'Optimize', desc: 'Rebuild supported PDFs using object streams; savings vary by file.', color: 'text-emerald-400' },
  { icon: RotateCw, title: 'Rotate', desc: 'Rotate all pages deterministically by a selected angle.', color: 'text-amber-400' },
  { icon: Stamp, title: 'Watermark', desc: 'Apply a text watermark across every page.', color: 'text-violet-400' },
  { icon: Image, title: 'Images to PDF', desc: 'Combine local JPG and PNG images into a PDF.', color: 'text-teal-400' },
  { icon: Table, title: 'Flatten Forms', desc: 'Flatten supported interactive form fields into page content.', color: 'text-lime-400' },
  { icon: Hash, title: 'Page Numbers', desc: 'Add numbered labels in one supported position.', color: 'text-cyan-400' },
];

export default function FeaturesGrid() {
  return (
    <section className="py-20">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold tracking-tight mb-3">Nine Admitted Workflows</h2>
          <p className="text-zinc-400 max-w-xl mx-auto">Every listed tool has an explicit browser-local boundary and tool-specific limits.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {features.map((f: any, i: number) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="group p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 hover:border-indigo-500/30 hover:bg-zinc-900/80 transition-all duration-300 cursor-default"
            >
              <f.icon className={`w-6 h-6 ${f.color} mb-3 group-hover:scale-110 transition-transform`} />
              <h3 className="text-sm font-semibold text-zinc-200 mb-1">{f.title}</h3>
              <p className="text-xs text-zinc-500 leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
