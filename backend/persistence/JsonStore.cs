using System.Linq.Expressions;
using System.Text.Json;

namespace BudgetTracker.Persistence;

public class JsonStore<T> : IStore<T> where T : class
{
    private readonly string _filePath;
    private readonly SemaphoreSlim _lock = new(1, 1);

    public JsonStore(string dataDirectory, string fileName)
    {
        Directory.CreateDirectory(dataDirectory);
        _filePath = Path.Combine(dataDirectory, fileName);
        if (!File.Exists(_filePath))
        {
            File.WriteAllText(_filePath, "[]");
        }
    }

    public async Task<IEnumerable<T>> GetAllAsync()
    {
        await _lock.WaitAsync();
        try
        {
            var json = await File.ReadAllTextAsync(_filePath);
            return JsonSerializer.Deserialize<List<T>>(json) ?? [];
        }
        finally
        {
            _lock.Release();
        }
    }

    public async Task<T?> GetByIdAsync(Guid id)
    {
        var items = await GetAllAsync();
        var prop = typeof(T).GetProperty("Id");
        if (prop == null) return null;
        return items.FirstOrDefault(e =>
            prop.GetValue(e) is Guid g && g == id);
    }

    public async Task<IEnumerable<T>> FindAsync(Expression<Func<T, bool>> predicate)
    {
        var items = await GetAllAsync();
        return items.AsQueryable().Where(predicate);
    }

    public async Task<T> AddAsync(T entity)
    {
        await _lock.WaitAsync();
        try
        {
            var json = await File.ReadAllTextAsync(_filePath);
            var items = JsonSerializer.Deserialize<List<T>>(json) ?? [];
            items.Add(entity);
            var options = new JsonSerializerOptions { WriteIndented = true };
            await File.WriteAllTextAsync(_filePath, JsonSerializer.Serialize(items, options));
            return entity;
        }
        finally
        {
            _lock.Release();
        }
    }

    public async Task<T> UpdateAsync(T entity)
    {
        await _lock.WaitAsync();
        try
        {
            var json = await File.ReadAllTextAsync(_filePath);
            var items = JsonSerializer.Deserialize<List<T>>(json) ?? [];
            var prop = typeof(T).GetProperty("Id");
            if (prop == null) return entity;

            var id = prop.GetValue(entity) as Guid?;
            if (id == null) return entity;

            var index = items.FindIndex(e =>
                prop.GetValue(e) is Guid g && g == id.Value);
            if (index >= 0)
            {
                items[index] = entity;
                var options = new JsonSerializerOptions { WriteIndented = true };
                await File.WriteAllTextAsync(_filePath, JsonSerializer.Serialize(items, options));
            }
            return entity;
        }
        finally
        {
            _lock.Release();
        }
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        await _lock.WaitAsync();
        try
        {
            var json = await File.ReadAllTextAsync(_filePath);
            var items = JsonSerializer.Deserialize<List<T>>(json) ?? [];
            var prop = typeof(T).GetProperty("Id");
            if (prop == null) return false;

            var removed = items.RemoveAll(e =>
                prop.GetValue(e) is Guid g && g == id);
            if (removed > 0)
            {
                var options = new JsonSerializerOptions { WriteIndented = true };
                await File.WriteAllTextAsync(_filePath, JsonSerializer.Serialize(items, options));
                return true;
            }
            return false;
        }
        finally
        {
            _lock.Release();
        }
    }
}
