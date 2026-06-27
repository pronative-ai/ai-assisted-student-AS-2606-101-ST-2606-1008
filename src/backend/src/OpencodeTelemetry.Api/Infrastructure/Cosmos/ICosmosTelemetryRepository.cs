using OpencodeTelemetry.Api.Domain.Models;

namespace OpencodeTelemetry.Api.Infrastructure.Cosmos;

public interface ICosmosTelemetryRepository
{
    Task PersistMetricAsync(MetricRecord record, CancellationToken ct);
    Task PersistLogEventAsync(LogEventRecord record, CancellationToken ct);
    Task<List<MetricRecord>> QueryMetricsAsync(
        string studentContextKey,
        string metricType,
        DateTime startUtc,
        DateTime endUtc,
        CancellationToken ct);
    Task<List<LogEventRecord>> QueryLogEventsAsync(
        string studentContextKey,
        string eventName,
        DateTime startUtc,
        DateTime endUtc,
        CancellationToken ct);
}
