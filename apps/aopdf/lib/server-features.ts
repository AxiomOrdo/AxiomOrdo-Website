import { ACCOUNTS_ENABLED, BILLING_ENABLED } from '@/lib/features';

export const ACCOUNTS_CONFIGURED =
  ACCOUNTS_ENABLED &&
  Boolean(process.env.DATABASE_URL) &&
  Boolean(process.env.NEXTAUTH_SECRET);

export const BILLING_CONFIGURED =
  BILLING_ENABLED &&
  ACCOUNTS_CONFIGURED &&
  Boolean(process.env.STRIPE_SECRET_KEY) &&
  Boolean(process.env.STRIPE_WEBHOOK_SECRET) &&
  Boolean(process.env.STRIPE_PRO_PRICE_ID) &&
  Boolean(process.env.STRIPE_ENTERPRISE_PRICE_ID);

export function unavailableResponse(feature: 'accounts' | 'billing'): Response {
  return Response.json(
    {
      error: `${feature === 'accounts' ? 'Account' : 'Billing'} infrastructure is not enabled.`,
    },
    { status: 503 },
  );
}
