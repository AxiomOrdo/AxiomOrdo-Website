import Stripe from 'stripe';
import { stripePriceForPlan } from '@/lib/commercial/config';

let stripeClient: Stripe | undefined;

export function getStripe(): Stripe {
  const apiKey = process.env.STRIPE_SECRET_KEY;
  if (!apiKey) throw new Error('Stripe is not configured.');
  stripeClient ??= new Stripe(apiKey, { telemetry: false });
  return stripeClient;
}

export function getStripePriceId(planCode: string): string {
  return stripePriceForPlan(process.env, planCode);
}
