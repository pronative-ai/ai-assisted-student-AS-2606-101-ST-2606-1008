import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import TokenUsageDashboardPage from '../components/token-usage-dashboard-page';

const mockFetch = vi.fn();
globalThis.fetch = mockFetch;

beforeEach(() => {
  mockFetch.mockReset();
});

describe('TokenUsageDashboardPage', () => {
  it('renders both panel titles', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        totalTokens: 0,
        isComplete: true,
        includedTokenTypes: [],
        rangeStartIso: '',
        rangeEndIso: '',
      }),
    });

    render(<TokenUsageDashboardPage />);

    expect(screen.getByText('Total Tokens')).toBeInTheDocument();
    expect(screen.getByText('Token Usage Over Time')).toBeInTheDocument();
  });

  it('renders time-range preset buttons', () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        totalTokens: 0,
        isComplete: true,
        includedTokenTypes: [],
        rangeStartIso: '',
        rangeEndIso: '',
      }),
    });

    render(<TokenUsageDashboardPage />);

    expect(screen.getByText('Last 24 hours')).toBeInTheDocument();
    expect(screen.getByText('Last 7 days')).toBeInTheDocument();
    expect(screen.getByText('Last 30 days')).toBeInTheDocument();
    expect(screen.getByText('Custom range')).toBeInTheDocument();
  });

  it('does not render a multi-student selector', () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        totalTokens: 0,
        isComplete: true,
        includedTokenTypes: [],
        rangeStartIso: '',
        rangeEndIso: '',
      }),
    });

    render(<TokenUsageDashboardPage />);

    expect(screen.queryByText(/student|tenant|resource group|repository/i)).toBeNull();
  });
});
