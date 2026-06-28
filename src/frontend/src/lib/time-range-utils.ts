import { SelectedTimeRange, TimeRangeMode } from '@/types/token-usage'

function toIso(d: Date): string {
  return d.toISOString()
}

function presetRange(mode: TimeRangeMode): {
  start: Date
  end: Date
  interval: string
} {
  const end = new Date()
  let start: Date

  switch (mode) {
    case '24h':
      start = new Date(end.getTime() - 24 * 60 * 60 * 1000)
      return { start, end, interval: '01:00:00' }
    case '7d':
      start = new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000)
      return { start, end, interval: '1.00:00:00' }
    case '30d':
      start = new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000)
      return { start, end, interval: '1.00:00:00' }
    default:
      start = new Date(end.getTime() - 24 * 60 * 60 * 1000)
      return { start, end, interval: '01:00:00' }
  }
}

function deriveInterval(startIso: string, endIso: string): string {
  const start = new Date(startIso)
  const end = new Date(endIso)
  const diffMs = end.getTime() - start.getTime()
  const diffHours = diffMs / (1000 * 60 * 60)

  if (diffHours <= 48) return '01:00:00'
  return '1.00:00:00'
}

export function resolvePreset(mode: TimeRangeMode): SelectedTimeRange {
  const { start, end, interval } = presetRange(mode)
  return {
    mode,
    startIso: toIso(start),
    endIso: toIso(end),
    interval,
    isCustom: false,
    validationError: null,
  }
}

export function resolveCustomRange(
  startIso: string,
  endIso: string
): SelectedTimeRange {
  const start = new Date(startIso)
  const end = new Date(endIso)

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return {
      mode: 'custom',
      startIso: '',
      endIso: '',
      interval: '',
      isCustom: true,
      validationError: 'Invalid date format. Use ISO 8601.',
    }
  }

  if (start >= end) {
    return {
      mode: 'custom',
      startIso,
      endIso,
      interval: '',
      isCustom: true,
      validationError: 'Start must be before end.',
    }
  }

  return {
    mode: 'custom',
    startIso: start.toISOString(),
    endIso: end.toISOString(),
    interval: deriveInterval(startIso, endIso),
    isCustom: true,
    validationError: null,
  }
}
