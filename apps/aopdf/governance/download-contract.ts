import { OperationError } from './operation-errors';

interface FileSystemWritableFileStream {
  write(data: Blob): Promise<void>;
  close(): Promise<void>;
}

interface FileSystemFileHandle {
  createWritable(): Promise<FileSystemWritableFileStream>;
}

interface SaveFilePickerOptions {
  suggestedName: string;
  types: Array<{
    description: string;
    accept: Record<string, string[]>;
  }>;
}

type WindowWithSavePicker = Window & {
  showSaveFilePicker?: (
    options: SaveFilePickerOptions,
  ) => Promise<FileSystemFileHandle>;
};

export interface DownloadResult {
  readonly delivery: 'native-save' | 'browser-download';
  readonly message: 'Saved' | 'Download started';
}

export async function deliverOutput(args: {
  data: ArrayBuffer | Uint8Array | Blob;
  filename: string;
  mimeType: 'application/pdf' | 'application/zip';
  windowObject?: WindowWithSavePicker;
  documentObject?: Document;
  urlObject?: Pick<typeof URL, 'createObjectURL' | 'revokeObjectURL'>;
}): Promise<DownloadResult> {
  const blob =
    args.data instanceof Blob
      ? args.data
      : new Blob(
          [
            args.data instanceof Uint8Array
              ? args.data.slice().buffer
              : args.data,
          ],
          { type: args.mimeType },
        );
  const targetWindow =
    args.windowObject ?? (window as unknown as WindowWithSavePicker);

  if (targetWindow.showSaveFilePicker) {
    try {
      const handle = await targetWindow.showSaveFilePicker({
        suggestedName: args.filename,
        types: [
          {
            description: args.mimeType === 'application/pdf' ? 'PDF document' : 'ZIP archive',
            accept: {
              [args.mimeType]: [
                args.mimeType === 'application/pdf' ? '.pdf' : '.zip',
              ],
            },
          },
        ],
      });
      const writable = await handle.createWritable();
      await writable.write(blob);
      await writable.close();
      return { delivery: 'native-save', message: 'Saved' };
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new OperationError('SAVE_CANCELLED');
      }
      throw new OperationError('DOWNLOAD_INITIATION_FAILED');
    }
  }

  const targetDocument = args.documentObject ?? document;
  const targetUrl = args.urlObject ?? URL;
  let objectUrl: string | undefined;
  try {
    objectUrl = targetUrl.createObjectURL(blob);
    const link = targetDocument.createElement('a');
    link.href = objectUrl;
    link.download = args.filename;
    targetDocument.body.appendChild(link);
    link.click();
    link.remove();
    return { delivery: 'browser-download', message: 'Download started' };
  } catch {
    throw new OperationError('DOWNLOAD_FALLBACK_FAILED');
  } finally {
    if (objectUrl) {
      const urlToRevoke = objectUrl;
      targetWindow.setTimeout(() => targetUrl.revokeObjectURL(urlToRevoke), 0);
    }
  }
}
