import { inject, track } from '@vercel/analytics';
import {
  isOperationErrorCode,
  type OperationErrorCode,
} from './operation-errors';
import {
  isAdmittedToolSlug,
  type AdmittedToolSlug,
} from './tool-limits';

export type TelemetryOutcome = 'success' | 'failure' | 'cancelled';

export interface ToolSelectedEvent {
  readonly name: 'aopdf_tool_selected';
  readonly tool: AdmittedToolSlug;
}

export interface OperationFinishedEvent {
  readonly name: 'aopdf_operation_finished';
  readonly tool: AdmittedToolSlug;
  readonly outcome: TelemetryOutcome;
  readonly durationMs: number;
  readonly errorCode?: OperationErrorCode;
}

export type TelemetryEvent = ToolSelectedEvent | OperationFinishedEvent;

function assertExactKeys(
  value: Record<string, unknown>,
  permitted: readonly string[],
): void {
  if (Object.keys(value).some((key) => !permitted.includes(key))) {
    throw new TypeError('Unknown telemetry property.');
  }
}

export function createToolSelectedEvent(tool: unknown): ToolSelectedEvent {
  if (!isAdmittedToolSlug(tool)) throw new TypeError('Unknown admitted tool.');
  return Object.freeze({ name: 'aopdf_tool_selected', tool });
}

export function createOperationFinishedEvent(args: {
  tool: unknown;
  outcome: unknown;
  durationMs: unknown;
  errorCode?: unknown;
}): OperationFinishedEvent {
  assertExactKeys(args as Record<string, unknown>, [
    'tool',
    'outcome',
    'durationMs',
    'errorCode',
  ]);
  if (!isAdmittedToolSlug(args.tool)) throw new TypeError('Unknown admitted tool.');
  if (!['success', 'failure', 'cancelled'].includes(String(args.outcome))) {
    throw new TypeError('Unknown telemetry outcome.');
  }
  if (typeof args.durationMs !== 'number' || !Number.isFinite(args.durationMs)) {
    throw new TypeError('Invalid telemetry duration.');
  }
  if (
    args.errorCode !== undefined &&
    !isOperationErrorCode(args.errorCode)
  ) {
    throw new TypeError('Unknown operation error code.');
  }
  const durationMs = Math.min(120_000, Math.max(0, Math.round(args.durationMs)));
  const event: OperationFinishedEvent = {
    name: 'aopdf_operation_finished',
    tool: args.tool,
    outcome: args.outcome as TelemetryOutcome,
    durationMs,
    ...(args.errorCode ? { errorCode: args.errorCode } : {}),
  };
  return Object.freeze(event);
}

export function transmitTelemetry(event: TelemetryEvent): void {
  inject();
  if (event.name === 'aopdf_tool_selected') {
    track(event.name, { tool: event.tool });
    return;
  }
  track(event.name, {
    tool: event.tool,
    outcome: event.outcome,
    durationMs: event.durationMs,
    ...(event.errorCode ? { errorCode: event.errorCode } : {}),
  });
}
