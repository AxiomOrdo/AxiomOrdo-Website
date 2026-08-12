import { prisma } from '@/lib/prisma';

export interface WorkspaceContext {
  readonly userId: string;
  readonly workspaceId: string;
  readonly role: 'OWNER' | 'MEMBER';
}

export async function workspaceContextForUser(userId: string): Promise<WorkspaceContext | null> {
  const membership = await prisma.membership.findFirst({
    where: { userId },
    orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
    select: { workspaceId: true, role: true },
  });
  return membership ? { userId, ...membership } : null;
}
