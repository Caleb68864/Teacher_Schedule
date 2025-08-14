using Microsoft.Playwright;
using NUnit.Framework;

namespace FlyOverTeaching.Tests.E2E;

[TestFixture]
public class ScheduleTests
{
    private IPlaywright _playwright = null!;
    private IBrowser _browser = null!;
    private IPage _page = null!;

    [SetUp]
    public async Task Setup()
    {
        _playwright = await Playwright.CreateAsync();
        _browser = await _playwright.Chromium.LaunchAsync(new BrowserTypeLaunchOptions
        {
            Headless = false // Set to true for CI/CD
        });
        
        var context = await _browser.NewContextAsync();
        _page = await context.NewPageAsync();
        await _page.GotoAsync("http://localhost:5000");
    }

    [TearDown]
    public async Task TearDown()
    {
        await _browser.CloseAsync();
        _playwright.Dispose();
    }

    [Test]
    public async Task Should_Display_Schedule_Page()
    {
        // Wait for the schedule to load
        await _page.WaitForSelectorAsync("h3:has-text('Schedule Controls')");
        
        // Check if title is visible
        var title = await _page.TextContentAsync("h3");
        Assert.That(title, Contains.Substring("Dragon Schedule"));
    }

    [Test]
    public async Task Should_Navigate_To_Editor()
    {
        // Click on Editor link
        await _page.ClickAsync("text=Editor");
        
        // Wait for editor page to load
        await _page.WaitForSelectorAsync("text=Schedule Editor");
        
        // Verify we're on the editor page
        var url = _page.Url;
        Assert.That(url, Contains.Substring("/editor"));
    }

    [Test]
    public async Task Should_Add_New_Schedule_Entry()
    {
        // Navigate to editor
        await _page.ClickAsync("text=Editor");
        await _page.WaitForSelectorAsync("text=Schedule Editor");
        
        // Click New button
        await _page.ClickAsync("button:has-text('New')");
        
        // Fill in the form
        await _page.FillAsync("input[label='Subject']", "Test Class");
        await _page.FillAsync("input[label='Start Time']", "10:00 AM");
        await _page.FillAsync("input[label='End Time']", "11:00 AM");
        
        // Save the entry
        await _page.ClickAsync("button:has-text('Save')");
        
        // Verify success message
        await _page.WaitForSelectorAsync("text=Entry saved successfully");
    }

    [Test]
    public async Task Should_Export_PDF()
    {
        // Wait for schedule to load
        await _page.WaitForSelectorAsync("h3:has-text('Schedule Controls')");
        
        // Set up download handler
        var downloadTask = _page.WaitForDownloadAsync();
        
        // Click Export PDF button
        await _page.ClickAsync("button:has-text('Export PDF')");
        
        // Wait for download
        var download = await downloadTask;
        Assert.That(download.SuggestedFilename, Is.EqualTo("schedule.pdf"));
    }

    [Test]
    public async Task Should_Filter_By_Day()
    {
        // Wait for schedule to load
        await _page.WaitForSelectorAsync("h3:has-text('Schedule Controls')");
        
        // Select Monday from dropdown
        await _page.SelectOptionAsync("select", "monday");
        
        // Verify filtered results (implementation depends on your data)
        await Task.Delay(500); // Wait for filter to apply
        
        // Check that schedule items are displayed
        var scheduleItems = await _page.QuerySelectorAllAsync(".mud-card");
        Assert.That(scheduleItems.Count, Is.GreaterThan(0));
    }

    [Test]
    public async Task Should_Switch_View_Modes()
    {
        // Wait for schedule to load
        await _page.WaitForSelectorAsync("h3:has-text('Schedule Controls')");
        
        // Click Compact View
        await _page.ClickAsync("text=Compact View");
        
        // Verify view changed (check for compact layout class or different grid size)
        await Task.Delay(500);
        
        // Switch back to Detailed View
        await _page.ClickAsync("text=Detailed View");
        
        // Verify view changed back
        await Task.Delay(500);
    }
}