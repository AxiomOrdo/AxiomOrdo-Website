import type { PDFDocument } from 'pdf-lib';

export interface SupportedDocumentMetadata {
  readonly title?: string;
  readonly author?: string;
  readonly subject?: string;
  readonly keywords?: string;
  readonly creator?: string;
  readonly producer?: string;
  readonly creationDate?: Date;
  readonly modificationDate?: Date;
}

function safelyRead<T>(read: () => T): T | undefined {
  try {
    return read();
  } catch {
    return undefined;
  }
}

export function captureSupportedMetadata(
  document: PDFDocument,
): SupportedDocumentMetadata {
  return {
    title: safelyRead(() => document.getTitle()),
    author: safelyRead(() => document.getAuthor()),
    subject: safelyRead(() => document.getSubject()),
    keywords: safelyRead(() => document.getKeywords()),
    creator: safelyRead(() => document.getCreator()),
    producer: safelyRead(() => document.getProducer()),
    creationDate: safelyRead(() => document.getCreationDate()),
    modificationDate: safelyRead(() => document.getModificationDate()),
  };
}

export function restoreSupportedMetadata(
  document: PDFDocument,
  metadata: SupportedDocumentMetadata,
): void {
  if (metadata.title !== undefined) document.setTitle(metadata.title);
  if (metadata.author !== undefined) document.setAuthor(metadata.author);
  if (metadata.subject !== undefined) document.setSubject(metadata.subject);
  if (metadata.keywords !== undefined) {
    document.setKeywords(
      metadata.keywords.split(',').map((value) => value.trim()).filter(Boolean),
    );
  }
  if (metadata.creator !== undefined) document.setCreator(metadata.creator);
  if (metadata.producer !== undefined) document.setProducer(metadata.producer);
  if (metadata.creationDate !== undefined) {
    document.setCreationDate(metadata.creationDate);
  }
  if (metadata.modificationDate !== undefined) {
    document.setModificationDate(metadata.modificationDate);
  }
}

export const UNSUPPORTED_METADATA_STRUCTURES = [
  'XMP packets',
  'attachments',
  'outlines and bookmarks',
  'page labels',
] as const;
