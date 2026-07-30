export function parsePageRanges(range: string, pageCount: number): number[] {
  if (!Number.isInteger(pageCount) || pageCount < 1) {
    throw new Error('Page count must be a positive integer.');
  }

  const indices = new Set<number>();
  for (const rawPart of range.split(',')) {
    const part = rawPart.trim();
    if (!part) continue;

    if (part.includes('-')) {
      const pieces = part.split('-');
      if (pieces.length !== 2) {
        throw new Error(`Invalid page range: "${part}".`);
      }
      const startText = pieces[0] ?? '';
      const endText = pieces[1] ?? '';
      if (!/^\d+$/.test(startText) || !/^\d+$/.test(endText)) {
        throw new Error(`Invalid page range: "${part}".`);
      }
      const start = Number.parseInt(startText, 10);
      const end = Number.parseInt(endText, 10);
      if (
        !Number.isInteger(start) ||
        !Number.isInteger(end) ||
        start < 1 ||
        end > pageCount ||
        start > end
      ) {
        throw new Error(`Invalid page range: "${part}".`);
      }
      for (let page = start; page <= end; page += 1) {
        indices.add(page - 1);
      }
      continue;
    }

    if (!/^\d+$/.test(part)) {
      throw new Error(`Invalid page number: "${part}".`);
    }
    const page = Number.parseInt(part, 10);
    if (!Number.isInteger(page) || page < 1 || page > pageCount) {
      throw new Error(`Invalid page number: "${part}".`);
    }
    indices.add(page - 1);
  }

  return [...indices].sort((left, right) => left - right);
}
