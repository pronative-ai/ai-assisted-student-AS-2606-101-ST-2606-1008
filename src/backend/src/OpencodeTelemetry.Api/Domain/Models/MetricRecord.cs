namespace OpencodeTelemetry.Api.Domain.Models;

public class MetricRecord
{
    public string id { get; set; } = Guid.NewGuid().ToString();
    public string student_context_key { get; set; } = string.Empty;
    public string repo_key { get; set; } = string.Empty;
    public string resource_group_key { get; set; } = string.Empty;
    public string signal_name { get; set; } = "opencode.token.usage";
    public string metric_type { get; set; } = string.Empty;
    public long time_unix_nano { get; set; }
    public DateTime event_time_utc { get; set; }
    public double cumulative_value { get; set; }
    public DateTime ingested_at_utc { get; set; } = DateTime.UtcNow;
    public string source_transport { get; set; } = "otlp_http_protobuf";
}
