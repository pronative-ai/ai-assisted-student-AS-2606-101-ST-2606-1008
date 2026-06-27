import { describe, it, expect } from 'vitest';
import { toTotalPanelModel, toTimeseriesPanelModel } from '../utils/token-response-normalizers';

describe('toTotalPanelModel', () => {
  it('returns loading state', () => {
    const m = toTotalPanelModel(null, true, null);
    expect(m.errorState).toBe('loading');
    expect(m.totalTokens).toBe(0);
    expect(m.hasData).toBe(false);
  });

  it('returns error state', () => {
    const m = toTotalPanelModel(null, false, 'Network error');
    expect(m.errorState).toBe('error');
    expect(m.totalTokens).toBe(0);
  });

  it('returns complete state', () => {
    const m = toTotalPanelModel(
      {
        totalTokens: 5000,
        isComplete: true,
        includedTokenTypes: ['input', 'output'],
        rangeStartIso: '2026-06-20T00:00:00Z',
        rangeEndIso: '2026-06-27T00:00:00Z',
      },
      false,
      null,
    );
    expect(m.errorState).toBe('none');
    expect(m.totalTokens).toBe(5000);
    expect(m.hasData).toBe(true);
    expect(m.isComplete).toBe(true);
  });

  it('returns incomplete state when isComplete is false', () => {
    const m = toTotalPanelModel(
      {
        totalTokens: 3000,
        isComplete: false,
        includedTokenTypes: ['input'],
        rangeStartIso: '',
        rangeEndIso: '',
      },
      false,
      null,
    );
    expect(m.errorState).toBe('incomplete');
    expect(m.totalTokens).toBe(3000);
    expect(m.hasData).toBe(true);
  });

  it('shows zero as valid no-usage state', () => {
    const m = toTotalPanelModel(
      {
        totalTokens: 0,
        isComplete: true,
        includedTokenTypes: [],
        rangeStartIso: '',
        rangeEndIso: '',
      },
      false,
      null,
    );
    expect(m.errorState).toBe('none');
    expect(m.totalTokens).toBe(0);
    expect(m.hasData).toBe(false);
  });
});

describe('toTimeseriesPanelModel', () => {
  it('returns loading state', () => {
    const m = toTimeseriesPanelModel(null, true, null);
    expect(m.errorState).toBe('loading');
    expect(m.buckets).toHaveLength(0);
  });

  it('returns error state', () => {
    const m = toTimeseriesPanelModel(null, false, 'Fail');
    expect(m.errorState).toBe('error');
  });

  it('returns complete state with data', () => {
    const m = toTimeseriesPanelModel(
      {
        interval: 'day',
        buckets: [
          { bucketStartIso: '2026-06-26T00:00:00Z', bucketEndIso: '2026-06-27T00:00:00Z', totalTokens: 100, includedTokenTypes: ['input'] },
        ],
        isComplete: true,
        rangeStartIso: '',
        rangeEndIso: '',
      },
      false,
      null,
    );
    expect(m.errorState).toBe('none');
    expect(m.hasData).toBe(true);
    expect(m.buckets).toHaveLength(1);
  });

  it('renders empty bucket array as no-data state', () => {
    const m = toTimeseriesPanelModel(
      {
        interval: 'day',
        buckets: [],
        isComplete: true,
        rangeStartIso: '',
        rangeEndIso: '',
      },
      false,
      null,
    );
    expect(m.errorState).toBe('none');
    expect(m.hasData).toBe(false);
  });

  it('marks incomplete when isComplete is false', () => {
    const m = toTimeseriesPanelModel(
      {
        interval: 'day',
        buckets: [{ bucketStartIso: '', bucketEndIso: '', totalTokens: 50, includedTokenTypes: ['output'] }],
        isComplete: false,
        rangeStartIso: '',
        rangeEndIso: '',
      },
      false,
      null,
    );
    expect(m.errorState).toBe('incomplete');
    expect(m.hasData).toBe(true);
  });
});
