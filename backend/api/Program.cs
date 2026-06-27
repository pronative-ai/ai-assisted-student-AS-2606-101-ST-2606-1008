using System.Reflection;
using BudgetTracker.Persistence;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var dataDirectory = builder.Configuration.GetValue<string>("DataDirectory")
    ?? Path.Combine(AppContext.BaseDirectory, "data");
builder.Services.AddJsonPersistence(dataDirectory);

if (!string.IsNullOrEmpty(builder.Configuration["ApplicationInsights:ConnectionString"]))
{
    builder.Services.AddApplicationInsightsTelemetry();
}

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseCors();
app.UseHttpsRedirection();

app.MapGet("/health", () =>
{
    return Results.Ok(new
    {
        status = "healthy",
        timestamp = DateTime.UtcNow
    });
});

app.MapGet("/version", () =>
{
    var version = Assembly.GetExecutingAssembly()
        .GetCustomAttribute<AssemblyInformationalVersionAttribute>()
        ?.InformationalVersion
        ?? "1.0.0";
    return Results.Ok(new
    {
        version,
        environment = app.Environment.EnvironmentName
    });
});

app.Run();
