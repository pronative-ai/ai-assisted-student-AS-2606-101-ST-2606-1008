import { describe, it, expect } from 'vitest';
import { getPresetRange, getCustomRange } from '../utils/time-range-utils';

describe('getPresetRange', () => {
  it('returns last-24h with hour interval', () => {
    const r = getPresetRange('last-24h');
    expect(r.mode).toBe('last-24h');
    expect(r.interval).toBe('hour');
    expect(r.isCustom).toBe(false);
    expect(r.validationError).toBeNull();
    expect(r.startIso).toBeTruthy();
    expect(r.endIso).toBeTruthy();
  });

  it('returns last-7d with day interval', () => {
    const r = getPresetRange('last-7d');
    expect(r.mode).toBe('last-7d');
    expect(r.interval).toBe('day');
    expect(r.isCustom).toBe(false);
    expect(r.validationError).toBeNull();
  });

  it('returns last-30d with day interval', () => {
    const r = getPresetRange('last-30d');
    expect(r.mode).toBe('last-30d');
    expect(r.interval).toBe('day');
    expect(r.isCustom).toBe(false);
    expect(r.validationError).toBeNull();
  });

  it('defaults to last-24h for unknown mode', () => {
    const r = getPresetRange('custom');
    expect(r.mode).toBe('last-24h');
    expect(r.interval).toBe('hour');
  });
});

describe('getCustomRange', () => {
  it('returns valid range with day interval for long spans', () => {
    const r = getCustomRange('2026-06-01T00:00:00Z', '2026-06-30T00:00:00Z');
    expect(r.validationError).toBeNull();
    expect(r.isCustom).toBe(true);
    expect(r.interval).toBe('day');
  });

  it('returns hour interval for spans <= 48 hours', () => {
    const r = getCustomRange('2026-06-27T00:00:00Z', '2026-06-28T00:00:00Z');
    expect(r.validationError).toBeNull();
    expect(r.interval).toBe('hour');
  });

  it('returns validation error when start >= end', () => {
    const r = getCustomRange('2026-06-28T00:00:00Z', '2026-06-27T00:00:00Z');
    expect(r.validationError).toBe('Start must be before end.');
  });

  it('returns validation error for invalid dates', () => {
    const r = getCustomRange('not-a-date', '2026-06-27T00:00:00Z');
    expect(r.validationError).toBe('Invalid date format. Use ISO 8601.');
  });
});
