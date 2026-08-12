/// <reference lib="webworker" />

import JSZip from 'jszip';
import {
  addPageNumbers,
  addTextWatermark,
  deletePages,
  extractPages,
  flattenFormFields,
  imagesToPdf,
  mergePdfs,
  optimizePdf,
  rotateAllPages,
  splitEveryPage,
} from '@/lib/pdf/operations';
import { toOperationError } from '@/governance/operation-errors';
import type {
  WorkerRequest,
  WorkerResponse,
  WorkerSuccess,
} from './protocol';

const workerScope = self as unknown as DedicatedWorkerGlobalScope;

workerScope.onmessage = async (event: MessageEvent<WorkerRequest>) => {
  const request = event.data;
  if (request.type !== 'execute') return;

  try {
    let output: Uint8Array | ArrayBuffer;
    let mimeType: WorkerSuccess['mimeType'] = 'application/pdf';
    let outputPageCount = request.sourcePageCount;
    const buffers = request.inputs.map((input) => input.bytes);

    switch (request.tool) {
      case 'merge':
        output = await mergePdfs(buffers);
        break;
      case 'split':
        if (request.options.kind !== 'split') throw new Error('Invalid options');
        if (request.options.everyPage) {
          const pages = await splitEveryPage(buffers[0] as ArrayBuffer);
          const archive = new JSZip();
          pages.forEach((bytes, index) => {
            archive.file(`page-${index + 1}.pdf`, bytes);
          });
          output = await archive.generateAsync({ type: 'arraybuffer' });
          mimeType = 'application/zip';
          outputPageCount = pages.length;
        } else {
          output = await extractPages(
            buffers[0] as ArrayBuffer,
            request.options.indices ?? [],
          );
          outputPageCount = request.options.indices?.length ?? 0;
        }
        break;
      case 'compress':
        output = await optimizePdf(buffers[0] as ArrayBuffer);
        break;
      case 'rotate':
        if (request.options.kind !== 'rotate') throw new Error('Invalid options');
        output = await rotateAllPages(
          buffers[0] as ArrayBuffer,
          request.options.angle,
        );
        break;
      case 'delete-pages':
        if (request.options.kind !== 'delete-pages') throw new Error('Invalid options');
        output = await deletePages(
          buffers[0] as ArrayBuffer,
          request.options.indices,
        );
        outputPageCount = request.sourcePageCount - request.options.indices.length;
        break;
      case 'watermark':
        if (request.options.kind !== 'watermark') throw new Error('Invalid options');
        output = await addTextWatermark(
          buffers[0] as ArrayBuffer,
          request.options.text,
        );
        break;
      case 'page-numbers':
        if (request.options.kind !== 'page-numbers') throw new Error('Invalid options');
        output = await addPageNumbers(
          buffers[0] as ArrayBuffer,
          request.options.position,
        );
        break;
      case 'flatten':
        output = await flattenFormFields(buffers[0] as ArrayBuffer);
        break;
      case 'images-to-pdf':
        output = await imagesToPdf(
          request.inputs.map((input) => ({
            bytes: input.bytes,
            type: input.mimeType as 'image/jpeg' | 'image/png',
          })),
        );
        outputPageCount = request.inputs.length;
        break;
      case 'inspect':
      case 'compare':
      case 'evidence-manifest':
      case 'redact':
        throw new Error('Assurance operation routed to the wrong executor.');
    }

    const transferable =
      output instanceof ArrayBuffer
        ? output
        : output.buffer.slice(
            output.byteOffset,
            output.byteOffset + output.byteLength,
          ) as ArrayBuffer;
    const response: WorkerResponse = {
      type: 'success',
      operationId: request.operationId,
      output: transferable,
      mimeType,
      outputPageCount,
    };
    workerScope.postMessage(response, [transferable]);
  } catch (error) {
    const response: WorkerResponse = {
      type: 'failure',
      operationId: request.operationId,
      errorCode: toOperationError(error).code,
    };
    workerScope.postMessage(response);
  }
};

export {};
