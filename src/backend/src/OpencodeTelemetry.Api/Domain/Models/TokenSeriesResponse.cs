namespace OpencodeTelemetry.Api.Domain.Models;

public class TokenSeriesResponse
{
    public DateTime start { get; set; }
    public DateTime end { get; set; }
    public string interval { get; set; } = string.Empty;
    public string student_context_key { get; set; } = string.Empty;
    public bool isComplete { get; set; } = true;
    public List<SeriesBucket> series { get; set; } = new();
}

public class SeriesBucket
{
    public DateTime bucket_start { get; set; }
    public DateTime bucket_end { get; set; }
    public MetricTypeValues values { get; set; } = new();
}
