using System.Net.Http.Json;
using FlyOverTeaching.Shared.Models;

namespace FlyOverTeaching.Client.Services;

public class PdfService : IPdfService
{
    private readonly HttpClient _httpClient;

    public PdfService(HttpClient httpClient)
    {
        _httpClient = httpClient;
    }

    public async Task<byte[]> GeneratePdfAsync(List<ScheduleEntry> entries, ThemeSettings theme, PdfSettings settings)
    {
        var request = new
        {
            Entries = entries,
            Theme = theme,
            Settings = settings
        };

        var response = await _httpClient.PostAsJsonAsync("api/pdf/generate", request);
        response.EnsureSuccessStatusCode();
        
        return await response.Content.ReadAsByteArrayAsync();
    }
}