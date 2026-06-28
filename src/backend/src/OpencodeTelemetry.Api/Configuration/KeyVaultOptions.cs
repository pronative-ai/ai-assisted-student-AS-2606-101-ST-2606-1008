namespace OpencodeTelemetry.Api.Configuration;

public class KeyVaultOptions
{
    public const string SectionName = "KeyVault";

    public string VaultUri { get; set; } = string.Empty;
}
