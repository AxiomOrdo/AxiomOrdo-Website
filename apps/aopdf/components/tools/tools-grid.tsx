'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { PDF_TOOLS, TOOL_CATEGORIES, type PdfTool } from '@/lib/pdf-tools';
import * as LucideIcons from 'lucide-react';
import { useState } from 'react';

export default function ToolsGrid() {
  const [activeCategory, setActiveCategory] = useState<string>('All');

  const filtered = activeCategory === 'All'
    ? PDF_TOOLS
    : PDF_TOOLS.filter((t: PdfTool) => t.category === activeCategory);

  return (
    <div>
      <div className="flex flex-wrap justify-center gap-2 mb-10">
        <button
          type="button"
          onClick={() => setActiveCategory('All')}
          className={`min-h-11 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
            activeCategory === 'All'
              ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
              : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-zinc-200'
          }`}
        >
          All
        </button>
        {TOOL_CATEGORIES.map((cat: string) => (
          <button
            type="button"
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`min-h-11 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeCategory === cat
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-zinc-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((tool: PdfTool, i: number) => {
          const IconComponent = (LucideIcons as any)[tool.icon] ?? LucideIcons.FileText;
          return (
            <motion.div
              key={tool.slug}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.03 }}
            >
              <Link
                href={`/tools/${tool.slug}`}
                className="group block p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 hover:border-indigo-500/30 hover:bg-zinc-900/80 transition-all duration-300"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <IconComponent className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-semibold text-zinc-200">{tool.name}</h3>
                      <span className={`px-1.5 py-0.5 text-[10px] font-semibold rounded-md uppercase ${
                        tool.status === 'available'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                      }`}>
                        {tool.status}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-500 line-clamp-2">{tool.description}</p>
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
