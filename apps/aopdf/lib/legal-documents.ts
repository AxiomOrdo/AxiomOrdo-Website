import 'server-only';

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

export type LegalDocumentSlug = 'privacy' | 'terms' | 'acceptable-use';

export interface LegalDocument {
  readonly effectiveDate: string;
  readonly revisionId: string;
  readonly reviewStatus: 'operational-draft';
  readonly title: string;
  readonly sections: readonly {
    readonly heading?: string;
    readonly paragraphs: readonly string[];
  }[];
}

const FRONTMATTER_PATTERN = /^---\n([\s\S]+?)\n---\n\n([\s\S]+)$/;

function parseFrontmatter(block: string): Record<string, string> {
  return Object.fromEntries(
    block.split('\n').map((line) => {
      const separator = line.indexOf(':');
      if (separator < 1) throw new Error('Invalid legal frontmatter.');
      return [
        line.slice(0, separator).trim(),
        line.slice(separator + 1).trim().replace(/^"|"$/g, ''),
      ];
    }),
  );
}

export function readLegalDocument(slug: LegalDocumentSlug): LegalDocument {
  const source = readFileSync(join(process.cwd(), 'legal', `${slug}.md`), 'utf8');
  const match = FRONTMATTER_PATTERN.exec(source);
  if (!match) throw new Error(`Legal document ${slug} has invalid frontmatter.`);

  const metadata = parseFrontmatter(match[1] ?? '');
  if (
    !metadata.effectiveDate ||
    !metadata.revisionId ||
    metadata.reviewStatus !== 'operational-draft'
  ) {
    throw new Error(`Legal document ${slug} is missing governed metadata.`);
  }

  const blocks = (match[2] ?? '').split(/\n\n+/);
  const titleBlock = blocks.shift();
  if (!titleBlock?.startsWith('# ')) {
    throw new Error(`Legal document ${slug} is missing its title.`);
  }

  const sections: Array<{ heading?: string; paragraphs: string[] }> = [];
  for (const block of blocks) {
    if (block.startsWith('## ')) {
      sections.push({ heading: block.slice(3), paragraphs: [] });
    } else {
      const section = sections[sections.length - 1];
      if (section) section.paragraphs.push(block.replace(/\n/g, ' '));
      else sections.push({ paragraphs: [block.replace(/\n/g, ' ')] });
    }
  }

  return {
    effectiveDate: metadata.effectiveDate,
    revisionId: metadata.revisionId,
    reviewStatus: 'operational-draft',
    title: titleBlock.slice(2),
    sections,
  };
}
