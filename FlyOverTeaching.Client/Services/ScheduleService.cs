using FlyOverTeaching.Shared.Models;

namespace FlyOverTeaching.Client.Services;

public class ScheduleService : IScheduleService
{
    private readonly IDatabaseService _databaseService;
    public event Action? OnScheduleChanged;

    public ScheduleService(IDatabaseService databaseService)
    {
        _databaseService = databaseService;
    }

    public async Task<List<ScheduleEntry>> GetScheduleAsync()
    {
        var entries = await _databaseService.GetScheduleEntriesAsync();
        return entries.OrderBy(e => e.SortOrder).ThenBy(e => e.TimeStart).ToList();
    }

    public async Task<List<ScheduleEntry>> GetScheduleByDayAsync(string dayOfWeek)
    {
        var entries = await GetScheduleAsync();
        if (dayOfWeek.ToLower() == "all")
            return entries;
            
        return entries.Where(e => e.DayOfWeek.ToLower() == dayOfWeek.ToLower() || e.DayOfWeek.ToLower() == "all").ToList();
    }

    public async Task RefreshScheduleAsync()
    {
        await Task.CompletedTask;
        OnScheduleChanged?.Invoke();
    }
}