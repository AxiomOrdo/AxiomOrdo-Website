import type { Metadata } from 'next';
import LegalDocumentPage from '@/components/legal-document-page';
import { readLegalDocument } from '@/lib/legal-documents';

export const metadata: Metadata = {
  title: 'Terms',
  description: 'Operational terms for the browser-local AOPDF workflows.',
};

export default function TermsPage() {
  return <LegalDocumentPage document={readLegalDocument('terms')} />;
}
