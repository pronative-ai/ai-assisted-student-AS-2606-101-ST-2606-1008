import { useState } from 'react';
import type { TimeRangeMode, SelectedTimeRange } from '../models/token-usage-types';
import { getPresetRange, getCustomRange } from '../utils/time-range-utils';

interface TimeRangeSelectorProps {
  value: SelectedTimeRange;
  onChange: (range: SelectedTimeRange) => void;
}

const MODE_LABELS: Record<TimeRangeMode, string> = {
  'last-24h': 'Last 24 hours',
  'last-7d': 'Last 7 days',
  'last-30d': 'Last 30 days',
  custom: 'Custom range',
};

const MODE_ORDER: TimeRangeMode[] = ['last-24h', 'last-7d', 'last-30d', 'custom'];

export default function TimeRangeSelector({ value, onChange }: TimeRangeSelectorProps) {
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  function handleModeChange(mode: TimeRangeMode) {
    if (mode === 'custom') {
      onChange(getPresetRange('last-24h'));
      return;
    }
    setCustomStart('');
    setCustomEnd('');
    onChange(getPresetRange(mode));
  }

  function handleCustomApply() {
    const range = getCustomRange(customStart, customEnd);
    onChange(range);
  }

  const hasValidationError = value.isCustom && value.validationError !== null;

  return (
    <div className="time-range-selector">
      <div className="time-range-presets">
        {MODE_ORDER.map((mode) => (
          <button
            key={mode}
            className={`time-range-btn${value.mode === mode ? ' active' : ''}`}
            onClick={() => handleModeChange(mode)}
            type="button"
          >
            {MODE_LABELS[mode]}
          </button>
        ))}
      </div>

      {value.mode === 'custom' && (
        <div className="time-range-custom">
          <label>
            Start
            <input
              type="datetime-local"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
            />
          </label>
          <label>
            End
            <input
              type="datetime-local"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
            />
          </label>
          <button type="button" className="time-range-apply" onClick={handleCustomApply}>
            Apply
          </button>
          {hasValidationError && (
            <p className="time-range-error">{value.validationError}</p>
          )}
        </div>
      )}
    </div>
  );
}
