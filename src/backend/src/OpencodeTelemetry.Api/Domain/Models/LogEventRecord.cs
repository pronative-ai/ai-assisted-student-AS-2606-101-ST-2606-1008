namespace OpencodeTelemetry.Api.Domain.Models;

public class LogEventRecord
{
    public string id { get; set; } = Guid.NewGuid().ToString();
    public string student_context_key { get; set; } = string.Empty;
    public string repo_key { get; set; } = string.Empty;
    public string resource_group_key { get; set; } = string.Empty;
    public string event_name { get; set; } = string.Empty;
    public long time_unix_nano { get; set; }
    public DateTime event_time_utc { get; set; }
    public string? body_text { get; set; }
    public Dictionary<string, object>? attributes { get; set; }
    public DateTime ingested_at_utc { get; set; } = DateTime.UtcNow;
    public string source_transport { get; set; } = "otlp_http_protobuf";
}
