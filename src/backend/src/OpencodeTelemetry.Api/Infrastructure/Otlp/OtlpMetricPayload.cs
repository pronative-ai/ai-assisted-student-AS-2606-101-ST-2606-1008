namespace OpencodeTelemetry.Api.Infrastructure.Otlp;

public class OtlpMetricPayload
{
    public string SignalName { get; set; } = string.Empty;
    public List<OtlpMetricDataPoint> DataPoints { get; set; } = new();
}

public class OtlpMetricDataPoint
{
    public string MetricType { get; set; } = string.Empty;
    public long TimeUnixNano { get; set; }
    public double CumulativeValue { get; set; }
}
