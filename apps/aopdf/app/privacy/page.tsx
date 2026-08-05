import type { Metadata } from 'next';
import LegalDocumentPage from '@/components/legal-document-page';
import { readLegalDocument } from '@/lib/legal-documents';

export const metadata: Metadata = {
  title: 'Privacy',
  description: 'How AOPDF keeps document processing local, limits telemetry and places device security responsibilities with the user.',
  alternates: { canonical: '/aopdf/privacy/' },
};

export default function PrivacyPage() {
  return <LegalDocumentPage document={readLegalDocument('privacy')} />;
}
