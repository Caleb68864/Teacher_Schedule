# FlyOver Teaching - Google Sheets App

A comprehensive teaching management and IEP data collection application that runs inside Google Sheets, designed specifically for special education teachers and general educators who need robust student tracking capabilities.

## Features

### Core Teaching Tools
- 📅 **Schedule Management**: Create and manage class schedules with color-coded entries, icons, and flexible time slots
- 👥 **Student Database**: Comprehensive student information tracking with behavior monitoring flags
- 📊 **Analytics Dashboard**: Real-time data visualization with Chart.js
- 📄 **PDF Export**: Generate formatted PDFs with customizable settings
- ☁️ **Google Drive Integration**: Automatic backup and export capabilities
- 🎨 **Modern UI**: Vue 3 with Bootstrap 5 and responsive design

### Behavior Tracking
- 📈 **Daily Behavior Scores**: 1-3 scale with color coding (Green/Yellow/Red)
- 📊 **Multiple Chart Types**: Line, bar, radar, and scatter plots for behavior trends
- 📝 **Progress Reports**: Auto-generated behavior reports with recommendations
- 🔄 **Trend Analysis**: Automatic detection of improving/declining patterns

### SPED/IEP Data Collection Tools (NEW)
- 🔢 **Frequency/Duration/Latency Recording**: Track behavior occurrences with detailed metrics
- 🔄 **ABC Tracking**: Antecedent-Behavior-Consequence analysis with function hypothesis
- ✅ **Task Analysis**: Step-by-step skill tracking with prompt level monitoring
- 📝 **Work Sample Scoring**: Academic performance tracking with rubric support
- 👆 **Prompt Level Tracking**: Monitor prompt fading progress (FP→PP→M→V→G→I)
- 📊 **IEP Progress Reports**: Comprehensive reports combining all data sources

## Quick Start

### Option 1: Deploy with CLASP (Recommended)

1. Install CLASP globally:
```bash
npm install -g @google/clasp
```

2. Login to your Google account:
```bash
clasp login
```

3. Navigate to the project directory:
```bash
cd flyover-teaching
```

4. Create a new Google Sheet and link it:
```bash
clasp create --title "FlyOver Teaching" --type sheets
```

5. Update `.clasp.json` with your script ID

6. Push the code:
```bash
clasp push
```

7. Open your Google Sheet and refresh - you'll see the "FlyOver Teaching" menu

### Option 2: Manual Installation

1. Create a new Google Sheet
2. Go to Extensions → Apps Script
3. Copy each file from `src/backend/` to the Apps Script editor
4. Create HTML files for each file in `src/frontend/`
5. Save and refresh your sheet

## Project Structure

```
flyover-teaching/
├── .clasp.json          # CLASP configuration
├── appsscript.json      # Apps Script manifest
└── src/
    ├── backend/
    │   ├── Code.gs           # Main menu and UI functions
    │   ├── SheetModels.gs    # Data access layer
    │   └── ScheduleLogic.gs  # Business logic
    └── frontend/
        ├── Page.html         # Main application page
        ├── App.html          # Vue app initialization
        ├── Components.html   # Vue components
        ├── Settings.html     # Settings sidebar
        └── Style.css.html    # Custom styles
```

## Usage

### First Time Setup

1. Click **FlyOver Teaching → Launch Dashboard** from the menu
2. The app will auto-create necessary sheets if they don't exist
3. Start by adding students in the Students tab
4. Enable behavior tracking for students who need monitoring
5. Create your schedule entries

### Core Features

#### Schedule Management
- Add class times with color coding and icons
- Assign students to specific time slots
- Filter by day of the week
- Set special activities and breaks

#### Student Management
- Add student information including grades and contact details
- Enable/disable behavior tracking per student
- Track parent contact information
- Add notes for each student

#### Behavior Tracking
- Daily scoring on 1-3 scale
- Color-coded grid view (Green=3, Yellow=2, Red=1)
- Weekly overview with quick entry
- Multiple chart types for visualization
- Automatic trend analysis

### SPED/IEP Data Collection

#### Frequency/Duration/Latency Recording
- Track specific behaviors with occurrence counts
- Record duration of behaviors in minutes
- Measure response latency in seconds
- View trends over time

#### ABC Tracking
- Document antecedents (what happened before)
- Record specific behaviors observed
- Note consequences (what happened after)
- Auto-suggest behavior functions
- Generate intervention recommendations

#### Task Analysis
- Break down complex skills into steps
- Track prompt levels for each step:
  - **FP**: Full Physical
  - **PP**: Partial Physical
  - **M**: Model
  - **V**: Verbal
  - **G**: Gestural
  - **I**: Independent
- Use pre-built templates (hand washing, tying shoes, etc.)
- Monitor independence percentage

