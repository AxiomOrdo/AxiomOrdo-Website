export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { getStripe, getStripePriceId } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import { appPath } from '@/lib/paths';
import { BILLING_CONFIGURED, unavailableResponse } from '@/lib/server-features';

export async function POST(request: NextRequest) {
  if (!BILLING_CONFIGURED) return unavailableResponse('billing');
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { plan } = await request.json();
    if (plan !== 'pro' && plan !== 'enterprise') {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }
    const userId = (session.user as any).id;
    const origin = request.headers.get('origin') ?? '';
    const stripe = getStripe();

    let sub = await prisma.subscription.findUnique({ where: { userId } });
    if (!sub) {
      sub = await prisma.subscription.create({ data: { userId, plan: 'free', status: 'active' } });
    }

    let customerId = sub?.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: session.user?.email ?? '',
        metadata: { userId },
      });
      customerId = customer.id;
      await prisma.subscription.update({ where: { userId }, data: { stripeCustomerId: customerId } });
    }

    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      line_items: [{ price: getStripePriceId(plan), quantity: 1 }],
      success_url: `${origin}${appPath('/dashboard')}?checkout=success`,
      cancel_url: `${origin}${appPath('/pricing')}?checkout=cancelled`,
      metadata: { userId, plan },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error: any) {
    console.error('Checkout error:', error);
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 });
  }
}
