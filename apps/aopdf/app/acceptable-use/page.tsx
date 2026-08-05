import type { Metadata } from 'next';
import LegalDocumentPage from '@/components/legal-document-page';
import { readLegalDocument } from '@/lib/legal-documents';

export const metadata: Metadata = {
  title: 'Acceptable Use',
  description: 'Acceptable-use requirements for lawful AOPDF processing, document security, service protection and responsible use.',
  alternates: { canonical: '/aopdf/acceptable-use/' },
};

export default function AcceptableUsePage() {
  return <LegalDocumentPage document={readLegalDocument('acceptable-use')} />;
}
