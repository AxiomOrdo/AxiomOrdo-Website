import type { Metadata } from 'next';
import LegalDocumentPage from '@/components/legal-document-page';
import { readLegalDocument } from '@/lib/legal-documents';

export const metadata: Metadata = {
  title: 'Terms',
  description: 'Terms governing AO-PDF browser-local workflows, supported inputs, operating limits and user responsibilities.',
  alternates: { canonical: '/ao-pdf/terms/' },
};

export default function TermsPage() {
  return <LegalDocumentPage document={readLegalDocument('terms')} />;
}
