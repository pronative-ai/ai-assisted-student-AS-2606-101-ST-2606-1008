namespace BudgetTracker.Api.Models;

public class ExpenseResponse
{
    public Guid ExpenseId { get; set; }
    public decimal Amount { get; set; }
    public string Date { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string? Description { get; set; }
}
