import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getTotalTokens, getTokenTimeseries } from '../api/si-01-token-api-client';

const mockFetch = vi.fn();
globalThis.fetch = mockFetch;

beforeEach(() => {
  mockFetch.mockReset();
});

describe('getTotalTokens', () => {
  it('returns normalized total response on success', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        totalTokens: 5000,
        isComplete: true,
        includedTokenTypes: ['input', 'output'],
        rangeStartIso: '2026-06-20T00:00:00Z',
        rangeEndIso: '2026-06-27T00:00:00Z',
      }),
    });

    const res = await getTotalTokens('2026-06-20T00:00:00Z', '2026-06-27T00:00:00Z');
    expect(res.totalTokens).toBe(5000);
    expect(res.isComplete).toBe(true);
    expect(res.includedTokenTypes).toEqual(['input', 'output']);

    const url = mockFetch.mock.calls[0][0] as string;
    expect(url).toContain('/api/telemetry/tokens/total');
    expect(url).toContain('start=');
    expect(url).toContain('end=');
    expect(mockFetch).toHaveBeenCalledWith(expect.any(String), { method: 'GET' });
  });

  it('throws on non-ok response', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 500 });
    await expect(getTotalTokens('s', 'e')).rejects.toThrow('returned 500');
  });

  it('filters out unsupported token types', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        totalTokens: 100,
        isComplete: true,
        includedTokenTypes: ['input', 'cost', 'output'],
        rangeStartIso: '',
        rangeEndIso: '',
      }),
    });
    const res = await getTotalTokens('s', 'e');
    expect(res.includedTokenTypes).toEqual(['input', 'output']);
  });

  it('throws for invalid payload', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ totalTokens: 'abc' }),
    });
    await expect(getTotalTokens('s', 'e')).rejects.toThrow('totalTokens is not a number');
  });
});

describe('getTokenTimeseries', () => {
  it('returns normalized timeseries response on success', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        interval: 'day',
        buckets: [
          {
            bucketStartIso: '2026-06-26T00:00:00Z',
            bucketEndIso: '2026-06-27T00:00:00Z',
            totalTokens: 200,
            includedTokenTypes: ['input'],
          },
        ],
        isComplete: true,
        rangeStartIso: '2026-06-20T00:00:00Z',
        rangeEndIso: '2026-06-27T00:00:00Z',
      }),
    });

    const res = await getTokenTimeseries('2026-06-20T00:00:00Z', '2026-06-27T00:00:00Z', 'day');
    expect(res.interval).toBe('day');
    expect(res.buckets).toHaveLength(1);
    expect(res.isComplete).toBe(true);

    const url = mockFetch.mock.calls[0][0] as string;
    expect(url).toContain('/api/telemetry/tokens/timeseries');
    expect(url).toContain('start=');
    expect(url).toContain('end=');
    expect(url).toContain('interval=');
    expect(mockFetch).toHaveBeenCalledWith(expect.any(String), { method: 'GET' });
  });

  it('defaults interval to day for unknown values', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        interval: 'week',
        buckets: [],
        isComplete: true,
        rangeStartIso: '',
        rangeEndIso: '',
      }),
    });
    const res = await getTokenTimeseries('s', 'e', 'day');
    expect(res.interval).toBe('day');
  });

  it('throws on non-ok response', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 400 });
    await expect(getTokenTimeseries('s', 'e', 'day')).rejects.toThrow('returned 400');
  });

  it('filters unsupported token types from buckets', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        interval: 'hour',
        buckets: [
          {
            bucketStartIso: '',
            bucketEndIso: '',
            totalTokens: 50,
            includedTokenTypes: ['reasoning', 'cost'],
          },
        ],
        isComplete: true,
        rangeStartIso: '',
        rangeEndIso: '',
      }),
    });
    const res = await getTokenTimeseries('s', 'e', 'hour');
    expect(res.buckets[0].includedTokenTypes).toEqual(['reasoning']);
  });
});
