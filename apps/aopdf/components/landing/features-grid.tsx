'use client';

import { motion } from 'framer-motion';
import { Columns2, FileKey2, Layers, ScanSearch, Scissors, ShieldX, Stamp, Table } from 'lucide-react';

const features = [
  { icon: ScanSearch, title: 'Inspect', desc: 'Separate detected facts, warnings, limitations, and recommendations.', color: 'text-indigo-400' },
  { icon: Columns2, title: 'Compare', desc: 'Compare extracted text, page geometry, annotations, and rendered appearances.', color: 'text-purple-400' },
  { icon: FileKey2, title: 'Evidence Manifests', desc: 'Calculate local SHA-256 hashes without turning them into legal claims.', color: 'text-emerald-400' },
  { icon: ShieldX, title: 'Permanent Redaction', desc: 'Reconstruct supported pages and verify bounded image-only output.', color: 'text-amber-400' },
  { icon: Layers, title: 'Merge PDFs', desc: 'Combine local PDF files in a selected source-file order.', color: 'text-indigo-400' },
  { icon: Scissors, title: 'Split & Extract', desc: 'Extract pages by range or split into individual files.', color: 'text-purple-400' },
  { icon: Stamp, title: 'Watermark', desc: 'Apply a text watermark across every page.', color: 'text-violet-400' },
  { icon: Table, title: 'Flatten Forms', desc: 'Flatten supported interactive form fields into page content.', color: 'text-lime-400' },
];

export default function FeaturesGrid() {
  return (
    <section className="py-20">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold tracking-tight mb-3">One Assurance Workspace</h2>
          <p className="text-zinc-400 max-w-xl mx-auto">Thirteen admitted workflows share a browser-local boundary, source/output separation, explicit limitations, and session-local operation history.</p>
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
