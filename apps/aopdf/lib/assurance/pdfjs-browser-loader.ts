import pdfModuleUrl from 'pdfjs-dist/build/pdf.mjs?aopdf-static-module';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.mjs?aopdf-static-module';

export async function loadBrowserPdfJs() {
  const pdfjs = await import(/* webpackIgnore: true */ pdfModuleUrl);
  pdfjs.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;
  return pdfjs;
}
