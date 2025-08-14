# CLAUDE.md - FlyOver Teaching Google Sheets App

This file provides guidance to Claude Code (claude.ai/code) when working with this Google Apps Script + Vue.js application.

## Project Overview

FlyOver Teaching is a Google Sheets-based teaching management application that runs entirely within Google Workspace. It provides schedule management, student tracking, behavior monitoring, and analytics capabilities.

### Technology Stack
- **Backend**: Google Apps Script (JavaScript ES6+)
- **Frontend**: Vue 3 (via CDN), Bootstrap 5, Font Awesome
- **Charts**: Chart.js 3.x for data visualization
- **PDF Export**: jsPDF for client-side PDF generation
- **Deployment**: CLASP (Command Line Apps Script)
- **Data Storage**: Google Sheets (no external database)

## Architecture

```
flyover-teaching/
├── src/
│   ├── backend/          # Google Apps Script files (.gs)
│   │   ├── Code.gs           # Main menu, UI functions, initialization
│   │   ├── SheetModels.gs    # Data access layer for sheets
│   │   ├── ScheduleLogic.gs  # Schedule business logic
│   │   └── BehaviorLogic.gs  # Behavior tracking logic
│   └── frontend/         # HTML files for UI
│       ├── Page.html         # Main application shell
│       ├── App.html          # Vue app initialization
│       ├── Components.html   # Vue components (Schedule, Students, etc.)
│       ├── BehaviorComponent.html # Behavior tracking component
│       ├── Settings.html     # Settings sidebar
│       └── Style.css.html    # Custom styles
├── mcp-servers/          # Model Context Protocol servers for dev
│   ├── playwright-tester/    # Automated UI testing
│   ├── sheets-api/          # Direct Google Sheets API access
│   └── clasp-automation/    # CLASP deployment automation
├── .clasp.json          # CLASP configuration
├── appsscript.json      # Apps Script manifest
└── .gitignore

```

## Data Structure (Google Sheets Tabs)

### Schedule Tab
```javascript
{
  id: string (UUID),
  day: string ('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'mwf', 'tth', 'all'),
  time: string ('9:00 AM - 10:00 AM'),
  subject: string,
  students: string (comma-separated names),
  grade: string ('3rd', '4th', etc.),
  type: string ('normal', 'special', 'break'),
  icon: string (Font Awesome class),
  color: string (hex color),
  note: string
}
```

### Students Tab
```javascript
{
  id: string (UUID),
  firstName: string,
  lastName: string,
  grade: string,
  email: string,
  parentEmail: string,
  trackBehavior: string ('true'/'false'), // Enables behavior tracking
  notes: string
}
```

### Behavior Tab
```javascript
{
  id: string (UUID),
  studentId: string,
  studentName: string,
  date: string (YYYY-MM-DD),
  score: string ('1', '2', '3'), // 1=Needs Improvement, 2=Good, 3=Excellent
  notes: string,
  timestamp: string (ISO 8601)
}
```

### Settings Tab
```javascript
{
  key: string,
  value: string,
  description: string
}
// Example settings:
// pdfFontSize: '12'
// pdfLineSpacing: '1.5'
// pdfMargins: '15'
// chartType: 'line'
// behaviorChartDays: '30'
```

## Vue 3 Component Structure

### Main App Component (App.html)
```javascript
createApp({
  data() {
    return {
      loading: boolean,
      activeTab: string,
      schedule: array,
      students: array,
      config: object
    }
  },
  methods: {
    loadSchedule(), // Calls google.script.run.getTableData('Schedule')
    loadStudents(), // Calls google.script.run.getTableData('Students')
    showSuccess(message),
    showError(message)
  }
})
```

### Key Components

1. **schedule-view**: Schedule management with color-coded entries
2. **students-view**: Student database with behavior tracking toggle
3. **behavior-view**: Behavior tracking with score grid (1-3 scale)
   - Color coding: Green (3), Yellow (2), Red (1)
   - Accordion UI for data entry and charts
   - Multiple chart types (line, bar, radar, scatter)
4. **analytics-view**: Data visualization with Chart.js
5. **export-view**: PDF and JSON export functionality

## Chart.js Integration

### Behavior Charts
```javascript
// Line chart with trend line
new Chart(ctx, {
  type: 'line', // or 'bar', 'radar', 'scatter'
  data: {
    labels: dates,
    datasets: [{
      label: 'Behavior Score',
      data: scores,
      backgroundColor: dynamicColors, // Based on score values
      borderColor: 'rgb(75, 192, 192)'
    }]
  },
  options: {
    scales: {
      y: {
        min: 0,
        max: 3,
        ticks: {
          callback: (value) => ['', 'Needs Improvement', 'Good', 'Excellent'][value]
        }
      }
    }
  }
});
```

