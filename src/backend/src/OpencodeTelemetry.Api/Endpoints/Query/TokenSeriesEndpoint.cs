using OpencodeTelemetry.Api.Application.Aggregation;
using OpencodeTelemetry.Api.Configuration;
using Microsoft.Extensions.Options;

namespace OpencodeTelemetry.Api.Endpoints.Query;

public static class TokenSeriesEndpoint
{
    public static async Task<IResult> HandleAsync(
        HttpRequest request,
        TokenAggregationService aggregationService,
        IOptions<TelemetryOptions> telemetryOptions,
        ILoggerFactory loggerFactory,
        CancellationToken ct)
    {
        var logger = loggerFactory.CreateLogger("TokenSeriesEndpoint");

        var query = request.Query;

        if (!query.ContainsKey("interval"))
            return Results.BadRequest(new { error = "Missing required parameter: interval" });

        if (!TimeSpan.TryParse(query["interval"].ToString(), out var interval) || interval <= TimeSpan.Zero)
            return Results.BadRequest(new { error = "Invalid interval. Use duration format like 00:15:00 or 1.00:00:00." });

        var (start, end, error) = TokenUsageEndpoint.ParseTimeRange(query);
        if (error != null)
            return Results.BadRequest(new { error });

        try
        {
            var result = await aggregationService.GetSeriesAsync(
                telemetryOptions.Value.StudentContextKey,
                start!.Value,
                end!.Value,
                interval,
                ct);

            return Results.Ok(result);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Token series aggregation failed");
            return Results.StatusCode(500);
        }
    }
}
