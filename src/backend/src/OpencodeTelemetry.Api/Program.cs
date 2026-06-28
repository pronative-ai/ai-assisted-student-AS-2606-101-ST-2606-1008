using OpencodeTelemetry.Api.Application.Aggregation;
using OpencodeTelemetry.Api.Application.Normalization;
using OpencodeTelemetry.Api.Configuration;
using OpencodeTelemetry.Api.Endpoints.Ingestion;
using OpencodeTelemetry.Api.Endpoints.Query;
using OpencodeTelemetry.Api.Infrastructure.Cosmos;
using OpencodeTelemetry.Api.Infrastructure.Observability;
using Microsoft.Azure.Cosmos;

var builder = WebApplication.CreateBuilder(args);

builder.Services.Configure<CosmosOptions>(builder.Configuration.GetSection(CosmosOptions.SectionName));
builder.Services.Configure<TelemetryOptions>(builder.Configuration.GetSection(TelemetryOptions.SectionName));

builder.Services.AddSingleton(sp =>
{
    var options = sp.GetRequiredService<Microsoft.Extensions.Options.IOptions<CosmosOptions>>().Value;
    if (string.IsNullOrEmpty(options.ConnectionString))
        return null!;
    return new CosmosClient(options.ConnectionString);
});

builder.Services.AddScoped<ICosmosTelemetryRepository, CosmosTelemetryRepository>();
builder.Services.AddScoped<MetricNormalizer>();
builder.Services.AddScoped<LogEventNormalizer>();
builder.Services.AddScoped<TokenAggregationService>();

if (!string.IsNullOrEmpty(builder.Configuration["ApplicationInsights:ConnectionString"]))
{
    builder.Services.AddApplicationInsightsTelemetry();
    builder.Services.AddSingleton<ITelemetryEventPublisher, AppInsightsTelemetryPublisher>();
}
else
{
    builder.Services.AddSingleton<ITelemetryEventPublisher, NullTelemetryPublisher>();
}

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader();
    });
});

var app = builder.Build();

app.UseCors();

app.MapGet("/health", () => Results.Ok(new { status = "healthy" }));

app.MapGet("/version", () => Results.Ok(new
{
    service = "opencode-telemetry-api",
    version = "1.0.0",
    intent = "intent-2606-101-1008-0004"
}));

app.MapPost("/otlp/v1/metrics", OtlpMetricsEndpoint.HandleAsync);
app.MapPost("/otlp/v1/logs", OtlpLogsEndpoint.HandleAsync);

app.MapGet("/api/opencode/token-usage", TokenUsageEndpoint.HandleAsync);
app.MapGet("/api/opencode/token-usage/series", TokenSeriesEndpoint.HandleAsync);
app.MapGet("/api/opencode/logs/api-request", LogQueryEndpoints.HandleApiRequestAsync);
app.MapGet("/api/opencode/logs/api-error", LogQueryEndpoints.HandleApiErrorAsync);

app.Run();
