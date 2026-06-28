namespace OpencodeTelemetry.Api.Configuration;

public class TelemetryOptions
{
    public const string SectionName = "Telemetry";

    public string StudentContextKey { get; set; } = "as-2606-101-st-2606-1008";
    public string RepoKey { get; set; } = "ai-assisted-student-AS-2606-101-ST-2606-1008";
    public string ResourceGroupKey { get; set; } = "rg-as-2606-101-st-2606-1008";
    public OtlpOptions Otlp { get; set; } = new();
}

public class OtlpOptions
{
    public string AuthHeader { get; set; } = string.Empty;
    public string Endpoint { get; set; } = string.Empty;
}
