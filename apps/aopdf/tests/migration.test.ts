import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import test from 'node:test';
import { PGlite } from '@electric-sql/pglite';

const migrationDirectory = join(
  process.cwd(),
  'prisma/migrations/20260812000000_commercial_foundation',
);

test('commercial migration applies and recovery removes the additive schema', async () => {
  const database = new PGlite();
  try {
    const migration = await readFile(join(migrationDirectory, 'migration.sql'), 'utf8');
    await database.exec(migration);
    const tables = await database.query<{ table_name: string }>(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    assert.deepEqual(
      tables.rows.map((row) => row.table_name),
      [
        'Account',
        'Membership',
        'Session',
        'Subscription',
        'UsageEvent',
        'User',
        'VerificationToken',
        'WebhookEvent',
        'Workspace',
      ],
    );
    const uniqueIndexes = await database.query<{ indexname: string }>(`
      SELECT indexname
      FROM pg_indexes
      WHERE schemaname = 'public'
        AND indexname IN ('UsageEvent_operationId_key', 'WebhookEvent_stripeEventId_key')
      ORDER BY indexname
    `);
    assert.deepEqual(uniqueIndexes.rows.map((row) => row.indexname), [
      'UsageEvent_operationId_key',
      'WebhookEvent_stripeEventId_key',
    ]);

    const rollback = await readFile(join(migrationDirectory, 'rollback.sql'), 'utf8');
    await database.exec(rollback);
    const remaining = await database.query<{ count: number }>(`
      SELECT COUNT(*)::int AS count
      FROM information_schema.tables
      WHERE table_schema = 'public'
    `);
    assert.equal(remaining.rows[0]?.count, 0);
  } finally {
    await database.close();
  }
});
