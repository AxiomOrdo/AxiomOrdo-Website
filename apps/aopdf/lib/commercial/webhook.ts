export const SUPPORTED_STRIPE_EVENTS = [
  'checkout.session.completed',
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted',
] as const;

export type SupportedStripeEvent = (typeof SUPPORTED_STRIPE_EVENTS)[number];

export type SubscriptionState =
  | 'INACTIVE'
  | 'TRIALING'
  | 'ACTIVE'
  | 'PAST_DUE'
  | 'PAUSED'
  | 'CANCELLED';

export function isSupportedStripeEvent(value: string): value is SupportedStripeEvent {
  return (SUPPORTED_STRIPE_EVENTS as readonly string[]).includes(value);
}

export function subscriptionStateFromStripe(value: string): SubscriptionState {
  switch (value) {
    case 'trialing': return 'TRIALING';
    case 'active': return 'ACTIVE';
    case 'past_due':
    case 'unpaid': return 'PAST_DUE';
    case 'paused': return 'PAUSED';
    case 'canceled': return 'CANCELLED';
    default: return 'INACTIVE';
  }
}

export function shouldApplyStripeEvent(args: {
  stripeCreated: number;
  lastAppliedStripeCreated: number;
}): boolean {
  return (
    Number.isSafeInteger(args.stripeCreated) &&
    args.stripeCreated > args.lastAppliedStripeCreated
  );
}
