export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import { ACCOUNTS_CONFIGURED, unavailableResponse } from '@/lib/server-features';

export async function POST(request: NextRequest) {
  if (!ACCOUNTS_CONFIGURED) return unavailableResponse('accounts');
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const userId = (session.user as any).id;
    const sub = await prisma.subscription.findUnique({ where: { userId } });
    if (!sub || sub.plan === 'free') {
      return NextResponse.json({ error: 'API access requires a Pro or Enterprise subscription' }, { status: 403 });
    }

    const { name } = await request.json();
    const rawKey = `aopdf_${crypto.randomBytes(32).toString('hex')}`;
    const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex');
    const prefix = rawKey.substring(0, 12);

    const apiKey = await prisma.apiKey.create({
      data: { userId, name: name ?? 'Default', keyHash, prefix },
    });

    return NextResponse.json({ id: apiKey.id, key: rawKey, prefix: apiKey.prefix, name: apiKey.name });
  } catch (error: any) {
    console.error('API key error:', error);
    return NextResponse.json({ error: 'Failed to create API key' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  if (!ACCOUNTS_CONFIGURED) return unavailableResponse('accounts');
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const userId = (session.user as any).id;
    const { id } = await request.json();
    await prisma.apiKey.deleteMany({ where: { id, userId } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('API key delete error:', error);
    return NextResponse.json({ error: 'Failed to delete API key' }, { status: 500 });
  }
}
