import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import test from 'node:test';
import ts from 'typescript';
import Stripe from 'stripe';
import { Prisma } from '@prisma/client';
import { readCommercialConfiguration } from '../lib/commercial/config';
import * as webhookRules from '../lib/commercial/webhook';
import { appPath } from '../lib/paths';

// Execute the actual server modules with explicit dependencies. No real process
// environment, database, authentication provider or Stripe network client enters
// this harness. Unknown imports fail rather than silently reaching a live service.
function load(path: string, dependencies: Record<string, unknown>, env: Record<string, string> = {}) {
  const source = ts.transpileModule(readFileSync(path, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true },
    fileName: path,
  }).outputText;
  const exports: Record<string, any> = {};
  runInNewContext(source, {
    exports, Response, process: { env },
    require: (name: string) => {
      assert.ok(Object.prototype.hasOwnProperty.call(dependencies, name), `Unexpected server dependency: ${name}`);
      return dependencies[name];
    },
  }, { filename: path });
  return exports;
}

const env = {
  AOPDF_COMMERCIAL_ENABLED: 'true', AOPDF_BILLING_ENABLED: 'true',
  DATABASE_URL: 'postgresql://fixture.invalid/test', NEXTAUTH_SECRET: 'local-fixture-only',
  AOPDF_PLAN_ENTITLEMENTS_JSON: JSON.stringify([{ code: 'fixture', maxOperationsPerUtcDay: 1, tools: ['inspect'] }]),
  AOPDF_DEFAULT_PLAN_CODE: 'fixture', STRIPE_SECRET_KEY: 'sk_test_fixture_only',
  STRIPE_WEBHOOK_SECRET: 'whsec_fixture_only',
  AOPDF_STRIPE_PRICE_MAP_JSON: JSON.stringify({ fixture: 'price_fixture' }),
  AOPDF_APP_ORIGIN: 'https://fixture.invalid',
};

function features(configuration = env) {
  return load('lib/server-features.ts', {
    '@/lib/commercial/config': { readCommercialConfiguration },
  }, configuration);
}

function route(kind: 'checkout' | 'webhook', dependencies: Record<string, unknown>, configuration = env) {
  return load(`server/api/stripe/${kind}/route.ts`, {
    'next/server': { NextResponse: { json: Response.json.bind(Response) } },
    'next-auth': { getServerSession: () => { throw new Error('Unexpected authentication'); } },
    '@/lib/auth-options': { authOptions: {} },
    '@/lib/paths': { appPath },
    '@/lib/server-features': features(configuration),
    '@/lib/commercial/webhook': webhookRules,
    '@/lib/commercial/config': {},
    '@prisma/client': { Prisma },
    ...dependencies,
  }, configuration).POST as (request: Request) => Promise<Response>;
}

const forbidden = () => { throw new Error('Unexpected side effect'); };

test('workspace lookup scopes exact user, orders createdAt/id, propagates roles, null and DB failure', async () => {
  let result: unknown = null;
  const failure = new Error('database unavailable');
  const { workspaceContextForUser } = load('lib/commercial/server-context.ts', {
    '@/lib/prisma': { prisma: { membership: { findFirst: async (query: unknown) => {
      // Compare across the VM boundary as plain JSON, including both tie breakers.
      assert.deepEqual(JSON.parse(JSON.stringify(query)), {
        where: { userId: 'trusted-user' }, orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
        select: { workspaceId: true, role: true },
      });
      if (result === failure) throw failure;
      return result;
    } } } },
  });
  assert.equal(await workspaceContextForUser('trusted-user'), null);
  for (const role of ['OWNER', 'MEMBER']) {
    result = { workspaceId: 'first-workspace', role };
    assert.deepEqual(JSON.parse(JSON.stringify(await workspaceContextForUser('trusted-user'))), {
      userId: 'trusted-user', workspaceId: 'first-workspace', role,
    });
  }
  result = failure;
  await assert.rejects(workspaceContextForUser('trusted-user'), (error) => error === failure);
});

test('every missing billing prerequisite and malformed origin stops both routes before side effects', async () => {
  const configurations = [
    ...['STRIPE_SECRET_KEY', 'STRIPE_WEBHOOK_SECRET', 'AOPDF_STRIPE_PRICE_MAP_JSON', 'AOPDF_APP_ORIGIN']
      .flatMap((key) => ['', '   '].map((value) => ({ ...env, [key]: value }))),
    ...['http://fixture.invalid', 'https://fixture.invalid/path', 'https://fixture.invalid/?q=1',
      'https://fixture.invalid/#fragment', 'not-an-origin'].map((AOPDF_APP_ORIGIN) => ({ ...env, AOPDF_APP_ORIGIN })),
    { ...env, AOPDF_BILLING_ENABLED: 'false' },
  ];
  for (const configuration of configurations) {
    assert.equal(features(configuration).BILLING_CONFIGURED, false);
    for (const kind of ['checkout', 'webhook'] as const) {
      const post = route(kind, {
        '@/lib/stripe': { getStripe: forbidden }, '@/lib/prisma': { prisma: {} },
      }, configuration);
      assert.equal((await post(new Request('https://fixture.invalid', { method: 'POST' }))).status, 503);
    }
  }
});

