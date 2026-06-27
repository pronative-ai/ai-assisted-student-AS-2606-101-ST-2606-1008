namespace OpencodeTelemetry.Api.Configuration;

public class CosmosOptions
{
    public const string SectionName = "Cosmos";

    public string ConnectionString { get; set; } = string.Empty;
    public string DatabaseId { get; set; } = "opencode-telemetry";
    public string MetricsContainerId { get; set; } = "metrics";
    public string LogsContainerId { get; set; } = "logs";
}
