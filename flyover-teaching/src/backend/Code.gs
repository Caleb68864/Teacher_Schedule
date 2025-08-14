function onOpen() {
  // Run migration on first open if needed
  try {
    migrateExistingDataToYear();
  } catch (e) {
    console.log('Migration check completed or not needed:', e);
  }
  
  SpreadsheetApp.getUi()
    .createMenu("FlyOver Teaching")
    .addItem("Launch Dashboard", "showSidebar")
    .addItem("Settings", "showSettings")
    .addItem("Help Guide", "showHelp")
    .addSeparator()
    .addItem("Export Schedule", "exportSchedule")
    .addItem("Generate IEP Report", "quickIEPReport")
    .addItem("Migrate Data to Year System", "runMigration")
    .addToUi();
  
  // Auto-launch sidebar on open (optional)
  showSidebar();
}

function runMigration() {
  const ui = SpreadsheetApp.getUi();
  const result = ui.alert(
    'Migrate Data',
    'This will add year fields to all existing data. Continue?',
    ui.ButtonSet.YES_NO
  );
  
  if (result === ui.Button.YES) {
    try {
      migrateExistingDataToYear();
      ui.alert('Migration completed successfully!');
    } catch (error) {
      ui.alert('Migration failed: ' + error.toString());
    }
  }
}

function showSidebar() {
  const html = HtmlService.createTemplateFromFile("frontend/Page")
    .evaluate()
    .setTitle("FlyOver Teaching Dashboard")
    .setWidth(450);
  
  SpreadsheetApp.getUi().showSidebar(html);
}

function showSettings() {
  const html = HtmlService.createTemplateFromFile("frontend/Settings")
    .evaluate()
    .setTitle("Settings")
    .setWidth(350);
  
  SpreadsheetApp.getUi().showSidebar(html);
}

function showHelp() {
  const html = HtmlService.createTemplateFromFile("frontend/Help")
    .evaluate()
    .setTitle("Help Guide")
    .setWidth(800)
    .setHeight(600);
  
  SpreadsheetApp.getUi().showModalDialog(html, "FlyOver Teaching Help Guide");
}

// Year management functions
function getCurrentAcademicYear() {
  return getCurrentYear();
}

function setCurrentAcademicYear(year) {
  return setCurrentYear(year);
}

function getAllYears() {
  // Get years from all tables
  const tables = ['Schedule', 'Students', 'Behavior', 'FrequencyData', 'ABCData', 'TaskAnalysis'];
  const allYears = new Set();
  
  tables.forEach(table => {
    const years = getAvailableYears(table);
    years.forEach(year => allYears.add(year));
  });
  
  // Add current year if not present
  const currentYear = new Date().getFullYear().toString();
  allYears.add(currentYear);
  
  return Array.from(allYears).sort((a, b) => b - a);
}

// Data access wrappers with year filtering
function getScheduleData() {
  return getTableData("Schedule", getCurrentYear());
}

function getStudentsData() {
  return getTableData("Students", getCurrentYear());
}

function getBehaviorData() {
  return getTableData("Behavior", getCurrentYear());
}

function quickIEPReport() {
  // Quick access to generate IEP report
  const ui = SpreadsheetApp.getUi();
  const students = getTableData("Students", getCurrentYear());
  
  if (students.length === 0) {
    ui.alert("No students found. Please add students first.");
    return;
  }
  
  // Show a dialog to select student
  const studentList = students.map((s, i) => 
    `${i + 1}. ${s.firstName} ${s.lastName} (Grade ${s.grade})`
  ).join('\\n');
  
  const response = ui.prompt(
    'Generate IEP Report',
    `Enter the number of the student:\\n\\n${studentList}`,
    ui.ButtonSet.OK_CANCEL
  );
  
  if (response.getSelectedButton() === ui.Button.OK) {
    const index = parseInt(response.getResponseText()) - 1;
    if (index >= 0 && index < students.length) {
      const report = generateIEPProgressReport(students[index].id);
      
      // Create a simple HTML report
      const htmlReport = formatIEPReportHTML(report);
      const htmlOutput = HtmlService.createHtmlOutput(htmlReport)
        .setWidth(600)
        .setHeight(500);
      
      ui.showModalDialog(htmlOutput, 'IEP Progress Report');
    } else {
      ui.alert('Invalid selection. Please enter a valid number.');
    }
  }
}