test('checkout uses trusted session membership, OWNER gate, validated destination and stable idempotency keys', async () => {
  let session: any = null;
  let role: string | null = 'OWNER';
  const checkouts: any[] = [];
  const customers: any[] = [];
  const post = route('checkout', {
    'next-auth': { getServerSession: async () => session },
    '@/lib/prisma': { prisma: {
      membership: { findUnique: async (query: unknown) => {
        assert.deepEqual(JSON.parse(JSON.stringify(query)), {
          where: { workspaceId_userId: { workspaceId: 'trusted-workspace', userId: 'trusted-user' } },
          select: { role: true },
        });
        return role ? { role } : null;
      } },
      subscription: {
        findUnique: async () => ({ stripeCustomerId: null }),
        update: async () => ({ stripeCustomerId: 'cus_fixture' }),
      },
    } },
    '@/lib/stripe': {
      getStripePriceId: (code: string) => { assert.equal(code, 'fixture'); return 'price_fixture'; },
      getStripe: () => ({
        customers: { create: async (...args: unknown[]) => { customers.push(args); return { id: 'cus_fixture' }; } },
        checkout: { sessions: { create: async (...args: unknown[]) => {
          checkouts.push(args); return { url: 'https://checkout.stripe.com/fixture' };
        } } },
      }),
    },
  });
  const request = () => new Request('https://fixture.invalid', { method: 'POST', body: JSON.stringify({
    planCode: 'fixture', requestId: 'request_fixture', userId: 'attacker', workspaceId: 'attacker',
  }) });
  assert.equal((await post(request())).status, 401);
  session = { user: { id: 'trusted-user', workspaceId: 'trusted-workspace', email: 'fixture@example.invalid' } };
  for (role of [null, 'MEMBER']) assert.equal((await post(request())).status, 403);
  assert.equal(checkouts.length, 0);
  assert.equal(customers.length, 0);
  role = 'OWNER';
  for (let delivery = 0; delivery < 2; delivery++) assert.equal((await post(request())).status, 200);
  for (const [parameters, options] of checkouts) {
    assert.equal(parameters.success_url, `${env.AOPDF_APP_ORIGIN}${appPath('/dashboard')}?checkout=success`);
    assert.equal(parameters.cancel_url, `${env.AOPDF_APP_ORIGIN}${appPath('/pricing')}?checkout=cancelled`);
    assert.equal(parameters.metadata.workspaceId, 'trusted-workspace');
    assert.equal(options.idempotencyKey, 'checkout:trusted-workspace:request_fixture');
  }
  for (const [, options] of customers) assert.equal(options.idempotencyKey, 'workspace-customer:trusted-workspace');
});

test('webhook verifies actual signatures before persistence and duplicate delivery has one mutation', async () => {
  // Real SDK signature verification, with a synthetic secret and no API request.
  const stripe = new Stripe('sk_test_fixture_only');
  let receipt: any = null;
  let mutations = 0;
  let claims = 0;
  let lookups = 0;
  const prisma = {
    webhookEvent: {
      create: async () => {
        claims++;
        if (receipt) throw new Prisma.PrismaClientKnownRequestError('duplicate fixture', { code: 'P2002', clientVersion: 'fixture' });
        receipt = { state: 'PROCESSING' };
      },
      findUnique: async () => receipt,
      update: async ({ data }: any) => { receipt = data; },
    },
    subscription: {
      findUnique: async ({ where }: any) => {
        lookups++;
        assert.equal(where.workspaceId, 'trusted-workspace');
        return { stripeCustomerId: 'cus_fixture', lastStripeEventCreated: 0 };
      },
      update: async ({ data }: any) => {
        mutations++;
        assert.equal(data.state, 'ACTIVE');
        assert.equal(data.stripeSubscriptionId, 'sub_fixture');
      },
    },
    $transaction: async (operation: (tx: unknown) => Promise<void>) => operation(prisma),
  };
  const post = route('webhook', {
    '@/lib/stripe': { getStripe: () => stripe }, '@/lib/prisma': { prisma },
  });
  const payload = JSON.stringify({ id: 'evt_fixture', type: 'checkout.session.completed', created: 100,
    data: { object: { object: 'checkout.session', customer: 'cus_fixture', subscription: 'sub_fixture',
      metadata: { workspaceId: 'trusted-workspace', planCode: 'fixture' } } } });
  const request = (signature?: string) => new Request('https://fixture.invalid', {
    method: 'POST', body: payload, headers: signature ? { 'stripe-signature': signature } : {},
  });
  for (const signature of [undefined, 'invalid', stripe.webhooks.generateTestHeaderString({ payload, secret: 'wrong-fixture-secret' })]) {
    assert.equal((await post(request(signature))).status, 400);
  }
  assert.equal(claims, 0);
  assert.equal(mutations, 0);
  const signature = stripe.webhooks.generateTestHeaderString({ payload, secret: env.STRIPE_WEBHOOK_SECRET });
  assert.equal((await post(request(signature))).status, 200);
  assert.equal(receipt.state, 'PROCESSED');
  const duplicate = await post(request(signature));
  assert.equal(duplicate.status, 200);
  assert.equal((await duplicate.json()).duplicate, true);
  assert.equal(mutations, 1);
  assert.equal(lookups, 1);
});
