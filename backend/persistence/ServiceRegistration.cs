using Microsoft.Extensions.DependencyInjection;

namespace BudgetTracker.Persistence;

public static class ServiceRegistration
{
    public static IServiceCollection AddJsonPersistence(this IServiceCollection services, string dataDirectory)
    {
        var context = new DataContext(dataDirectory);
        services.AddSingleton(context);
        services.AddSingleton(context.Categories);
        services.AddSingleton(context.Expenses);
        services.AddSingleton(context.Budgets);
        return services;
    }
}
