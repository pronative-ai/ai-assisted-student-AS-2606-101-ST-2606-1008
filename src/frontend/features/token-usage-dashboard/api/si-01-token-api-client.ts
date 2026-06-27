import type {
  Si01TotalResponse,
  Si01TimeseriesResponse,
} from '../models/token-usage-types';

const SI01_BASE_URL = '/api/telemetry/tokens';

export async function getTotalTokens(
  start: string,
  end: string,
): Promise<Si01TotalResponse> {
  const params = new URLSearchParams({ start, end });
  const res = await fetch(`${SI01_BASE_URL}/total?${params}`, { method: 'GET' });

  if (!res.ok) {
    throw new Error(`SI-01 total endpoint returned ${res.status}`);
  }

  const body: unknown = await res.json();
  return normalizeTotalResponse(body);
}

export async function getTokenTimeseries(
  start: string,
  end: string,
  interval: 'hour' | 'day',
): Promise<Si01TimeseriesResponse> {
  const params = new URLSearchParams({ start, end, interval });
  const res = await fetch(`${SI01_BASE_URL}/timeseries?${params}`, { method: 'GET' });

  if (!res.ok) {
    throw new Error(`SI-01 timeseries endpoint returned ${res.status}`);
  }

  const body: unknown = await res.json();
  return normalizeTimeseriesResponse(body);
}

function normalizeTotalResponse(raw: unknown): Si01TotalResponse {
  if (typeof raw !== 'object' || raw === null) {
    throw new Error('Invalid SI-01 total response: not an object');
  }
  const obj = raw as Record<string, unknown>;

  if (typeof obj.totalTokens !== 'number') {
    throw new Error('Invalid SI-01 total response: totalTokens is not a number');
  }

  return {
    totalTokens: obj.totalTokens,
    isComplete: obj.isComplete === true,
    includedTokenTypes: Array.isArray(obj.includedTokenTypes)
      ? obj.includedTokenTypes.filter(
          (t): t is 'input' | 'output' | 'reasoning' | 'cacheRead' | 'cacheCreation' =>
            ['input', 'output', 'reasoning', 'cacheRead', 'cacheCreation'].includes(String(t)),
        )
      : [],
    rangeStartIso: String(obj.rangeStartIso ?? ''),
    rangeEndIso: String(obj.rangeEndIso ?? ''),
  };
}

function normalizeTimeseriesResponse(raw: unknown): Si01TimeseriesResponse {
  if (typeof raw !== 'object' || raw === null) {
    throw new Error('Invalid SI-01 timeseries response: not an object');
  }
  const obj = raw as Record<string, unknown>;

  const interval = obj.interval === 'hour' ? 'hour' : 'day';

  const buckets: Si01TimeseriesResponse['buckets'] = Array.isArray(obj.buckets)
    ? obj.buckets.map((b: unknown) => {
        if (typeof b !== 'object' || b === null) {
          return {
            bucketStartIso: '',
            bucketEndIso: '',
            totalTokens: 0,
            includedTokenTypes: [],
          };
        }
        const bucket = b as Record<string, unknown>;
        return {
          bucketStartIso: String(bucket.bucketStartIso ?? ''),
          bucketEndIso: String(bucket.bucketEndIso ?? ''),
          totalTokens: typeof bucket.totalTokens === 'number' ? bucket.totalTokens : 0,
          includedTokenTypes: Array.isArray(bucket.includedTokenTypes)
            ? bucket.includedTokenTypes.filter(
                (t): t is 'input' | 'output' | 'reasoning' | 'cacheRead' | 'cacheCreation' =>
                  ['input', 'output', 'reasoning', 'cacheRead', 'cacheCreation'].includes(String(t)),
              )
            : [],
        };
      })
    : [];

  return {
    interval,
    buckets,
    isComplete: obj.isComplete === true,
    rangeStartIso: String(obj.rangeStartIso ?? ''),
    rangeEndIso: String(obj.rangeEndIso ?? ''),
  };
}
