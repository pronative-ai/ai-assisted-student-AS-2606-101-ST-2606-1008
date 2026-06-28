using System.Linq;
using System.Text;
using System.Text.Json;

namespace OpencodeTelemetry.Api.Infrastructure.Otlp;

public static class OtlpLogsParser
{
    public static List<OtlpLogPayload>? Parse(byte[] body)
    {
        try
        {
            var json = Encoding.UTF8.GetString(body);
            using var doc = JsonDocument.Parse(json);

            var results = new List<OtlpLogPayload>();

            if (doc.RootElement.TryGetProperty("resourceLogs", out var resourceLogs))
            {
                foreach (var rl in resourceLogs.EnumerateArray())
                {
                    if (!rl.TryGetProperty("scopeLogs", out var scopeLogs)) continue;

                    foreach (var scopeLog in scopeLogs.EnumerateArray()
                                 .Select(sl => new
                                 {
                                     ScopeLog = sl,
                                     HasLogRecords = sl.TryGetProperty("logRecords", out var logRecords),
                                     LogRecords = logRecords
                                 })
                                 .Where(x => x.HasLogRecords))
                    {
                        foreach (var logRecord in scopeLog.LogRecords.EnumerateArray())
                        {
                            var payload = new OtlpLogPayload();

                            if (logRecord.TryGetProperty("timeUnixNano", out var timeProp))
                                payload.TimeUnixNano = long.Parse(timeProp.GetString() ?? "0");

                            if (logRecord.TryGetProperty("body", out var bodyProp))
                                payload.BodyText = ExtractBodyText(bodyProp);

                            if (logRecord.TryGetProperty("attributes", out var attrs))
                            {
                                var dict = new Dictionary<string, object>();
                                foreach (var attr in attrs.EnumerateArray())
                                {
                                    var key = attr.GetProperty("key").GetString() ?? "";
                                    if (attr.TryGetProperty("value", out var val))
                                        dict[key] = ExtractStringValue(val);
                                }
                                payload.Attributes = dict;

                                if (dict.TryGetValue("event.name", out var eventName))
                                    payload.EventName = eventName.ToString() ?? string.Empty;
                            }

                            results.Add(payload);
                        }
                    }
                }
            }

            return results.Count > 0 ? results : null;
        }
        catch (JsonException)
        {
            return null;
        }
        catch (FormatException)
        {
            return null;
        }
        catch (OverflowException)
        {
            return null;
        }
        catch (InvalidOperationException)
        {
            return null;
        }
        catch
        {
            return null;
        }
    }

    private static string? ExtractBodyText(JsonElement body)
    {
        if (body.TryGetProperty("stringValue", out var sv))
            return sv.GetString();
        return body.GetRawText();
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
