import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { TokenTimeseriesPanelModel } from '../models/token-usage-types';

interface TokenUsageOverTimePanelProps {
  model: TokenTimeseriesPanelModel;
}

function formatBucketLabel(bucketStartIso: string): string {
  const d = new Date(bucketStartIso);
  const month = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  const hours = String(d.getUTCHours()).padStart(2, '0');
  return `${month}/${day} ${hours}:00`;
}

export default function TokenUsageOverTimePanel({ model }: TokenUsageOverTimePanelProps) {
  const chartData = model.buckets.map((b) => ({
    label: formatBucketLabel(b.bucketStartIso),
    tokens: b.totalTokens,
  }));

  return (
    <div className="panel panel-timeseries">
      <h2 className="panel-title">Token Usage Over Time</h2>

      <div className="panel-body">
        {model.errorState === 'loading' && (
          <p className="panel-status">Loading...</p>
        )}

        {model.errorState === 'error' && (
          <p className="panel-status panel-status-error">
            Unable to load token usage over time.
          </p>
        )}

        {model.errorState !== 'loading' && model.errorState !== 'error' && (
          <>
            {chartData.length === 0 ? (
              <p className="panel-status">No token usage data for this range.</p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 11 }}
                    interval="preserveStartEnd"
                  />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="tokens"
                    stroke="#2563eb"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}

            {model.errorState === 'incomplete' && (
              <p className="panel-incomplete">
                Data incomplete — showing available values.
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
