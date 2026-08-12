import { isAdmittedToolSlug, type AdmittedToolSlug } from '@/governance/tool-limits';

export const USAGE_EVENT_KEYS = [
  'operationId',
  'workspaceId',
  'actorUserId',
  'tool',
  'outcome',
  'occurredAt',
] as const;

export interface UsageEventMetadata {
  readonly operationId: string;
  readonly workspaceId: string;
  readonly actorUserId: string;
  readonly tool: AdmittedToolSlug;
  readonly outcome: 'success' | 'failure' | 'cancelled';
  readonly occurredAt: string;
}

const STABLE_IDENTIFIER = /^[A-Za-z0-9_-]{8,128}$/;

export function parseUsageEventMetadata(value: unknown): UsageEventMetadata {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new TypeError('Usage metadata must be an object.');
  }
  const record = value as Record<string, unknown>;
  if (Object.keys(record).some((key) => !(USAGE_EVENT_KEYS as readonly string[]).includes(key))) {
    throw new TypeError('Usage metadata contains a forbidden property.');
  }
  const operationId = String(record.operationId ?? '');
  const workspaceId = String(record.workspaceId ?? '');
  const actorUserId = String(record.actorUserId ?? '');
  const occurredAt = String(record.occurredAt ?? '');
  if (![operationId, workspaceId, actorUserId].every((item) => STABLE_IDENTIFIER.test(item))) {
    throw new TypeError('Usage metadata identifiers are invalid.');
  }
  if (!isAdmittedToolSlug(record.tool)) throw new TypeError('Usage tool is not admitted.');
  if (!['success', 'failure', 'cancelled'].includes(String(record.outcome))) {
    throw new TypeError('Usage outcome is invalid.');
  }
  const normalizedDate = new Date(occurredAt);
  if (!Number.isFinite(normalizedDate.valueOf())) throw new TypeError('Usage time is invalid.');
  return Object.freeze({
    operationId,
    workspaceId,
    actorUserId,
    tool: record.tool,
    outcome: record.outcome as UsageEventMetadata['outcome'],
    occurredAt: normalizedDate.toISOString(),
  });
}
