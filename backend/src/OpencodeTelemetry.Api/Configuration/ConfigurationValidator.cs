namespace OpencodeTelemetry.Api.Configuration;

public static class ConfigurationValidator
{
    public static void ValidateRequiredConfiguration(string? value, string configKey, string? secretRef)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            var message = string.IsNullOrWhiteSpace(secretRef)
                ? $"Required configuration '{configKey}' is not set and no Key Vault secret reference was provided."
                : $"Required configuration '{configKey}' (secret reference: '{secretRef}') could not be resolved from Key Vault or configuration.";

            throw new InvalidOperationException(message);
        }
    }

    public static void ValidateOtlpEndpoint(string? endpoint)
    {
        if (string.IsNullOrWhiteSpace(endpoint))
            return;

        try
        {
            var uri = new Uri(endpoint);

            if (!string.IsNullOrEmpty(uri.UserInfo))
            {
                throw new InvalidOperationException(
                    $"Configuration 'Telemetry:Otlp:Endpoint' must not contain embedded credentials. " +
                    $"The endpoint URI includes user information which is not permitted.");
            }

            var query = uri.Query;
            if (!string.IsNullOrEmpty(query) &&
                (query.Contains("secret", StringComparison.OrdinalIgnoreCase) ||
                 query.Contains("token", StringComparison.OrdinalIgnoreCase) ||
                 query.Contains("key", StringComparison.OrdinalIgnoreCase) ||
                 query.Contains("auth", StringComparison.OrdinalIgnoreCase) ||
                 query.Contains("password", StringComparison.OrdinalIgnoreCase) ||
                 query.Contains("credential", StringComparison.OrdinalIgnoreCase)))
            {
                throw new InvalidOperationException(
                    $"Configuration 'Telemetry:Otlp:Endpoint' must not contain embedded credentials in the query string.");
            }
        }
        catch (InvalidOperationException)
        {
            throw;
        }
        catch (UriFormatException ex)
        {
            throw new InvalidOperationException(
                $"Configuration 'Telemetry:Otlp:Endpoint' is not a valid URI: {ex.Message}");
        }
    }
}
