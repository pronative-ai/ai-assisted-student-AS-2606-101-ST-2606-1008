import type {
  Si01TotalResponse,
  Si01TimeseriesResponse,
  TotalTokensPanelModel,
  TokenTimeseriesPanelModel,
} from '../models/token-usage-types';

export function toTotalPanelModel(
  response: Si01TotalResponse | null,
  loading: boolean,
  error: string | null,
): TotalTokensPanelModel {
  if (loading) {
    return {
      totalTokens: 0,
      isComplete: false,
      includedTokenTypes: [],
      hasData: false,
      errorState: 'loading',
      rangeStartIso: '',
      rangeEndIso: '',
    };
  }

  if (error || response === null) {
    return {
      totalTokens: 0,
      isComplete: false,
      includedTokenTypes: [],
      hasData: false,
      errorState: 'error',
      rangeStartIso: '',
      rangeEndIso: '',
    };
  }

  return {
    totalTokens: response.totalTokens,
    isComplete: response.isComplete,
    includedTokenTypes: response.includedTokenTypes,
    hasData: response.totalTokens > 0,
    errorState: response.isComplete ? 'none' : 'incomplete',
    rangeStartIso: response.rangeStartIso,
    rangeEndIso: response.rangeEndIso,
  };
}

export function toTimeseriesPanelModel(
  response: Si01TimeseriesResponse | null,
  loading: boolean,
  error: string | null,
): TokenTimeseriesPanelModel {
  if (loading) {
    return {
      interval: 'day',
      buckets: [],
      isComplete: false,
      hasData: false,
      errorState: 'loading',
      rangeStartIso: '',
      rangeEndIso: '',
    };
  }

  if (error || response === null) {
    return {
      interval: 'day',
      buckets: [],
      isComplete: false,
      hasData: false,
      errorState: 'error',
      rangeStartIso: '',
      rangeEndIso: '',
    };
  }

  const hasData = response.buckets.some((b) => b.totalTokens > 0);

  return {
    interval: response.interval,
    buckets: response.buckets,
    isComplete: response.isComplete,
    hasData,
    errorState: response.isComplete ? 'none' : 'incomplete',
    rangeStartIso: response.rangeStartIso,
    rangeEndIso: response.rangeEndIso,
  };
}
