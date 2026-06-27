using OpencodeTelemetry.Api.Application.Normalization;
using OpencodeTelemetry.Api.Infrastructure.Cosmos;
using OpencodeTelemetry.Api.Infrastructure.Observability;

namespace OpencodeTelemetry.Api.Endpoints.Ingestion;

public static class OtlpLogsEndpoint
{
    public static async Task<IResult> HandleAsync(
        HttpRequest request,
        LogEventNormalizer normalizer,
        ICosmosTelemetryRepository repository,
        ITelemetryEventPublisher telemetry,
        ILoggerFactory loggerFactory,
        CancellationToken ct)
    {
        var logger = loggerFactory.CreateLogger("OtlpLogsEndpoint");

        if (request.ContentType is null ||
            (!request.ContentType.StartsWith("application/json", StringComparison.OrdinalIgnoreCase) &&
             !request.ContentType.StartsWith("application/x-protobuf", StringComparison.OrdinalIgnoreCase)))
        {
            telemetry.ReportIngestionFailure("OtlpLogsEndpoint", "Unsupported content type", request.ContentType);
            return Results.StatusCode(415);
        }

        try
        {
            using var ms = new MemoryStream();
            await request.Body.CopyToAsync(ms, ct);
            var body = ms.ToArray();

            if (body.Length == 0)
            {
                telemetry.ReportIngestionFailure("OtlpLogsEndpoint", "Empty request body");
                return Results.BadRequest(new { error = "Empty request body" });
            }

            var payload = OpencodeTelemetry.Api.Infrastructure.Otlp.OtlpLogsParser.Parse(body);

            if (payload == null)
            {
                telemetry.ReportIngestionFailure("OtlpLogsEndpoint", "Failed to parse OTLP logs payload");
                return Results.BadRequest(new { error = "Invalid OTLP logs payload" });
            }

            var persistedCount = 0;

            foreach (var logEvent in payload)
            {
                if (!normalizer.TryNormalize(
                        logEvent.EventName,
                        logEvent.TimeUnixNano,
                        logEvent.BodyText,
                        logEvent.Attributes,
                        null,
                        out var record) || record == null)
                    continue;

                try
                {
                    await repository.PersistLogEventAsync(record, ct);
                    persistedCount++;
                }
                catch (Exception ex)
                {
                    telemetry.ReportPersistenceFailure("OtlpLogsEndpoint", ex.Message, logEvent.EventName);
                    throw;
                }
            }

            logger.LogInformation("Ingested {Count} log event records", persistedCount);
            return Results.Ok(new { ingested = persistedCount });
        }
        catch (Exception ex)
        {
            telemetry.ReportIngestionFailure("OtlpLogsEndpoint", ex.Message);
            logger.LogError(ex, "OTLP logs ingestion failed");
            return Results.StatusCode(500);
        }
    }
}
