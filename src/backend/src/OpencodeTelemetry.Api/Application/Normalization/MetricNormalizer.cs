using OpencodeTelemetry.Api.Configuration;
using OpencodeTelemetry.Api.Domain.Models;
using Microsoft.Extensions.Options;

namespace OpencodeTelemetry.Api.Application.Normalization;

public class MetricNormalizer
{
    private static readonly HashSet<string> AllowedMetricTypes = new()
    {
        "input", "output", "reasoning", "cacheRead", "cacheCreation"
    };

    private readonly TelemetryOptions _options;

    public MetricNormalizer(IOptions<TelemetryOptions> options)
    {
        _options = options.Value;
    }

    public bool TryNormalize(
        string metricType,
        long timeUnixNano,
        double cumulativeValue,
        DateTime? ingestedAt,
        out MetricRecord? record)
    {
        record = null;

        if (!AllowedMetricTypes.Contains(metricType))
            return false;

        var eventTime = UnixTimeNanoToUtc(timeUnixNano);

        record = new MetricRecord
        {
            student_context_key = _options.StudentContextKey,
            repo_key = _options.RepoKey,
            resource_group_key = _options.ResourceGroupKey,
            signal_name = "opencode.token.usage",
            metric_type = metricType,
            time_unix_nano = timeUnixNano,
            event_time_utc = eventTime,
            cumulative_value = cumulativeValue,
            ingested_at_utc = ingestedAt ?? DateTime.UtcNow,
            source_transport = "otlp_http_protobuf"
        };

        return true;
    }

    private static DateTime UnixTimeNanoToUtc(long timeUnixNano)
    {
        var epoch = new DateTime(1970, 1, 1, 0, 0, 0, DateTimeKind.Utc);
        return epoch.AddTicks(timeUnixNano / 100);
    }
}
