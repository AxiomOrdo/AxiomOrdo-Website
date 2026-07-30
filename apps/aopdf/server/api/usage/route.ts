export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { checkUsageLimit } from '@/lib/rate-limit';
import { ACCOUNTS_CONFIGURED, unavailableResponse } from '@/lib/server-features';

export async function GET() {
  if (!ACCOUNTS_CONFIGURED) return unavailableResponse('accounts');
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const userId = (session.user as any).id;
    const sub = await prisma.subscription.findUnique({ where: { userId } });
    const plan = sub?.plan ?? 'free';
    const usage = await checkUsageLimit(userId, plan);

    return NextResponse.json({ plan, ...usage });
  } catch (error: any) {
    console.error('Usage check error:', error);
    return NextResponse.json({ error: 'Failed to check usage' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!ACCOUNTS_CONFIGURED) return unavailableResponse('accounts');
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const userId = (session.user as any).id;
    const { tool, fileSize } = await request.json();
    await prisma.usageLog.create({ data: { userId, tool: tool ?? 'unknown', fileSize: fileSize ?? 0 } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Usage log error:', error);
    return NextResponse.json({ error: 'Failed to log usage' }, { status: 500 });
  }
}
