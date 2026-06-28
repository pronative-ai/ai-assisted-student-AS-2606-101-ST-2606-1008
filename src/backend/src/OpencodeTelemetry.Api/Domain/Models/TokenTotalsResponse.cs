namespace OpencodeTelemetry.Api.Domain.Models;

public class TokenTotalsResponse
{
    public DateTime start { get; set; }
    public DateTime end { get; set; }
    public string student_context_key { get; set; } = string.Empty;
    public MetricTypeValues totals { get; set; } = new();
    public bool isComplete { get; set; } = true;
    public string derivation_note { get; set; } =
        "Derived from cumulative opencode.token.usage counter deltas using time_unix_nano. Raw cumulative snapshots are not usage totals.";
}

public class MetricTypeValues
{
    public long input { get; set; }
    public long output { get; set; }
    public long reasoning { get; set; }
    public long cacheRead { get; set; }
    public long cacheCreation { get; set; }
}
