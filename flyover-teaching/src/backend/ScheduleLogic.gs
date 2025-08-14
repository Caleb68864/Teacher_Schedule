// Schedule-specific business logic

function getScheduleForDay(day) {
  const allSchedule = getTableData("Schedule", getCurrentYear());
  
  if (!day || day === "all") {
    return allSchedule;
  }
  
  return allSchedule.filter(slot => {
    const slotDay = slot.day || "all";
    if (slotDay === "all") return true;
    if (slotDay === day) return true;
    if (slotDay === "mwf" && ["monday", "wednesday", "friday"].includes(day)) return true;
    if (slotDay === "tth" && ["tuesday", "thursday"].includes(day)) return true;
    return false;
  });
}

function getStudentSchedule(studentName) {
  const schedule = getTableData("Schedule", getCurrentYear());
  
  return schedule.filter(slot => {
    const students = slot.students ? slot.students.split(",").map(s => s.trim()) : [];
    return students.includes(studentName);
  });
}

function addScheduleEntry(entry) {
  // Use appendRow which automatically adds year
  entry.createdAt = new Date().toISOString();
  return appendRow("Schedule", entry);
}

function updateScheduleEntry(id, updates) {
  const schedule = getTableData("Schedule", getCurrentYear());
  
  const index = schedule.findIndex(entry => entry.id === id);
  if (index === -1) {
    throw new Error("Schedule entry not found");
  }
  
  // Merge updates
  schedule[index] = { ...schedule[index], ...updates, updatedAt: new Date().toISOString() };
  
  return saveTableData("Schedule", schedule);
}

function deleteScheduleEntry(id) {
  // Note: This will delete from any year - might want to restrict
  return deleteRow("Schedule", id);
}

// Original function for reference if needed
function deleteScheduleEntryOld(id) {
  const schedule = getTableData("Schedule", getCurrentYear());
  
  const filtered = schedule.filter(entry => entry.id !== id);
  
  if (filtered.length === schedule.length) {
    throw new Error("Schedule entry not found");
  }
  
  return saveTableData("Schedule", filtered);
}

function getScheduleStats() {
  const schedule = getTableData("Schedule", getCurrentYear());
  const students = getTableData("Students", getCurrentYear());
  
  const stats = {
    totalClasses: schedule.length,
    totalStudents: students.length,
    classesByType: {},
    classesByDay: {},
    studentsPerGrade: {}
  };
  
  schedule.forEach(slot => {
    // Count by type
    const type = slot.type || "normal";
    stats.classesByType[type] = (stats.classesByType[type] || 0) + 1;
    
    // Count by day
    const day = slot.day || "all";
    stats.classesByDay[day] = (stats.classesByDay[day] || 0) + 1;
  });
  
  students.forEach(student => {
    const grade = student.grade || "unknown";
    stats.studentsPerGrade[grade] = (stats.studentsPerGrade[grade] || 0) + 1;
  });
  
  return stats;
}

function getUpcomingClasses(count = 5) {
  const schedule = getTableData("Schedule", getCurrentYear());
  const now = new Date();
  const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  const currentTime = now.getHours() * 60 + now.getMinutes();
  
  // Filter and sort by time
  const upcoming = schedule
    .filter(slot => {
      // Check if it's today or future
      const slotDay = slot.day || currentDay;
      if (slotDay !== currentDay) return true;
      
      // Parse time
      const timeMatch = slot.time.match(/(\d+):(\d+)\s*(AM|PM)/i);
      if (!timeMatch) return false;
      
      let hours = parseInt(timeMatch[1]);
      const minutes = parseInt(timeMatch[2]);
      const period = timeMatch[3].toUpperCase();
      
      if (period === 'PM' && hours !== 12) hours += 12;
      if (period === 'AM' && hours === 12) hours = 0;
      
      const slotTime = hours * 60 + minutes;
      return slotTime > currentTime;
    })
    .slice(0, count);
  
  return upcoming;
}