## jsPDF Configuration

### PDF Export with Settings
```javascript
const { jsPDF } = window.jspdf;
const settings = getSettings(); // From Settings sheet

const doc = new jsPDF({
  orientation: 'landscape',
  unit: 'mm',
  format: 'letter'
});

// Apply settings
doc.setFontSize(parseInt(settings.pdfFontSize) || 12);
const lineHeight = parseFloat(settings.pdfLineSpacing) || 1.5;
const margin = parseInt(settings.pdfMargins) || 15;

// Generate content
doc.text('Title', margin, margin);
// ... add content with proper spacing
doc.save('schedule.pdf');
```

## Google Apps Script API Functions

### Data Operations
- `getTableData(tabName)`: Fetch all data from a sheet
- `saveTableData(tabName, data)`: Save data array to sheet
- `updateRow(tabName, rowId, newData)`: Update specific row
- `deleteRow(tabName, rowId)`: Delete row by ID
- `createSheetIfNotExists(tabName)`: Initialize sheet with headers

### Schedule Functions
- `addScheduleEntry(entry)`: Add new schedule item
- `updateScheduleEntry(id, updates)`: Update existing entry
- `deleteScheduleEntry(id)`: Remove schedule entry
- `getScheduleForDay(day)`: Filter schedule by day

### Student Functions  
- `addStudent(studentData)`: Add new student
- `deleteStudent(id)`: Remove student
- `updateStudentBehaviorTracking(studentId, trackBehavior)`: Toggle behavior tracking

### Behavior Functions
- `addBehaviorScore(data)`: Add behavior entry
- `getBehaviorByStudent(studentId)`: Get student's behavior history
- `getBehaviorStats(studentId)`: Calculate averages and trends
- `generateBehaviorReport(studentId)`: Create detailed report

### Settings Functions
- `getSettings()`: Retrieve all app settings
- `updateSetting(key, value)`: Update specific setting
- `resetSettings()`: Restore default settings

## Common Development Tasks

### Adding a New Feature
1. Create backend logic in `src/backend/[Feature]Logic.gs`
2. Add Vue component in `src/frontend/Components.html`
3. Update sheet headers in `SheetModels.gs`
4. Include component in `Page.html`
5. Test with MCP Playwright server

### Modifying PDF Export
1. Check Settings sheet for configurable values
2. Update export logic in export component
3. Use jsPDF methods:
   - `doc.setFontSize(size)`
   - `doc.setLineWidth(width)`
   - `doc.setTextColor(r, g, b)`

### Adding New Chart Type
1. Import Chart.js chart type if needed
2. Add chart option to behavior component
3. Configure chart-specific options
4. Update chart data transformation

### Testing with MCP Servers
```bash
# Start Playwright tester
cd mcp-servers/playwright-tester
npm install
npm start

# Use tools:
- launch_browser
- serve_local_app
- run_test_suite
```

## Deployment

### Initial Setup
```bash
npm install -g @google/clasp
clasp login
cd flyover-teaching
clasp create --title "FlyOver Teaching" --type sheets
```

### Push Updates
```bash
clasp push
clasp open --webapp  # Open in browser
```

### Settings Configuration
The app supports runtime configuration through the Settings sheet:
- PDF export settings (font size, margins, spacing)
- Chart display preferences
- Behavior tracking options
- UI theme settings

## Security & Permissions

- Data stays within Google Workspace
- No external API calls
- FERPA compliant for educational use
- Permissions required:
  - Google Sheets (read/write)
  - Google Drive (for exports)
  - Script runtime

## Best Practices

1. **Data Validation**: Always validate in backend .gs files
2. **Error Handling**: Use try-catch blocks with user feedback
3. **Performance**: Batch sheet operations when possible
4. **UI Feedback**: Show loading states and confirmations
5. **Accessibility**: Use proper ARIA labels and keyboard navigation

## Troubleshooting

### Common Issues
- **Menu not appearing**: Refresh sheet or re-authorize script
- **Data not loading**: Check sheet names match exactly
- **Charts not rendering**: Ensure Chart.js is loaded
- **PDF export fails**: Check browser console for jsPDF errors

### Debug Mode
Add to Settings sheet:
- key: 'debug', value: 'true'
- Enables console logging in Apps Script

## Future Enhancements
- [ ] Email notifications for behavior alerts
- [ ] Parent portal with read-only access
- [ ] Attendance tracking integration
- [ ] Custom report templates
- [ ] Multi-teacher collaboration