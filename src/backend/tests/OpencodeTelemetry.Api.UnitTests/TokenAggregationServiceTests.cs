using OpencodeTelemetry.Api.Application.Aggregation;
using OpencodeTelemetry.Api.Domain.Models;
using OpencodeTelemetry.Api.Infrastructure.Cosmos;
using OpencodeTelemetry.Api.Infrastructure.Observability;
using Moq;

namespace OpencodeTelemetry.Api.UnitTests;

public class TokenAggregationServiceTests
{
    private readonly Mock<ICosmosTelemetryRepository> _repositoryMock = new();
    private readonly Mock<ITelemetryEventPublisher> _telemetryMock = new();
    private readonly TokenAggregationService _service;

    public TokenAggregationServiceTests()
    {
        _service = new TokenAggregationService(
            _repositoryMock.Object,
            _telemetryMock.Object);
    }

    [Fact]
    public async Task GetTotalsAsync_WithMultipleSamples_ComputesCumulativeDelta()
    {
        var studentKey = "test-student";
        var start = new DateTime(2026, 1, 1, 10, 0, 0, DateTimeKind.Utc);
        var end = new DateTime(2026, 1, 1, 10, 30, 0, DateTimeKind.Utc);

        var samples = new List<MetricRecord>
        {
            new() { metric_type = "input", cumulative_value = 100, event_time_utc = start, time_unix_nano = 1000000 },
            new() { metric_type = "input", cumulative_value = 140, event_time_utc = start.AddMinutes(15), time_unix_nano = 2000000 },
            new() { metric_type = "input", cumulative_value = 205, event_time_utc = end, time_unix_nano = 3000000 }
        };

        _repositoryMock
            .Setup(r => r.QueryMetricsAsync(studentKey, "input", start, end, It.IsAny<CancellationToken>()))
            .ReturnsAsync(samples);

        _repositoryMock
            .Setup(r => r.QueryMetricsAsync(studentKey, It.IsIn("output", "reasoning", "cacheRead", "cacheCreation"), start, end, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<MetricRecord>());

        var result = await _service.GetTotalsAsync(studentKey, start, end, CancellationToken.None);

        Assert.Equal(105, result.totals.input);
        Assert.Equal(0, result.totals.output);
        Assert.Equal(0, result.totals.reasoning);
        Assert.Equal(0, result.totals.cacheRead);
        Assert.Equal(0, result.totals.cacheCreation);
        Assert.Equal(start, result.start);
        Assert.Equal(end, result.end);
        Assert.Equal(studentKey, result.student_context_key);
        Assert.Contains("cumulative", result.derivation_note);
    }

    [Fact]
    public async Task GetTotalsAsync_WithZeroSamples_ReturnsZero()
    {
        var studentKey = "test-student";
        var start = new DateTime(2026, 1, 1, 10, 0, 0, DateTimeKind.Utc);
        var end = new DateTime(2026, 1, 1, 10, 30, 0, DateTimeKind.Utc);

        _repositoryMock
            .Setup(r => r.QueryMetricsAsync(It.IsAny<string>(), It.IsAny<string>(), start, end, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<MetricRecord>());

        var result = await _service.GetTotalsAsync(studentKey, start, end, CancellationToken.None);

        Assert.Equal(0, result.totals.input);
        Assert.Equal(0, result.totals.output);
        Assert.Equal(0, result.totals.reasoning);
        Assert.Equal(0, result.totals.cacheRead);
        Assert.Equal(0, result.totals.cacheCreation);
    }

    [Fact]
    public async Task GetTotalsAsync_WithBeforeWindowBaseline_UsesBaselineForDelta()
    {
        var studentKey = "test-student";
        var start = new DateTime(2026, 1, 1, 10, 0, 0, DateTimeKind.Utc);
        var end = new DateTime(2026, 1, 1, 10, 30, 0, DateTimeKind.Utc);

        var samples = new List<MetricRecord>
        {
            new() { metric_type = "input", cumulative_value = 50, event_time_utc = start.AddMinutes(-15), time_unix_nano = 0 },
            new() { metric_type = "input", cumulative_value = 100, event_time_utc = start, time_unix_nano = 1000000 },
            new() { metric_type = "input", cumulative_value = 200, event_time_utc = end, time_unix_nano = 3000000 }
        };

        _repositoryMock
            .Setup(r => r.QueryMetricsAsync(studentKey, "input", start, end, It.IsAny<CancellationToken>()))
            .ReturnsAsync(samples);

        _repositoryMock
            .Setup(r => r.QueryMetricsAsync(studentKey, It.IsIn("output", "reasoning", "cacheRead", "cacheCreation"), start, end, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<MetricRecord>());

        var result = await _service.GetTotalsAsync(studentKey, start, end, CancellationToken.None);

        Assert.Equal(150, result.totals.input);
    }

    [Fact]
    public async Task GetTotalsAsync_WithCounterReset_ReturnsNonNegative()
    {
        var studentKey = "test-student";
        var start = new DateTime(2026, 1, 1, 11, 0, 0, DateTimeKind.Utc);
        var end = new DateTime(2026, 1, 1, 11, 15, 0, DateTimeKind.Utc);

        var samples = new List<MetricRecord>
        {
            new() { metric_type = "reasoning", cumulative_value = 300, event_time_utc = start, time_unix_nano = 1000000 },
            new() { metric_type = "reasoning", cumulative_value = 20, event_time_utc = end, time_unix_nano = 2000000 }
        };

        _repositoryMock
            .Setup(r => r.QueryMetricsAsync(studentKey, "reasoning", start, end, It.IsAny<CancellationToken>()))
            .ReturnsAsync(samples);

        _repositoryMock
            .Setup(r => r.QueryMetricsAsync(studentKey, It.IsIn("input", "output", "cacheRead", "cacheCreation"), start, end, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<MetricRecord>());

        var result = await _service.GetTotalsAsync(studentKey, start, end, CancellationToken.None);

        Assert.True(result.totals.reasoning >= 0);
    }

    [Fact]
    public async Task GetSeriesAsync_WithSamples_ReturnsIntervalDeltas()
    {
        var studentKey = "test-student";
        var start = new DateTime(2026, 1, 1, 10, 0, 0, DateTimeKind.Utc);
        var end = new DateTime(2026, 1, 1, 10, 30, 0, DateTimeKind.Utc);
        var interval = TimeSpan.FromMinutes(15);

        var firstIntervalSamples = new List<MetricRecord>
        {
            new() { metric_type = "output", cumulative_value = 50, event_time_utc = start, time_unix_nano = 1000000 },
            new() { metric_type = "output", cumulative_value = 80, event_time_utc = start.AddMinutes(15), time_unix_nano = 2000000 }
        };

        var secondIntervalSamples = new List<MetricRecord>
        {
            new() { metric_type = "output", cumulative_value = 80, event_time_utc = start.AddMinutes(15), time_unix_nano = 2000000 },
            new() { metric_type = "output", cumulative_value = 120, event_time_utc = end, time_unix_nano = 3000000 }
        };

        _repositoryMock
            .Setup(r => r.QueryMetricsAsync(studentKey, "output", start, start.AddMinutes(15), It.IsAny<CancellationToken>()))
            .ReturnsAsync(firstIntervalSamples);

        _repositoryMock
            .Setup(r => r.QueryMetricsAsync(studentKey, "output", start.AddMinutes(15), end, It.IsAny<CancellationToken>()))
            .ReturnsAsync(secondIntervalSamples);

        _repositoryMock
            .Setup(r => r.QueryMetricsAsync(studentKey, It.IsIn("input", "reasoning", "cacheRead", "cacheCreation"), It.IsAny<DateTime>(), It.IsAny<DateTime>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<MetricRecord>());

        var result = await _service.GetSeriesAsync(studentKey, start, end, interval, CancellationToken.None);

        Assert.Equal(2, result.series.Count);
        Assert.Equal(30, result.series[0].values.output);
        Assert.Equal(40, result.series[1].values.output);
        Assert.Equal("15m", result.interval);
    }

    [Fact]
    public async Task GetSeriesAsync_WithNoData_ReturnsEmptyBuckets()
    {
        var studentKey = "test-student";
        var start = new DateTime(2026, 1, 1, 10, 0, 0, DateTimeKind.Utc);
        var end = new DateTime(2026, 1, 1, 10, 30, 0, DateTimeKind.Utc);
        var interval = TimeSpan.FromMinutes(15);

        _repositoryMock
            .Setup(r => r.QueryMetricsAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<DateTime>(), It.IsAny<DateTime>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<MetricRecord>());

        var result = await _service.GetSeriesAsync(studentKey, start, end, interval, CancellationToken.None);

        Assert.Equal(2, result.series.Count);
        Assert.Equal(0, result.series[0].values.input);
        Assert.Equal(0, result.series[0].values.output);
        Assert.Equal(0, result.series[0].values.reasoning);
        Assert.Equal(0, result.series[0].values.cacheRead);
        Assert.Equal(0, result.series[0].values.cacheCreation);
    }
}
