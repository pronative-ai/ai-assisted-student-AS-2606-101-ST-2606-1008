import { useState, useEffect, useCallback, useRef } from 'react';
import TimeRangeSelector from './time-range-selector';
import TotalTokensPanel from './total-tokens-panel';
import TokenUsageOverTimePanel from './token-usage-over-time-panel';
import { getPresetRange } from '../utils/time-range-utils';
import { toTotalPanelModel, toTimeseriesPanelModel } from '../utils/token-response-normalizers';
import { getTotalTokens, getTokenTimeseries } from '../api/si-01-token-api-client';
import type { SelectedTimeRange, TotalTokensPanelModel, TokenTimeseriesPanelModel, Si01TotalResponse, Si01TimeseriesResponse } from '../models/token-usage-types';

export default function TokenUsageDashboardPage() {
  const [range, setRange] = useState<SelectedTimeRange>(() => getPresetRange('last-7d'));

  const [totalModel, setTotalModel] = useState<TotalTokensPanelModel>(() =>
    toTotalPanelModel(null, true, null),
  );
  const [timeseriesModel, setTimeseriesModel] = useState<TokenTimeseriesPanelModel>(() =>
    toTimeseriesPanelModel(null, true, null),
  );

  const abortRef = useRef<AbortController | null>(null);

  const fetchData = useCallback(async (r: SelectedTimeRange) => {
    if (r.validationError) {
      return;
    }

    if (abortRef.current) {
      abortRef.current.abort();
    }
    abortRef.current = new AbortController();

    setTotalModel(toTotalPanelModel(null, true, null));
    setTimeseriesModel(toTimeseriesPanelModel(null, true, null));

    const totalPromise = getTotalTokens(r.startIso, r.endIso)
      .then((res: Si01TotalResponse) => {
        setTotalModel(toTotalPanelModel(res, false, null));
      })
      .catch((err: Error) => {
        if (err.name === 'AbortError') return;
        setTotalModel(toTotalPanelModel(null, false, err.message));
      });

    const timeseriesPromise = getTokenTimeseries(r.startIso, r.endIso, r.interval)
      .then((res: Si01TimeseriesResponse) => {
        setTimeseriesModel(toTimeseriesPanelModel(res, false, null));
      })
      .catch((err: Error) => {
        if (err.name === 'AbortError') return;
        setTimeseriesModel(toTimeseriesPanelModel(null, false, err.message));
      });

    await Promise.allSettled([totalPromise, timeseriesPromise]);
  }, []);

  useEffect(() => {
    fetchData(range);
    return () => {
      if (abortRef.current) {
        abortRef.current.abort();
      }
    };
  }, [range, fetchData]);

  function handleRangeChange(newRange: SelectedTimeRange) {
    if (newRange.validationError && newRange.isCustom) {
      setRange(newRange);
      return;
    }
    setRange(newRange);
  }

  return (
    <div className="dashboard">
      <div className="dashboard-controls">
        <TimeRangeSelector value={range} onChange={handleRangeChange} />
      </div>

      <div className="dashboard-panels">
        <TotalTokensPanel model={totalModel} />
        <TokenUsageOverTimePanel model={timeseriesModel} />
      </div>
    </div>
  );
}
