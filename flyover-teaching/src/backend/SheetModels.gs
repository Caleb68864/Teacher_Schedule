// Data access layer for Google Sheets tabs

function getTableData(tabName, year = null) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(tabName);
    if (!sheet) {
      createSheetIfNotExists(tabName);
      return [];
    }
    
    const rows = sheet.getDataRange().getValues();
    if (rows.length === 0) return [];
    
    const headers = rows[0];
    const data = rows.slice(1).map(row => {
      const obj = {};
      headers.forEach((header, index) => {
        obj[header] = row[index] || "";
      });
      return obj;
    });
    
    // Filter by year if specified
    if (year && headers.includes('year')) {
      return data.filter(item => item.year === year || item.year === String(year));
    }
    
    return data;
  } catch (error) {
    console.error("Error getting table data:", error);
    return [];
  }
}

// Get current academic year from settings or default to current year
function getCurrentYear() {
  const settings = getTableData('Settings');
  const yearSetting = settings.find(s => s.key === 'currentYear');
  if (yearSetting) {
    return yearSetting.value;
  }
  // Default to current calendar year
  return new Date().getFullYear().toString();
}

// Set the current academic year
function setCurrentYear(year) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Settings') || 
                createSheetIfNotExists('Settings');
  
  const data = getTableData('Settings');
  const existingIndex = data.findIndex(s => s.key === 'currentYear');
  
  if (existingIndex >= 0) {
    // Update existing
    updateRow('Settings', data[existingIndex].id, { value: year });
  } else {
    // Add new
    const newSetting = {
      id: Utilities.getUuid(),
      key: 'currentYear',
      value: year,
      description: 'Current academic year for data filtering'
    };
    appendRow('Settings', newSetting);
  }
  
  return true;
}

// Get all unique years from a table
function getAvailableYears(tabName) {
  try {
    const data = getTableData(tabName);
    const years = data
      .map(item => item.year)
      .filter(year => year && year !== '')
      .filter((year, index, self) => self.indexOf(year) === index)
      .sort((a, b) => b - a); // Sort descending
    
    return years;
  } catch (error) {
    console.error('Error getting available years:', error);
    return [];
  }
}

// Append a new row with automatic year field
function appendRow(tabName, rowData) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(tabName) || 
                  createSheetIfNotExists(tabName);
    
    // Add current year if not specified and table has year column
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    if (headers.includes('year') && !rowData.year) {
      rowData.year = getCurrentYear();
    }
    
    // Add ID if not specified
    if (!rowData.id) {
      rowData.id = Utilities.getUuid();
    }
    
    const values = headers.map(header => rowData[header] || '');
    sheet.appendRow(values);
    
    return true;
  } catch (error) {
    console.error('Error appending row:', error);
    return false;
  }
}

function saveTableData(tabName, data) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(tabName) || 
                  createSheetIfNotExists(tabName);
    
    sheet.clearContents();
    
    if (!data || data.length === 0) return true;
    
    const headers = Object.keys(data[0]);
    sheet.appendRow(headers);
    
    data.forEach(row => {
      const values = headers.map(header => row[header] || "");
      sheet.appendRow(values);
    });
    
    return true;
  } catch (error) {
    console.error("Error saving table data:", error);
    return false;
  }
}

function updateRow(tabName, rowId, newData) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(tabName);
    if (!sheet) return false;
    
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const idColumn = headers.indexOf("id");
    
    if (idColumn === -1) return false;
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][idColumn] === rowId) {
        headers.forEach((header, index) => {
          if (newData.hasOwnProperty(header)) {
            sheet.getRange(i + 1, index + 1).setValue(newData[header]);
          }
        });
        return true;
      }
    }
    return false;
  } catch (error) {
    console.error("Error updating row:", error);
    return false;
  }
}

function deleteRow(tabName, rowId) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(tabName);
    if (!sheet) return false;
    
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const idColumn = headers.indexOf("id");
    
    if (idColumn === -1) return false;
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][idColumn] === rowId) {
        sheet.deleteRow(i + 1);
        return true;
      }
    }
    return false;
  } catch (error) {
    console.error("Error deleting row:", error);
    return false;
  }
}

function createSheetIfNotExists(tabName) {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = spreadsheet.getSheetByName(tabName);
  
  if (!sheet) {
    sheet = spreadsheet.insertSheet(tabName);
    
    // Initialize with default headers based on tab name
    const defaultHeaders = getDefaultHeaders(tabName);
    if (defaultHeaders.length > 0) {
      sheet.appendRow(defaultHeaders);
    }
  }
  
  return sheet;
}

function getDefaultHeaders(tabName) {
  const headerMap = {
    "Schedule": ["id", "year", "day", "time", "subject", "students", "grade", "type", "icon", "color", "note"],
    "Students": ["id", "year", "firstName", "lastName", "grade", "email", "parentEmail", "trackBehavior", "notes"],
    "Grades": ["id", "year", "studentId", "subject", "assignment", "score", "maxScore", "date", "notes"],
    "Assignments": ["id", "year", "subject", "title", "description", "dueDate", "points", "category"],
    "Behavior": ["id", "year", "studentId", "studentName", "date", "score", "notes", "timestamp"],
    "FrequencyData": ["id", "year", "studentId", "date", "behavior", "startTime", "endTime", "frequency", "duration", "latency", "notes"],
    "ABCData": ["id", "year", "studentId", "date", "time", "antecedent", "behavior", "consequence", "functionHypothesis", "notes"],
    "TaskAnalysis": ["id", "year", "studentId", "taskName", "date", "steps", "promptLevels", "percentComplete", "notes"],
    "WorkSamples": ["id", "year", "studentId", "date", "subject", "assignmentType", "scoreEarned", "scoreTotal", "rubricCriteria", "notes"],
    "PromptTracking": ["id", "year", "studentId", "date", "skill", "promptLevel", "responseLatency", "accuracy", "notes"],
    "Settings": ["id", "key", "value", "description"]
  };
  
  return headerMap[tabName] || ["id", "data"];
}