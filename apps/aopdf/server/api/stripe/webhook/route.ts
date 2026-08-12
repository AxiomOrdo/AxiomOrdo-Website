export const dynamic = 'force-dynamic';

import { Prisma } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { getStripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import {
  isSupportedStripeEvent,
  shouldApplyStripeEvent,
  subscriptionStateFromStripe,
} from '@/lib/commercial/webhook';
import { planForStripePrice } from '@/lib/commercial/config';
import {
  BILLING_CONFIGURED,
  COMMERCIAL_CONFIGURATION,
  unavailableResponse,
} from '@/lib/server-features';

async function claimEvent(event: Stripe.Event): Promise<'claimed' | 'processing' | 'processed'> {
  try {
    await prisma.webhookEvent.create({
      data: {
        stripeEventId: event.id,
        eventType: event.type,
        stripeCreated: event.created,
        state: 'PROCESSING',
        attempts: 1,
      },
    });
    return 'claimed';
  } catch (error) {
    if (!(error instanceof Prisma.PrismaClientKnownRequestError) || error.code !== 'P2002') throw error;
    const existing = await prisma.webhookEvent.findUnique({ where: { stripeEventId: event.id } });
    if (existing?.state === 'PROCESSED') return 'processed';
    if (existing?.state === 'PROCESSING') return 'processing';
    const reclaimed = await prisma.webhookEvent.updateMany({
      where: { stripeEventId: event.id, state: 'FAILED' },
      data: { state: 'PROCESSING', attempts: { increment: 1 }, errorCode: null },
    });
    return reclaimed.count === 1 ? 'claimed' : 'processing';
  }
}

function subscriptionItem(event: Stripe.Event): Stripe.Subscription | null {
  return event.data.object.object === 'subscription'
    ? event.data.object as Stripe.Subscription
    : null;
}

export async function POST(request: NextRequest) {
  if (!BILLING_CONFIGURED) return unavailableResponse('billing');
  const signature = request.headers.get('stripe-signature');
  if (!signature) return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(
      await request.text(),
      signature,
      process.env.STRIPE_WEBHOOK_SECRET as string,
    );
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }
  if (!isSupportedStripeEvent(event.type)) return NextResponse.json({ received: true, ignored: true });
  const claim = await claimEvent(event);
  if (claim === 'processed') return NextResponse.json({ received: true, duplicate: true });
  if (claim === 'processing') return NextResponse.json({ received: true, processing: true }, { status: 202 });
  try {
    await prisma.$transaction(async (tx) => {
      if (event.type === 'checkout.session.completed') {
        const checkout = event.data.object as Stripe.Checkout.Session;
        const workspaceId = checkout.metadata?.workspaceId;
        const planCode = checkout.metadata?.planCode;
        const customerId = typeof checkout.customer === 'string' ? checkout.customer : checkout.customer?.id;
        const subscriptionId = typeof checkout.subscription === 'string'
          ? checkout.subscription
          : checkout.subscription?.id;
        if (
          !workspaceId ||
          !planCode ||
          !customerId ||
          !subscriptionId ||
          COMMERCIAL_CONFIGURATION.state !== 'ready' ||
          !COMMERCIAL_CONFIGURATION.plans.some((plan) => plan.code === planCode)
        ) {
          throw new Error('CHECKOUT_BINDING_INVALID');
        }
        const current = await tx.subscription.findUnique({ where: { workspaceId } });
        if (!current || (current.stripeCustomerId && current.stripeCustomerId !== customerId)) {
          throw new Error('CHECKOUT_TENANT_MISMATCH');
        }
        if (shouldApplyStripeEvent({
          stripeCreated: event.created,
          lastAppliedStripeCreated: current.lastStripeEventCreated,
        })) {
          await tx.subscription.update({
            where: { workspaceId },
            data: {
              planCode,
              state: 'ACTIVE',
              stripeCustomerId: customerId,
              stripeSubscriptionId: subscriptionId,
              lastStripeEventCreated: event.created,
            },
          });
        }
      } else {
        const stripeSubscription = subscriptionItem(event);
        const customerId = typeof stripeSubscription?.customer === 'string'
          ? stripeSubscription.customer
          : stripeSubscription?.customer?.id;
        if (!stripeSubscription || !customerId) throw new Error('SUBSCRIPTION_BINDING_INVALID');
        const current = await tx.subscription.findUnique({ where: { stripeCustomerId: customerId } });
        if (!current) throw new Error('SUBSCRIPTION_TENANT_NOT_FOUND');
        if (shouldApplyStripeEvent({
          stripeCreated: event.created,
          lastAppliedStripeCreated: current.lastStripeEventCreated,
        })) {
          const priceId = stripeSubscription.items.data[0]?.price.id ?? null;
          const planCode = priceId ? planForStripePrice(process.env, priceId) : current.planCode;
          await tx.subscription.update({
            where: { id: current.id },
            data: {
              state: subscriptionStateFromStripe(stripeSubscription.status),
              planCode,
              stripeSubscriptionId:
                event.type === 'customer.subscription.deleted' ? null : stripeSubscription.id,
              stripePriceId: priceId,
              stripePeriodEnd: stripeSubscription.items.data[0]?.current_period_end
                ? new Date(stripeSubscription.items.data[0].current_period_end * 1000)
                : null,
              lastStripeEventCreated: event.created,
            },
          });
        }
      }
      await tx.webhookEvent.update({
        where: { stripeEventId: event.id },
        data: { state: 'PROCESSED', processedAt: new Date(), errorCode: null },
      });
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
    return NextResponse.json({ received: true });
  } catch (error) {
    const errorCode = error instanceof Error ? error.message.slice(0, 64) : 'WEBHOOK_PROCESSING_FAILED';
    await prisma.webhookEvent.update({
      where: { stripeEventId: event.id },
      data: { state: 'FAILED', errorCode },
    });
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
