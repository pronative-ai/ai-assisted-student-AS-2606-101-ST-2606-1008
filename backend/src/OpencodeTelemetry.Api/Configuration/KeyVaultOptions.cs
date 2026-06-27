namespace OpencodeTelemetry.Api.Configuration;

public class KeyVaultOptions
{
    public const string SectionName = "KeyVault";

    public string VaultUri { get; set; } = string.Empty;
    public string CosmosDbConnectionStringSecretName { get; set; } = "cosmosdb-connection-string";
    public string TelemetryOtlpAuthHeaderSecretName { get; set; } = "telemetry-otlp-auth-header";
}
