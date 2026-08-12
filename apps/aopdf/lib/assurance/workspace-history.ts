import type { WorkspaceHistoryEntry } from './types';
import { isAdmittedToolSlug } from '@/governance/tool-limits';

const KEY = 'aopdf.assurance.workspace-history.v1';
const LIMIT = 20;

function normalizeEntry(value: unknown): WorkspaceHistoryEntry | null {
  if (!value || typeof value !== 'object') return null;
  const item = value as Record<string, unknown>;
  if (
    !isAdmittedToolSlug(item.operation) ||
    typeof item.completedAt !== 'string' ||
    !Number.isFinite(Date.parse(item.completedAt)) ||
    typeof item.sourceCount !== 'number' ||
    !Number.isInteger(item.sourceCount) ||
    item.sourceCount <= 0 ||
    (item.assurance !== 'generated' && item.assurance !== 'verified-bounded')
  ) {
    return null;
  }
  return {
    operation: item.operation,
    completedAt: item.completedAt,
    sourceCount: item.sourceCount,
    assurance: item.assurance,
  };
}

export function readWorkspaceHistory(storage: Storage): WorkspaceHistoryEntry[] {
  try {
    const parsed: unknown = JSON.parse(storage.getItem(KEY) ?? '[]');
    return Array.isArray(parsed)
      ? parsed.map(normalizeEntry).filter((entry): entry is WorkspaceHistoryEntry => entry !== null).slice(0, LIMIT)
      : [];
  } catch {
    return [];
  }
}

export function writeWorkspaceHistory(
  storage: Storage,
  entries: readonly WorkspaceHistoryEntry[],
): WorkspaceHistoryEntry[] {
  const bounded = entries
    .map(normalizeEntry)
    .filter((entry): entry is WorkspaceHistoryEntry => entry !== null)
    .slice(0, LIMIT);
  storage.setItem(KEY, JSON.stringify(bounded));
  return bounded;
}

export function clearWorkspaceHistory(storage: Storage): void {
  storage.removeItem(KEY);
}