function formatIEPReportHTML(report) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { color: #667eea; }
          h2 { color: #764ba2; border-bottom: 2px solid #eee; padding-bottom: 5px; }
          .metric { margin: 10px 0; }
          .metric strong { color: #333; }
          ul { margin-top: 5px; }
          .summary { background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0; }
          .recommendations { background: #e8f5e9; padding: 15px; border-radius: 5px; }
          @media print { body { padding: 0; } }
        </style>
      </head>
      <body>
        <h1>IEP Progress Report</h1>
        
        <div class="metric">
          <strong>Student:</strong> ${report.student}<br>
          <strong>Grade:</strong> ${report.grade}<br>
          <strong>Report Date:</strong> ${report.reportDate}<br>
          <strong>Period:</strong> ${report.dateRange}
        </div>
        
        <div class="summary">
          <h2>Summary</h2>
          <ul>
            ${report.summary.map(item => `<li>${item}</li>`).join('')}
          </ul>
        </div>
        
        <h2>Behavior Data</h2>
        <div class="metric">
          <strong>Average Score:</strong> ${report.behaviorData.average || 'N/A'}<br>
          <strong>Trend:</strong> ${report.behaviorData.trend || 'N/A'}<br>
          <strong>Total Entries:</strong> ${report.behaviorData.totalEntries || 0}
        </div>
        
        <h2>Frequency Data</h2>
        <div class="metric">
          <strong>Total Occurrences:</strong> ${report.frequencyData.totalOccurrences || 0}<br>
          <strong>Average Frequency:</strong> ${report.frequencyData.averageFrequency || 'N/A'}<br>
          <strong>Trend:</strong> ${report.frequencyData.trend || 'N/A'}
        </div>
        
        <h2>Academic Performance</h2>
        <div class="metric">
          <strong>Average Score:</strong> ${report.workSamples.averageScore || 'N/A'}%<br>
          <strong>Trend:</strong> ${report.workSamples.trend || 'N/A'}<br>
          <strong>Total Samples:</strong> ${report.workSamples.totalSamples || 0}
        </div>
        
        <div class="recommendations">
          <h2>Recommendations</h2>
          <ul>
            ${report.recommendations.map(rec => `<li>${rec}</li>`).join('')}
          </ul>
        </div>
        
        <div style="margin-top: 30px; text-align: center;">
          <button onclick="window.print()" style="padding: 10px 20px; background: #667eea; color: white; border: none; border-radius: 5px; cursor: pointer;">
            Print Report
          </button>
        </div>
      </body>
    </html>
  `;
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

function exportSchedule() {
  const data = getTableData("Schedule");
  const blob = Utilities.newBlob(JSON.stringify(data, null, 2), "application/json", "schedule.json");
  
  DriveApp.createFile(blob);
  SpreadsheetApp.getUi().alert("Schedule exported to Google Drive!");
}

function getActiveUserEmail() {
  return Session.getActiveUser().getEmail();
}

function getSpreadsheetUrl() {
  return SpreadsheetApp.getActiveSpreadsheet().getUrl();
}

function initializeAllSheets() {
  const requiredSheets = [
    "Schedule", 
    "Students", 
    "Grades", 
    "Assignments", 
    "Behavior",
    "FrequencyData",
    "ABCData",
    "TaskAnalysis",
    "WorkSamples",
    "PromptTracking",
    "Settings"
  ];
  
  requiredSheets.forEach(sheetName => {
    createSheetIfNotExists(sheetName);
  });
  
  // Initialize settings if empty
  initializeSettings();
  
  return true;
}

// Student management functions
function addStudent(studentData) {
  const students = getTableData("Students");
  studentData.id = Utilities.getUuid();
  studentData.createdAt = new Date().toISOString();
  students.push(studentData);
  return saveTableData("Students", students);
}

function deleteStudent(id) {
  const students = getTableData("Students");
  const filtered = students.filter(s => s.id !== id);
  return saveTableData("Students", filtered);
}

function updateStudentBehaviorTracking(studentId, trackBehavior) {
  const students = getTableData("Students");
  const student = students.find(s => s.id === studentId);
  
  if (!student) {
    throw new Error("Student not found");
  }
  
  student.trackBehavior = trackBehavior.toString();
  return saveTableData("Students", students);
}