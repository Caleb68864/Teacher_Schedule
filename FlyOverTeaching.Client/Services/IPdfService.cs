using FlyOverTeaching.Shared.Models;

namespace FlyOverTeaching.Client.Services;

public interface IPdfService
{
    Task<byte[]> GeneratePdfAsync(List<ScheduleEntry> entries, ThemeSettings theme, PdfSettings settings);
}