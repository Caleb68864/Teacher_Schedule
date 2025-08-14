namespace FlyOverTeaching.Shared.Models;

public class PdfSettings
{
    public int Id { get; set; } = 1;
    public string Orientation { get; set; } = "portrait";
    public string PageSize { get; set; } = "letter";
    public bool IncludeHeader { get; set; } = true;
    public bool IncludeFooter { get; set; } = true;
    public bool IncludeStudents { get; set; } = true;
    public bool IncludeNotes { get; set; } = true;
    public bool UseColors { get; set; } = true;
    public float FontSize { get; set; } = 10;
    public float MarginTop { get; set; } = 0.5f;
    public float MarginBottom { get; set; } = 0.5f;
    public float MarginLeft { get; set; } = 0.5f;
    public float MarginRight { get; set; } = 0.5f;
}