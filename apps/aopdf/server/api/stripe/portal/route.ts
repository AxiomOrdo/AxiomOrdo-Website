export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { getStripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import { appPath } from '@/lib/paths';
import { BILLING_CONFIGURED, unavailableResponse } from '@/lib/server-features';

export async function POST() {
  if (!BILLING_CONFIGURED) return unavailableResponse('billing');
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  const workspaceId = session?.user?.workspaceId;
  if (!userId || !workspaceId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const membership = await prisma.membership.findUnique({
    where: { workspaceId_userId: { workspaceId, userId } },
    select: { role: true },
  });
  if (membership?.role !== 'OWNER') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const subscription = await prisma.subscription.findUnique({ where: { workspaceId } });
  if (!subscription?.stripeCustomerId) {
    return NextResponse.json({ error: 'No billing account found' }, { status: 404 });
  }
  const portalSession = await getStripe().billingPortal.sessions.create({
    customer: subscription.stripeCustomerId,
    return_url: `${process.env.AOPDF_APP_ORIGIN as string}${appPath('/dashboard')}`,
  });
  return NextResponse.json({ url: portalSession.url });
}
