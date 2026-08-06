import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import Providers from './providers';

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const mono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://axiomordo.com'),
  title: {
    default: 'AO-PDF — Private PDF Tools by AxiomOrdo',
    template: '%s | AO-PDF',
  },
  description: 'Private browser PDF tools with local processing boundaries and no document uploads for local workflows.',
  alternates: {
    canonical: '/ao-pdf/',
  },
  icons: {
    icon: '/ao-pdf/favicon.svg',
    shortcut: '/ao-pdf/favicon.svg',
  },
  openGraph: {
    title: 'AO-PDF — Private PDF Tools by AxiomOrdo',
    description: 'Private browser-based PDF tools with explicit processing boundaries.',
    images: ['/ao-pdf/og-image.png'],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${jakarta.variable} ${mono.variable} font-sans bg-zinc-950 text-zinc-100 antialiased min-h-screen selection:bg-indigo-500 selection:text-white`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
