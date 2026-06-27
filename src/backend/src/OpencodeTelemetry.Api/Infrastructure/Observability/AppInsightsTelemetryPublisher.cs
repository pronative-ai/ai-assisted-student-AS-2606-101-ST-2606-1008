using Microsoft.ApplicationInsights;
using Microsoft.ApplicationInsights.DataContracts;

namespace OpencodeTelemetry.Api.Infrastructure.Observability;

public class AppInsightsTelemetryPublisher : ITelemetryEventPublisher
{
    private readonly TelemetryClient _telemetryClient;

    public AppInsightsTelemetryPublisher(TelemetryClient telemetryClient)
    {
        _telemetryClient = telemetryClient;
    }

    public void ReportIngestionFailure(string stage, string reason, string? correlationId = null)
    {
        var evt = new EventTelemetry("IngestionFailure");
        evt.Properties["Stage"] = stage;
        evt.Properties["Reason"] = reason;
        if (correlationId != null) evt.Properties["CorrelationId"] = correlationId;
        _telemetryClient.TrackEvent(evt);
    }

    public void ReportNormalizationFailure(string stage, string reason, string? signalName = null)
    {
        var evt = new EventTelemetry("NormalizationFailure");
        evt.Properties["Stage"] = stage;
        evt.Properties["Reason"] = reason;
        if (signalName != null) evt.Properties["SignalName"] = signalName;
        _telemetryClient.TrackEvent(evt);
    }

    public void ReportPersistenceFailure(string stage, string reason, string? signalName = null)
    {
        var evt = new EventTelemetry("PersistenceFailure");
        evt.Properties["Stage"] = stage;
        evt.Properties["Reason"] = reason;
        if (signalName != null) evt.Properties["SignalName"] = signalName;
        _telemetryClient.TrackEvent(evt);
    }

    public void ReportQueryFailure(string stage, string reason, string? queryType = null)
    {
        var evt = new EventTelemetry("QueryFailure");
        evt.Properties["Stage"] = stage;
        evt.Properties["Reason"] = reason;
        if (queryType != null) evt.Properties["QueryType"] = queryType;
        _telemetryClient.TrackEvent(evt);
    }

    public void ReportDatastoreAccessError(string stage, string reason)
    {
        var evt = new EventTelemetry("DatastoreAccessError");
        evt.Properties["Stage"] = stage;
        evt.Properties["Reason"] = reason;
        _telemetryClient.TrackEvent(evt);
    }
}
