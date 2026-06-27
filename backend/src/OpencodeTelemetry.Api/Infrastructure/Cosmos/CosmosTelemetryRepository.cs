using Microsoft.Azure.Cosmos;
using OpencodeTelemetry.Api.Configuration;
using OpencodeTelemetry.Api.Domain.Models;
using Microsoft.Extensions.Options;

namespace OpencodeTelemetry.Api.Infrastructure.Cosmos;

public class CosmosTelemetryRepository : ICosmosTelemetryRepository
{
    private readonly Container _metricsContainer;
    private readonly Container _logsContainer;
    private readonly ILogger<CosmosTelemetryRepository> _logger;

    public CosmosTelemetryRepository(
        CosmosClient client,
        IOptions<CosmosOptions> options,
        ILogger<CosmosTelemetryRepository> logger)
    {
        var opts = options.Value;
        var database = client.GetDatabase(opts.DatabaseId);
        _metricsContainer = database.GetContainer(opts.MetricsContainerId);
        _logsContainer = database.GetContainer(opts.LogsContainerId);
        _logger = logger;
    }

    public async Task PersistMetricAsync(MetricRecord record, CancellationToken ct)
    {
        try
        {
            await _metricsContainer.CreateItemAsync(record, new PartitionKey(record.student_context_key), cancellationToken: ct);
        }
        catch (CosmosException ex)
        {
            _logger.LogError(ex, "Cosmos DB persistence failed for metric record. StatusCode: {StatusCode}", ex.StatusCode);
            throw;
        }
    }

    public async Task PersistLogEventAsync(LogEventRecord record, CancellationToken ct)
    {
        try
        {
            await _logsContainer.CreateItemAsync(record, new PartitionKey(record.student_context_key), cancellationToken: ct);
        }
        catch (CosmosException ex)
        {
            _logger.LogError(ex, "Cosmos DB persistence failed for log event record. StatusCode: {StatusCode}", ex.StatusCode);
            throw;
        }
    }

    public async Task<List<MetricRecord>> QueryMetricsAsync(
        string studentContextKey,
        string metricType,
        DateTime startUtc,
        DateTime endUtc,
        CancellationToken ct)
    {
        try
        {
            var query = new QueryDefinition(
                "SELECT * FROM c WHERE c.student_context_key = @student " +
                "AND c.metric_type = @type " +
                "AND c.event_time_utc >= @start " +
                "AND c.event_time_utc <= @end " +
                "ORDER BY c.event_time_utc ASC")
                .WithParameter("@student", studentContextKey)
                .WithParameter("@type", metricType)
                .WithParameter("@start", startUtc)
                .WithParameter("@end", endUtc);

            var results = new List<MetricRecord>();
            using var iterator = _metricsContainer.GetItemQueryIterator<MetricRecord>(query);

            while (iterator.HasMoreResults)
            {
                var response = await iterator.ReadNextAsync(ct);
                results.AddRange(response);
            }

            return results;
        }
        catch (CosmosException ex)
        {
            _logger.LogError(ex, "Cosmos DB query failed for metrics. MetricType: {MetricType}", metricType);
            throw;
        }
    }

    public async Task<List<LogEventRecord>> QueryLogEventsAsync(
        string studentContextKey,
        string eventName,
        DateTime startUtc,
        DateTime endUtc,
        CancellationToken ct)
    {
        try
        {
            var query = new QueryDefinition(
                "SELECT * FROM c WHERE c.student_context_key = @student " +
                "AND c.event_name = @eventName " +
                "AND c.event_time_utc >= @start " +
                "AND c.event_time_utc <= @end " +
                "ORDER BY c.event_time_utc ASC")
                .WithParameter("@student", studentContextKey)
                .WithParameter("@eventName", eventName)
                .WithParameter("@start", startUtc)
                .WithParameter("@end", endUtc);

            var results = new List<LogEventRecord>();
            using var iterator = _logsContainer.GetItemQueryIterator<LogEventRecord>(query);

            while (iterator.HasMoreResults)
            {
                var response = await iterator.ReadNextAsync(ct);
                results.AddRange(response);
            }

            return results;
        }
        catch (CosmosException ex)
        {
            _logger.LogError(ex, "Cosmos DB query failed for log events. EventName: {EventName}", eventName);
            throw;
        }
    }
}
