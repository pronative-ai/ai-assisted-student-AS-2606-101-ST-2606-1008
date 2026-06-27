export const ALLOWED_TOKEN_TYPES = [
  'input',
  'output',
  'reasoning',
  'cacheRead',
  'cacheCreation',
] as const;

export type AllowedTokenType = (typeof ALLOWED_TOKEN_TYPES)[number];

export type TimeRangeMode = 'last-24h' | 'last-7d' | 'last-30d' | 'custom';

export interface SelectedTimeRange {
  mode: TimeRangeMode;
  startIso: string;
  endIso: string;
  interval: 'hour' | 'day';
  isCustom: boolean;
  validationError: string | null;
}

export interface Si01TotalResponse {
  totalTokens: number;
  isComplete: boolean;
  includedTokenTypes: AllowedTokenType[];
  rangeStartIso: string;
  rangeEndIso: string;
}

export interface Si01TimeseriesBucket {
  bucketStartIso: string;
  bucketEndIso: string;
  totalTokens: number;
  includedTokenTypes: AllowedTokenType[];
}

export interface Si01TimeseriesResponse {
  interval: 'hour' | 'day';
  buckets: Si01TimeseriesBucket[];
  isComplete: boolean;
  rangeStartIso: string;
  rangeEndIso: string;
}

export interface TotalTokensPanelModel {
  totalTokens: number;
  isComplete: boolean;
  includedTokenTypes: AllowedTokenType[];
  hasData: boolean;
  errorState: 'none' | 'loading' | 'error' | 'incomplete';
  rangeStartIso: string;
  rangeEndIso: string;
}

export interface TokenTimeseriesPanelModel {
  interval: 'hour' | 'day';
  buckets: Si01TimeseriesBucket[];
  isComplete: boolean;
  hasData: boolean;
  errorState: 'none' | 'loading' | 'error' | 'incomplete';
  rangeStartIso: string;
  rangeEndIso: string;
}
