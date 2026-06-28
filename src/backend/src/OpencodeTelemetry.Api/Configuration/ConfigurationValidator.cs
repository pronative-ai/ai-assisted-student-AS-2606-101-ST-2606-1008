namespace OpencodeTelemetry.Api.Configuration;

public static class ConfigurationValidator
{
    public static void ValidateRequiredConfiguration(IConfiguration configuration)
    {
        var cosmosConnectionString = configuration["CosmosDb:ConnectionString"];
        if (string.IsNullOrWhiteSpace(cosmosConnectionString))
            throw new InvalidOperationException(
                "Required configuration 'CosmosDb:ConnectionString' could not be resolved from Key Vault.");

        var otlpAuthHeader = configuration["Telemetry:Otlp:AuthHeader"];
        if (string.IsNullOrWhiteSpace(otlpAuthHeader))
            throw new InvalidOperationException(
                "Required configuration 'Telemetry:Otlp:AuthHeader' could not be resolved from Key Vault.");

        var otlpEndpoint = configuration["Telemetry:Otlp:Endpoint"];
        if (!string.IsNullOrEmpty(otlpEndpoint) &&
            Uri.TryCreate(otlpEndpoint, UriKind.Absolute, out var endpointUri) &&
            !string.IsNullOrEmpty(endpointUri.UserInfo))
        {
            throw new InvalidOperationException(
                "Configuration 'Telemetry:Otlp:Endpoint' must not contain embedded credentials.");
        }
    }
}
