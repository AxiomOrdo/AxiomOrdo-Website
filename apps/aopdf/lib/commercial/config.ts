import { isAdmittedToolSlug, type AdmittedToolSlug } from '@/governance/tool-limits';

export interface PlanEntitlements {
  readonly code: string;
  readonly maxOperationsPerUtcDay: number | null;
  readonly tools: readonly AdmittedToolSlug[];
}

export type CommercialConfiguration =
  | { readonly state: 'disabled'; readonly missing: readonly string[] }
  | { readonly state: 'invalid'; readonly missing: readonly string[]; readonly reason: string }
  | {
      readonly state: 'ready';
      readonly billingReady: boolean;
      readonly defaultPlanCode: string;
      readonly plans: readonly PlanEntitlements[];
      readonly missing: readonly string[];
    };

type Environment = Readonly<Record<string, string | undefined>>;

function nonEmpty(env: Environment, name: string): boolean {
  return Boolean(env[name]?.trim());
}

function parsePlans(value: string): readonly PlanEntitlements[] {
  const parsed: unknown = JSON.parse(value);
  if (!Array.isArray(parsed) || parsed.length === 0) {
    throw new TypeError('AOPDF_PLAN_ENTITLEMENTS_JSON must be a non-empty array.');
  }
  const seen = new Set<string>();
  return parsed.map((item) => {
    if (!item || typeof item !== 'object') throw new TypeError('Invalid plan entry.');
    const record = item as Record<string, unknown>;
    const code = typeof record.code === 'string' ? record.code.trim() : '';
    const maximum = record.maxOperationsPerUtcDay;
    const tools = record.tools;
    if (!/^[a-z][a-z0-9-]{0,31}$/.test(code) || seen.has(code)) {
      throw new TypeError('Plan codes must be unique stable identifiers.');
    }
    if (
      maximum !== null &&
      (!Number.isSafeInteger(maximum) || Number(maximum) < 1)
    ) {
      throw new TypeError('Plan operation limits must be positive integers or null.');
    }
    if (!Array.isArray(tools) || tools.length === 0 || tools.some((tool) => !isAdmittedToolSlug(tool))) {
      throw new TypeError('Every plan must contain admitted tool identifiers.');
    }
    if (new Set(tools).size !== tools.length) {
      throw new TypeError('Plan tool identifiers must be unique.');
    }
    seen.add(code);
    return Object.freeze({
      code,
      maxOperationsPerUtcDay: maximum as number | null,
      tools: Object.freeze([...tools] as AdmittedToolSlug[]),
    });
  });
}

export function readCommercialConfiguration(env: Environment): CommercialConfiguration {
  if (env.AOPDF_COMMERCIAL_ENABLED !== 'true') {
    return Object.freeze({ state: 'disabled', missing: Object.freeze([]) });
  }
  const accountRequirements = [
    'DATABASE_URL',
    'NEXTAUTH_SECRET',
    'AOPDF_PLAN_ENTITLEMENTS_JSON',
    'AOPDF_DEFAULT_PLAN_CODE',
  ];
  const missingAccounts = accountRequirements.filter((name) => !nonEmpty(env, name));
  if (missingAccounts.length) {
    return Object.freeze({
      state: 'invalid',
      missing: Object.freeze(missingAccounts),
      reason: 'Commercial features were enabled without complete account configuration.',
    });
  }
  let plans: readonly PlanEntitlements[];
  try {
    plans = parsePlans(env.AOPDF_PLAN_ENTITLEMENTS_JSON as string);
  } catch (error) {
    return Object.freeze({
      state: 'invalid',
      missing: Object.freeze([]),
      reason: error instanceof Error ? error.message : 'Invalid plan configuration.',
    });
  }
  const defaultPlanCode = env.AOPDF_DEFAULT_PLAN_CODE as string;
  if (!plans.some((plan) => plan.code === defaultPlanCode)) {
    return Object.freeze({
      state: 'invalid',
      missing: Object.freeze([]),
      reason: 'AOPDF_DEFAULT_PLAN_CODE must identify a configured plan.',
    });
  }
  const billingRequested = env.AOPDF_BILLING_ENABLED === 'true';
  const billingRequirements = [
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_SECRET',
    'AOPDF_STRIPE_PRICE_MAP_JSON',
    'AOPDF_APP_ORIGIN',
  ];
  const missingBilling = billingRequested
    ? billingRequirements.filter((name) => !nonEmpty(env, name))
    : [];
  if (missingBilling.length) {
    return Object.freeze({
      state: 'invalid',
      missing: Object.freeze(missingBilling),
      reason: 'Billing was enabled without complete Stripe configuration.',
    });
  }
  if (billingRequested) {
    try {
      const origin = new URL(env.AOPDF_APP_ORIGIN as string);
      if (origin.protocol !== 'https:' || origin.pathname !== '/' || origin.search || origin.hash) {
        throw new TypeError('AOPDF_APP_ORIGIN must be an HTTPS origin without a path.');
      }
      const priceMap = JSON.parse(env.AOPDF_STRIPE_PRICE_MAP_JSON as string) as unknown;
      if (!priceMap || typeof priceMap !== 'object' || Array.isArray(priceMap)) {
        throw new TypeError('AOPDF_STRIPE_PRICE_MAP_JSON must be an object.');
      }
      const entries = Object.entries(priceMap as Record<string, unknown>);
      if (
        entries.length === 0 ||
        entries.some(
          ([planCode, priceId]) =>
            !plans.some((plan) => plan.code === planCode) ||
            typeof priceId !== 'string' ||
            !/^price_[A-Za-z0-9]+$/.test(priceId),
        )
      ) {
        throw new TypeError('Stripe prices must map configured plan codes to verified price IDs.');
      }
    } catch (error) {
      return Object.freeze({
        state: 'invalid',
        missing: Object.freeze([]),
        reason: error instanceof Error ? error.message : 'Invalid billing configuration.',
      });
    }
  }
  return Object.freeze({
    state: 'ready',
    billingReady: billingRequested,
    defaultPlanCode,
    plans: Object.freeze(plans),
    missing: Object.freeze([]),
  });
}

export function planAllowsTool(
  plan: PlanEntitlements,
  tool: AdmittedToolSlug,
): boolean {
  return plan.tools.includes(tool);
}

export function stripePriceForPlan(env: Environment, planCode: string): string {
  const configuration = readCommercialConfiguration(env);
  if (configuration.state !== 'ready' || !configuration.billingReady) {
    throw new TypeError('Billing configuration is not ready.');
  }
  const mapping = JSON.parse(env.AOPDF_STRIPE_PRICE_MAP_JSON as string) as Record<string, string>;
  const priceId = mapping[planCode];
  if (!priceId) throw new TypeError('The requested plan has no configured Stripe price.');
  return priceId;
}

export function planForStripePrice(env: Environment, priceId: string): string {
  const configuration = readCommercialConfiguration(env);
  if (configuration.state !== 'ready' || !configuration.billingReady) {
    throw new TypeError('Billing configuration is not ready.');
  }
  const mapping = JSON.parse(env.AOPDF_STRIPE_PRICE_MAP_JSON as string) as Record<string, string>;
  const match = Object.entries(mapping).find(([, configuredPriceId]) => configuredPriceId === priceId);
  if (!match) throw new TypeError('Stripe price is not mapped to a configured plan.');
  return match[0];
}
