export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { ACCOUNTS_CONFIGURED, unavailableResponse } from '@/lib/server-features';

export async function GET() {
  if (!ACCOUNTS_CONFIGURED) return unavailableResponse('accounts');
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const userId = (session.user as any).id;
    const [subscription, apiKeys, todayUsage, totalUsage] = await Promise.all([
      prisma.subscription.findUnique({ where: { userId } }),
      prisma.apiKey.findMany({ where: { userId, isActive: true }, select: { id: true, name: true, prefix: true, lastUsed: true, createdAt: true } }),
      prisma.usageLog.count({ where: { userId, createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } } }),
      prisma.usageLog.count({ where: { userId } }),
    ]);

    const recentUsage = await prisma.usageLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: { id: true, tool: true, fileSize: true, status: true, createdAt: true },
    });

    return NextResponse.json({
      subscription: subscription ?? { plan: 'free', status: 'active' },
      apiKeys: apiKeys ?? [],
      todayUsage,
      totalUsage,
      recentUsage: recentUsage ?? [],
    });
  } catch (error: any) {
    console.error('Dashboard error:', error);
    return NextResponse.json({ error: 'Failed to load dashboard' }, { status: 500 });
  }
}
