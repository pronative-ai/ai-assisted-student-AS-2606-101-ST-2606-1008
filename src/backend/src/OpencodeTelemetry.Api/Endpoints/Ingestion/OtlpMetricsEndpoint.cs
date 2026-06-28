using System.IO;
using System.Linq;
using OpencodeTelemetry.Api.Application.Normalization;
using OpencodeTelemetry.Api.Infrastructure.Cosmos;
using OpencodeTelemetry.Api.Infrastructure.Observability;

namespace OpencodeTelemetry.Api.Endpoints.Ingestion;

public static class OtlpMetricsEndpoint
{
    private static readonly HashSet<string> AllowedMetricNames = new()
    {
        "opencode.token.usage"
    };

    public static async Task<IResult> HandleAsync(
        HttpRequest request,
        MetricNormalizer normalizer,
        ICosmosTelemetryRepository repository,
        ITelemetryEventPublisher telemetry,
        ILoggerFactory loggerFactory,
        CancellationToken ct)
    {
        var logger = loggerFactory.CreateLogger("OtlpMetricsEndpoint");

        if (request.ContentType is null ||
            (!request.ContentType.StartsWith("application/json", StringComparison.OrdinalIgnoreCase) &&
             !request.ContentType.StartsWith("application/x-protobuf", StringComparison.OrdinalIgnoreCase)))
        {
            telemetry.ReportIngestionFailure("OtlpMetricsEndpoint", "Unsupported content type", request.ContentType);
            return Results.StatusCode(415);
        }

        try
        {
            using var ms = new MemoryStream();
            await request.Body.CopyToAsync(ms, ct);
            var body = ms.ToArray();

            if (body.Length == 0)
            {
                telemetry.ReportIngestionFailure("OtlpMetricsEndpoint", "Empty request body");
                return Results.BadRequest(new { error = "Empty request body" });
            }

            var payload = OpencodeTelemetry.Api.Infrastructure.Otlp.OtlpMetricsParser.Parse(body);

            if (payload == null)
            {
                telemetry.ReportIngestionFailure("OtlpMetricsEndpoint", "Failed to parse OTLP metrics payload");
                return Results.BadRequest(new { error = "Invalid OTLP metrics payload" });
            }

            var persistedCount = 0;

            foreach (var metric in payload.Where(metric => AllowedMetricNames.Contains(metric.SignalName)))
            {
                foreach (var datapoint in metric.DataPoints)
                {
                    try
                    {
                        if (normalizer.TryNormalize(
                                datapoint.MetricType,
                                datapoint.TimeUnixNano,
                                datapoint.CumulativeValue,
                                null,
                                out var record))
                        {
                            await repository.PersistMetricAsync(record!, ct);
                            persistedCount++;
                        }
                    }
                    catch (Exception ex)
                    {
                        telemetry.ReportPersistenceFailure("OtlpMetricsEndpoint", ex.Message, metric.SignalName);
                        throw;
                    }
                }
            }

            logger.LogInformation("Ingested {Count} metric records", persistedCount);
            return Results.Ok(new { ingested = persistedCount });
        }
        catch (InvalidDataException ex)
        {
            telemetry.ReportIngestionFailure("OtlpMetricsEndpoint", ex.Message);
            logger.LogWarning(ex, "OTLP metrics ingestion failed due to invalid data");
            return Results.BadRequest(new { error = "Invalid OTLP metrics payload" });
        }
        catch (FormatException ex)
        {
            telemetry.ReportIngestionFailure("OtlpMetricsEndpoint", ex.Message);
            logger.LogWarning(ex, "OTLP metrics ingestion failed due to malformed payload");
            return Results.BadRequest(new { error = "Invalid OTLP metrics payload" });
        }
        catch (IOException ex)
        {
            telemetry.ReportIngestionFailure("OtlpMetricsEndpoint", ex.Message);
            logger.LogError(ex, "OTLP metrics ingestion failed due to I/O error");
            return Results.StatusCode(500);
        }
        catch (OperationCanceledException ex) when (ct.IsCancellationRequested)
        {
            telemetry.ReportIngestionFailure("OtlpMetricsEndpoint", "Request was canceled");
            logger.LogInformation(ex, "OTLP metrics ingestion was canceled");
            return Results.StatusCode(499);
        }
        catch (Exception ex)
        {
            telemetry.ReportIngestionFailure("OtlpMetricsEndpoint", ex.Message);
            logger.LogError(ex, "OTLP metrics ingestion failed");
            return Results.StatusCode(500);
        }
    }
}
