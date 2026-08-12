export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { getStripe, getStripePriceId } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import { appPath } from '@/lib/paths';
import {
  BILLING_CONFIGURED,
  COMMERCIAL_CONFIGURATION,
  unavailableResponse,
} from '@/lib/server-features';

const REQUEST_ID = /^[A-Za-z0-9_-]{8,128}$/;

export async function POST(request: NextRequest) {
  if (!BILLING_CONFIGURED || COMMERCIAL_CONFIGURATION.state !== 'ready') {
    return unavailableResponse('billing');
  }
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  const workspaceId = session?.user?.workspaceId;
  if (!userId || !workspaceId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await request.json() as Record<string, unknown>;
  const planCode = typeof body.planCode === 'string' ? body.planCode : '';
  const requestId = typeof body.requestId === 'string' ? body.requestId : '';
  if (!REQUEST_ID.test(requestId) || !COMMERCIAL_CONFIGURATION.plans.some((plan) => plan.code === planCode)) {
    return NextResponse.json({ error: 'Invalid checkout request' }, { status: 400 });
  }
  const membership = await prisma.membership.findUnique({
    where: { workspaceId_userId: { workspaceId, userId } },
    select: { role: true },
  });
  if (membership?.role !== 'OWNER') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const stripe = getStripe();
  let subscription = await prisma.subscription.findUnique({ where: { workspaceId } });
  if (!subscription) return NextResponse.json({ error: 'Subscription record unavailable' }, { status: 409 });
  let customerId = subscription.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create(
      { email: session.user.email ?? undefined, metadata: { workspaceId } },
      { idempotencyKey: `workspace-customer:${workspaceId}` },
    );
    customerId = customer.id;
    subscription = await prisma.subscription.update({
      where: { workspaceId },
      data: { stripeCustomerId: customerId },
    });
  }
  const origin = process.env.AOPDF_APP_ORIGIN as string;
  const checkoutSession = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    line_items: [{ price: getStripePriceId(planCode), quantity: 1 }],
    success_url: `${origin}${appPath('/dashboard')}?checkout=success`,
    cancel_url: `${origin}${appPath('/pricing')}?checkout=cancelled`,
    metadata: { workspaceId, planCode },
  }, { idempotencyKey: `checkout:${workspaceId}:${requestId}` });
  if (!checkoutSession.url) return NextResponse.json({ error: 'Checkout URL unavailable' }, { status: 502 });
  return NextResponse.json({ url: checkoutSession.url });
}
