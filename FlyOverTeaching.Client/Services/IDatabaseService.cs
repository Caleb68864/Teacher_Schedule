using FlyOverTeaching.Shared.Models;

namespace FlyOverTeaching.Client.Services;

public interface IDatabaseService
{
    Task InitializeAsync();
    Task<List<ScheduleEntry>> GetScheduleEntriesAsync();
    Task<ScheduleEntry?> GetScheduleEntryAsync(int id);
    Task<int> AddScheduleEntryAsync(ScheduleEntry entry);
    Task UpdateScheduleEntryAsync(ScheduleEntry entry);
    Task DeleteScheduleEntryAsync(int id);
    
    Task<List<Student>> GetStudentsAsync();
    Task<Student?> GetStudentAsync(int id);
    Task<int> AddStudentAsync(Student student);
    Task UpdateStudentAsync(Student student);
    Task DeleteStudentAsync(int id);
    
    Task<List<Teacher>> GetTeachersAsync();
    Task<Teacher?> GetTeacherAsync(int id);
    Task<int> AddTeacherAsync(Teacher teacher);
    Task UpdateTeacherAsync(Teacher teacher);
    Task DeleteTeacherAsync(int id);
    
    Task<ThemeSettings> GetThemeSettingsAsync();
    Task UpdateThemeSettingsAsync(ThemeSettings settings);
    
    Task<PdfSettings> GetPdfSettingsAsync();
    Task UpdatePdfSettingsAsync(PdfSettings settings);
    
    Task ExportDatabaseAsync(string filename);
    Task ImportDatabaseAsync(string jsonData);
    Task ResetToDefaultsAsync();
}