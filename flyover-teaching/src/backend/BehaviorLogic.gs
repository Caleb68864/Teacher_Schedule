// Behavior tracking business logic

function addBehaviorScore(data) {
  data.timestamp = new Date().toISOString();
  
  // Ensure date is formatted consistently (YYYY-MM-DD)
  if (data.date) {
    const dateObj = new Date(data.date);
    data.date = dateObj.toISOString().split('T')[0];
  }
  
  // Use appendRow which automatically adds year
  return appendRow("Behavior", data);
}

function getBehaviorByStudent(studentId) {
  const behavior = getTableData("Behavior", getCurrentYear());
  
  return behavior
    .filter(entry => entry.studentId === studentId)
    .sort((a, b) => new Date(a.date) - new Date(b.date));
}

function getBehaviorByDateRange(startDate, endDate) {
  const behavior = getTableData("Behavior", getCurrentYear());
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  return behavior.filter(entry => {
    const entryDate = new Date(entry.date);
    return entryDate >= start && entryDate <= end;
  });
}

function updateBehaviorScore(id, newScore, notes) {
  return updateRow("Behavior", id, { 
    score: newScore, 
    notes: notes,
    updatedAt: new Date().toISOString()
  });
}

function updateBehaviorScoreOld(id, newScore, notes) {
  const behavior = getTableData("Behavior", getCurrentYear());
  
  const index = behavior.findIndex(entry => entry.id === id);
  if (index === -1) {
    throw new Error("Behavior entry not found");
  }
  
  behavior[index].score = newScore;
  if (notes !== undefined) {
    behavior[index].notes = notes;
  }
  behavior[index].updatedAt = new Date().toISOString();
  
  return saveTableData("Behavior", behavior);
}

function deleteBehaviorEntry(id) {
  return deleteRow("Behavior", id);
}

function getBehaviorStats(studentId, period = 'month') {
  const behavior = getBehaviorByStudent(studentId);
  
  if (behavior.length === 0) {
    return {
      average: 0,
      trend: 'stable',
      totalEntries: 0,
      scoreDistribution: { 1: 0, 2: 0, 3: 0 }
    };
  }
  
  // Calculate average
  const totalScore = behavior.reduce((sum, entry) => sum + parseInt(entry.score), 0);
  const average = totalScore / behavior.length;
  
  // Calculate score distribution
  const distribution = { 1: 0, 2: 0, 3: 0 };
  behavior.forEach(entry => {
    distribution[entry.score] = (distribution[entry.score] || 0) + 1;
  });
  
  // Calculate trend (comparing first half to second half)
  let trend = 'stable';
  if (behavior.length >= 4) {
    const midpoint = Math.floor(behavior.length / 2);
    const firstHalf = behavior.slice(0, midpoint);
    const secondHalf = behavior.slice(midpoint);
    
    const firstAvg = firstHalf.reduce((sum, e) => sum + parseInt(e.score), 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, e) => sum + parseInt(e.score), 0) / secondHalf.length;
    
    if (secondAvg > firstAvg + 0.2) trend = 'improving';
    else if (secondAvg < firstAvg - 0.2) trend = 'declining';
  }
  
  return {
    average: average.toFixed(2),
    trend,
    totalEntries: behavior.length,
    scoreDistribution: distribution,
    recentScores: behavior.slice(-10) // Last 10 scores
  };
}

function getClassBehaviorOverview() {
  const students = getTableData("Students", getCurrentYear());
  const behavior = getTableData("Behavior", getCurrentYear());
  
  const overview = students.map(student => {
    const studentBehavior = behavior.filter(b => b.studentId === student.id);
    const stats = getBehaviorStats(student.id);
    
    return {
      studentId: student.id,
      studentName: `${student.firstName} ${student.lastName}`,
      grade: student.grade,
      averageScore: stats.average,
      trend: stats.trend,
      totalEntries: stats.totalEntries,
      lastEntry: studentBehavior[studentBehavior.length - 1]?.date || 'No data'
    };
  });
  
  return overview.sort((a, b) => parseFloat(b.averageScore) - parseFloat(a.averageScore));
}

function getBehaviorChartData(studentId, chartType = 'line') {
  const behavior = getBehaviorByStudent(studentId);
  
  if (behavior.length === 0) {
    return { labels: [], datasets: [] };
  }
  
  const labels = behavior.map(entry => entry.date);
  const scores = behavior.map(entry => parseInt(entry.score));
  
  const chartData = {
    labels,
    datasets: [{
      label: 'Behavior Score',
      data: scores,
      borderColor: 'rgb(75, 192, 192)',
      backgroundColor: scores.map(score => {
        if (score === 3) return 'rgba(76, 175, 80, 0.5)';  // Green
        if (score === 2) return 'rgba(255, 193, 7, 0.5)';  // Yellow
        return 'rgba(244, 67, 54, 0.5)';  // Red
      }),
      tension: 0.1
    }]
  };
  
  // Add moving average for line charts
  if (chartType === 'line' && behavior.length > 3) {
    const movingAvg = [];
    for (let i = 0; i < scores.length; i++) {
      const start = Math.max(0, i - 2);
      const end = Math.min(scores.length, i + 3);
      const subset = scores.slice(start, end);
      const avg = subset.reduce((a, b) => a + b, 0) / subset.length;
      movingAvg.push(avg);
    }
    
    chartData.datasets.push({
      label: 'Trend (5-day average)',
      data: movingAvg,
      borderColor: 'rgba(255, 99, 132, 0.5)',
      borderDash: [5, 5],
      fill: false,
      pointRadius: 0
    });
  }
  
  return chartData;
}

function generateBehaviorReport(studentId, format = 'summary') {
  const student = getTableData("Students", getCurrentYear()).find(s => s.id === studentId);
  const behavior = getBehaviorByStudent(studentId);
  const stats = getBehaviorStats(studentId);
  
  if (!student) {
    throw new Error("Student not found");
  }
  
  const report = {
    student: `${student.firstName} ${student.lastName}`,
    grade: student.grade,
    reportDate: new Date().toISOString().split('T')[0],
    stats,
    recentEntries: behavior.slice(-10),
    recommendations: []
  };
  
  // Add recommendations based on trend
  if (stats.trend === 'improving') {
    report.recommendations.push('Continue current support strategies');
    report.recommendations.push('Consider peer mentorship opportunities');
  } else if (stats.trend === 'declining') {
    report.recommendations.push('Schedule parent-teacher conference');
    report.recommendations.push('Implement behavior intervention plan');
    report.recommendations.push('Increase positive reinforcement');
  } else {
    report.recommendations.push('Maintain current approach');
    report.recommendations.push('Monitor for changes');
  }
  
  return report;
}