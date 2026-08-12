export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { ACCOUNTS_CONFIGURED, unavailableResponse } from '@/lib/server-features';

export async function GET() {
  if (!ACCOUNTS_CONFIGURED) return unavailableResponse('accounts');
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  const workspaceId = session?.user?.workspaceId;
  if (!userId || !workspaceId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const membership = await prisma.membership.findUnique({
    where: { workspaceId_userId: { workspaceId, userId } },
    select: { role: true, workspace: { select: { displayName: true } } },
  });
  if (!membership) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const [subscription, totalUsage, recentUsage] = await Promise.all([
    prisma.subscription.findUnique({
      where: { workspaceId },
      select: { planCode: true, state: true, stripeCustomerId: true, stripePeriodEnd: true },
    }),
    prisma.usageEvent.count({ where: { workspaceId } }),
    prisma.usageEvent.findMany({
      where: { workspaceId },
      orderBy: [{ occurredAt: 'desc' }, { id: 'desc' }],
      take: 10,
      select: { id: true, tool: true, outcome: true, occurredAt: true },
    }),
  ]);
  return NextResponse.json({
    workspace: { displayName: membership.workspace.displayName, role: membership.role },
    subscription,
    totalUsage,
    recentUsage,
  });
}
