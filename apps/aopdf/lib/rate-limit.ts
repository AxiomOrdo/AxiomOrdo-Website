import { prisma } from './prisma';

const TIER_LIMITS: Record<string, { maxOps: number; maxFileSize: number; apiCalls: number }> = {
  free: { maxOps: 5, maxFileSize: 10 * 1024 * 1024, apiCalls: 0 },
  pro: { maxOps: -1, maxFileSize: 100 * 1024 * 1024, apiCalls: 100 },
  enterprise: { maxOps: -1, maxFileSize: 500 * 1024 * 1024, apiCalls: -1 },
};

export async function checkUsageLimit(userId: string, plan: string): Promise<{ allowed: boolean; remaining: number; limit: number }> {
  const limits = TIER_LIMITS[plan] ?? TIER_LIMITS.free;
  if (limits.maxOps === -1) return { allowed: true, remaining: -1, limit: -1 };
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const count = await prisma.usageLog.count({ where: { userId, createdAt: { gte: today } } });
  return { allowed: count < limits.maxOps, remaining: Math.max(0, limits.maxOps - count), limit: limits.maxOps };
}

export async function checkApiRateLimit(userId: string, plan: string): Promise<{ allowed: boolean; remaining: number }> {
  const limits = TIER_LIMITS[plan] ?? TIER_LIMITS.free;
  if (limits.apiCalls === 0) return { allowed: false, remaining: 0 };
  if (limits.apiCalls === -1) return { allowed: true, remaining: -1 };
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const count = await prisma.usageLog.count({ where: { userId, createdAt: { gte: today } } });
  return { allowed: count < limits.apiCalls, remaining: Math.max(0, limits.apiCalls - count) };
}

export async function logUsage(userId: string, tool: string, fileSize: number = 0) {
  await prisma.usageLog.create({ data: { userId, tool, fileSize } });
}

export function getTierLimits(plan: string) {
  return TIER_LIMITS[plan] ?? TIER_LIMITS.free;
}

export function isToolAvailable(toolTier: string, userPlan: string): boolean {
  const tierOrder = ['free', 'pro', 'enterprise'];
  return tierOrder.indexOf(userPlan) >= tierOrder.indexOf(toolTier);
}
