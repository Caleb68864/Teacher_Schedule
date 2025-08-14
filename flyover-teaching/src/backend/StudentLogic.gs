// Student-specific business logic

function addStudent(studentData) {
  // Use appendRow which automatically adds year
  return appendRow("Students", studentData);
}

function updateStudent(id, updates) {
  return updateRow("Students", id, updates);
}

function deleteStudent(id) {
  return deleteRow("Students", id);
}

function getStudentById(id) {
  const students = getTableData("Students", getCurrentYear());
  return students.find(s => s.id === id);
}

function updateStudentBehaviorTracking(studentId, trackBehavior) {
  return updateRow("Students", studentId, { trackBehavior: String(trackBehavior) });
}

function getStudentsWithBehaviorTracking() {
  const students = getTableData("Students", getCurrentYear());
  return students.filter(s => s.trackBehavior === 'true' || s.trackBehavior === true);
}

// Copy students to a new year
function copyStudentsToYear(fromYear, toYear) {
  const students = getTableData("Students", fromYear);
  const newStudents = students.map(student => ({
    ...student,
    year: toYear,
    id: Utilities.getUuid() // Generate new ID for the copy
  }));
  
  // Append each student to the new year
  newStudents.forEach(student => {
    appendRow("Students", student);
  });
  
  return newStudents.length;
}

// Migrate existing data to include year field
function migrateStudentsAddYear() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Students");
  if (!sheet) return false;
  
  const data = sheet.getDataRange().getValues();
  if (data.length === 0) return false;
  
  const headers = data[0];
  const yearIndex = headers.indexOf("year");
  
  // If year column doesn't exist, add it
  if (yearIndex === -1) {
    sheet.insertColumnAfter(1); // Insert after ID column
    sheet.getRange(1, 2).setValue("year");
    
    const currentYear = getCurrentYear();
    // Set year for all existing rows
    for (let i = 2; i <= data.length; i++) {
      sheet.getRange(i, 2).setValue(currentYear);
    }
    
    return true;
  }
  
  return false;
}