#### Work Sample Scoring
- Track academic performance by subject
- Score assignments with rubric criteria
- Calculate percentage scores automatically
- Analyze trends across subjects

#### Prompt Level Tracking
- Monitor prompt fading over time
- Track response accuracy and latency
- Visualize progress toward independence
- Identify skills needing additional support

### Generating Reports

#### IEP Progress Reports
1. Navigate to Data Collection tab
2. Select a student
3. Click "Generate IEP Progress Report"
4. Report includes:
   - Behavior trends
   - Frequency data analysis
   - ABC patterns and recommendations
   - Academic performance summary
   - Prompt fading progress

### Settings & Configuration

Click **FlyOver Teaching → Settings** to:
- Configure PDF export settings (font size, margins, orientation)
- Customize theme colors and titles
- Set behavior tracking thresholds
- Adjust chart display preferences
- View direct link to Google Sheet data
- Initialize missing sheets
- Close sidebar to view raw data

## Data Structure

The app uses these Google Sheets tabs:

### Core Data
- **Schedule**: Class times, subjects, students, grades, colors, icons
- **Students**: Names, grades, contact info, behavior tracking flag
- **Grades**: Individual assignment scores and dates
- **Assignments**: Assignment details, due dates, categories

### Behavior & IEP Data
- **Behavior**: Daily behavior scores (1-3 scale) with timestamps
- **FrequencyData**: Behavior frequency, duration, and latency records
- **ABCData**: Antecedent-Behavior-Consequence tracking with function analysis
- **TaskAnalysis**: Step-by-step skill breakdown with prompt levels
- **WorkSamples**: Academic performance scores with rubric criteria
- **PromptTracking**: Prompt level fading data with accuracy metrics

### Configuration
- **Settings**: App configuration, PDF settings, theme customization

## Deployment to Other Accounts

### For Teachers/Administrators

1. Share the `.zip` file containing the `src/` folder
2. They install CLASP and login to their account
3. Run:
```bash
clasp create --title "FlyOver Teaching" --type sheets
clasp push
```

### Alternative: GitHub Template

1. Fork/clone the repository
2. Follow the CLASP installation steps above
3. Deploy to any Google account

## Development

### Local Development

1. Make changes in the `src/` directory
2. Test with: `clasp push && clasp open`
3. View logs: `clasp logs`

### Adding New Features

1. Add backend logic in `src/backend/`
2. Add UI components in `src/frontend/Components.html`
3. Update data models in `SheetModels.gs`

## Troubleshooting

### Common Issues

**Menu doesn't appear**: Refresh the Google Sheet

**Data not loading**: Check that sheets exist (use Settings → Initialize Sheets)

**Permission errors**: Re-authorize the script when prompted

## Security & Privacy

- All data stays in your Google account
- No external servers or databases
- FERPA compliant for educational use
- Data is only accessible to sheet owners/editors

## Quick Reference

### Prompt Level Hierarchy (Most → Least Support)
- **FP** - Full Physical: Complete hand-over-hand assistance
- **PP** - Partial Physical: Some physical guidance
- **M** - Model: Demonstrating the action
- **V** - Verbal: Verbal cues or reminders
- **G** - Gestural: Pointing or gesturing
- **I** - Independent: No assistance needed

### Behavior Score Scale
- **3** - Excellent (Green): Met/exceeded expectations
- **2** - Good (Yellow): Minor challenges
- **1** - Needs Improvement (Red): Significant challenges

### ABC Function Categories
- **Escape/Avoidance**: Behavior to avoid tasks/demands
- **Attention-seeking**: Behavior to gain attention
- **Tangible/Access**: Behavior to obtain items/activities
- **Sensory/Automatic**: Self-stimulatory behavior

### Common Task Analysis Templates
- Hand Washing (7 steps)
- Tying Shoes (8 steps)
- Brushing Teeth (11 steps)
- Putting on Coat (6 steps)

## Keyboard Shortcuts

- **Tab** - Navigate between fields
- **Enter** - Save current entry
- **Esc** - Cancel/close dialogs

## Menu Options

From the Google Sheets menu bar:
- **FlyOver Teaching → Launch Dashboard** - Open main app
- **FlyOver Teaching → Settings** - Configure app settings
- **FlyOver Teaching → Help Guide** - View comprehensive help
- **FlyOver Teaching → Generate IEP Report** - Quick report generation

## License

MIT License - See LICENSE file

## Support

For issues or questions, please create an issue on GitHub or contact support.

## Acknowledgments

Special thanks to special education teachers who provided valuable feedback and use cases for IEP data collection features.

---

Built with ❤️ for teachers using Google Apps Script, Vue 3, and Bootstrap 5