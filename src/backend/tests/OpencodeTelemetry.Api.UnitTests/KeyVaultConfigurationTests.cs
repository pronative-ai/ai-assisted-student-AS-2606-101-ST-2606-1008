using OpencodeTelemetry.Api.Configuration;
using Microsoft.Extensions.Configuration;

namespace OpencodeTelemetry.Api.UnitTests;

public class KeyVaultConfigurationTests
{
    [Fact]
    public void ValidateRequiredConfiguration_WithAllValuesSet_Passes()
    {
        var config = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["CosmosDb:ConnectionString"] = "AccountEndpoint=https://test.documents.azure.com:443/;AccountKey=testkey==;",
                ["Telemetry:Otlp:AuthHeader"] = "test-auth-header",
                ["Telemetry:Otlp:Endpoint"] = "https://collector.example.com:4318"
            })
            .Build();

        var exception = Record.Exception(() => ConfigurationValidator.ValidateRequiredConfiguration(config));
        Assert.Null(exception);
    }

    [Fact]
    public void ValidateRequiredConfiguration_WithAllValuesSetAndNoOtlpEndpoint_Passes()
    {
        var config = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["CosmosDb:ConnectionString"] = "AccountEndpoint=https://test.documents.azure.com:443/;AccountKey=testkey==;",
                ["Telemetry:Otlp:AuthHeader"] = "test-auth-header"
            })
            .Build();

        var exception = Record.Exception(() => ConfigurationValidator.ValidateRequiredConfiguration(config));
        Assert.Null(exception);
    }

    [Fact]
    public void ValidateRequiredConfiguration_MissingCosmosDbConnectionString_Throws()
    {
        var config = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["Telemetry:Otlp:AuthHeader"] = "test-auth-header"
            })
            .Build();

        var ex = Assert.Throws<InvalidOperationException>(() =>
            ConfigurationValidator.ValidateRequiredConfiguration(config));
        Assert.Contains("CosmosDb:ConnectionString", ex.Message);
    }

    [Fact]
    public void ValidateRequiredConfiguration_EmptyCosmosDbConnectionString_Throws()
    {
        var config = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["CosmosDb:ConnectionString"] = "",
                ["Telemetry:Otlp:AuthHeader"] = "test-auth-header"
            })
            .Build();

        var ex = Assert.Throws<InvalidOperationException>(() =>
            ConfigurationValidator.ValidateRequiredConfiguration(config));
        Assert.Contains("CosmosDb:ConnectionString", ex.Message);
    }

    [Fact]
    public void ValidateRequiredConfiguration_MissingOtlpAuthHeader_Throws()
    {
        var config = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["CosmosDb:ConnectionString"] = "AccountEndpoint=https://test.documents.azure.com:443/;AccountKey=testkey==;"
            })
            .Build();

        var ex = Assert.Throws<InvalidOperationException>(() =>
            ConfigurationValidator.ValidateRequiredConfiguration(config));
        Assert.Contains("Telemetry:Otlp:AuthHeader", ex.Message);
    }

    [Fact]
    public void ValidateRequiredConfiguration_EmptyOtlpAuthHeader_Throws()
    {
        var config = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["CosmosDb:ConnectionString"] = "AccountEndpoint=https://test.documents.azure.com:443/;AccountKey=testkey==;",
                ["Telemetry:Otlp:AuthHeader"] = ""
            })
            .Build();

        var ex = Assert.Throws<InvalidOperationException>(() =>
            ConfigurationValidator.ValidateRequiredConfiguration(config));
        Assert.Contains("Telemetry:Otlp:AuthHeader", ex.Message);
    }

    [Fact]
    public void ValidateRequiredConfiguration_OtlpEndpointWithEmbeddedCredentials_Throws()
    {
        var config = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["CosmosDb:ConnectionString"] = "AccountEndpoint=https://test.documents.azure.com:443/;AccountKey=testkey==;",
                ["Telemetry:Otlp:AuthHeader"] = "test-auth-header",
                ["Telemetry:Otlp:Endpoint"] = "https://user:pass@collector.example.com:4318"
            })
            .Build();

        var ex = Assert.Throws<InvalidOperationException>(() =>
            ConfigurationValidator.ValidateRequiredConfiguration(config));
        Assert.Contains("Telemetry:Otlp:Endpoint", ex.Message);
    }

    [Fact]
    public void ValidateRequiredConfiguration_ErrorMessageDoesNotContainSecretValues()
    {
        var config = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["CosmosDb:ConnectionString"] = ""
            })
            .Build();

        var ex = Assert.Throws<InvalidOperationException>(() =>
            ConfigurationValidator.ValidateRequiredConfiguration(config));

        Assert.DoesNotContain("AccountEndpoint", ex.Message);
        Assert.DoesNotContain("AccountKey", ex.Message);
        Assert.Contains("CosmosDb:ConnectionString", ex.Message);
    }
}
