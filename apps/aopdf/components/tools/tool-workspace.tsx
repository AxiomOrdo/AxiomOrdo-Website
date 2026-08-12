'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ComponentType,
} from 'react';
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  FileText,
  Loader2,
  Play,
  ShieldCheck,
  Square,
  Trash2,
  UploadCloud,
} from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import type { PdfTool } from '@/lib/pdf-tools';
import { parsePageRanges } from '@/lib/pdf/page-ranges';
import {
  admitInputs,
  type AdmittedInput,
  type AdmissionInput,
} from '@/governance/admission';
import { deliverOutput } from '@/governance/download-contract';
import {
  ERROR_DEFINITIONS,
  OperationError,
  toOperationError,
  type OperationErrorCode,
} from '@/governance/operation-errors';
import type {
  OperationState,
  OperationSummary,
} from '@/governance/operation-states';
import { canonicalOutputFilename } from '@/governance/filename-contract';
import {
  createOperationFinishedEvent,
  createToolSelectedEvent,
  transmitTelemetry,
} from '@/governance/telemetry-contract';
import {
  isAdmittedToolSlug,
  TOOL_LIMITS,
  type AdmittedToolSlug,
} from '@/governance/tool-limits';
import { startWorkerOperation, type ActiveWorkerOperation } from '@/workers/client';
import type { WorkerOptions, WorkerRequest } from '@/workers/protocol';
import { parseRedactionRectangles } from '@/lib/assurance/redaction-selection';
import {
  clearWorkspaceHistory,
  readWorkspaceHistory,
  writeWorkspaceHistory,
} from '@/lib/assurance/workspace-history';
import {
  isAssuranceTool,
  type RedactionRectangle,
  type WorkspaceHistoryEntry,
} from '@/lib/assurance/types';

interface LoadedFile extends AdmittedInput {
  readonly file: File;
  readonly displaySize: string;
}

interface ToolWorkspaceProps {
  tool: PdfTool;
}

async function readImagePixels(file: File): Promise<number> {
  const bitmap = await createImageBitmap(file);
  try {
    return bitmap.width * bitmap.height;
  } finally {
    bitmap.close();
  }
}

function formatMebibytes(bytes: number): string {
  return `${(bytes / 1_048_576).toFixed(1)} MiB`;
}

function operationOptions(args: {
  tool: AdmittedToolSlug;
  splitMode: 'range' | 'single';
  indices: number[];
  rotation: number;
  watermarkText: string;
  pageNumberPosition: 'bottom-center' | 'bottom-right' | 'top-center';
  redactionRectangles: readonly RedactionRectangle[];
}): WorkerOptions {
  switch (args.tool) {
    case 'split':
      return {
        kind: 'split',
        everyPage: args.splitMode === 'single',
        ...(args.splitMode === 'range' ? { indices: args.indices } : {}),
      };
    case 'rotate':
      return { kind: 'rotate', angle: args.rotation as 90 | 180 | 270 };
    case 'delete-pages':
      return { kind: 'delete-pages', indices: args.indices };
    case 'watermark':
      return { kind: 'watermark', text: args.watermarkText };
    case 'page-numbers':
      return { kind: 'page-numbers', position: args.pageNumberPosition };
    case 'redact':
      return { kind: 'redact', rectangles: args.redactionRectangles };
    default:
      return { kind: 'none' };
  }
}

