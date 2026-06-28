import {
  TokenTotalsResponse,
  TokenSeriesResponse,
  TotalPanelModel,
  TimeseriesPanelModel,
  MetricTypeValues,
  ALLOWED_TOKEN_TYPES,
} from '@/types/token-usage'

const ALLOWED_SET = new Set<string>(ALLOWED_TOKEN_TYPES)

function sumAllowedTypes(values: MetricTypeValues): number {
  let total = 0
  for (const key of ALLOWED_TOKEN_TYPES) {
    total += values[key] ?? 0
  }
  return total
}

export function normalizeTotalResponse(
  raw: TokenTotalsResponse | null,
  error: string | null
): TotalPanelModel {
  if (error) {
    return {
      state: 'error',
      totalTokens: 0,
      isComplete: false,
      errorMessage: error,
    }
  }

  if (!raw) {
    return {
      state: 'error',
      totalTokens: 0,
      isComplete: false,
      errorMessage: 'No response from server.',
    }
  }

  const total = sumAllowedTypes(raw.totals)

  if (total === 0 && raw.isComplete) {
    return {
      state: 'zero',
      totalTokens: 0,
      isComplete: true,
      errorMessage: null,
    }
  }

  return {
    state: 'success',
    totalTokens: total,
    isComplete: raw.isComplete,
    errorMessage: null,
  }
}

export function normalizeSeriesResponse(
  raw: TokenSeriesResponse | null,
  error: string | null
): TimeseriesPanelModel {
  if (error) {
    return {
      state: 'error',
      interval: '',
      buckets: [],
      isComplete: false,
      errorMessage: error,
    }
  }

  if (!raw) {
    return {
      state: 'error',
      interval: '',
      buckets: [],
      isComplete: false,
      errorMessage: 'No response from server.',
    }
  }

  const hasData = raw.series.some(
    (b) => sumAllowedTypes(b.values) > 0
  )

  if (!hasData && raw.isComplete) {
    return {
      state: 'zero',
      interval: raw.interval,
      buckets: [],
      isComplete: true,
      errorMessage: null,
    }
  }

  return {
    state: 'success',
    interval: raw.interval,
    buckets: raw.series,
    isComplete: raw.isComplete,
    errorMessage: null,
  }
}
