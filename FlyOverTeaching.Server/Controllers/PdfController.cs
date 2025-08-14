using Microsoft.AspNetCore.Mvc;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using FlyOverTeaching.Shared.Models;

namespace FlyOverTeaching.Server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PdfController : ControllerBase
{
    public PdfController()
    {
        QuestPDF.Settings.License = LicenseType.Community;
    }

    [HttpPost("generate")]
    public IActionResult GeneratePdf([FromBody] PdfGenerationRequest request)
    {
        var document = Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(request.Settings.PageSize == "letter" ? PageSizes.Letter : PageSizes.A4);
                
                if (request.Settings.Orientation == "landscape")
                    page.Size(PageSizes.Letter.Landscape());
                
                page.Margin(request.Settings.MarginTop, Unit.Inch);
                page.Margin(request.Settings.MarginBottom, Unit.Inch);
                page.Margin(request.Settings.MarginLeft, Unit.Inch);
                page.Margin(request.Settings.MarginRight, Unit.Inch);
                
                page.DefaultTextStyle(x => x.FontSize(request.Settings.FontSize));
                
                if (request.Settings.IncludeHeader)
                {
                    page.Header()
                        .Text(text =>
                        {
                            text.Span(request.Theme.Title).FontSize(20).Bold();
                            text.EmptyLine();
                            text.Span(request.Theme.Subtitle).FontSize(14);
                        });
                }
                
                page.Content()
                    .PaddingVertical(1, Unit.Centimetre)
                    .Column(x =>
                    {
                        x.Spacing(20);
                        
                        foreach (var entry in request.Entries)
                        {
                            x.Item().Border(1).BorderColor(entry.Color).Padding(10).Column(column =>
                            {
                                column.Item().Row(row =>
                                {
                                    row.RelativeItem().Text(text =>
                                    {
                                        text.Span(entry.Subject).FontSize(14).Bold();
                                        if (!string.IsNullOrEmpty(entry.Grade))
                                        {
                                            text.Span($" - {entry.Grade}").FontSize(12);
                                        }
                                    });
                                    
                                    row.ConstantItem(100).AlignRight().Text(entry.TimeRange);
                                });
                                
                                if (request.Settings.IncludeStudents && entry.Students.Any())
                                {
                                    column.Item().Text(text =>
                                    {
                                        text.Span("Students: ").Bold();
                                        text.Span(string.Join(", ", entry.Students.Select(s => s.Name)));
                                    });
                                }
                                
                                if (request.Settings.IncludeNotes && !string.IsNullOrEmpty(entry.Note))
                                {
                                    column.Item().Text(text =>
                                    {
                                        text.Span("Note: ").Bold();
                                        text.Span(entry.Note);
                                    });
                                }
                            });
                        }
                    });
                
                if (request.Settings.IncludeFooter)
                {
                    page.Footer()
                        .AlignCenter()
                        .Text(x =>
                        {
                            x.Span("Page ");
                            x.CurrentPageNumber();
                            x.Span(" of ");
                            x.TotalPages();
                        });
                }
            });
        });
        
        var pdf = document.GeneratePdf();
        return File(pdf, "application/pdf", "schedule.pdf");
    }
}

public class PdfGenerationRequest
{
    public List<ScheduleEntry> Entries { get; set; } = new();
    public ThemeSettings Theme { get; set; } = new();
    public PdfSettings Settings { get; set; } = new();
}