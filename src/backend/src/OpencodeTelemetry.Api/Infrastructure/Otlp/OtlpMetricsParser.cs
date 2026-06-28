using System.Linq;
using System.Text.Json;

namespace OpencodeTelemetry.Api.Infrastructure.Otlp;

public static class OtlpMetricsParser
{
    public static List<OtlpMetricPayload>? Parse(byte[] body)
    {
        try
        {
            var json = System.Text.Encoding.UTF8.GetString(body);
            using var doc = JsonDocument.Parse(json);

            var results = new List<OtlpMetricPayload>();

            if (doc.RootElement.TryGetProperty("resourceMetrics", out var resourceMetrics))
            {
                foreach (var resourceMetric in resourceMetrics.EnumerateArray()
                             .Select(rm => new { rm, hasScopeMetrics = rm.TryGetProperty("scopeMetrics", out var scopeMetrics), scopeMetrics })
                             .Where(x => x.hasScopeMetrics))
                {
                    foreach (var scopeMetric in resourceMetric.scopeMetrics.EnumerateArray()
                                 .Select(sm => new { sm, hasMetrics = sm.TryGetProperty("metrics", out var metrics), metrics })
                                 .Where(x => x.hasMetrics))
                    {
                        foreach (var metric in scopeMetric.metrics.EnumerateArray())
                        {
                            var signalName = metric.GetProperty("name").GetString() ?? string.Empty;
                            var payload = new OtlpMetricPayload { SignalName = signalName };

                            if (TryExtractGaugeOrSum(metric, "sum", payload.DataPoints))
                            {
                                results.Add(payload);
                                continue;
                            }

                            if (TryExtractGaugeOrSum(metric, "gauge", payload.DataPoints))
                            {
                                results.Add(payload);
                            }
                        }
                    }
                }
            }

            return results.Count > 0 ? results : null;
        }
        catch
        {
            return null;
        }
    }

    private static bool TryExtractGaugeOrSum(
        JsonElement metric,
        string field,
        List<OtlpMetricDataPoint> dataPoints)
    {
        if (!metric.TryGetProperty(field, out var sum)) return false;
        if (!sum.TryGetProperty("dataPoints", out var dps)) return false;

        foreach (var dp in dps.EnumerateArray())
        {
            long timeUnixNano = 0;
            if (dp.TryGetProperty("timeUnixNano", out var timeProp))
                timeUnixNano = long.Parse(timeProp.GetString() ?? "0");

            double value = 0;
            if (dp.TryGetProperty("asDouble", out var asDouble))
                value = asDouble.GetDouble();
            else if (dp.TryGetProperty("asInt", out var asInt))
                value = asInt.GetInt64();

            var attributes = new Dictionary<string, string>();
            if (dp.TryGetProperty("attributes", out var attrs))
            {
                foreach (var attr in attrs.EnumerateArray())
                {
                    var key = attr.GetProperty("key").GetString() ?? "";
                    if (attr.TryGetProperty("value", out var val))
                    {
                        attributes[key] = ExtractStringValue(val);
                    }
                }
            }

            var metricType = attributes.GetValueOrDefault("opencode.token.type", "input");

            dataPoints.Add(new OtlpMetricDataPoint
            {
                MetricType = metricType,
                TimeUnixNano = timeUnixNano,
                CumulativeValue = value
            });
        }

        return dataPoints.Count > 0;
    }

    private static string ExtractStringValue(JsonElement value)
    {
        if (value.TryGetProperty("stringValue", out var sv))
            return sv.GetString() ?? string.Empty;
        if (value.TryGetProperty("intValue", out var iv))
            return iv.GetInt64().ToString();
        return string.Empty;
    }
}
