export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import { BILLING_CONFIGURED, unavailableResponse } from '@/lib/server-features';

export async function POST(request: NextRequest) {
  if (!BILLING_CONFIGURED) return unavailableResponse('billing');
  const body = await request.text();
  const sig = request.headers.get('stripe-signature');
  if (!sig) return NextResponse.json({ error: 'No signature' }, { status: 400 });

  let event;
  try {
    event = getStripe().webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET ?? '');
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err?.message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as any;
        const userId = session?.metadata?.userId;
        const plan = session?.metadata?.plan;
        if (userId && plan) {
          await prisma.subscription.upsert({
            where: { userId },
            update: {
              plan,
              stripeSubscriptionId: session?.subscription,
              stripeCustomerId: session?.customer,
              status: 'active',
            },
            create: {
              userId,
              plan,
              stripeSubscriptionId: session?.subscription,
              stripeCustomerId: session?.customer,
              status: 'active',
            },
          });
        }
        break;
      }
      case 'customer.subscription.updated': {
        const subscription = event.data.object as any;
        const sub = await prisma.subscription.findFirst({ where: { stripeSubscriptionId: subscription?.id } });
        if (sub) {
          await prisma.subscription.update({
            where: { id: sub.id },
            data: {
              status: subscription?.status === 'active' ? 'active' : 'cancelled',
              stripeCurrentPeriodEnd: subscription?.current_period_end ? new Date(subscription.current_period_end * 1000) : null,
            },
          });
        }
        break;
      }
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as any;
        const sub = await prisma.subscription.findFirst({ where: { stripeSubscriptionId: subscription?.id } });
        if (sub) {
          await prisma.subscription.update({
            where: { id: sub.id },
            data: { plan: 'free', status: 'cancelled', stripeSubscriptionId: null },
          });
        }
        break;
      }
    }
  } catch (error: any) {
    console.error('Webhook processing error:', error);
  }

  return NextResponse.json({ received: true });
}
