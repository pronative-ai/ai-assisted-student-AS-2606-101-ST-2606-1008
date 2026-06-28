'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts'
import { TimeseriesPanelModel, ALLOWED_TOKEN_TYPES } from '@/types/token-usage'

interface TokenUsageOverTimePanelProps {
  model: TimeseriesPanelModel
}

function formatBucketLabel(bucketStart: string): string {
  const d = new Date(bucketStart)
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

function buildChartData(model: TimeseriesPanelModel) {
  return model.buckets.map((b) => {
    const row: Record<string, number | string> = {
      label: formatBucketLabel(b.bucket_start),
    }
    let total = 0
    for (const key of ALLOWED_TOKEN_TYPES) {
      const val = b.values[key] ?? 0
      row[key] = val
      total += val
    }
    row.total = total
    return row
  })
}

const CHART_COLORS: Record<string, string> = {
  input: '#3b82f6',
  output: '#10b981',
  reasoning: '#f59e0b',
  cacheRead: '#8b5cf6',
  cacheCreation: '#ec4899',
}

export default function TokenUsageOverTimePanel({
  model,
}: TokenUsageOverTimePanelProps) {
  function renderBody() {
    switch (model.state) {
      case 'loading':
        return <div className="loading-spinner">Loading...</div>

      case 'error':
        return <div className="error-state">{model.errorMessage}</div>

      case 'zero':
        return <div className="zero-state">No token usage in this period</div>

      case 'success':
        if (model.buckets.length === 0) {
          return <div className="zero-state">No token usage in this period</div>
        }

        const data = buildChartData(model)

        return (
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 12 }}
                  interval="preserveStartEnd"
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                {ALLOWED_TOKEN_TYPES.map((type) => (
                  <Bar
                    key={type}
                    dataKey={type}
                    stackId="tokens"
                    fill={CHART_COLORS[type]}
                    name={type}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        )
    }
  }

  return (
    <div className="panel">
      <div className="panel-title">Token Usage Over Time</div>
      <div className="panel-body">{renderBody()}</div>
      {model.state === 'success' && !model.isComplete && (
        <div className="incomplete-badge">Incomplete data</div>
      )}
    </div>
  )
}
