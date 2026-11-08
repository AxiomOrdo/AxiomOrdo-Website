import Link from 'next/link';
import { FileText } from 'lucide-react';
import corporate from '../../../src/lib/corporate-notices.json';

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
          <a href="/legal/ico-registration/" className="hover:text-zinc-400 transition-colors">ICO registration</a>
        </div>
        <a
          href="https://www.axiomordo.com/"
          className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors"
        >
          © 2026 AxiomOrdo Ltd
        </a>
      </div>
      <div data-company-identifiers="true" className="max-w-7xl mx-auto px-6 mt-6 text-xs text-zinc-400 space-y-2">
        <p>{corporate.company.legalName} · Registered in {corporate.company.jurisdiction} · Company number <a href={corporate.company.companyRegisterUrl} className="underline">{corporate.company.companyNumber}</a></p>
        <p>Registered office: {corporate.company.registeredOffice}</p>
        <p>Contact: <a href={`mailto:${corporate.company.contactEmail}`} className="underline">{corporate.company.contactEmail}</a></p>
      </div>
    </footer>
  );
}
