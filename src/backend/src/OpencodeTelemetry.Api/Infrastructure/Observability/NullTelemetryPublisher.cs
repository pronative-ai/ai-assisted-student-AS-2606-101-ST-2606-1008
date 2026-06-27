namespace OpencodeTelemetry.Api.Infrastructure.Observability;

public class NullTelemetryPublisher : ITelemetryEventPublisher
{
    public void ReportIngestionFailure(string stage, string reason, string? correlationId = null) { }
    public void ReportNormalizationFailure(string stage, string reason, string? signalName = null) { }
    public void ReportPersistenceFailure(string stage, string reason, string? signalName = null) { }
    public void ReportQueryFailure(string stage, string reason, string? queryType = null) { }
    public void ReportDatastoreAccessError(string stage, string reason) { }
}
