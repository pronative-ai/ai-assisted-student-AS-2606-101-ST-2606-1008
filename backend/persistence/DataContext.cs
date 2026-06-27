using BudgetTracker.Domain;

namespace BudgetTracker.Persistence;

public class DataContext
{
    public IStore<Category> Categories { get; }
    public IStore<Expense> Expenses { get; }
    public IStore<Budget> Budgets { get; }

    public DataContext(string dataDirectory)
    {
        Categories = new JsonStore<Category>(dataDirectory, "categories.json");
        Expenses = new JsonStore<Expense>(dataDirectory, "expenses.json");
        Budgets = new JsonStore<Budget>(dataDirectory, "budgets.json");
    }
}
