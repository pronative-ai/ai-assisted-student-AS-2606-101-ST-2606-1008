export interface MetricTypeValues {
  input: number
  output: number
  reasoning: number
  cacheRead: number
  cacheCreation: number
}

export interface TokenTotalsResponse {
  start: string
  end: string
  student_context_key: string
  totals: MetricTypeValues
  isComplete: boolean
  derivation_note: string
}

export interface SeriesBucket {
  bucket_start: string
  bucket_end: string
  values: MetricTypeValues
}

export interface TokenSeriesResponse {
  start: string
  end: string
  interval: string
  student_context_key: string
  isComplete: boolean
  series: SeriesBucket[]
}

export type TimeRangeMode = '24h' | '7d' | '30d' | 'custom'

export interface SelectedTimeRange {
  mode: TimeRangeMode
  startIso: string
  endIso: string
  interval: string
  isCustom: boolean
  validationError: string | null
}

export type PanelState = 'loading' | 'success' | 'error' | 'zero'

export interface TotalPanelModel {
  state: PanelState
  totalTokens: number
  isComplete: boolean
  errorMessage: string | null
}

export interface TimeseriesPanelModel {
  state: PanelState
  interval: string
  buckets: SeriesBucket[]
  isComplete: boolean
  errorMessage: string | null
}

export const ALLOWED_TOKEN_TYPES = [
  'input',
  'output',
  'reasoning',
  'cacheRead',
  'cacheCreation',
] as const

export type AllowedTokenType = typeof ALLOWED_TOKEN_TYPES[number]
