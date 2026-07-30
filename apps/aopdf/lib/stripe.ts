import Stripe from 'stripe';

let stripeClient: Stripe | undefined;

export function getStripe(): Stripe {
  const apiKey = process.env.STRIPE_SECRET_KEY;
  if (!apiKey) throw new Error('Stripe is not configured.');

  stripeClient ??= new Stripe(apiKey, {
    apiVersion: '2024-06-20' as any,
  });
  return stripeClient;
}

export function getStripePriceId(plan: 'pro' | 'enterprise'): string {
  const priceId =
    plan === 'pro'
      ? process.env.STRIPE_PRO_PRICE_ID
      : process.env.STRIPE_ENTERPRISE_PRICE_ID;
  if (!priceId) throw new Error(`Stripe price is not configured for ${plan}.`);
  return priceId;
}
