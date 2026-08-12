import assert from 'node:assert/strict';
import test from 'node:test';
import {
  planAllowsTool,
  readCommercialConfiguration,
} from '../lib/commercial/config';
import { parseUsageEventMetadata } from '../lib/commercial/privacy';
import {
  shouldApplyStripeEvent,
  subscriptionStateFromStripe,
} from '../lib/commercial/webhook';

const planJson = JSON.stringify([
  { code: 'configured-plan', maxOperationsPerUtcDay: 25, tools: ['merge', 'inspect'] },
]);

test('commercial capability fails disabled or invalid until all explicit configuration exists', () => {
  assert.deepEqual(readCommercialConfiguration({}), { state: 'disabled', missing: [] });
  const incomplete = readCommercialConfiguration({ AOPDF_COMMERCIAL_ENABLED: 'true' });
  assert.equal(incomplete.state, 'invalid');
  assert.deepEqual(incomplete.missing, [
    'DATABASE_URL',
    'NEXTAUTH_SECRET',
    'AOPDF_PLAN_ENTITLEMENTS_JSON',
    'AOPDF_DEFAULT_PLAN_CODE',
  ]);
  const accountsOnly = readCommercialConfiguration({
    AOPDF_COMMERCIAL_ENABLED: 'true',
    DATABASE_URL: 'postgresql://configured',
    NEXTAUTH_SECRET: 'configured-secret',
    AOPDF_PLAN_ENTITLEMENTS_JSON: planJson,
    AOPDF_DEFAULT_PLAN_CODE: 'configured-plan',
  });
  assert.equal(accountsOnly.state, 'ready');
  if (accountsOnly.state === 'ready') {
    assert.equal(accountsOnly.billingReady, false);
    assert.equal(planAllowsTool(accountsOnly.plans[0]!, 'merge'), true);
    assert.equal(planAllowsTool(accountsOnly.plans[0]!, 'redact'), false);
  }
});

test('billing fails closed without every Stripe dependency and accepts no invented prices', () => {
  const configuration = readCommercialConfiguration({
    AOPDF_COMMERCIAL_ENABLED: 'true',
    AOPDF_BILLING_ENABLED: 'true',
    DATABASE_URL: 'postgresql://configured',
    NEXTAUTH_SECRET: 'configured-secret',
    AOPDF_PLAN_ENTITLEMENTS_JSON: planJson,
    AOPDF_DEFAULT_PLAN_CODE: 'configured-plan',
  });
  assert.equal(configuration.state, 'invalid');
  assert.deepEqual(configuration.missing, [
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_SECRET',
    'AOPDF_STRIPE_PRICE_MAP_JSON',
    'AOPDF_APP_ORIGIN',
  ]);
});

test('usage history admits metadata only and rejects document-derived or cross-scope fields', () => {
  const allowed = parseUsageEventMetadata({
    operationId: 'operation_123456',
    workspaceId: 'workspace_123456',
    actorUserId: 'user_123456789',
    tool: 'inspect',
    outcome: 'success',
    occurredAt: '2026-08-12T00:00:00.000Z',
  });
  assert.equal(allowed.tool, 'inspect');
  for (const forbidden of ['filename', 'documentBytes', 'extractedText', 'sha256', 'redactionRectangles']) {
    assert.throws(() => parseUsageEventMetadata({ ...allowed, [forbidden]: 'secret' }), /forbidden/);
  }
});

test('webhook ordering and replay rules reject duplicates and stale state transitions', () => {
  assert.equal(shouldApplyStripeEvent({ stripeCreated: 101, lastAppliedStripeCreated: 100 }), true);
  assert.equal(shouldApplyStripeEvent({ stripeCreated: 100, lastAppliedStripeCreated: 100 }), false);
  assert.equal(shouldApplyStripeEvent({ stripeCreated: 99, lastAppliedStripeCreated: 100 }), false);
  assert.equal(subscriptionStateFromStripe('active'), 'ACTIVE');
  assert.equal(subscriptionStateFromStripe('past_due'), 'PAST_DUE');
  assert.equal(subscriptionStateFromStripe('unknown'), 'INACTIVE');
});
