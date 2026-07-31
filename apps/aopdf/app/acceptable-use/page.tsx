import type { Metadata } from 'next';
import LegalDocumentPage from '@/components/legal-document-page';
import { readLegalDocument } from '@/lib/legal-documents';

export const metadata: Metadata = {
  title: 'Acceptable Use',
  description: 'Acceptable-use requirements for AOPDF.',
};

export default function AcceptableUsePage() {
  return <LegalDocumentPage document={readLegalDocument('acceptable-use')} />;
}
