import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

interface RedirectRule {
  readonly source: string;
  readonly destination: string;
  readonly permanent?: boolean;
  readonly has?: ReadonlyArray<{
    readonly type: string;
    readonly value?: string;
  }>;
}

interface VercelConfig {
  readonly redirects: readonly RedirectRule[];
  readonly headers: ReadonlyArray<{
    readonly source: string;
    readonly headers: ReadonlyArray<{ readonly key: string; readonly value: string }>;
  }>;
}

const repositoryRoot = resolve(process.cwd(), '..', '..');
const config = JSON.parse(
  readFileSync(resolve(repositoryRoot, 'vercel.json'), 'utf8'),
) as VercelConfig;
const layoutSource = readFileSync(
  resolve(repositoryRoot, 'apps/aopdf/app/layout.tsx'),
  'utf8',
);
const canonicalOrigin = 'https://www.axiomordo.com';

function canonicalHostRules(): readonly RedirectRule[] {
  return config.redirects.filter((rule) =>
    rule.has?.some(
      (condition) =>
        condition.type === 'host' && condition.value === 'axiomordo.com',
    ),
  );
}

function applyCanonicalHostRedirect(url: string): string | null {
  const parsed = new URL(url);
  if (parsed.hostname !== 'axiomordo.com') return null;

  for (const rule of canonicalHostRules()) {
    let path: string | null = null;
    if (rule.source === '/' && parsed.pathname === '/') {
      path = '';
    } else if (rule.source === '/:path*/' && parsed.pathname.endsWith('/')) {
      path = parsed.pathname.slice(1, -1);
    } else if (
      rule.source === '/:path*' &&
      parsed.pathname !== '/' &&
      !parsed.pathname.endsWith('/')
    ) {
      path = parsed.pathname.slice(1);
    }
    if (path === null) continue;

    const destination = rule.destination.replace(':path*', path);
    return `${destination}${parsed.search}`;
  }
  return null;
}

describe('canonical www host policy', () => {
  it('covers root, trailing paths, and non-trailing assets before other redirects', () => {
    assert.deepEqual(canonicalHostRules(), [
      {
        source: '/',
        has: [{ type: 'host', value: 'axiomordo.com' }],
        destination: `${canonicalOrigin}/`,
        permanent: true,
      },
      {
        source: '/:path*/',
        has: [{ type: 'host', value: 'axiomordo.com' }],
        destination: `${canonicalOrigin}/:path*/`,
        permanent: true,
      },
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'axiomordo.com' }],
        destination: `${canonicalOrigin}/:path*`,
        permanent: true,
      },
    ]);
    assert.deepEqual(config.redirects.slice(0, 3), canonicalHostRules());
  });

  it('preserves AO-PDF path, query, and trailing semantics without host oscillation', () => {
    assert.equal(
      applyCanonicalHostRedirect('https://axiomordo.com/ao-pdf/?mode=review'),
      `${canonicalOrigin}/ao-pdf/?mode=review`,
    );
    assert.equal(
      applyCanonicalHostRedirect(
        'https://axiomordo.com/ao-pdf/tools/redact/?mode=review&step=2',
      ),
      `${canonicalOrigin}/ao-pdf/tools/redact/?mode=review&step=2`,
    );
    assert.equal(
      applyCanonicalHostRedirect(
        'https://axiomordo.com/ao-pdf/_next/static/chunks/app.js?v=1',
      ),
      `${canonicalOrigin}/ao-pdf/_next/static/chunks/app.js?v=1`,
    );
    assert.equal(
      applyCanonicalHostRedirect(
        'https://www.axiomordo.com/ao-pdf/tools/redact/?mode=review',
      ),
      null,
    );
  });

  it('aligns AO-PDF metadata with www and retains a self-only application CSP', () => {
    assert.match(
      layoutSource,
      /metadataBase: new URL\('https:\/\/www\.axiomordo\.com'\)/,
    );
    assert.doesNotMatch(
      layoutSource,
      /metadataBase: new URL\('https:\/\/axiomordo\.com'\)/,
    );

    const aopdfHeaders = config.headers.find(
      (entry) => entry.source === '/ao-pdf/(.*)',
    );
    const csp = aopdfHeaders?.headers.find(
      (header) => header.key === 'Content-Security-Policy',
    )?.value;
    assert.ok(csp);
    assert.match(csp, /default-src 'self'/);
    assert.doesNotMatch(csp, /https:\/\/axiomordo\.com/);
    assert.doesNotMatch(csp, /https:\/\/www\.axiomordo\.com/);
  });
});
