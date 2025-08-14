using FlyOverTeaching.Shared.Models;

namespace FlyOverTeaching.Client.Services;

public interface IScheduleService
{
    Task<List<ScheduleEntry>> GetScheduleAsync();
    Task<List<ScheduleEntry>> GetScheduleByDayAsync(string dayOfWeek);
    Task RefreshScheduleAsync();
    event Action? OnScheduleChanged;
}