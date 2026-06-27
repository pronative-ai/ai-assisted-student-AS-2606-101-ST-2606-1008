namespace OpencodeTelemetry.Api.Infrastructure.Otlp;

public class OtlpLogPayload
{
    public string EventName { get; set; } = string.Empty;
    public long TimeUnixNano { get; set; }
    public string? BodyText { get; set; }
    public Dictionary<string, object>? Attributes { get; set; }
}
