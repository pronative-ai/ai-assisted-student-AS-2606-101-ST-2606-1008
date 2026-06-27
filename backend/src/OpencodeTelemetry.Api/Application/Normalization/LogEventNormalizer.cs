using OpencodeTelemetry.Api.Configuration;
using OpencodeTelemetry.Api.Domain.Models;
using Microsoft.Extensions.Options;

namespace OpencodeTelemetry.Api.Application.Normalization;

public class LogEventNormalizer
{
    private static readonly HashSet<string> AllowedEventNames = new()
    {
        "api_request", "api_error"
    };

    private readonly TelemetryOptions _options;

    public LogEventNormalizer(IOptions<TelemetryOptions> options)
    {
        _options = options.Value;
    }

    public bool TryNormalize(
        string eventName,
        long timeUnixNano,
        string? bodyText,
        Dictionary<string, object>? attributes,
        DateTime? ingestedAt,
        out LogEventRecord? record)
    {
        record = null;

        if (!AllowedEventNames.Contains(eventName))
            return false;

        var eventTime = UnixTimeNanoToUtc(timeUnixNano);

        record = new LogEventRecord
        {
            student_context_key = _options.StudentContextKey,
            repo_key = _options.RepoKey,
            resource_group_key = _options.ResourceGroupKey,
            event_name = eventName,
            time_unix_nano = timeUnixNano,
            event_time_utc = eventTime,
            body_text = bodyText,
            attributes = attributes,
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
