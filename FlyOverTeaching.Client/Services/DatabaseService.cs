using System.Text.Json;
using Blazored.LocalStorage;
using FlyOverTeaching.Shared.Models;

namespace FlyOverTeaching.Client.Services;

public class DatabaseService : IDatabaseService
{
    private readonly ILocalStorageService _localStorage;
    private const string SCHEDULE_KEY = "schedule_entries";
    private const string STUDENTS_KEY = "students";
    private const string TEACHERS_KEY = "teachers";
    private const string THEME_KEY = "theme_settings";
    private const string PDF_KEY = "pdf_settings";

    public DatabaseService(ILocalStorageService localStorage)
    {
        _localStorage = localStorage;
    }

    public async Task InitializeAsync()
    {
        var hasData = await _localStorage.ContainKeyAsync(SCHEDULE_KEY);
        if (!hasData)
        {
            await ResetToDefaultsAsync();
        }
    }

    public async Task<List<ScheduleEntry>> GetScheduleEntriesAsync()
    {
        var entries = await _localStorage.GetItemAsync<List<ScheduleEntry>>(SCHEDULE_KEY);
        return entries ?? new List<ScheduleEntry>();
    }

    public async Task<ScheduleEntry?> GetScheduleEntryAsync(int id)
    {
        var entries = await GetScheduleEntriesAsync();
        return entries.FirstOrDefault(e => e.Id == id);
    }

    public async Task<int> AddScheduleEntryAsync(ScheduleEntry entry)
    {
        var entries = await GetScheduleEntriesAsync();
        entry.Id = entries.Any() ? entries.Max(e => e.Id) + 1 : 1;
        entries.Add(entry);
        await _localStorage.SetItemAsync(SCHEDULE_KEY, entries);
        return entry.Id;
    }

    public async Task UpdateScheduleEntryAsync(ScheduleEntry entry)
    {
        var entries = await GetScheduleEntriesAsync();
        var index = entries.FindIndex(e => e.Id == entry.Id);
        if (index >= 0)
        {
            entries[index] = entry;
            await _localStorage.SetItemAsync(SCHEDULE_KEY, entries);
        }
    }

    public async Task DeleteScheduleEntryAsync(int id)
    {
        var entries = await GetScheduleEntriesAsync();
        entries.RemoveAll(e => e.Id == id);
        await _localStorage.SetItemAsync(SCHEDULE_KEY, entries);
    }

    public async Task<List<Student>> GetStudentsAsync()
    {
        var students = await _localStorage.GetItemAsync<List<Student>>(STUDENTS_KEY);
        return students ?? new List<Student>();
    }

    public async Task<Student?> GetStudentAsync(int id)
    {
        var students = await GetStudentsAsync();
        return students.FirstOrDefault(s => s.Id == id);
    }

    public async Task<int> AddStudentAsync(Student student)
    {
        var students = await GetStudentsAsync();
        student.Id = students.Any() ? students.Max(s => s.Id) + 1 : 1;
        students.Add(student);
        await _localStorage.SetItemAsync(STUDENTS_KEY, students);
        return student.Id;
    }

    public async Task UpdateStudentAsync(Student student)
    {
        var students = await GetStudentsAsync();
        var index = students.FindIndex(s => s.Id == student.Id);
        if (index >= 0)
        {
            students[index] = student;
            await _localStorage.SetItemAsync(STUDENTS_KEY, students);
        }
    }

    public async Task DeleteStudentAsync(int id)
    {
        var students = await GetStudentsAsync();
        students.RemoveAll(s => s.Id == id);
        await _localStorage.SetItemAsync(STUDENTS_KEY, students);
    }

    public async Task<List<Teacher>> GetTeachersAsync()
    {
        var teachers = await _localStorage.GetItemAsync<List<Teacher>>(TEACHERS_KEY);
        return teachers ?? new List<Teacher>();
    }

    public async Task<Teacher?> GetTeacherAsync(int id)
    {
        var teachers = await GetTeachersAsync();
        return teachers.FirstOrDefault(t => t.Id == id);
    }

    public async Task<int> AddTeacherAsync(Teacher teacher)
    {
        var teachers = await GetTeachersAsync();
        teacher.Id = teachers.Any() ? teachers.Max(t => t.Id) + 1 : 1;
        teachers.Add(teacher);
        await _localStorage.SetItemAsync(TEACHERS_KEY, teachers);
        return teacher.Id;
    }

    public async Task UpdateTeacherAsync(Teacher teacher)
    {
        var teachers = await GetTeachersAsync();
        var index = teachers.FindIndex(t => t.Id == teacher.Id);
        if (index >= 0)
        {
            teachers[index] = teacher;
            await _localStorage.SetItemAsync(TEACHERS_KEY, teachers);
        }
    }

    public async Task DeleteTeacherAsync(int id)
    {
        var teachers = await GetTeachersAsync();
        teachers.RemoveAll(t => t.Id == id);
        await _localStorage.SetItemAsync(TEACHERS_KEY, teachers);
    }

