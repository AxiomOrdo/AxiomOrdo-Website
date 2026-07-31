import {
  ADMITTED_TOOL_SLUGS,
  type AdmittedToolSlug,
} from '@/governance/tool-limits';

export interface PdfTool {
  slug: AdmittedToolSlug;
  name: string;
  description: string;
  icon: string;
  category: 'Organize' | 'Edit' | 'Convert' | 'Optimize';
  clientSide: true;
  status: 'available' | 'beta';
  statusNote?: string;
}

export const PDF_TOOLS: readonly PdfTool[] = [
  { slug: 'merge', name: 'Merge PDFs', description: 'Combine 2–20 PDF files into one new document.', icon: 'Layers', category: 'Organize', clientSide: true, status: 'available' },
  { slug: 'split', name: 'Split PDF', description: 'Extract selected pages or split up to 200 pages into separate files.', icon: 'Scissors', category: 'Organize', clientSide: true, status: 'available' },
  { slug: 'compress', name: 'Optimize PDF', description: 'Rebuild PDF object streams without recompressing embedded images.', icon: 'Minimize2', category: 'Optimize', clientSide: true, status: 'beta', statusNote: 'Results depend on document structure and may not reduce file size.' },
  { slug: 'rotate', name: 'Rotate Pages', description: 'Rotate every page by 90°, 180°, or 270°.', icon: 'RotateCw', category: 'Organize', clientSide: true, status: 'available' },
  { slug: 'delete-pages', name: 'Delete Pages', description: 'Remove selected pages while leaving at least one output page.', icon: 'Trash2', category: 'Organize', clientSide: true, status: 'available' },
  { slug: 'watermark', name: 'Add Watermark', description: 'Apply printable Latin text to every page.', icon: 'Stamp', category: 'Edit', clientSide: true, status: 'available' },
  { slug: 'page-numbers', name: 'Add Page Numbers', description: 'Insert page numbers at one supported position on every page.', icon: 'Hash', category: 'Edit', clientSide: true, status: 'available' },
  { slug: 'flatten', name: 'Flatten Form Fields', description: 'Flatten only the supported, regression-tested AcroForm field types.', icon: 'PanelTopClose', category: 'Edit', clientSide: true, status: 'available' },
  { slug: 'images-to-pdf', name: 'Images to PDF', description: 'Create one PDF from up to 20 JPG or PNG images, without OCR.', icon: 'ImagePlus', category: 'Convert', clientSide: true, status: 'available' },
] as const;

if (
  PDF_TOOLS.length !== ADMITTED_TOOL_SLUGS.length ||
  PDF_TOOLS.some((tool, index) => tool.slug !== ADMITTED_TOOL_SLUGS[index])
) {
  throw new Error('PDF_TOOLS must match the governed admitted tool registry.');
}

export const TOOL_CATEGORIES = ['Organize', 'Edit', 'Convert', 'Optimize'] as const;

export function getToolBySlug(slug: string): PdfTool | undefined {
  return PDF_TOOLS.find((tool) => tool.slug === slug);
}

export function getToolsByCategory(category: string): PdfTool[] {
  return PDF_TOOLS.filter((tool) => tool.category === category);
}
