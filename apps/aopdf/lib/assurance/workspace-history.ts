import type { WorkspaceHistoryEntry } from './types';
import { isAdmittedToolSlug } from '@/governance/tool-limits';

const KEY = 'aopdf.assurance.workspace-history.v1';
const LIMIT = 20;

function isEntry(value: unknown): value is WorkspaceHistoryEntry {
  if (!value || typeof value !== 'object') return false;
  const item = value as Record<string, unknown>;
  return (
    isAdmittedToolSlug(item.operation) &&
    typeof item.completedAt === 'string' &&
    Number.isFinite(Date.parse(item.completedAt)) &&
    typeof item.sourceCount === 'number' &&
    Number.isInteger(item.sourceCount) &&
    item.sourceCount > 0 &&
    typeof item.outputFilename === 'string' &&
    (item.assurance === 'generated' || item.assurance === 'verified-bounded')
  );
}

export function readWorkspaceHistory(storage: Storage): WorkspaceHistoryEntry[] {
  try {
    const parsed: unknown = JSON.parse(storage.getItem(KEY) ?? '[]');
    return Array.isArray(parsed) ? parsed.filter(isEntry).slice(0, LIMIT) : [];
  } catch {
    return [];
  }
}

export function writeWorkspaceHistory(
  storage: Storage,
  entries: readonly WorkspaceHistoryEntry[],
): WorkspaceHistoryEntry[] {
  const bounded = entries.filter(isEntry).slice(0, LIMIT);
  storage.setItem(KEY, JSON.stringify(bounded));
  return bounded;
}

export function clearWorkspaceHistory(storage: Storage): void {
  storage.removeItem(KEY);
}
