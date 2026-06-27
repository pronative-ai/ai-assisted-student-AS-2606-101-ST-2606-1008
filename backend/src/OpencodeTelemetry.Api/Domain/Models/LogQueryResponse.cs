namespace OpencodeTelemetry.Api.Domain.Models;

public class LogQueryResponse
{
    public DateTime start { get; set; }
    public DateTime end { get; set; }
    public List<LogQueryItem> items { get; set; } = new();
}

public class LogQueryItem
{
    public string event_name { get; set; } = string.Empty;
    public DateTime event_time_utc { get; set; }
    public string? body { get; set; }
    public Dictionary<string, object>? attributes { get; set; }
}
