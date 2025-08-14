namespace FlyOverTeaching.Shared.Models;

public class ScheduleEntry
{
    public int Id { get; set; }
    public string TimeStart { get; set; } = string.Empty;
    public string TimeEnd { get; set; } = string.Empty;
    public string Subject { get; set; } = string.Empty;
    public string? Grade { get; set; }
    public string Type { get; set; } = "normal";
    public string Icon { get; set; } = "fa-clock";
    public string Color { get; set; } = "#3b82f6";
    public string? Note { get; set; }
    public string DayOfWeek { get; set; } = "all";
    public int SortOrder { get; set; }
    public List<Student> Students { get; set; } = new();
    public List<Teacher> Teachers { get; set; } = new();
    
    public string TimeRange => $"{TimeStart} - {TimeEnd}";
}