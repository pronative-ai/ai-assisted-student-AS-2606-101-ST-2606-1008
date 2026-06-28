'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import {
  SelectedTimeRange,
  TotalPanelModel,
  TimeseriesPanelModel,
} from '@/types/token-usage'
import { resolvePreset } from '@/lib/time-range-utils'
import { getTotalTokens, getTokenTimeseries } from '@/lib/si01-api-client'
import {
  normalizeTotalResponse,
  normalizeSeriesResponse,
} from '@/lib/token-response-normalizers'
import TimeRangeSelector from '@/components/token-usage-dashboard/time-range-selector'
import TotalTokensPanel from '@/components/token-usage-dashboard/total-tokens-panel'
import TokenUsageOverTimePanel from '@/components/token-usage-dashboard/token-usage-over-time-panel'

export default function DashboardPage() {
  const [timeRange, setTimeRange] = useState<SelectedTimeRange>(() =>
    resolvePreset('7d')
  )

  const [totalModel, setTotalModel] = useState<TotalPanelModel>({
    state: 'loading',
    totalTokens: 0,
    isComplete: true,
    errorMessage: null,
  })

  const [seriesModel, setSeriesModel] = useState<TimeseriesPanelModel>({
    state: 'loading',
    interval: '',
    buckets: [],
    isComplete: true,
    errorMessage: null,
  })

  const abortRef = useRef<AbortController | null>(null)

  const fetchData = useCallback(
    async (range: SelectedTimeRange) => {
      if (range.validationError) return

      abortRef.current?.abort()
      const controller = new AbortController()
      abortRef.current = controller
      const signal = controller.signal

      setTotalModel((prev) => ({ ...prev, state: 'loading' }))
      setSeriesModel((prev) => ({ ...prev, state: 'loading' }))

      const totalPromise = getTotalTokens(range.startIso, range.endIso, signal)
        .then((raw) => normalizeTotalResponse(raw, null))
        .catch((err: Error) => {
          if (err.name === 'AbortError') return null
          return normalizeTotalResponse(null, err.message)
        })

      const seriesPromise = getTokenTimeseries(
        range.startIso,
        range.endIso,
        range.interval,
        signal
      )
        .then((raw) => normalizeSeriesResponse(raw, null))
        .catch((err: Error) => {
          if (err.name === 'AbortError') return null
          return normalizeSeriesResponse(null, err.message)
        })

      const [totalResult, seriesResult] = await Promise.all([
        totalPromise,
        seriesPromise,
      ])

      if (signal.aborted) return

      if (totalResult) setTotalModel(totalResult)
      if (seriesResult) setSeriesModel(seriesResult)
    },
    []
  )

  useEffect(() => {
    fetchData(timeRange)
    return () => abortRef.current?.abort()
  }, [timeRange, fetchData])

  function handleTimeRangeChange(range: SelectedTimeRange) {
    setTimeRange(range)
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Token Usage Dashboard</h1>
        <TimeRangeSelector value={timeRange} onChange={handleTimeRangeChange} />
      </div>

      <div className="dashboard-panels">
        <TotalTokensPanel model={totalModel} />
        <TokenUsageOverTimePanel model={seriesModel} />
      </div>
    </div>
  )
}
