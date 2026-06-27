using OpencodeTelemetry.Api.Configuration;

namespace OpencodeTelemetry.Api.UnitTests;

public class ConfigurationValidatorTests
{
    [Fact]
    public void ValidateRequiredConfiguration_WithValidValue_DoesNotThrow()
    {
        var exception = Record.Exception(() =>
            ConfigurationValidator.ValidateRequiredConfiguration("valid-value", "Test:Key", "test-secret"));

        Assert.Null(exception);
    }

    [Fact]
    public void ValidateRequiredConfiguration_WithNullValue_ThrowsInvalidOperationException()
    {
        var ex = Assert.Throws<InvalidOperationException>(() =>
            ConfigurationValidator.ValidateRequiredConfiguration(null, "CosmosDb:ConnectionString", "cosmosdb-connection-string"));

        Assert.Contains("CosmosDb:ConnectionString", ex.Message);
        Assert.Contains("cosmosdb-connection-string", ex.Message);
        Assert.DoesNotContain("secret-value", ex.Message, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public void ValidateRequiredConfiguration_WithEmptyValue_ThrowsInvalidOperationException()
    {
        var ex = Assert.Throws<InvalidOperationException>(() =>
            ConfigurationValidator.ValidateRequiredConfiguration("", "CosmosDb:ConnectionString", "cosmosdb-connection-string"));

        Assert.Contains("CosmosDb:ConnectionString", ex.Message);
    }

    [Fact]
    public void ValidateRequiredConfiguration_WithWhitespaceValue_ThrowsInvalidOperationException()
    {
        var ex = Assert.Throws<InvalidOperationException>(() =>
            ConfigurationValidator.ValidateRequiredConfiguration("   ", "CosmosDb:ConnectionString", "cosmosdb-connection-string"));

        Assert.Contains("CosmosDb:ConnectionString", ex.Message);
    }

    [Fact]
    public void ValidateRequiredConfiguration_WithNullSecretRef_ProvidesAppropriateMessage()
    {
        var ex = Assert.Throws<InvalidOperationException>(() =>
            ConfigurationValidator.ValidateRequiredConfiguration(null, "CosmosDb:ConnectionString", null));

        Assert.Contains("no Key Vault secret reference was provided", ex.Message);
    }

    [Fact]
    public void ValidateOtlpEndpoint_WithNull_DoesNotThrow()
    {
        var exception = Record.Exception(() =>
            ConfigurationValidator.ValidateOtlpEndpoint(null));

        Assert.Null(exception);
    }

    [Fact]
    public void ValidateOtlpEndpoint_WithEmptyString_DoesNotThrow()
    {
        var exception = Record.Exception(() =>
            ConfigurationValidator.ValidateOtlpEndpoint(""));

        Assert.Null(exception);
    }

    [Fact]
    public void ValidateOtlpEndpoint_WithValidUri_DoesNotThrow()
    {
        var exception = Record.Exception(() =>
            ConfigurationValidator.ValidateOtlpEndpoint("https://collector.example.com:4318"));

        Assert.Null(exception);
    }

    [Fact]
    public void ValidateOtlpEndpoint_WithEmbeddedUserInfo_ThrowsInvalidOperationException()
    {
        var ex = Assert.Throws<InvalidOperationException>(() =>
            ConfigurationValidator.ValidateOtlpEndpoint("https://user:pass@collector.example.com"));

        Assert.Contains("Telemetry:Otlp:Endpoint", ex.Message);
        Assert.Contains("embedded credentials", ex.Message);
    }

    [Fact]
    public void ValidateOtlpEndpoint_WithSecretInQueryString_ThrowsInvalidOperationException()
    {
        var ex = Assert.Throws<InvalidOperationException>(() =>
            ConfigurationValidator.ValidateOtlpEndpoint("https://collector.example.com?secret=abc123"));

        Assert.Contains("embedded credentials", ex.Message);
    }

    [Fact]
    public void ValidateOtlpEndpoint_WithTokenInQueryString_ThrowsInvalidOperationException()
    {
        var ex = Assert.Throws<InvalidOperationException>(() =>
            ConfigurationValidator.ValidateOtlpEndpoint("https://collector.example.com?token=xyz789"));

        Assert.Contains("embedded credentials", ex.Message);
    }

    [Fact]
    public void ValidateOtlpEndpoint_WithKeyInQueryString_ThrowsInvalidOperationException()
    {
        var ex = Assert.Throws<InvalidOperationException>(() =>
            ConfigurationValidator.ValidateOtlpEndpoint("https://collector.example.com?api-key=abc"));

        Assert.Contains("embedded credentials", ex.Message);
    }

    [Fact]
    public void ValidateOtlpEndpoint_WithAuthInQueryString_ThrowsInvalidOperationException()
    {
        var ex = Assert.Throws<InvalidOperationException>(() =>
            ConfigurationValidator.ValidateOtlpEndpoint("https://collector.example.com?auth=bearer_token"));

        Assert.Contains("embedded credentials", ex.Message);
    }

    [Fact]
    public void ValidateOtlpEndpoint_WithPasswordInQueryString_ThrowsInvalidOperationException()
    {
        var ex = Assert.Throws<InvalidOperationException>(() =>
            ConfigurationValidator.ValidateOtlpEndpoint("https://collector.example.com?password=secret"));

        Assert.Contains("embedded credentials", ex.Message);
    }

    [Fact]
    public void ValidateOtlpEndpoint_WithCredentialInQueryString_ThrowsInvalidOperationException()
    {
        var ex = Assert.Throws<InvalidOperationException>(() =>
            ConfigurationValidator.ValidateOtlpEndpoint("https://collector.example.com?credential=abc"));

        Assert.Contains("embedded credentials", ex.Message);
    }

    [Fact]
    public void ValidateOtlpEndpoint_WithInvalidUriFormat_ThrowsInvalidOperationException()
    {
        var ex = Assert.Throws<InvalidOperationException>(() =>
            ConfigurationValidator.ValidateOtlpEndpoint("not-a-valid-uri"));

        Assert.Contains("Telemetry:Otlp:Endpoint", ex.Message);
        Assert.Contains("not a valid URI", ex.Message);
    }

    [Fact]
    public void ValidateOtlpEndpoint_WithSafeQueryParameters_DoesNotThrow()
    {
        var exception = Record.Exception(() =>
            ConfigurationValidator.ValidateOtlpEndpoint("https://collector.example.com?timeout=30&format=json"));

        Assert.Null(exception);
    }

    [Fact]
    public void ValidateRequiredConfiguration_ErrorIdentifiesKeyNotSecret()
    {
        var ex = Assert.Throws<InvalidOperationException>(() =>
            ConfigurationValidator.ValidateRequiredConfiguration(null, "CosmosDb:ConnectionString", "some-secret-ref"));

        Assert.Contains("CosmosDb:ConnectionString", ex.Message);
        Assert.Contains("some-secret-ref", ex.Message);
    }

    [Fact]
    public void ValidateOtlpEndpoint_ErrorDoesNotLeakSecretValue()
    {
        var secretEndpoint = "https://user:supersecret@collector.example.com";
        var ex = Assert.Throws<InvalidOperationException>(() =>
            ConfigurationValidator.ValidateOtlpEndpoint(secretEndpoint));

        Assert.DoesNotContain("supersecret", ex.Message, StringComparison.OrdinalIgnoreCase);
    }
}
