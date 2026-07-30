export interface PdfTool {
  slug: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  tier: 'free' | 'pro' | 'enterprise';
  clientSide: boolean;
  status: 'available' | 'beta' | 'planned';
  statusNote?: string;
}

export const PDF_TOOLS: PdfTool[] = [
  { slug: 'merge', name: 'Merge PDFs', description: 'Combine multiple PDF files into a single document. Reorder the source files before processing.', icon: 'Layers', category: 'Organize', tier: 'free', clientSide: true, status: 'available' },
  { slug: 'split', name: 'Split PDF', description: 'Extract specific pages or split every page into separate files.', icon: 'Scissors', category: 'Organize', tier: 'free', clientSide: true, status: 'available' },
  { slug: 'compress', name: 'Optimize PDF', description: 'Rebuild a PDF with object streams. Results vary by document and may not reduce every file.', icon: 'Minimize2', category: 'Optimize', tier: 'free', clientSide: true, status: 'beta', statusNote: 'Document-dependent optimization; image recompression is not yet included.' },
  { slug: 'rotate', name: 'Rotate Pages', description: 'Rotate every PDF page by 90°, 180°, or 270°.', icon: 'RotateCw', category: 'Organize', tier: 'free', clientSide: true, status: 'available' },
  { slug: 'delete-pages', name: 'Delete Pages', description: 'Remove selected pages from a PDF document.', icon: 'Trash2', category: 'Organize', tier: 'free', clientSide: true, status: 'available' },
  { slug: 'reorder', name: 'Reorder Pages', description: 'Rearrange individual pages with a visual page editor.', icon: 'ArrowUpDown', category: 'Organize', tier: 'pro', clientSide: true, status: 'planned', statusNote: 'Page-level preview and ordering controls are under development.' },
  { slug: 'watermark', name: 'Add Watermark', description: 'Apply a diagonal text watermark to every page.', icon: 'Stamp', category: 'Edit', tier: 'free', clientSide: true, status: 'available' },
  { slug: 'page-numbers', name: 'Add Page Numbers', description: 'Insert page numbers at a selected position on every page.', icon: 'Hash', category: 'Edit', tier: 'free', clientSide: true, status: 'available' },
  { slug: 'protect', name: 'Protect PDF', description: 'Add password-based encryption to a PDF.', icon: 'Lock', category: 'Security', tier: 'pro', clientSide: true, status: 'planned', statusNote: 'A vetted encryption engine is required before release.' },
  { slug: 'unlock', name: 'Unlock PDF', description: 'Remove password protection when the valid password is supplied.', icon: 'Unlock', category: 'Security', tier: 'pro', clientSide: true, status: 'planned', statusNote: 'A vetted encryption engine is required before release.' },
  { slug: 'sign', name: 'Sign PDF', description: 'Place a visible signature image on a selected page.', icon: 'PenTool', category: 'Edit', tier: 'pro', clientSide: true, status: 'planned', statusNote: 'Visible signing is planned; this will not claim certificate-based digital signatures.' },
  { slug: 'flatten', name: 'Flatten Form Fields', description: 'Flatten supported interactive form fields into page content.', icon: 'Layers', category: 'Edit', tier: 'free', clientSide: true, status: 'available' },
  { slug: 'crop', name: 'Crop Pages', description: 'Crop PDF pages to user-selected boundaries.', icon: 'Crop', category: 'Edit', tier: 'pro', clientSide: true, status: 'planned' },
  { slug: 'images-to-pdf', name: 'Images to PDF', description: 'Convert JPG and PNG images into a single PDF document.', icon: 'ImagePlus', category: 'Convert', tier: 'free', clientSide: true, status: 'available' },
  { slug: 'pdf-to-images', name: 'PDF to Images', description: 'Render PDF pages as downloadable image files.', icon: 'Image', category: 'Convert', tier: 'pro', clientSide: true, status: 'planned' },
  { slug: 'pdf-to-word', name: 'PDF to Word', description: 'Convert PDF documents to editable DOCX with explicit fidelity limits.', icon: 'FileText', category: 'Convert', tier: 'pro', clientSide: false, status: 'planned', statusNote: 'No document conversion service is connected.' },
  { slug: 'pdf-to-excel', name: 'PDF to Excel', description: 'Extract supported tables into XLSX spreadsheets.', icon: 'Table', category: 'Convert', tier: 'pro', clientSide: false, status: 'planned', statusNote: 'No document conversion service is connected.' },
  { slug: 'pdf-to-pptx', name: 'PDF to PowerPoint', description: 'Convert supported slide PDFs into PPTX presentations.', icon: 'Presentation', category: 'Convert', tier: 'enterprise', clientSide: false, status: 'planned', statusNote: 'No document conversion service is connected.' },
  { slug: 'annotate', name: 'Annotate PDF', description: 'Add governed highlights and comments to selected locations.', icon: 'MessageSquare', category: 'Edit', tier: 'pro', clientSide: true, status: 'planned' },
  { slug: 'redact', name: 'Redact PDF', description: 'Remove selected content rather than merely drawing an overlay.', icon: 'EyeOff', category: 'Security', tier: 'enterprise', clientSide: true, status: 'planned', statusNote: 'Release is blocked until irreversible content removal is verified.' },
  { slug: 'ocr', name: 'OCR — Text Recognition', description: 'Make scanned PDFs searchable while preserving a traceable source layer.', icon: 'ScanText', category: 'Convert', tier: 'enterprise', clientSide: false, status: 'planned', statusNote: 'No OCR engine is connected.' },
  { slug: 'form-fill', name: 'Fill PDF Forms', description: 'Inspect, fill, and save supported interactive PDF form fields.', icon: 'ClipboardEdit', category: 'Edit', tier: 'pro', clientSide: true, status: 'planned' },
];

export const TOOL_CATEGORIES = ['Organize', 'Edit', 'Convert', 'Optimize', 'Security'] as const;

export function getToolBySlug(slug: string): PdfTool | undefined {
  return PDF_TOOLS.find((t: PdfTool) => t.slug === slug);
}

export function getToolsByCategory(category: string): PdfTool[] {
  return PDF_TOOLS.filter((t: PdfTool) => t.category === category);
}

export function getToolsByTier(tier: string): PdfTool[] {
  return PDF_TOOLS.filter((t: PdfTool) => t.tier === tier);
}
