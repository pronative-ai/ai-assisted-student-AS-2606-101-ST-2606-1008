'use client'

import { useState } from 'react'
import { SelectedTimeRange, TimeRangeMode } from '@/types/token-usage'
import { resolvePreset, resolveCustomRange } from '@/lib/time-range-utils'

interface TimeRangeSelectorProps {
  value: SelectedTimeRange
  onChange: (range: SelectedTimeRange) => void
}

const PRESETS: { mode: TimeRangeMode; label: string }[] = [
  { mode: '24h', label: 'Last 24 hours' },
  { mode: '7d', label: 'Last 7 days' },
  { mode: '30d', label: 'Last 30 days' },
]

export default function TimeRangeSelector({
  value,
  onChange,
}: TimeRangeSelectorProps) {
  const [customStart, setCustomStart] = useState('')
  const [customEnd, setCustomEnd] = useState('')

  function handlePreset(mode: TimeRangeMode) {
    const range = resolvePreset(mode)
    onChange(range)
  }

  function handleCustomApply() {
    if (!customStart || !customEnd) return

    const startDate = new Date(customStart)
    const endDate = new Date(customEnd)

    const range = resolveCustomRange(
      startDate.toISOString(),
      endDate.toISOString()
    )
    onChange(range)
  }

  function isActive(mode: TimeRangeMode): boolean {
    return value.mode === mode && !value.isCustom
  }

  return (
    <div className="dashboard-controls">
      {PRESETS.map((p) => (
        <button
          key={p.mode}
          className={`time-range-btn ${isActive(p.mode) ? 'active' : ''}`}
          onClick={() => handlePreset(p.mode)}
        >
          {p.label}
        </button>
      ))}

      <div className="custom-range-form">
        <label htmlFor="custom-start">From:</label>
        <input
          id="custom-start"
          type="datetime-local"
          value={customStart}
          onChange={(e) => setCustomStart(e.target.value)}
        />
        <label htmlFor="custom-end">To:</label>
        <input
          id="custom-end"
          type="datetime-local"
          value={customEnd}
          onChange={(e) => setCustomEnd(e.target.value)}
        />
        <button className="time-range-btn" onClick={handleCustomApply}>
          Apply
        </button>
        {value.isCustom && value.validationError && (
          <span className="validation-error">{value.validationError}</span>
        )}
      </div>
    </div>
  )
}
