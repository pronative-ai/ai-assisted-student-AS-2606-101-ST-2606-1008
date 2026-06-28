using OpencodeTelemetry.Api.Domain.Models;
using OpencodeTelemetry.Api.Infrastructure.Cosmos;
using OpencodeTelemetry.Api.Infrastructure.Observability;

namespace OpencodeTelemetry.Api.Application.Aggregation;

public class TokenAggregationService
{
    private static readonly string[] MetricTypes = { "input", "output", "reasoning", "cacheRead", "cacheCreation" };

    private readonly ICosmosTelemetryRepository _repository;
    private readonly ITelemetryEventPublisher _telemetry;

    public TokenAggregationService(
        ICosmosTelemetryRepository repository,
        ITelemetryEventPublisher telemetry)
    {
        _repository = repository;
        _telemetry = telemetry;
    }

    public async Task<TokenTotalsResponse> GetTotalsAsync(
        string studentContextKey,
        DateTime startUtc,
        DateTime endUtc,
        CancellationToken ct)
    {
        var totals = new MetricTypeValues();
        var allQueriesSucceeded = true;

        foreach (var metricType in MetricTypes)
        {
            try
            {
                var samples = await _repository.QueryMetricsAsync(studentContextKey, metricType, startUtc, endUtc, ct);
                totals = SetValue(totals, metricType, ComputeCumulativeDelta(samples, startUtc, endUtc));
            }
            catch (Exception ex)
            {
                _telemetry.ReportQueryFailure("GetTotalsAsync", ex.Message, metricType);
                allQueriesSucceeded = false;
            }
        }

        return new TokenTotalsResponse
        {
            start = startUtc,
            end = endUtc,
            student_context_key = studentContextKey,
            totals = totals,
            isComplete = allQueriesSucceeded
        };
    }

    public async Task<TokenSeriesResponse> GetSeriesAsync(
        string studentContextKey,
        DateTime startUtc,
        DateTime endUtc,
        TimeSpan interval,
        CancellationToken ct)
    {
        var buckets = new List<SeriesBucket>();
        var bucketStart = startUtc;
        var allQueriesSucceeded = true;

        while (bucketStart < endUtc)
        {
            var bucketEnd = bucketStart.Add(interval);
            if (bucketEnd > endUtc)
                bucketEnd = endUtc;

            var values = new MetricTypeValues();

            foreach (var metricType in MetricTypes)
            {
                try
                {
                    var samples = await _repository.QueryMetricsAsync(studentContextKey, metricType, bucketStart, bucketEnd, ct);
                    values = SetValue(values, metricType, ComputeCumulativeDelta(samples, bucketStart, bucketEnd));
                }
                catch (Exception ex)
                {
                    _telemetry.ReportQueryFailure("GetSeriesAsync", ex.Message, metricType);
                    allQueriesSucceeded = false;
                }
            }

            buckets.Add(new SeriesBucket
            {
                bucket_start = bucketStart,
                bucket_end = bucketEnd,
                values = values
            });

            bucketStart = bucketEnd;
        }

        return new TokenSeriesResponse
        {
            start = startUtc,
            end = endUtc,
            interval = FormatInterval(interval),
            student_context_key = studentContextKey,
            isComplete = allQueriesSucceeded,
            series = buckets
        };
    }

    private static long ComputeCumulativeDelta(List<MetricRecord> samples, DateTime windowStart, DateTime windowEnd)
    {
        if (samples.Count == 0)
            return 0;

        var sorted = samples.OrderBy(s => s.time_unix_nano).ToList();

        var beforeWindow = sorted
            .Where(s => s.event_time_utc < windowStart)
            .OrderByDescending(s => s.time_unix_nano)
            .FirstOrDefault();

        var inWindow = sorted
            .Where(s => s.event_time_utc >= windowStart && s.event_time_utc <= windowEnd)
            .OrderBy(s => s.time_unix_nano)
            .ToList();

        if (inWindow.Count == 0)
            return 0;

        var lastInWindow = inWindow.Last().cumulative_value;

        var baseline = beforeWindow != null
            ? beforeWindow.cumulative_value
            : inWindow.First().cumulative_value;

        var delta = lastInWindow - baseline;

        if (delta < 0)
        {
            delta = lastInWindow;
        }

        return (long)delta;
    }

    private static MetricTypeValues SetValue(MetricTypeValues values, string metricType, long value)
    {
        switch (metricType)
        {
            case "input": values.input = value; break;
            case "output": values.output = value; break;
            case "reasoning": values.reasoning = value; break;
            case "cacheRead": values.cacheRead = value; break;
            case "cacheCreation": values.cacheCreation = value; break;
        }
        return values;
    }

    private static string FormatInterval(TimeSpan interval)
    {
        if (interval.TotalMinutes < 60)
            return $"{(int)interval.TotalMinutes}m";
        if (interval.TotalHours < 24)
            return $"{(int)interval.TotalHours}h";
        return $"{(int)interval.TotalDays}d";
    }
}
