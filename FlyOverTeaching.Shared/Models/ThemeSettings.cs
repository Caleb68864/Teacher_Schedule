namespace FlyOverTeaching.Shared.Models;

public class ThemeSettings
{
    public int Id { get; set; } = 1;
    public string Title { get; set; } = "Mrs. Bennett's Dragon Schedule";
    public string Subtitle { get; set; } = "2025-2026 Academic Year";
    public string Background { get; set; } = "linear-gradient(135deg, #84cc16 0%, #eab308 100%)";
    public string HeaderTextColor { get; set; } = "#ffffff";
    public string HeaderTextShadow { get; set; } = "2px 2px 4px rgba(0,0,0,0.3)";
    public string PrimaryButtonColor { get; set; } = "linear-gradient(135deg, #16a34a 0%, #84cc16 100%)";
    public string ControlsBackground { get; set; } = "#fef3c7";
    public string ControlsTextColor { get; set; } = "#365314";
}