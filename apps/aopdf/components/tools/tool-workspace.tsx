'use client';

import { useState, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, FileText, Trash2, ChevronUp, ChevronDown, Play, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import type { PdfTool } from '@/lib/pdf-tools';
import * as LucideIcons from 'lucide-react';
import { appPath } from '@/lib/paths';
import { parsePageRanges } from '@/lib/pdf/page-ranges';

interface LoadedFile {
  file: File;
  name: string;
  size: string;
  pages: number;
  buffer: ArrayBuffer;
}

interface ToolWorkspaceProps {
  tool: PdfTool;
}

export default function ToolWorkspace({ tool }: ToolWorkspaceProps) {
  const { data: session } = useSession() || {};
  const [files, setFiles] = useState<LoadedFile[]>([]);
  const [processing, setProcessing] = useState(false);
  const [toast, setToast] = useState<{ msg: string; error: boolean } | null>(null);
  const [splitRange, setSplitRange] = useState('1-2');
  const [splitMode, setSplitMode] = useState<'range' | 'single'>('range');
  const [watermarkText, setWatermarkText] = useState('CONFIDENTIAL');
  const [rotation, setRotation] = useState(90);
  const [pageNumberPosition, setPageNumberPosition] = useState<'bottom-center' | 'bottom-right' | 'top-center'>('bottom-center');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const IconComponent = (LucideIcons as any)[tool?.icon] ?? FileText;

  const isFreeTool = tool.tier === 'free';
  const showToast = (msg: string, error = false) => {
    setToast({ msg, error });
    setTimeout(() => setToast(null), 4000);
  };

  const handleFiles = useCallback(async (fileList: FileList | null) => {
    if (!fileList) return;
    const pdfLib = await import('pdf-lib');
    const newFiles: LoadedFile[] = [];

    for (const file of Array.from(fileList)) {
      if (!file?.name?.endsWith('.pdf') && file?.type !== 'application/pdf') {
        // For images-to-pdf, accept image files
        if (
          tool.slug === 'images-to-pdf' &&
          (file.type === 'image/jpeg' || file.type === 'image/png')
        ) {
          const buffer = await file.arrayBuffer();
          newFiles.push({ file, name: file.name, size: `${(file.size / 1024 / 1024).toFixed(2)} MB`, pages: 1, buffer });
          continue;
        }
        showToast(`Skipped ${file?.name}: Not a valid file.`, true);
        continue;
      }
      if (file.size > 150 * 1024 * 1024) {
        showToast(`Skipped ${file?.name}: Exceeds 150MB limit.`, true);
        continue;
      }
      try {
        const buffer = await file.arrayBuffer();
        const pdfDoc = await pdfLib.PDFDocument.load(buffer, { ignoreEncryption: true });
        newFiles.push({
          file,
          name: file.name,
          size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
          pages: pdfDoc.getPageCount(),
          buffer,
        });
      } catch {
        showToast(`Could not parse ${file?.name}`, true);
      }
    }
    setFiles((prev: LoadedFile[]) => [...prev, ...newFiles]);
  }, [tool?.slug]);

  const moveFile = (index: number, direction: number) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= files.length) return;
    const updated = [...files];
    const temp = updated[index];
    updated[index] = updated[newIndex] as LoadedFile;
    updated[newIndex] = temp as LoadedFile;
    setFiles(updated);
  };

  const removeFile = (index: number) => {
    setFiles((prev: LoadedFile[]) => prev.filter((_: LoadedFile, i: number) => i !== index));
  };

  const downloadBlob = (data: Uint8Array | Blob, filename: string, mimeType = 'application/pdf') => {
    const blob =
      data instanceof Blob
        ? data
        : new Blob([Uint8Array.from(data).buffer], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const logUsage = async () => {
    if (session?.user) {
      try {
        await fetch(appPath('/api/usage'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tool: tool?.slug, fileSize: files?.[0]?.file?.size ?? 0 }),
        });
      } catch {}
    }
  };

  const runProcess = async () => {
    if (files.length === 0) return;
    setProcessing(true);
    try {
      const operations = await import('@/lib/pdf/operations');

      switch (tool?.slug) {
        case 'merge': {
          const bytes = await operations.mergePdfs(files.map((file) => file.buffer));
          downloadBlob(bytes, 'axiomordopdf-merged.pdf');
          showToast('PDFs merged successfully!');
          break;
        }
        case 'split': {
          const target = files[0];
          if (!target) break;
          if (splitMode === 'single') {
            const JSZip = (await import('jszip')).default;
            const zip = new JSZip();
            const baseName = target.name.replace('.pdf', '');
            const pages = await operations.splitEveryPage(target.buffer);
            pages.forEach((bytes, index) => {
              zip.file(`${baseName}_page_${index + 1}.pdf`, bytes);
            });
            const zipBlob = await zip.generateAsync({ type: 'blob' });
            downloadBlob(zipBlob, `${baseName}_all_pages.zip`, 'application/zip');
            showToast(`Split ${target.pages} pages into ZIP archive!`);
          } else {
            const indices = parsePageRanges(splitRange, target.pages);
            const bytes = await operations.extractPages(target.buffer, indices);
            downloadBlob(bytes, `${target.name.replace('.pdf', '')}_extracted.pdf`);
            showToast('Extracted pages downloaded!');
          }
          break;
        }
        case 'compress': {
          const target = files[0];
          if (!target) break;
          const bytes = await operations.optimizePdf(target.buffer);
          const savings = ((1 - bytes.length / target.file.size) * 100).toFixed(1);
          downloadBlob(bytes, `${target.name.replace('.pdf', '')}_compressed.pdf`);
          showToast(
            bytes.length < target.file.size
              ? `Optimized. File size reduced by ${savings}%.`
              : 'Optimization completed, but this document did not become smaller.',
          );
          break;
        }
        case 'rotate': {
          const target = files[0];
          if (!target) break;
          const bytes = await operations.rotateAllPages(
            target.buffer,
            rotation as 90 | 180 | 270,
          );
          downloadBlob(bytes, `${target.name.replace('.pdf', '')}_rotated.pdf`);
          showToast('Pages rotated!');
          break;
        }
        case 'delete-pages': {
          const target = files[0];
          if (!target) break;
          const indices = parsePageRanges(splitRange, target.pages);
          const bytes = await operations.deletePages(target.buffer, indices);
          downloadBlob(bytes, `${target.name.replace('.pdf', '')}_pages_removed.pdf`);
          showToast(`Deleted ${indices.length} page(s)!`);
          break;
        }
        case 'watermark': {
          const target = files[0];
          if (!target) break;
          const bytes = await operations.addTextWatermark(
            target.buffer,
            watermarkText,
          );
          downloadBlob(bytes, `${target.name.replace('.pdf', '')}_watermarked.pdf`);
          showToast('Watermark applied!');
          break;
        }
        case 'page-numbers': {
          const target = files[0];
          if (!target) break;
          const bytes = await operations.addPageNumbers(
            target.buffer,
            pageNumberPosition,
          );
          downloadBlob(bytes, `${target.name.replace('.pdf', '')}_numbered.pdf`);
          showToast('Page numbers added!');
          break;
        }
        case 'flatten': {
          const target = files[0];
          if (!target) break;
          const bytes = await operations.flattenFormFields(target.buffer);
          downloadBlob(bytes, `${target.name.replace('.pdf', '')}_flattened.pdf`);
          showToast('Supported form fields flattened.');
          break;
        }
        case 'images-to-pdf': {
          const images: Array<{
            bytes: ArrayBuffer;
            type: 'image/jpeg' | 'image/png';
          }> = [];
          files.forEach((file) => {
            const name = file.name.toLowerCase();
            if (name.endsWith('.jpg') || name.endsWith('.jpeg')) {
              images.push({ bytes: file.buffer, type: 'image/jpeg' });
            }
            if (name.endsWith('.png')) {
              images.push({ bytes: file.buffer, type: 'image/png' });
            }
          });
          const bytes = await operations.imagesToPdf(images);
          downloadBlob(bytes, 'images-to-pdf.pdf');
          showToast('Images converted to PDF!');
          break;
        }
        default: {
          showToast('This operation is not available.', true);
        }
      }
      await logUsage();
    } catch (error: unknown) {
      showToast(
        error instanceof Error ? error.message : 'Processing failed.',
        true,
      );
    } finally {
      setProcessing(false);
    }
  };

  const acceptTypes = tool.slug === 'images-to-pdf' ? '.jpg,.jpeg,.png' : '.pdf';
  const needsMultiple = tool.slug === 'merge' || tool.slug === 'images-to-pdf';

  return (
    <div className="space-y-6">
      {/* Tool Header */}
      <div className="text-center mb-8">
        <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <IconComponent className="w-7 h-7 text-white" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">{tool?.name}</h1>
        <p className="text-zinc-400 text-sm max-w-lg mx-auto">{tool?.description}</p>
        {!isFreeTool && (
          <span className={`inline-block mt-3 px-3 py-1 text-xs font-semibold rounded-full ${
            tool?.tier === 'pro' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
          }`}>
            {tool?.tier === 'pro' ? 'Pro' : 'Enterprise'} Feature
          </span>
        )}
      </div>

      {/* Drop Zone */}
      {files.length === 0 ? (
        <div
          className="relative group border-2 border-dashed border-zinc-800 hover:border-indigo-500/50 bg-zinc-900/40 hover:bg-zinc-900/80 rounded-2xl p-10 text-center transition-all duration-300 cursor-pointer glow"
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e: any) => e.preventDefault()}
          onDrop={(e: any) => { e.preventDefault(); handleFiles(e.dataTransfer?.files); }}
        >
          <input ref={fileInputRef} type="file" className="hidden" multiple={needsMultiple} accept={acceptTypes} onChange={(e: any) => handleFiles(e.target?.files)} />
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-zinc-800/80 border border-zinc-700/50 flex items-center justify-center group-hover:scale-110 group-hover:border-indigo-500/40 transition-all duration-300">
            <UploadCloud className="w-8 h-8 text-indigo-400" />
          </div>
          <h3 className="text-lg font-semibold text-zinc-200 mb-1">
            Drop files here, or <span className="text-indigo-400 underline underline-offset-4">browse</span>
          </h3>
          <p className="text-xs text-zinc-500">{tool?.slug === 'images-to-pdf' ? 'Select image files (JPG, PNG)' : 'Select PDF files (Max 150MB per file)'}</p>
        </div>
      ) : (
        <>
          {/* File List */}
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-400" /> Files ({files.length})
              </h2>
              <div className="flex items-center gap-3">
                <button onClick={() => fileInputRef.current?.click()} className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs rounded-lg flex items-center gap-1.5 transition-colors border border-zinc-700">
                  + Add Files
                </button>
                <input ref={fileInputRef} type="file" className="hidden" multiple accept={acceptTypes} onChange={(e: any) => handleFiles(e.target?.files)} />
                <button onClick={() => setFiles([])} className="text-xs text-zinc-500 hover:text-rose-400 transition-colors">Clear All</button>
              </div>
            </div>
            <div className="space-y-2.5">
              {files.map((f: LoadedFile, idx: number) => (
                <div key={`${f.name}-${idx}`} className="flex items-center justify-between p-3 rounded-xl bg-zinc-950 border border-zinc-800/80">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="flex flex-col gap-0.5 text-zinc-600">
                      <button onClick={() => moveFile(idx, -1)} disabled={idx === 0} className={idx === 0 ? 'opacity-20' : 'hover:text-indigo-400'}><ChevronUp className="w-3.5 h-3.5" /></button>
                      <button onClick={() => moveFile(idx, 1)} disabled={idx === files.length - 1} className={idx === files.length - 1 ? 'opacity-20' : 'hover:text-indigo-400'}><ChevronDown className="w-3.5 h-3.5" /></button>
                    </div>
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4 text-indigo-400" />
                    </div>
                    <div className="truncate">
                      <p className="text-sm font-medium text-zinc-200 truncate">{f.name}</p>
                      <p className="text-[11px] text-zinc-500">{f.pages} Pages • {f.size}</p>
                    </div>
                  </div>
                  <button onClick={() => removeFile(idx)} className="p-1.5 text-zinc-500 hover:text-rose-400 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Tool-specific Options */}
          {(tool?.slug === 'split' || tool?.slug === 'delete-pages') && (
            <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-6">
              {tool?.slug === 'split' && (
                <div className="flex items-center gap-4 text-xs font-semibold text-zinc-300 mb-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="splitMode" checked={splitMode === 'range'} onChange={() => setSplitMode('range')} className="accent-indigo-500" />
                    Extract Range
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="splitMode" checked={splitMode === 'single'} onChange={() => setSplitMode('single')} className="accent-indigo-500" />
                    Split Every Page (ZIP)
                  </label>
                </div>
              )}
              {(splitMode === 'range' || tool?.slug === 'delete-pages') && (
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                    {tool?.slug === 'delete-pages' ? 'Pages to delete' : 'Page range'} (e.g. 1-3, 5):
                  </label>
                  <input
                    type="text"
                    value={splitRange}
                    onChange={(e: any) => setSplitRange(e.target?.value ?? '')}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-indigo-500"
                  />
                  <p className="text-[11px] text-zinc-500 mt-1">Total pages: {files?.[0]?.pages ?? 0}</p>
                </div>
              )}
            </div>
          )}

          {tool?.slug === 'watermark' && (
            <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-6">
              <label className="block text-xs font-medium text-zinc-400 mb-2">Watermark Text:</label>
              <input
                type="text"
                value={watermarkText}
                onChange={(e: any) => setWatermarkText(e.target?.value ?? '')}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
          )}

          {tool?.slug === 'rotate' && (
            <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-6">
              <label className="block text-xs font-medium text-zinc-400 mb-2">Rotation Angle:</label>
              <div className="flex gap-3">
                {[90, 180, 270].map((deg: number) => (
                  <button
                    key={deg}
                    onClick={() => setRotation(deg)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      rotation === deg ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'bg-zinc-900 text-zinc-400 border border-zinc-800'
                    }`}
                  >
                    {deg}°
                  </button>
                ))}
              </div>
            </div>
          )}

          {tool?.slug === 'page-numbers' && (
            <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-6">
              <label className="block text-xs font-medium text-zinc-400 mb-2">Position:</label>
              <div className="flex gap-3">
                {[{ v: 'bottom-center', l: 'Bottom Center' }, { v: 'bottom-right', l: 'Bottom Right' }, { v: 'top-center', l: 'Top Center' }].map((opt: any) => (
                  <button
                    key={opt.v}
                    onClick={() => setPageNumberPosition(opt.v)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      pageNumberPosition === opt.v ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'bg-zinc-900 text-zinc-400 border border-zinc-800'
                    }`}
                  >
                    {opt.l}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Process Button */}
          <button
            onClick={runProcess}
            disabled={processing || files.length === 0}
            className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.99]"
          >
            {processing ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
            ) : (
              <><Play className="w-4 h-4 fill-current" /> Process & Download</>
            )}
          </button>
        </>
      )}

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className={`fixed bottom-6 right-6 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-semibold z-50 ${
              toast.error
                ? 'bg-zinc-900 border border-rose-500/50 text-rose-300'
                : 'bg-zinc-900 border border-emerald-500/50 text-emerald-300'
            }`}
          >
            {toast.error ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
