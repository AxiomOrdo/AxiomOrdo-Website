'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { FileText, Menu, X } from 'lucide-react';
import { appPath } from '@/lib/paths';
import { ACCOUNTS_ENABLED } from '@/lib/features';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const { status } = useSession() || {};
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-800/80 bg-zinc-950/70 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-zinc-200 to-zinc-400">
            AxiomOrdoPDF
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          <Link href="/tools" className="px-3 py-2 text-sm text-zinc-400 hover:text-zinc-100 transition-colors rounded-lg hover:bg-zinc-800/50">Tools</Link>
          <Link href="/pricing" className="px-3 py-2 text-sm text-zinc-400 hover:text-zinc-100 transition-colors rounded-lg hover:bg-zinc-800/50">Pricing</Link>
          <Link href="/api-docs" className="px-3 py-2 text-sm text-zinc-400 hover:text-zinc-100 transition-colors rounded-lg hover:bg-zinc-800/50">API</Link>
          {!ACCOUNTS_ENABLED ? (
            <span className="ml-2 rounded-full border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-400">
              Accounts opening later
            </span>
          ) : status === 'authenticated' ? (
            <>
              <Link href="/dashboard" className="px-3 py-2 text-sm text-zinc-400 hover:text-zinc-100 transition-colors rounded-lg hover:bg-zinc-800/50">Dashboard</Link>
              <button onClick={() => signOut({ callbackUrl: appPath('/') })} className="ml-2 px-4 py-2 text-sm bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg transition-colors border border-zinc-700">Sign Out</button>
            </>
          ) : (
            <>
              <Link href="/auth/signin" className="ml-2 px-4 py-2 text-sm text-zinc-300 hover:text-white transition-colors">Sign In</Link>
              <Link href="/auth/signup" className="px-4 py-2 text-sm bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors shadow-lg shadow-indigo-600/25">Get Started</Link>
            </>
          )}
        </nav>

        {/* Mobile Toggle */}
        <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 text-zinc-400 hover:text-zinc-100">
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-zinc-800 bg-zinc-950/95 backdrop-blur-lg"
          >
            <nav className="flex flex-col p-4 gap-2">
              <Link href="/tools" onClick={() => setMobileOpen(false)} className="px-3 py-2 text-sm text-zinc-400 hover:text-zinc-100 rounded-lg hover:bg-zinc-800/50">Tools</Link>
              <Link href="/pricing" onClick={() => setMobileOpen(false)} className="px-3 py-2 text-sm text-zinc-400 hover:text-zinc-100 rounded-lg hover:bg-zinc-800/50">Pricing</Link>
              <Link href="/api-docs" onClick={() => setMobileOpen(false)} className="px-3 py-2 text-sm text-zinc-400 hover:text-zinc-100 rounded-lg hover:bg-zinc-800/50">API</Link>
              {!ACCOUNTS_ENABLED ? (
                <span className="px-3 py-2 text-xs text-zinc-500">Accounts opening later</span>
              ) : status === 'authenticated' ? (
                <>
                  <Link href="/dashboard" onClick={() => setMobileOpen(false)} className="px-3 py-2 text-sm text-zinc-400 hover:text-zinc-100 rounded-lg hover:bg-zinc-800/50">Dashboard</Link>
                  <button onClick={() => { signOut({ callbackUrl: appPath('/') }); setMobileOpen(false); }} className="px-3 py-2 text-sm text-left text-rose-400 hover:bg-zinc-800/50 rounded-lg">Sign Out</button>
                </>
              ) : (
                <>
                  <Link href="/auth/signin" onClick={() => setMobileOpen(false)} className="px-3 py-2 text-sm text-zinc-400 hover:text-zinc-100 rounded-lg hover:bg-zinc-800/50">Sign In</Link>
                  <Link href="/auth/signup" onClick={() => setMobileOpen(false)} className="px-3 py-2 text-sm bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-center">Get Started</Link>
                </>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
