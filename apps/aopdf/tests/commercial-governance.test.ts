import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import test from 'node:test';

const read = (path: string) => readFileSync(join(process.cwd(), path), 'utf8');

test('commercial persistence schema contains only metadata and explicit tenant keys', () => {
  const schema = read('prisma/schema.prisma');
  const usageModel = /model UsageEvent \{([\s\S]*?)\n\}/.exec(schema)?.[1] ?? '';
  assert.match(usageModel, /workspaceId String/);
  assert.match(usageModel, /operationId String\s+@unique/);
  assert.doesNotMatch(
    usageModel,
    /filename|documentBytes|extractedText|sha256|redaction|sourceBytes|outputContent/i,
  );
  assert.match(schema, /@@unique\(\[workspaceId, userId\]\)/);
  assert.match(schema, /stripeEventId\s+String\s+@unique/);
});

test('migration is additive with a separately marked recovery script', () => {
  const migration = read('prisma/migrations/20260812000000_commercial_foundation/migration.sql');
  const rollback = read('prisma/migrations/20260812000000_commercial_foundation/rollback.sql');
  assert.doesNotMatch(migration, /\bDROP\b|\bTRUNCATE\b|\bDELETE\s+FROM\b/i);
  assert.match(migration, /UsageEvent_operationId_key/);
  assert.match(migration, /WebhookEvent_stripeEventId_key/);
  assert.match(rollback, /Recovery-only rollback/);
  assert.match(rollback, /DROP TABLE IF EXISTS "WebhookEvent"/);
});

test('server routes derive workspace scope from the authenticated session', () => {
  for (const route of [
    'server/api/usage/route.ts',
    'server/api/dashboard/route.ts',
    'server/api/stripe/checkout/route.ts',
    'server/api/stripe/portal/route.ts',
  ]) {
    const source = read(route);
    assert.match(source, /session\?\.user\?\.workspaceId/);
    assert.match(source, /workspaceId_userId/);
    assert.doesNotMatch(source, /fileSize|filename|extractedText|documentBytes|redactionRectangles/);
  }
});

test('Stripe webhook processing is signed, idempotent, ordered and retryable', () => {
  const route = read('server/api/stripe/webhook/route.ts');
  assert.match(route, /webhooks\.constructEvent/);
  assert.match(route, /stripeEventId: event\.id/);
  assert.match(route, /PrismaClientKnownRequestError/);
  assert.match(route, /shouldApplyStripeEvent/);
  assert.match(route, /state: 'FAILED'/);
  assert.match(route, /state: 'PROCESSED'/);
});
