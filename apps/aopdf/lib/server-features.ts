import { readCommercialConfiguration } from '@/lib/commercial/config';

export const COMMERCIAL_CONFIGURATION = readCommercialConfiguration(process.env);
export const ACCOUNTS_CONFIGURED = COMMERCIAL_CONFIGURATION.state === 'ready';
export const BILLING_CONFIGURED =
  COMMERCIAL_CONFIGURATION.state === 'ready' &&
  COMMERCIAL_CONFIGURATION.billingReady;

export function unavailableResponse(feature: 'accounts' | 'billing'): Response {
  return Response.json(
    {
      error: `${feature === 'accounts' ? 'Account' : 'Billing'} infrastructure is not enabled.`,
      state: COMMERCIAL_CONFIGURATION.state,
      ...(COMMERCIAL_CONFIGURATION.state === 'invalid'
        ? { missing: COMMERCIAL_CONFIGURATION.missing }
        : {}),
    },
    { status: 503 },
  );
}
