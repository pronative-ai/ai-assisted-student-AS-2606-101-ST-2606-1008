using BudgetTracker.Api.Models;
using BudgetTracker.Domain;
using BudgetTracker.Persistence;

namespace BudgetTracker.Api.Services;

public class ExpenseService
{
    private readonly IStore<Expense> _expenseStore;
    private readonly ExpenseSettings _settings;

    public ExpenseService(IStore<Expense> expenseStore, ExpenseSettings settings)
    {
        _expenseStore = expenseStore;
        _settings = settings;
    }

    public async Task<(ExpenseResponse? Response, List<ValidationError> Errors)> CreateAsync(CreateExpenseRequest request)
    {
        var errors = Validate(request);
        if (errors.Count > 0)
        {
            return (null, errors);
        }

        var expense = new Expense
        {
            Id = Guid.NewGuid(),
            Amount = request.Amount,
            Date = request.Date,
            Category = request.Category,
            Description = string.IsNullOrWhiteSpace(request.Description) ? null : request.Description,
            CreatedAt = DateTime.UtcNow
        };

        await _expenseStore.AddAsync(expense);

        return (MapToResponse(expense), errors);
    }

    public async Task<List<ExpenseResponse>> GetAllAsync()
    {
        var expenses = await _expenseStore.GetAllAsync();
        return expenses
            .OrderBy(e => e.Date)
            .ThenBy(e => e.CreatedAt)
            .Select(MapToResponse)
            .ToList();
    }

    public string[] GetAllowedCategories() => _settings.AllowedCategories;

    private List<ValidationError> Validate(CreateExpenseRequest request)
    {
        var errors = new List<ValidationError>();

        if (request.Amount <= 0)
        {
            errors.Add(new ValidationError
            {
                Field = "amount",
                Message = "Amount must be greater than 0"
            });
        }

        if (string.IsNullOrWhiteSpace(request.Date))
        {
            errors.Add(new ValidationError
            {
                Field = "date",
                Message = "Date is required"
            });
        }
        else if (!DateOnly.TryParse(request.Date, out var parsedDate))
        {
            errors.Add(new ValidationError
            {
                Field = "date",
                Message = "Date must be a valid date in yyyy-MM-dd format"
            });
        }
        else if (parsedDate > DateOnly.FromDateTime(DateTime.Today))
        {
            errors.Add(new ValidationError
            {
                Field = "date",
                Message = "Date cannot be in the future"
            });
        }

        if (string.IsNullOrWhiteSpace(request.Category))
        {
            errors.Add(new ValidationError
            {
                Field = "category",
                Message = "Category is required"
            });
        }
        else if (!_settings.AllowedCategories.Contains(request.Category, StringComparer.OrdinalIgnoreCase))
        {
            errors.Add(new ValidationError
            {
                Field = "category",
                Message = $"Category '{request.Category}' is not allowed. Allowed categories: {string.Join(", ", _settings.AllowedCategories)}"
            });
        }

        if (request.Description?.Length > 250)
        {
            errors.Add(new ValidationError
            {
                Field = "description",
                Message = "Description must not exceed 250 characters"
            });
        }

        return errors;
    }

    private static ExpenseResponse MapToResponse(Expense expense)
    {
        return new ExpenseResponse
        {
            ExpenseId = expense.Id,
            Amount = expense.Amount,
            Date = expense.Date,
            Category = expense.Category,
            Description = expense.Description
        };
    }
}
