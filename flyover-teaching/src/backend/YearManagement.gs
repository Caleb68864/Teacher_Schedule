// Year Management Functions

function copyScheduleToYear(fromYear, toYear) {
  const schedule = getTableData("Schedule", fromYear);
  let count = 0;
  
  schedule.forEach(entry => {
    const newEntry = {
      ...entry,
      year: toYear,
      id: Utilities.getUuid(), // Generate new ID
      createdAt: new Date().toISOString()
    };
    appendRow("Schedule", newEntry);
    count++;
  });
  
  return count;
}

function copyStudentsToYear(fromYear, toYear) {
  const students = getTableData("Students", fromYear);
  let count = 0;
  
  students.forEach(student => {
    // Promote grade level
    let newGrade = student.grade;
    if (newGrade) {
      // Try to parse grade number and increment
      const gradeMatch = newGrade.match(/(\d+)/);
      if (gradeMatch) {
        const gradeNum = parseInt(gradeMatch[1]);
        newGrade = newGrade.replace(gradeMatch[1], (gradeNum + 1).toString());
      }
    }
    
    const newStudent = {
      ...student,
      year: toYear,
      grade: newGrade,
      id: Utilities.getUuid(), // Generate new ID
      // Reset behavior tracking for new year
      trackBehavior: student.trackBehavior || 'false'
    };
    
    appendRow("Students", newStudent);
    count++;
  });
  
  return count;
}

function archiveYear(year) {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const archiveName = `Archive_${year}_${parseInt(year) + 1}`;
  
  // Create archive sheet if it doesn't exist
  let archiveSheet = spreadsheet.getSheetByName(archiveName);
  if (!archiveSheet) {
    archiveSheet = spreadsheet.insertSheet(archiveName);
  } else {
    // Clear existing content
    archiveSheet.clear();
  }
  
  // Tables to archive
  const tables = [
    'Schedule', 'Students', 'Behavior', 'Grades', 'Assignments',
    'FrequencyData', 'ABCData', 'TaskAnalysis', 'WorkSamples', 'PromptTracking'
  ];
  
  let row = 1;
  
  tables.forEach(tableName => {
    const data = getTableData(tableName, year);
    
    if (data.length > 0) {
      // Add table name header
      archiveSheet.getRange(row, 1).setValue(`=== ${tableName} ===`);
      archiveSheet.getRange(row, 1).setFontWeight('bold');
      archiveSheet.getRange(row, 1).setBackground('#f0f0f0');
      row++;
      
      // Add headers
      const headers = Object.keys(data[0]);
      headers.forEach((header, col) => {
        archiveSheet.getRange(row, col + 1).setValue(header);
        archiveSheet.getRange(row, col + 1).setFontWeight('bold');
      });
      row++;
      
      // Add data
      data.forEach(item => {
        headers.forEach((header, col) => {
          archiveSheet.getRange(row, col + 1).setValue(item[header] || '');
        });
        row++;
      });
      
      // Add spacing between tables
      row += 2;
    }
    
    // Now delete the archived data from the original tables
    deleteYearData(tableName, year);
  });
  
  // Format the archive sheet
  archiveSheet.autoResizeColumns(1, archiveSheet.getLastColumn());
  
  // Protect the archive sheet
  const protection = archiveSheet.protect();
  protection.setDescription(`Archived data for ${year}-${parseInt(year) + 1}`);
  protection.setWarningOnly(true);
  
  return true;
}

function deleteYearData(tableName, year) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(tableName);
  if (!sheet) return;
  
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return; // No data or only headers
  
  const headers = data[0];
  const yearIndex = headers.indexOf('year');
  
  if (yearIndex === -1) return; // No year column
  
  // Delete rows from bottom to top to avoid index issues
  for (let i = data.length - 1; i >= 1; i--) {
    if (data[i][yearIndex] === year || data[i][yearIndex] === parseInt(year)) {
      sheet.deleteRow(i + 1);
    }
  }
}

function migrateExistingDataToYear() {
  // This function adds year field to existing data that doesn't have it
  const currentYear = getCurrentYear();
  const tables = [
    'Schedule', 'Students', 'Behavior', 'Grades', 'Assignments',
    'FrequencyData', 'ABCData', 'TaskAnalysis', 'WorkSamples', 'PromptTracking'
  ];
  
  tables.forEach(tableName => {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(tableName);
    if (!sheet || sheet.getLastRow() === 0) return;
    
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const yearIndex = headers.indexOf('year');
    
    if (yearIndex === -1) {
      // Add year column if it doesn't exist
      sheet.insertColumnAfter(1); // Insert after ID column
      sheet.getRange(1, 2).setValue('year');
      
      // Set year for all existing rows
      if (sheet.getLastRow() > 1) {
        const yearValues = [];
        for (let i = 2; i <= sheet.getLastRow(); i++) {
          yearValues.push([currentYear]);
        }
        sheet.getRange(2, 2, yearValues.length, 1).setValues(yearValues);
      }
    } else {
      // Fill in missing year values
      for (let i = 2; i <= sheet.getLastRow(); i++) {
        const yearValue = sheet.getRange(i, yearIndex + 1).getValue();
        if (!yearValue || yearValue === '') {
          sheet.getRange(i, yearIndex + 1).setValue(currentYear);
        }
      }
    }
  });
  
  return true;
}

function getYearSummary(year) {
  const summary = {
    year: year,
    academicYear: `${year}-${parseInt(year) + 1}`,
    students: getTableData("Students", year).length,
    scheduleEntries: getTableData("Schedule", year).length,
    behaviorRecords: getTableData("Behavior", year).length,
    iepDataPoints: 0
  };
  
  // Count IEP data points
  summary.iepDataPoints += getTableData("FrequencyData", year).length;
  summary.iepDataPoints += getTableData("ABCData", year).length;
  summary.iepDataPoints += getTableData("TaskAnalysis", year).length;
  summary.iepDataPoints += getTableData("WorkSamples", year).length;
  summary.iepDataPoints += getTableData("PromptTracking", year).length;
  
  return summary;
}