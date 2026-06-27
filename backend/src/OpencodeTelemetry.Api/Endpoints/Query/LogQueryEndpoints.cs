using OpencodeTelemetry.Api.Domain.Models;
using OpencodeTelemetry.Api.Infrastructure.Cosmos;
using OpencodeTelemetry.Api.Infrastructure.Observability;
using OpencodeTelemetry.Api.Configuration;
using Microsoft.Extensions.Options;

namespace OpencodeTelemetry.Api.Endpoints.Query;

public static class LogQueryEndpoints
{
    public static async Task<IResult> HandleApiRequestAsync(
        HttpRequest request,
        ICosmosTelemetryRepository repository,
        IOptions<TelemetryOptions> telemetryOptions,
        ITelemetryEventPublisher telemetry,
        ILoggerFactory loggerFactory,
        CancellationToken ct)
    {
        var logger = loggerFactory.CreateLogger("LogQueryEndpoints");
        return await HandleLogQueryAsync("api_request", request, repository, telemetryOptions, telemetry, logger, ct);
    }

    public static async Task<IResult> HandleApiErrorAsync(
        HttpRequest request,
        ICosmosTelemetryRepository repository,
        IOptions<TelemetryOptions> telemetryOptions,
        ITelemetryEventPublisher telemetry,
        ILoggerFactory loggerFactory,
        CancellationToken ct)
    {
        var logger = loggerFactory.CreateLogger("LogQueryEndpoints");
        return await HandleLogQueryAsync("api_error", request, repository, telemetryOptions, telemetry, logger, ct);
    }

    private static async Task<IResult> HandleLogQueryAsync(
        string eventName,
        HttpRequest request,
        ICosmosTelemetryRepository repository,
        IOptions<TelemetryOptions> telemetryOptions,
        ITelemetryEventPublisher telemetry,
        ILogger logger,
        CancellationToken ct)
    {
        var (start, end, error) = Endpoints.Query.TokenUsageEndpoint.ParseTimeRange(request.Query);
        if (error != null)
            return Results.BadRequest(new { error });

        try
        {
            var records = await repository.QueryLogEventsAsync(
                telemetryOptions.Value.StudentContextKey,
                eventName,
                start!.Value,
                end!.Value,
                ct);

            var response = new LogQueryResponse
            {
                start = start.Value,
                end = end.Value,
                items = records.Select(r => new LogQueryItem
                {
                    event_name = r.event_name,
                    event_time_utc = r.event_time_utc,
                    body = r.body_text,
                    attributes = r.attributes
                }).ToList()
            };

            return Results.Ok(response);
        }
        catch (Exception ex)
        {
            telemetry.ReportQueryFailure("LogQueryEndpoints", ex.Message, eventName);
            logger.LogError(ex, "Log query failed for {EventName}", eventName);
            return Results.StatusCode(500);
        }
    }
}