export default function ToolWorkspace({ tool }: ToolWorkspaceProps) {
  if (!isAdmittedToolSlug(tool.slug)) {
    throw new Error('ToolWorkspace requires an admitted tool.');
  }
  const toolSlug = tool.slug;
  const limits = TOOL_LIMITS[toolSlug];
  const IconComponent =
    (LucideIcons as unknown as Record<string, ComponentType<{ className?: string }>>)[
      tool.icon
    ] ?? FileText;

  const [files, setFiles] = useState<LoadedFile[]>([]);
  const [operationState, setOperationState] = useState<OperationState>('idle');
  const [errorCode, setErrorCode] = useState<OperationErrorCode | null>(null);
  const [summary, setSummary] = useState<OperationSummary | null>(null);
  const [statusMessage, setStatusMessage] = useState('Select files to begin.');
  const [splitRange, setSplitRange] = useState('1-2');
  const [splitMode, setSplitMode] = useState<'range' | 'single'>('range');
  const [watermarkText, setWatermarkText] = useState('CONFIDENTIAL');
  const [rotation, setRotation] = useState(90);
  const [redactionSelection, setRedactionSelection] = useState('1,20,20,20,10');
  const [history, setHistory] = useState<WorkspaceHistoryEntry[]>([]);
  const [pageNumberPosition, setPageNumberPosition] = useState<
    'bottom-center' | 'bottom-right' | 'top-center'
  >('bottom-center');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const activeOperationRef = useRef<ActiveWorkerOperation | null>(null);

  useEffect(() => {
    transmitTelemetry(createToolSelectedEvent(toolSlug));
    const historyTimer = window.setTimeout(() => {
      setHistory(readWorkspaceHistory(window.sessionStorage));
    }, 0);
    return () => {
      window.clearTimeout(historyTimer);
      activeOperationRef.current?.cancel();
      activeOperationRef.current = null;
    };
  }, [toolSlug]);

  const reportFailure = useCallback(
    (error: unknown, startedAt?: number) => {
      const operationError = toOperationError(error);
      const cancelled =
        operationError.code === 'OPERATION_CANCELLED' ||
        operationError.code === 'SAVE_CANCELLED';
      setFiles([]);
      setErrorCode(operationError.code);
      setOperationState(cancelled ? 'cancelled' : 'failed');
      setStatusMessage(ERROR_DEFINITIONS[operationError.code].message);
      if (startedAt !== undefined) {
        transmitTelemetry(
          createOperationFinishedEvent({
            tool: toolSlug,
            outcome: cancelled ? 'cancelled' : 'failure',
            durationMs: performance.now() - startedAt,
            errorCode: operationError.code,
          }),
        );
      }
    },
    [toolSlug],
  );

  const handleFiles = useCallback(
    async (fileList: FileList | null) => {
      if (!fileList?.length) return;
      setOperationState('validating');
      setErrorCode(null);
      setSummary(null);
      setStatusMessage('Validating files against the tool limits.');

      try {
        const candidates = [...files];
        for (const file of Array.from(fileList)) {
          const bytes = await file.arrayBuffer();
          const imagePixels =
            toolSlug === 'images-to-pdf'
              ? await readImagePixels(file).catch(() => {
                  throw new OperationError('FILE_TYPE_UNSUPPORTED');
                })
              : undefined;
          const input: AdmissionInput = {
            name: file.name,
            mimeType: file.type,
            size: file.size,
            bytes,
            ...(imagePixels !== undefined ? { imagePixels } : {}),
          };
          candidates.push({
            ...input,
            file,
            pageCount: toolSlug === 'images-to-pdf' ? 1 : 0,
            displaySize: formatMebibytes(file.size),
          });
        }

        const admitted = await admitInputs({
          tool: toolSlug,
          inputs: candidates,
          splitEveryPage: toolSlug === 'split' && splitMode === 'single',
        });
        const loaded = admitted.inputs.map((input, index) => ({
          ...input,
          file: candidates[index]?.file as File,
          displaySize: formatMebibytes(input.size),
        }));
        setFiles(loaded);
        setOperationState('ready');
        setStatusMessage(
          `${loaded.length} file${loaded.length === 1 ? '' : 's'} ready. Estimated working memory: ${formatMebibytes(admitted.estimatedWorkingBytes)}.`,
        );
      } catch (error) {
        reportFailure(error);
      } finally {
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    },
    [files, reportFailure, splitMode, toolSlug],
  );

  const moveFile = (index: number, direction: number) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= files.length) return;
    setFiles((current) => {
      const updated = [...current];
      [updated[index], updated[newIndex]] = [
        updated[newIndex] as LoadedFile,
        updated[index] as LoadedFile,
      ];
      return updated;
    });
  };

  const removeFile = (index: number) => {
    setFiles((current) => current.filter((_, candidate) => candidate !== index));
    setSummary(null);
    setErrorCode(null);
    setOperationState('idle');
    setStatusMessage('File removed. Validate the remaining selection before processing.');
  };

  const cancelOperation = () => {
    activeOperationRef.current?.cancel();
    activeOperationRef.current = null;
  };

  const runProcess = async () => {
    if (files.length === 0 || activeOperationRef.current) return;
    const startedAt = performance.now();
    setErrorCode(null);
    setSummary(null);
    setOperationState('validating');
    setStatusMessage('Running final admission checks.');

    try {
      const target = files[0];
      let indices: number[] = [];
      try {
        indices =
          (toolSlug === 'split' && splitMode === 'range') ||
          toolSlug === 'delete-pages'
            ? parsePageRanges(splitRange, target?.pageCount ?? 0)
            : [];
      } catch {
        throw new OperationError('SELECTION_INVALID');
      }
      const admission = await admitInputs({
        tool: toolSlug,
        inputs: files,
        splitEveryPage: toolSlug === 'split' && splitMode === 'single',
        ...(indices.length ? { selectedPageCount: indices.length } : {}),
      });
      const redactionRectangles =
        toolSlug === 'redact'
          ? parseRedactionRectangles(redactionSelection, admission.aggregatePages)
          : [];
      if (
        toolSlug === 'watermark' &&
        (!watermarkText.trim() ||
          watermarkText.length > (limits.maxWatermarkCharacters ?? 0) ||
          !/^[\x20-\x7e\u00a0-\u00ff]+$/.test(watermarkText))
      ) {
        throw new OperationError('WATERMARK_TEXT_INVALID');
      }

      const operationId = crypto.randomUUID();
      const createdAt = new Date().toISOString();
      const inputs = admission.inputs.map((input) => ({
        bytes: input.bytes.slice(0),
        mimeType: input.mimeType as
          | 'application/pdf'
          | 'image/jpeg'
          | 'image/png',
      }));
      const options = operationOptions({
        tool: toolSlug,
        splitMode,
        indices,
        rotation,
        watermarkText,
        pageNumberPosition,
        redactionRectangles,
      });
      const request: WorkerRequest = {
        type: 'execute',
        operationId,
        createdAt,
        tool: toolSlug,
        inputs,
        sourcePageCount: admission.aggregatePages,
        options,
      };

      setOperationState('processing');
      setStatusMessage('Processing locally in this browser.');
      const result = isAssuranceTool(toolSlug)
        ? await import('@/lib/assurance/execute').then(({ executeAssuranceOperation }) =>
            executeAssuranceOperation({
              tool: toolSlug,
              createdAt,
              sources: inputs.map((input) => input.bytes),
              sourcePageCount: admission.aggregatePages,
              options,
            }),
          )
        : await (async () => {
            const activeOperation = startWorkerOperation(request);
            activeOperationRef.current = activeOperation;
            const workerResult = await activeOperation.result;
            if (activeOperationRef.current?.operationId !== operationId) {
              throw new OperationError('OPERATION_CANCELLED');
            }
            activeOperationRef.current = null;
            return workerResult;
          })();

      const filename = canonicalOutputFilename({
        tool: toolSlug,
        sourceName: target?.name,
        fileCount: files.length,
        outputPageCount: result.outputPageCount,
        canonicalRange: indices.map((index) => index + 1).join('-'),
        splitEveryPage: toolSlug === 'split' && splitMode === 'single',
      });
      setOperationState('saving');
      setStatusMessage('Output generation completed locally. Choose where to save it.');
      const delivery = await deliverOutput({
        data: result.output,
        filename,
        mimeType: result.mimeType,
      });
      const durationMs = Math.round(performance.now() - startedAt);
      setSummary({
        tool: toolSlug,
        filesProcessed: files.length,
        sourcePageCount: admission.aggregatePages,
        outputPageCount: result.outputPageCount,
        durationMs,
        delivery: delivery.delivery,
      });
      setHistory((current) =>
        writeWorkspaceHistory(window.sessionStorage, [
          {
            operation: toolSlug,
            completedAt: createdAt,
            sourceCount: files.length,
            assurance: toolSlug === 'redact' ? 'verified-bounded' : 'generated',
          },
          ...current,
        ]),
      );
      setFiles([]);
      setOperationState('success');
      setStatusMessage(
        delivery.delivery === 'native-save'
          ? 'Saved.'
          : 'Download started. Your browser is handling the download.',
      );
      transmitTelemetry(
        createOperationFinishedEvent({
          tool: toolSlug,
          outcome: 'success',
          durationMs,
        }),
      );
    } catch (error) {
      activeOperationRef.current = null;
      reportFailure(error, startedAt);
    }
  };

  const acceptTypes =
    toolSlug === 'images-to-pdf' ? '.jpg,.jpeg,.png' : '.pdf';
  const canAddMore = files.length < limits.maxFiles;
  const busy = ['validating', 'processing', 'saving', 'downloading'].includes(
    operationState,
  );

  return (
    <div className="space-y-6">
      <header className="text-center mb-8">
        <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <IconComponent className="w-7 h-7 text-white" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">
          {tool.name}
        </h1>
        <p className="text-zinc-400 text-sm max-w-lg mx-auto">
          {tool.description}
        </p>
      </header>

      <section className="rounded-2xl border border-indigo-500/20 bg-indigo-500/5 p-5">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-indigo-400" />
          <div>
            <h2 className="font-semibold text-zinc-200">Local processing boundary</h2>
            <p className="mt-1 text-sm leading-6 text-zinc-400">
              Current workflows process document bytes in this browser. AO-PDF
              records only the selected tool, outcome, duration, and coarse
              browser/runtime information—never filenames or document-derived data.
            </p>
            <p className="mt-2 text-xs leading-5 text-zinc-500">
              Selected source bytes remain separate and unchanged. Generated outputs
              are new files. Session history stores operation metadata only in this
              browser tab and never stores source filenames, document text, or hashes.
            </p>
            <p className="mt-2 text-xs leading-5 text-amber-200/80">
              This release supports Chromium on desktop and mobile. Firefox and
              Safari/WebKit are unverified and unsupported.
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
        <h2 className="text-sm font-semibold text-zinc-200">Operating limits</h2>
        <p className="mt-2 text-sm text-zinc-400">
          {limits.minFiles}–{limits.maxFiles} file{limits.maxFiles === 1 ? '' : 's'};
          {' '}100 MiB per file; 250 MiB aggregate; {limits.maxAggregatePages} pages;
          {' '}1,024 MiB estimated working-memory limit; 120-second timeout.
        </p>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-xs leading-5 text-zinc-500">
          {limits.limitations.map((limitation) => (
            <li key={limitation}>{limitation}</li>
          ))}
        </ul>
      </section>

      {files.length === 0 ? (
        <button
          type="button"
          className="relative w-full min-h-52 border-2 border-dashed border-zinc-800 hover:border-indigo-500/50 bg-zinc-900/40 hover:bg-zinc-900/80 rounded-2xl p-10 text-center transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => {
            event.preventDefault();
            void handleFiles(event.dataTransfer.files);
          }}
        >
          <UploadCloud className="mx-auto h-10 w-10 text-indigo-400" />
          <span className="mt-4 block text-lg font-semibold text-zinc-200">
            Drop files here, or browse
          </span>
          <span className="mt-1 block text-xs text-zinc-500">
            {toolSlug === 'images-to-pdf'
              ? 'JPG or PNG; image limits are checked before processing'
              : 'PDF; encrypted documents are rejected'}
          </span>
        </button>
      ) : (
        <section className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4 sm:p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-300">
              Files ({files.length})
            </h2>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={!canAddMore || busy}
                onClick={() => fileInputRef.current?.click()}
                className="min-h-11 rounded-lg border border-zinc-700 bg-zinc-800 px-4 text-sm text-zinc-200 disabled:opacity-40"
              >
                Add files
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => {
                  setFiles([]);
                  setSummary(null);
                  setOperationState('idle');
                  setStatusMessage('Select files to begin.');
                }}
                className="min-h-11 rounded-lg px-4 text-sm text-zinc-400 hover:text-rose-300 disabled:opacity-40"
              >
                Clear all
              </button>
            </div>
          </div>
          <div className="space-y-2">
            {files.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="flex items-center justify-between gap-3 rounded-xl border border-zinc-800 bg-zinc-950 p-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-zinc-200">{file.name}</p>
                  <p className="text-xs text-zinc-500">
                    {file.pageCount} page{file.pageCount === 1 ? '' : 's'} · {file.displaySize}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  {limits.maxFiles > 1 ? (
                    <>
                      <button
                        type="button"
                        aria-label={`Move ${file.name} up`}
                        disabled={index === 0 || busy}
                        onClick={() => moveFile(index, -1)}
                        className="min-h-11 min-w-11 rounded-lg p-3 text-zinc-500 hover:text-indigo-300 disabled:opacity-20"
                      >
                        <ChevronUp className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        aria-label={`Move ${file.name} down`}
                        disabled={index === files.length - 1 || busy}
                        onClick={() => moveFile(index, 1)}
                        className="min-h-11 min-w-11 rounded-lg p-3 text-zinc-500 hover:text-indigo-300 disabled:opacity-20"
                      >
                        <ChevronDown className="h-4 w-4" />
                      </button>
                    </>
                  ) : null}
                  <button
                    type="button"
                    aria-label={`Remove ${file.name}`}
                    disabled={busy}
                    onClick={() => removeFile(index)}
                    className="min-h-11 min-w-11 rounded-lg p-3 text-zinc-500 hover:text-rose-300 disabled:opacity-20"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <input
        ref={fileInputRef}
        type="file"
        className="sr-only"
        multiple={limits.maxFiles > 1}
        accept={acceptTypes}
        onChange={(event) => void handleFiles(event.target.files)}
      />

      {files.length > 0 && (toolSlug === 'split' || toolSlug === 'delete-pages') ? (
        <section className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
          {toolSlug === 'split' ? (
            <div className="mb-4 flex flex-wrap gap-4">
              <label className="flex min-h-11 items-center gap-2 text-sm text-zinc-300">
                <input
                  type="radio"
                  name="split-mode"
                  checked={splitMode === 'range'}
                  onChange={() => setSplitMode('range')}
                />
                Extract pages
              </label>
              <label className="flex min-h-11 items-center gap-2 text-sm text-zinc-300">
                <input
                  type="radio"
                  name="split-mode"
                  checked={splitMode === 'single'}
                  onChange={() => setSplitMode('single')}
                />
                Split every page
              </label>
            </div>
          ) : null}
          {splitMode === 'range' || toolSlug === 'delete-pages' ? (
            <label className="block text-sm text-zinc-300">
              {toolSlug === 'delete-pages' ? 'Pages to delete' : 'Pages to extract'}
              <input
                value={splitRange}
                onChange={(event) => setSplitRange(event.target.value)}
                className="mt-2 min-h-11 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 text-zinc-100"
                placeholder="1-3, 5"
              />
            </label>
          ) : null}
        </section>
      ) : null}

      {files.length > 0 && toolSlug === 'watermark' ? (
        <label className="block rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 text-sm text-zinc-300">
          Watermark text
          <input
            value={watermarkText}
            maxLength={limits.maxWatermarkCharacters}
            onChange={(event) => setWatermarkText(event.target.value)}
            className="mt-2 min-h-11 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 text-zinc-100"
          />
        </label>
      ) : null}

      {files.length > 0 && toolSlug === 'rotate' ? (
        <fieldset className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
          <legend className="text-sm text-zinc-300">Rotation angle</legend>
          <div className="mt-3 flex flex-wrap gap-3">
            {[90, 180, 270].map((angle) => (
              <button
                type="button"
                key={angle}
                onClick={() => setRotation(angle)}
                className={`min-h-11 rounded-lg border px-5 text-sm ${
                  rotation === angle
                    ? 'border-indigo-500 bg-indigo-500/20 text-indigo-200'
                    : 'border-zinc-700 text-zinc-400'
                }`}
              >
                {angle}°
              </button>
            ))}
          </div>
        </fieldset>
      ) : null}

      {files.length > 0 && toolSlug === 'page-numbers' ? (
        <fieldset className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
          <legend className="text-sm text-zinc-300">Page-number position</legend>
          <div className="mt-3 flex flex-wrap gap-3">
            {[
              ['bottom-center', 'Bottom center'],
              ['bottom-right', 'Bottom right'],
              ['top-center', 'Top center'],
            ].map(([value, label]) => (
              <button
                type="button"
                key={value}
                onClick={() =>
                  setPageNumberPosition(
                    value as 'bottom-center' | 'bottom-right' | 'top-center',
                  )
                }
                className={`min-h-11 rounded-lg border px-4 text-sm ${
                  pageNumberPosition === value
                    ? 'border-indigo-500 bg-indigo-500/20 text-indigo-200'
                    : 'border-zinc-700 text-zinc-400'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </fieldset>
      ) : null}

      {files.length > 0 && toolSlug === 'redact' ? (
        <section className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-5">
          <h2 className="text-sm font-semibold text-amber-200">Redaction rectangles</h2>
          <p className="mt-2 text-xs leading-5 text-zinc-400">
            Enter one rectangle per line as page, x%, y%, width%, height%. Coordinates
            start at the visible top-left. The supported output is rebuilt as image-only
            pages; this is not a visual overlay.
          </p>
          <label className="mt-3 block text-sm text-zinc-300">
            Rectangle list
            <textarea
              aria-label="Redaction rectangles"
              value={redactionSelection}
              onChange={(event) => setRedactionSelection(event.target.value)}
              rows={4}
              className="mt-2 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-3 font-mono text-sm text-zinc-100"
            />
          </label>
          <p className="mt-3 text-xs leading-5 text-amber-200/80">
            AO-PDF rejects forms, annotations, attachments, JavaScript, incremental
            revisions, encryption, and malformed structures for this capability.
          </p>
          <p className="mt-2 text-xs leading-5 text-amber-200/80">
            Raster reconstruction does not preserve selectable text, accessibility,
            links, signatures, forms, attachments, metadata, or original document
            structures. Bounded verification establishes tested recovery resistance
            only, not universal irrecoverability. You are responsible for selecting
            rectangles that cover every sensitive visible pixel.
          </p>
        </section>
      ) : null}

      {files.length > 0 ? (
        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => void runProcess()}
            disabled={busy}
            className="min-h-12 flex-1 rounded-xl bg-indigo-600 px-6 font-semibold text-white shadow-lg shadow-indigo-600/25 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none" />
                {operationState === 'validating' ? 'Validating…' : 'Processing…'}
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <Play className="h-4 w-4" /> Process locally
              </span>
            )}
          </button>
          {operationState === 'processing' ? (
            <button
              type="button"
              onClick={cancelOperation}
              className="min-h-12 rounded-xl border border-rose-500/40 px-6 font-semibold text-rose-300"
            >
              <span className="flex items-center justify-center gap-2">
                <Square className="h-4 w-4" /> Cancel
              </span>
            </button>
          ) : null}
        </div>
      ) : null}

      <div
        aria-live="polite"
        aria-atomic="true"
        className={`rounded-xl border p-4 text-sm ${
          errorCode
            ? 'border-rose-500/30 bg-rose-500/5 text-rose-200'
            : operationState === 'success'
              ? 'border-emerald-500/30 bg-emerald-500/5 text-emerald-200'
              : 'border-zinc-800 bg-zinc-900/40 text-zinc-400'
        }`}
      >
        <div className="flex items-start gap-2">
          {errorCode ? (
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          ) : operationState === 'success' ? (
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          ) : null}
          <div>
            <p>{statusMessage}</p>
            {errorCode ? (
              <p className="mt-1 text-xs text-zinc-400">
                {ERROR_DEFINITIONS[errorCode].recovery} ({errorCode})
              </p>
            ) : null}
          </div>
        </div>
      </div>

      {summary ? (
        <section className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5">
          <h2 className="font-semibold text-emerald-200">Local processing summary</h2>
          <dl className="mt-4 grid grid-cols-2 gap-4 text-sm sm:grid-cols-5">
            <div><dt className="text-zinc-500">Operation</dt><dd>{tool.name}</dd></div>
            <div><dt className="text-zinc-500">Files</dt><dd>{summary.filesProcessed}</dd></div>
            <div><dt className="text-zinc-500">Source pages</dt><dd>{summary.sourcePageCount}</dd></div>
            <div><dt className="text-zinc-500">Output pages</dt><dd>{summary.outputPageCount}</dd></div>
            <div><dt className="text-zinc-500">Duration</dt><dd>{summary.durationMs} ms</dd></div>
          </dl>
          <p className="mt-4 text-xs text-zinc-500">
            This summary remains in this page and is not included in telemetry.
          </p>
        </section>
      ) : null}

      <section className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="font-semibold text-zinc-200">Session-local workspace history</h2>
            <p className="mt-1 text-xs text-zinc-500">
              Metadata only; cleared when this browser tab session ends.
            </p>
          </div>
          {history.length ? (
            <button
              type="button"
              onClick={() => {
                clearWorkspaceHistory(window.sessionStorage);
                setHistory([]);
              }}
              className="min-h-11 rounded-lg border border-zinc-700 px-3 text-xs text-zinc-300"
            >
              Clear history
            </button>
          ) : null}
        </div>
        {history.length ? (
          <ol className="mt-4 space-y-2 text-xs text-zinc-400">
            {history.map((entry, index) => (
              <li key={`${entry.completedAt}-${entry.operation}-${index}`} className="rounded-lg border border-zinc-800 p-3">
                <span className="font-medium text-zinc-200">{entry.operation}</span>
                {' · '}{entry.sourceCount} source{entry.sourceCount === 1 ? '' : 's'}
                {' · '}{entry.assurance === 'verified-bounded' ? 'bounded verification passed' : 'output generated'}
              </li>
            ))}
          </ol>
        ) : (
          <p className="mt-4 text-xs text-zinc-500">No completed operations in this tab session.</p>
        )}
      </section>
    </div>
  );
}
