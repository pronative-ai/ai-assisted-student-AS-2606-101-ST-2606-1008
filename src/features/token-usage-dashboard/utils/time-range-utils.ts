import type { SelectedTimeRange, TimeRangeMode } from '../models/token-usage-types';

function toIso(d: Date): string {
  return d.toISOString();
}

function hoursAgo(n: number): Date {
  const d = new Date();
  d.setHours(d.getHours() - n);
  return d;
}

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function getPresetRange(mode: TimeRangeMode): SelectedTimeRange {
  const now = new Date();

  switch (mode) {
    case 'last-24h': {
      const start = hoursAgo(24);
      return {
        mode,
        startIso: toIso(start),
        endIso: toIso(now),
        interval: 'hour',
        isCustom: false,
        validationError: null,
      };
    }
    case 'last-7d': {
      const start = daysAgo(7);
      return {
        mode,
        startIso: toIso(start),
        endIso: toIso(now),
        interval: 'day',
        isCustom: false,
        validationError: null,
      };
    }
    case 'last-30d': {
      const start = daysAgo(30);
      return {
        mode,
        startIso: toIso(start),
        endIso: toIso(now),
        interval: 'day',
        isCustom: false,
        validationError: null,
      };
    }
    default:
      return {
        mode: 'last-24h',
        startIso: toIso(hoursAgo(24)),
        endIso: toIso(now),
        interval: 'hour',
        isCustom: false,
        validationError: null,
      };
  }
}

export function getCustomRange(
  startIso: string,
  endIso: string,
): SelectedTimeRange {
  const startMs = Date.parse(startIso);
  const endMs = Date.parse(endIso);

  if (isNaN(startMs) || isNaN(endMs)) {
    return {
      mode: 'custom',
      startIso: '',
      endIso: '',
      interval: 'day',
      isCustom: true,
      validationError: 'Invalid date format. Use ISO 8601.',
    };
  }

  if (startMs >= endMs) {
    return {
      mode: 'custom',
      startIso,
      endIso,
      interval: 'day',
      isCustom: true,
      validationError: 'Start must be before end.',
    };
  }

  const diffHours = (endMs - startMs) / (1000 * 60 * 60);
  const interval = diffHours <= 48 ? 'hour' : 'day';

  return {
    mode: 'custom',
    startIso,
    endIso,
    interval,
    isCustom: true,
    validationError: null,
  };
}
