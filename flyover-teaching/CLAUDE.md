# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Google Apps Script application for managing teaching schedules and student data with comprehensive IEP/SPED support. The application runs within Google Sheets and provides a sidebar interface built with Vue.js. 

**Multi-Year Support**: The application supports storing multiple academic years in a single spreadsheet, with the ability to switch between years, copy data forward, and archive old years.

## Key Architecture

The application uses Google Sheets as a database with tabs serving as tables:
- Each table has a `year` field to support multiple academic years
- Data is filtered by the current selected year
- Users can switch between years, copy data to new years, and archive old data

### Backend (Google Apps Script)
- `Code.gs`: Main entry point, menu creation, UI functions
- `SheetModels.gs`: Data access layer with year filtering
- `ScheduleLogic.gs`: Schedule-specific business logic
- `StudentLogic.gs`: Student management with year support
- `BehaviorLogic.gs`: Behavior tracking logic
- `DataCollectionLogic.gs`: IEP data collection (ABC, frequency, task analysis, etc.)
- `YearManagement.gs`: Functions for copying data between years and archiving
- `SettingsLogic.gs`: Application settings management

### Frontend (Vue.js)
- `Page.html`: Main application shell
- `Components.html`: Core Vue components (Schedule, Students, Analytics, Export)
- `BehaviorComponent.html`: Behavior tracking with visual grids and charts
- `DataCollectionComponent.html`: Comprehensive IEP data collection tools
- `YearSelector.html`: Academic year selection and management
- `Settings.html`: Settings interface
- `Help.html`: User documentation
- `App.html`: Vue app initialization and state management
- `Style.css.html`: Base styles
- `EnhancedStyles.css.html`: Animations and delightful UI enhancements

## Data Model

All tables include these core fields:
- `id`: Unique identifier (UUID)
- `year`: Academic year (e.g., "2024" for 2024-2025)
- `timestamp`: Creation/modification timestamp

### Key Tables
- **Schedule**: Class schedule entries with day, time, subject, students
- **Students**: Student roster with grades and behavior tracking flags
- **Behavior**: Daily behavior scores (1-3 scale) with notes
- **FrequencyData**: Frequency, duration, and latency recording for behaviors
- **ABCData**: Antecedent-Behavior-Consequence analysis with function hypothesis
- **TaskAnalysis**: Step-by-step task completion with prompt levels
- **WorkSamples**: Academic work scoring with rubrics
- **PromptTracking**: Prompt fading data (FP→PP→M→V→G→I)
- **Settings**: Application settings and preferences

## Year Management

The application automatically:
1. Adds year fields to all data on first run (migration)
2. Filters all queries by the current selected year
3. Allows copying students and schedules to new years (with grade promotion)
4. Archives old year data to backup sheets

## Common Development Tasks

### Adding a New Data Type
1. Add table name and headers to `getDefaultHeaders()` in SheetModels.gs
2. Create logic functions in appropriate Logic.gs file
3. Add UI components in frontend HTML files
4. Ensure year field is included in the data model

### Modifying Year Behavior
- Update `getCurrentYear()` and `setCurrentYear()` in SheetModels.gs
- Modify `getTableData()` filtering logic if needed
- Update `appendRow()` to handle year assignment

### Testing Locally
1. Use CLASP to push changes: `clasp push`
2. Open the Google Sheet and refresh
3. Check browser console for errors
4. Use the menu items to test functionality

## Dependencies

CDN-hosted libraries (no build process needed):
- Vue 3 (via CDN)
- Bootstrap 5.3.0
- Font Awesome 6.4.0
- Chart.js
- jsPDF 2.5.1

## Deployment

1. Install CLASP: `npm install -g @google/clasp`
2. Login: `clasp login`
3. Create new project: `clasp create --type sheets`
4. Push code: `clasp push`
5. Open in browser: `clasp open`

## Important Notes

- All data operations should use the year-aware functions (getTableData with year parameter)
- New rows are automatically assigned the current year via appendRow()
- The migration function runs on first open to add year fields to existing data
- Archive function creates protected backup sheets before deleting data

## AI Development Agents

This project includes 12 specialized AI agents that provide domain expertise for development. These agents are available through an MCP server or can be referenced directly from the `ai-agents/` directory.

### Available Agents

1. **Google Apps Script Specialist** (`ai-agents/1-gas-specialist.md`)
   - Batch operations optimization
   - Caching strategies
   - API quota management
   - Google Workspace integration

2. **Vue.js Component Builder** (`ai-agents/2-vue-component-builder.md`)
   - Vue 3 CDN components
   - Reactive patterns
   - Google Apps Script integration
   - Component optimization

3. **Data Visualization Expert** (`ai-agents/3-data-visualization.md`)
   - Chart.js configurations
   - IEP progress monitoring charts
   - Behavior tracking visualizations
   - Dashboard composition

4. **IEP/SPED Domain Expert** (`ai-agents/4-iep-sped-expert.md`)
   - IDEA compliance
   - Data collection methodologies
   - Progress monitoring
   - Goal writing and benchmarking

5. **Educational UX Designer** (`ai-agents/5-educational-ux-designer.md`)
   - Classroom-first design
   - Accessibility (WCAG 2.1 AA)
   - Teacher workflow optimization
   - Mobile-responsive layouts

6. **Automated Testing Specialist** (`ai-agents/6-automated-testing.md`)
   - Google Apps Script testing
   - Vue component tests
   - Playwright E2E automation
   - Coverage reporting

7. **Data Integrity Validator** (`ai-agents/7-data-integrity-validator.md`)
   - Referential integrity checks
   - Data type validation
   - Duplicate detection
   - Migration validation

8. **CLASP Deployment Specialist** (`ai-agents/8-clasp-deployment.md`)
   - Multi-environment setup
   - CI/CD pipelines
   - Version management
   - Rollback procedures

9. **Documentation Generator** (`ai-agents/9-documentation-generator.md`)
   - API documentation
   - User guides
   - Training materials
   - Changelog generation

10. **Performance Optimizer** (`ai-agents/10-performance-optimizer.md`)
    - GAS execution optimization
    - Vue rendering performance
    - Memory management
    - Chart.js optimization

11. **Security & Compliance Agent** (`ai-agents/11-security-compliance.md`)
    - FERPA compliance
    - Data encryption
    - Authentication/authorization
    - Input validation

12. **Integration Specialist** (`ai-agents/12-integration-specialist.md`)
    - Google Classroom sync
    - SIS system integration
    - State reporting
    - Third-party tools

### Using AI Agents with MCP

The AI agents are available through an MCP (Model Context Protocol) server located in `mcp-servers/ai-agents-server/`.

To enable the MCP server:

1. Install dependencies:
   ```bash
   cd mcp-servers/ai-agents-server
   npm install
   ```

2. Configure Claude Desktop to use the server (see `mcp-servers/ai-agents-server/README.md`)

3. Use the agents through MCP tools:
   - `consult_agent` - Get expertise on specific topics
   - `generate_code` - Generate code following agent patterns
   - `review_code` - Review code for best practices
   - `get_best_practices` - Get domain-specific best practices

### Direct Agent Reference

When working without MCP, consult the agent files directly for:
- Code patterns and examples
- Best practices
- Implementation strategies
- Common pitfalls to avoid
- Security considerations
- Performance optimizations

Each agent file contains comprehensive knowledge including code examples, patterns, and detailed explanations for their domain of expertise.