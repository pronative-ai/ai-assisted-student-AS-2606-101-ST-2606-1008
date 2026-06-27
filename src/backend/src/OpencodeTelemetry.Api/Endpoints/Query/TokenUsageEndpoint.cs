using OpencodeTelemetry.Api.Application.Aggregation;
using OpencodeTelemetry.Api.Configuration;
using Microsoft.Extensions.Options;

namespace OpencodeTelemetry.Api.Endpoints.Query;

public static class TokenUsageEndpoint
{
    public static async Task<IResult> HandleAsync(
        HttpRequest request,
        TokenAggregationService aggregationService,
        IOptions<TelemetryOptions> telemetryOptions,
        ILoggerFactory loggerFactory,
        CancellationToken ct)
    {
        var logger = loggerFactory.CreateLogger("TokenUsageEndpoint");

        var (start, end, error) = ParseTimeRange(request.Query);
        if (error != null)
            return Results.BadRequest(new { error });

        try
        {
            var result = await aggregationService.GetTotalsAsync(
                telemetryOptions.Value.StudentContextKey,
                start!.Value,
                end!.Value,
                ct);

            return Results.Ok(result);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Token usage aggregation failed");
            return Results.StatusCode(500);
        }
    }

    internal static (DateTime? start, DateTime? end, string? error) ParseTimeRange(IQueryCollection query)
    {
        if (!query.ContainsKey("start"))
            return (null, null, "Missing required parameter: start");

        if (!query.ContainsKey("end"))
            return (null, null, "Missing required parameter: end");

        if (!DateTime.TryParse(query["start"].ToString(), out var start))
            return (null, null, "Invalid start timestamp. Use ISO 8601 format.");

        if (!DateTime.TryParse(query["end"].ToString(), out var end))
            return (null, null, "Invalid end timestamp. Use ISO 8601 format.");

        if (start > end)
            return (null, null, "start must not be later than end");

        return (start.ToUniversalTime(), end.ToUniversalTime(), null);
    }
}
