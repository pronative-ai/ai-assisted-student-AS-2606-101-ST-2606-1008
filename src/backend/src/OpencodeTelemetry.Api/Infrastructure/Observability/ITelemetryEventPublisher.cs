namespace OpencodeTelemetry.Api.Infrastructure.Observability;

public interface ITelemetryEventPublisher
{
    void ReportIngestionFailure(string stage, string reason, string? correlationId = null);
    void ReportNormalizationFailure(string stage, string reason, string? signalName = null);
    void ReportPersistenceFailure(string stage, string reason, string? signalName = null);
    void ReportQueryFailure(string stage, string reason, string? queryType = null);
    void ReportDatastoreAccessError(string stage, string reason);
}
