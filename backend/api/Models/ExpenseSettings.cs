namespace BudgetTracker.Api.Models;

public class ExpenseSettings
{
    public string[] AllowedCategories { get; set; } = [];
    public string Currency { get; set; } = "INR";
}
