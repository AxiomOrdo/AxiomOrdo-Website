import { OperationError } from '@/governance/operation-errors';
import type { RedactionRectangle } from './types';

export function parseRedactionRectangles(
  input: string,
  pageCount: number,
): RedactionRectangle[] {
  const lines = input
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  if (lines.length === 0 || lines.length > 100) {
    throw new OperationError('REDACTION_SELECTION_INVALID');
  }
  const rectangles = lines.map((line) => {
    const values = line.split(',').map((value) => Number(value.trim()));
    if (values.length !== 5) throw new OperationError('REDACTION_SELECTION_INVALID');
    const [page, xPercent, yPercent, widthPercent, heightPercent] = values;
    if (
      !Number.isInteger(page) ||
      page < 1 ||
      page > pageCount ||
      ![xPercent, yPercent, widthPercent, heightPercent].every(Number.isFinite) ||
      (xPercent as number) < 0 ||
      (yPercent as number) < 0 ||
      (widthPercent as number) <= 0 ||
      (heightPercent as number) <= 0 ||
      (xPercent as number) + (widthPercent as number) > 100 ||
      (yPercent as number) + (heightPercent as number) > 100
    ) {
      throw new OperationError('REDACTION_SELECTION_INVALID');
    }
    return {
      page: page as number,
      xPercent: xPercent as number,
      yPercent: yPercent as number,
      widthPercent: widthPercent as number,
      heightPercent: heightPercent as number,
    };
  });
  return rectangles.sort(
    (left, right) =>
      left.page - right.page ||
      left.yPercent - right.yPercent ||
      left.xPercent - right.xPercent ||
      left.widthPercent - right.widthPercent ||
      left.heightPercent - right.heightPercent,
  );
}
