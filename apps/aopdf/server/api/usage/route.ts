export const dynamic = 'force-dynamic';

import { Prisma } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { parseUsageEventMetadata } from '@/lib/commercial/privacy';
import { planAllowsTool } from '@/lib/commercial/config';
import {
  ACCOUNTS_CONFIGURED,
  COMMERCIAL_CONFIGURATION,
  unavailableResponse,
} from '@/lib/server-features';

function startOfUtcDay(value = new Date()): Date {
  return new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate()));
}

async function caller() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  const workspaceId = session?.user?.workspaceId;
  return userId && workspaceId ? { userId, workspaceId } : null;
}

export async function GET() {
  if (!ACCOUNTS_CONFIGURED || COMMERCIAL_CONFIGURATION.state !== 'ready') {
    return unavailableResponse('accounts');
  }
  const configuredPlans = COMMERCIAL_CONFIGURATION.plans;
  const context = await caller();
  if (!context) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const membership = await prisma.membership.findUnique({
    where: { workspaceId_userId: context },
    select: { id: true },
  });
  if (!membership) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const subscription = await prisma.subscription.findUnique({
    where: { workspaceId: context.workspaceId },
  });
  const plan = configuredPlans.find(
    (candidate) => candidate.code === subscription?.planCode,
  );
  if (!plan) return NextResponse.json({ error: 'Entitlement unavailable' }, { status: 503 });
  const used = await prisma.usageEvent.count({
    where: { workspaceId: context.workspaceId, occurredAt: { gte: startOfUtcDay() } },
  });
  return NextResponse.json({
    planCode: plan.code,
    used,
    limit: plan.maxOperationsPerUtcDay,
    remaining:
      plan.maxOperationsPerUtcDay === null
        ? null
        : Math.max(0, plan.maxOperationsPerUtcDay - used),
  });
}

export async function POST(request: NextRequest) {
  if (!ACCOUNTS_CONFIGURED || COMMERCIAL_CONFIGURATION.state !== 'ready') {
    return unavailableResponse('accounts');
  }
  const configuredPlans = COMMERCIAL_CONFIGURATION.plans;
  const context = await caller();
  if (!context) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  let metadata;
  try {
    const body = await request.json() as Record<string, unknown>;
    metadata = parseUsageEventMetadata({
      ...body,
      workspaceId: context.workspaceId,
      actorUserId: context.userId,
    });
  } catch {
    return NextResponse.json({ error: 'Invalid usage metadata' }, { status: 400 });
  }
  try {
    const result = await prisma.$transaction(async (tx) => {
      const membership = await tx.membership.findUnique({
        where: { workspaceId_userId: context },
        select: { id: true },
      });
      if (!membership) return { status: 'forbidden' as const };
      const subscription = await tx.subscription.findUnique({
        where: { workspaceId: context.workspaceId },
      });
      const plan = configuredPlans.find(
        (candidate) => candidate.code === subscription?.planCode,
      );
      if (!plan || !planAllowsTool(plan, metadata.tool)) {
        return { status: 'not-entitled' as const };
      }
      if (plan.maxOperationsPerUtcDay !== null) {
        const used = await tx.usageEvent.count({
          where: { workspaceId: context.workspaceId, occurredAt: { gte: startOfUtcDay() } },
        });
        if (used >= plan.maxOperationsPerUtcDay) return { status: 'limit' as const };
      }
      await tx.usageEvent.create({
        data: { ...metadata, occurredAt: new Date(metadata.occurredAt) },
      });
      return { status: 'created' as const };
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
    if (result.status === 'forbidden') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    if (result.status === 'not-entitled') return NextResponse.json({ error: 'Tool not entitled' }, { status: 403 });
    if (result.status === 'limit') return NextResponse.json({ error: 'Usage limit reached' }, { status: 429 });
    return NextResponse.json({ recorded: true }, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json({ recorded: true, duplicate: true });
    }
    return NextResponse.json({ error: 'Usage recording failed' }, { status: 500 });
  }
}
