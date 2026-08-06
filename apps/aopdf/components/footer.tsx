import Link from 'next/link';
import { FileText } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-zinc-900 py-10">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center">
            <FileText className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm font-semibold text-zinc-400">AO-PDF</span>
        </div>
        <div className="flex items-center gap-6 text-xs text-zinc-600">
          <Link href="/tools" className="hover:text-zinc-400 transition-colors">Tools</Link>
          <Link href="/limits" className="hover:text-zinc-400 transition-colors">Limits</Link>
          <Link href="/privacy" className="hover:text-zinc-400 transition-colors">Privacy</Link>
          <Link href="/terms" className="hover:text-zinc-400 transition-colors">Terms</Link>
          <Link href="/acceptable-use" className="hover:text-zinc-400 transition-colors">Acceptable use</Link>
        </div>
        <p className="text-xs text-zinc-600">© 2026 AxiomOrdo Ltd</p>
      </div>
    </footer>
  );
}