    public async Task<ThemeSettings> GetThemeSettingsAsync()
    {
        var settings = await _localStorage.GetItemAsync<ThemeSettings>(THEME_KEY);
        return settings ?? new ThemeSettings();
    }

    public async Task UpdateThemeSettingsAsync(ThemeSettings settings)
    {
        await _localStorage.SetItemAsync(THEME_KEY, settings);
    }

    public async Task<PdfSettings> GetPdfSettingsAsync()
    {
        var settings = await _localStorage.GetItemAsync<PdfSettings>(PDF_KEY);
        return settings ?? new PdfSettings();
    }

    public async Task UpdatePdfSettingsAsync(PdfSettings settings)
    {
        await _localStorage.SetItemAsync(PDF_KEY, settings);
    }

    public async Task ExportDatabaseAsync(string filename)
    {
        var data = new
        {
            schedule = await GetScheduleEntriesAsync(),
            students = await GetStudentsAsync(),
            teachers = await GetTeachersAsync(),
            theme = await GetThemeSettingsAsync(),
            pdf = await GetPdfSettingsAsync()
        };

        var json = JsonSerializer.Serialize(data, new JsonSerializerOptions { WriteIndented = true });
        // TODO: Trigger file download
    }

    public async Task ImportDatabaseAsync(string jsonData)
    {
        var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
        var data = JsonSerializer.Deserialize<dynamic>(jsonData, options);
        
        // Import logic will be implemented here
        await Task.CompletedTask;
    }

    public async Task ResetToDefaultsAsync()
    {
        var defaultEntries = GetDefaultScheduleEntries();
        var defaultStudents = GetDefaultStudents();
        
        await _localStorage.SetItemAsync(SCHEDULE_KEY, defaultEntries);
        await _localStorage.SetItemAsync(STUDENTS_KEY, defaultStudents);
        await _localStorage.SetItemAsync(TEACHERS_KEY, new List<Teacher>());
        await _localStorage.SetItemAsync(THEME_KEY, new ThemeSettings());
        await _localStorage.SetItemAsync(PDF_KEY, new PdfSettings());
    }

    private List<ScheduleEntry> GetDefaultScheduleEntries()
    {
        return new List<ScheduleEntry>
        {
            new() { Id = 1, TimeStart = "8:00 AM", TimeEnd = "8:45 AM", Subject = "Morning Assembly", Type = "special", Icon = "fa-users", Color = "#1976d2", DayOfWeek = "monday" },
            new() { Id = 2, TimeStart = "8:45 AM", TimeEnd = "9:30 AM", Subject = "Mathematics", Grade = "Grade 3", Icon = "fa-calculator", Color = "#2196f3", Students = new() { new Student { Id = 1, Name = "Alice" }, new Student { Id = 2, Name = "Bob" } } },
            new() { Id = 3, TimeStart = "9:30 AM", TimeEnd = "9:45 AM", Subject = "Break", Type = "break", Icon = "fa-coffee", Color = "#9e9e9e" },
            new() { Id = 4, TimeStart = "9:45 AM", TimeEnd = "10:30 AM", Subject = "English Language", Grade = "Grade 4", Icon = "fa-book", Color = "#4caf50" },
            new() { Id = 5, TimeStart = "10:30 AM", TimeEnd = "11:15 AM", Subject = "Science", Grade = "Grade 5", Icon = "fa-flask", Color = "#9c27b0" },
            new() { Id = 6, TimeStart = "11:15 AM", TimeEnd = "12:00 PM", Subject = "Art & Craft", Grade = "Mixed", Icon = "fa-palette", Color = "#e91e63", Note = "Combined class with Grade 3 & 4" },
            new() { Id = 7, TimeStart = "12:00 PM", TimeEnd = "1:00 PM", Subject = "Lunch Break", Type = "break", Icon = "fa-utensils", Color = "#9e9e9e" },
            new() { Id = 8, TimeStart = "1:00 PM", TimeEnd = "1:45 PM", Subject = "Physical Education", Grade = "All Grades", Icon = "fa-running", Color = "#ff9800" },
            new() { Id = 9, TimeStart = "1:45 PM", TimeEnd = "2:30 PM", Subject = "Music", Grade = "Grade 3-5", Icon = "fa-music", Color = "#00bcd4" },
            new() { Id = 10, TimeStart = "2:30 PM", TimeEnd = "3:15 PM", Subject = "Computer Studies", Grade = "Grade 5", Icon = "fa-laptop", Color = "#3f51b5" }
        };
    }

    private List<Student> GetDefaultStudents()
    {
        return new List<Student>
        {
            new() { Id = 1, Name = "Alice" },
            new() { Id = 2, Name = "Bob" },
            new() { Id = 3, Name = "Charlie" },
            new() { Id = 4, Name = "Diana" },
            new() { Id = 5, Name = "Ethan" }
        };
    }
}