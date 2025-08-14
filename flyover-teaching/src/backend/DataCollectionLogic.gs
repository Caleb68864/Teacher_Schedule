// Data Collection Logic for SPED/IEP Support

// Frequency/Duration/Latency Recording
function addFrequencyData(data) {
  data.timestamp = new Date().toISOString();
  
  // Calculate duration if start and end times provided
  if (data.startTime && data.endTime) {
    const start = new Date(`1970-01-01T${data.startTime}`);
    const end = new Date(`1970-01-01T${data.endTime}`);
    const durationMs = end - start;
    data.duration = Math.round(durationMs / 1000 / 60); // Duration in minutes
  }
  
  // Use appendRow which automatically adds year
  return appendRow("FrequencyData", data);
}

function getFrequencyDataByStudent(studentId, dateRange) {
  const data = getTableData("FrequencyData", getCurrentYear());
  let filtered = data.filter(d => d.studentId === studentId);
  
  if (dateRange) {
    const startDate = new Date(dateRange.start);
    const endDate = new Date(dateRange.end);
    filtered = filtered.filter(d => {
      const date = new Date(d.date);
      return date >= startDate && date <= endDate;
    });
  }
  
  return filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
}

function getFrequencyStats(studentId, behavior, days = 30) {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  const data = getFrequencyDataByStudent(studentId, {
    start: startDate.toISOString(),
    end: endDate.toISOString()
  });
  
  const behaviorData = behavior ? data.filter(d => d.behavior === behavior) : data;
  
  if (behaviorData.length === 0) {
    return {
      totalOccurrences: 0,
      averageFrequency: 0,
      averageDuration: 0,
      averageLatency: 0,
      trend: 'No data'
    };
  }
  
  const totalFreq = behaviorData.reduce((sum, d) => sum + (parseInt(d.frequency) || 0), 0);
  const totalDuration = behaviorData.reduce((sum, d) => sum + (parseInt(d.duration) || 0), 0);
  const totalLatency = behaviorData.reduce((sum, d) => sum + (parseInt(d.latency) || 0), 0);
  
  // Calculate trend
  let trend = 'stable';
  if (behaviorData.length >= 5) {
    const firstHalf = behaviorData.slice(0, Math.floor(behaviorData.length / 2));
    const secondHalf = behaviorData.slice(Math.floor(behaviorData.length / 2));
    
    const firstAvg = firstHalf.reduce((sum, d) => sum + (parseInt(d.frequency) || 0), 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, d) => sum + (parseInt(d.frequency) || 0), 0) / secondHalf.length;
    
    if (secondAvg < firstAvg * 0.8) trend = 'decreasing';
    else if (secondAvg > firstAvg * 1.2) trend = 'increasing';
  }
  
  return {
    totalOccurrences: totalFreq,
    averageFrequency: (totalFreq / behaviorData.length).toFixed(1),
    averageDuration: (totalDuration / behaviorData.length).toFixed(1),
    averageLatency: (totalLatency / behaviorData.filter(d => d.latency).length || 0).toFixed(1),
    trend,
    dataPoints: behaviorData.length
  };
}

// ABC (Antecedent-Behavior-Consequence) Tracking
function addABCData(data) {
  const abcData = getTableData("ABCData", getCurrentYear());
  
  data.id = Utilities.getUuid();
  data.timestamp = new Date().toISOString();
  
  // Auto-suggest function hypothesis based on patterns
  if (!data.functionHypothesis) {
    data.functionHypothesis = suggestFunctionHypothesis(data);
  }
  
  // Use appendRow which automatically adds year
  return appendRow("ABCData", data);
}

function suggestFunctionHypothesis(data) {
  const antecedent = data.antecedent.toLowerCase();
  const consequence = data.consequence.toLowerCase();
  
  // Simple pattern matching for common functions
  if (antecedent.includes('demand') || antecedent.includes('task') || antecedent.includes('work')) {
    if (consequence.includes('remove') || consequence.includes('break') || consequence.includes('stop')) {
      return 'Escape/Avoidance';
    }
  }
  
  if (consequence.includes('attention') || consequence.includes('talk') || consequence.includes('look')) {
    return 'Attention-seeking';
  }
  
  if (consequence.includes('item') || consequence.includes('toy') || consequence.includes('food')) {
    return 'Tangible/Access';
  }
  
  if (antecedent.includes('alone') || antecedent.includes('quiet')) {
    return 'Sensory/Automatic';
  }
  
  return 'Undetermined';
}

function getABCAnalysis(studentId, days = 30) {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  const data = getTableData("ABCData", getCurrentYear())
    .filter(d => d.studentId === studentId)
    .filter(d => {
      const date = new Date(d.date);
      return date >= startDate && date <= endDate;
    });
  
  // Analyze patterns
  const antecedentPatterns = {};
  const consequencePatterns = {};
  const functionPatterns = {};
  const timePatterns = {};
  
  data.forEach(entry => {
    // Count antecedents
    antecedentPatterns[entry.antecedent] = (antecedentPatterns[entry.antecedent] || 0) + 1;
    
    // Count consequences
    consequencePatterns[entry.consequence] = (consequencePatterns[entry.consequence] || 0) + 1;
    
    // Count functions
    functionPatterns[entry.functionHypothesis] = (functionPatterns[entry.functionHypothesis] || 0) + 1;
    
    // Time patterns (morning, afternoon, etc.)
    const hour = parseInt(entry.time.split(':')[0]);
    let timeOfDay = 'morning';
    if (hour >= 12 && hour < 15) timeOfDay = 'afternoon';
    else if (hour >= 15) timeOfDay = 'late afternoon';
    
    timePatterns[timeOfDay] = (timePatterns[timeOfDay] || 0) + 1;
  });
  
  return {
    totalIncidents: data.length,
    topAntecedents: Object.entries(antecedentPatterns)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3),
    topConsequences: Object.entries(consequencePatterns)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3),
    functionHypotheses: functionPatterns,
    timePatterns,
    recommendations: generateABCRecommendations(functionPatterns)
  };
}

function generateABCRecommendations(functionPatterns) {
  const recommendations = [];
  const topFunction = Object.entries(functionPatterns)
    .sort((a, b) => b[1] - a[1])[0];
  
  if (!topFunction) return ['Collect more ABC data for analysis'];
  
  switch (topFunction[0]) {
    case 'Escape/Avoidance':
      recommendations.push('Consider task modifications or breaks');
      recommendations.push('Teach appropriate requesting for breaks');
      recommendations.push('Use positive reinforcement for task completion');
      break;
    case 'Attention-seeking':
      recommendations.push('Provide attention on a fixed schedule');
      recommendations.push('Teach appropriate attention-seeking behaviors');
      recommendations.push('Ignore inappropriate behaviors when safe');
      break;
    case 'Tangible/Access':
      recommendations.push('Use visual schedules for access to preferred items');
      recommendations.push('Teach requesting skills');
      recommendations.push('Implement token economy system');
      break;
    case 'Sensory/Automatic':
      recommendations.push('Provide sensory breaks');
      recommendations.push('Consider sensory diet consultation with OT');
      recommendations.push('Offer alternative sensory activities');
      break;
  }
  
  return recommendations;
}

// Task Analysis
function addTaskAnalysis(data) {
  const taskData = getTableData("TaskAnalysis", getCurrentYear());
  
  data.id = Utilities.getUuid();
  data.timestamp = new Date().toISOString();
  
  // Parse steps and prompt levels if they're strings
  if (typeof data.steps === 'string') {
    data.steps = data.steps.split(',').map(s => s.trim());
  }
  if (typeof data.promptLevels === 'string') {
    data.promptLevels = data.promptLevels.split(',').map(p => p.trim());
  }
  
  // Calculate percent complete
  if (data.steps && data.promptLevels) {
    const independentSteps = data.promptLevels.filter(p => p === 'I' || p === 'Independent').length;
    data.percentComplete = Math.round((independentSteps / data.steps.length) * 100);
  }
  
  // Use appendRow which automatically adds year
  return appendRow("TaskAnalysis", data);
}

function getTaskProgress(studentId, taskName) {
  const data = getTableData("TaskAnalysis", getCurrentYear())
    .filter(d => d.studentId === studentId && d.taskName === taskName)
    .sort((a, b) => new Date(a.date) - new Date(b.date));
  
  if (data.length === 0) {
    return { progress: [], currentMastery: 0 };
  }
  
  const progress = data.map(entry => ({
    date: entry.date,
    percentComplete: parseInt(entry.percentComplete) || 0,
    promptLevels: entry.promptLevels
  }));
  
  const latest = data[data.length - 1];
  
  return {
    progress,
    currentMastery: parseInt(latest.percentComplete) || 0,
    trend: calculateTaskTrend(progress),
    stepsNeedingSupport: identifyStepsNeedingSupport(latest)
  };
}

function calculateTaskTrend(progress) {
  if (progress.length < 3) return 'Insufficient data';
  
  const recent = progress.slice(-5);
  const percentages = recent.map(p => p.percentComplete);
  
  // Simple linear regression
  const avgIncrease = (percentages[percentages.length - 1] - percentages[0]) / percentages.length;
  
  if (avgIncrease > 5) return 'Improving';
  if (avgIncrease < -5) return 'Declining';
  return 'Stable';
}

function identifyStepsNeedingSupport(taskEntry) {
  if (!taskEntry.steps || !taskEntry.promptLevels) return [];
  
  const stepsNeedingSupport = [];
  taskEntry.promptLevels.forEach((level, index) => {
    if (level !== 'I' && level !== 'Independent') {
      stepsNeedingSupport.push({
        step: taskEntry.steps[index],
        currentPromptLevel: level
      });
    }
  });
  
  return stepsNeedingSupport;
}

// Work Sample Scoring
function addWorkSample(data) {
  const samples = getTableData("WorkSamples", getCurrentYear());
  
  data.id = Utilities.getUuid();
  data.timestamp = new Date().toISOString();
  
  // Calculate percentage
  if (data.scoreEarned && data.scoreTotal) {
    data.percentage = Math.round((parseInt(data.scoreEarned) / parseInt(data.scoreTotal)) * 100);
  }
  
  // Use appendRow which automatically adds year
  return appendRow("WorkSamples", data);
}

function getWorkSampleAnalysis(studentId, subject) {
  const samples = getTableData("WorkSamples", getCurrentYear())
    .filter(d => d.studentId === studentId);
  
  const subjectSamples = subject ? samples.filter(s => s.subject === subject) : samples;
  
  if (subjectSamples.length === 0) {
    return { averageScore: 0, trend: 'No data' };
  }
  
  const percentages = subjectSamples.map(s => 
    (parseInt(s.scoreEarned) / parseInt(s.scoreTotal)) * 100
  );
  
  const average = percentages.reduce((a, b) => a + b, 0) / percentages.length;
  
  // Trend analysis
  let trend = 'Stable';
  if (percentages.length >= 3) {
    const firstThird = percentages.slice(0, Math.floor(percentages.length / 3));
    const lastThird = percentages.slice(-Math.floor(percentages.length / 3));
    
    const firstAvg = firstThird.reduce((a, b) => a + b, 0) / firstThird.length;
    const lastAvg = lastThird.reduce((a, b) => a + b, 0) / lastThird.length;
    
    if (lastAvg > firstAvg + 10) trend = 'Improving';
    else if (lastAvg < firstAvg - 10) trend = 'Declining';
  }
  
  return {
    averageScore: average.toFixed(1),
    trend,
    totalSamples: subjectSamples.length,
    subjectBreakdown: getSubjectBreakdown(samples)
  };
}

function getSubjectBreakdown(samples) {
  const breakdown = {};
  
  samples.forEach(sample => {
    if (!breakdown[sample.subject]) {
      breakdown[sample.subject] = {
        count: 0,
        totalScore: 0,
        totalPossible: 0
      };
    }
    
    breakdown[sample.subject].count++;
    breakdown[sample.subject].totalScore += parseInt(sample.scoreEarned) || 0;
    breakdown[sample.subject].totalPossible += parseInt(sample.scoreTotal) || 0;
  });
  
  Object.keys(breakdown).forEach(subject => {
    const data = breakdown[subject];
    data.average = ((data.totalScore / data.totalPossible) * 100).toFixed(1);
  });
  
  return breakdown;
}

// Prompt Level Tracking
function addPromptTracking(data) {
  const prompts = getTableData("PromptTracking", getCurrentYear());
  
  data.id = Utilities.getUuid();
  data.timestamp = new Date().toISOString();
  
  // Convert prompt level to numeric for analysis
  data.promptLevelNumeric = convertPromptToNumeric(data.promptLevel);
  
  // Use appendRow which automatically adds year
  return appendRow("PromptTracking", data);
}

function convertPromptToNumeric(promptLevel) {
  const levels = {
    'FP': 5, 'Full Physical': 5,
    'PP': 4, 'Partial Physical': 4,
    'M': 3, 'Model': 3,
    'V': 2, 'Verbal': 2,
    'G': 1, 'Gestural': 1,
    'I': 0, 'Independent': 0
  };
  
  return levels[promptLevel] || -1;
}

function getPromptFading(studentId, skill) {
  const data = getTableData("PromptTracking", getCurrentYear())
    .filter(d => d.studentId === studentId && d.skill === skill)
    .sort((a, b) => new Date(a.date) - new Date(b.date));
  
  if (data.length === 0) {
    return { currentLevel: 'No data', trend: 'No data' };
  }
  
  const latest = data[data.length - 1];
  const promptLevels = data.map(d => convertPromptToNumeric(d.promptLevel));
  
  // Calculate trend
  let trend = 'Stable';
  if (promptLevels.length >= 3) {
    const recent = promptLevels.slice(-5);
    const avgChange = (recent[recent.length - 1] - recent[0]) / recent.length;
    
    if (avgChange < -0.3) trend = 'Fading (improving)';
    else if (avgChange > 0.3) trend = 'Increasing prompts';
  }
  
  return {
    currentLevel: latest.promptLevel,
    trend,
    averageAccuracy: calculateAverageAccuracy(data),
    responseLatency: calculateAverageLatency(data),
    history: data.map(d => ({
      date: d.date,
      promptLevel: d.promptLevel,
      accuracy: d.accuracy
    }))
  };
}

function calculateAverageAccuracy(data) {
  const accuracyData = data.filter(d => d.accuracy).map(d => parseInt(d.accuracy));
  if (accuracyData.length === 0) return 'No data';
  
  return (accuracyData.reduce((a, b) => a + b, 0) / accuracyData.length).toFixed(1) + '%';
}

function calculateAverageLatency(data) {
  const latencyData = data.filter(d => d.responseLatency).map(d => parseInt(d.responseLatency));
  if (latencyData.length === 0) return 'No data';
  
  return (latencyData.reduce((a, b) => a + b, 0) / latencyData.length).toFixed(1) + ' seconds';
}

// Generate IEP Progress Report
function generateIEPProgressReport(studentId, dateRange) {
  const student = getTableData("Students", getCurrentYear()).find(s => s.id === studentId);
  if (!student) throw new Error("Student not found");
  
  const report = {
    student: `${student.firstName} ${student.lastName}`,
    grade: student.grade,
    reportDate: new Date().toISOString().split('T')[0],
    dateRange: dateRange || 'Last 30 days',
    
    behaviorData: getBehaviorStats(studentId),
    frequencyData: getFrequencyStats(studentId),
    abcAnalysis: getABCAnalysis(studentId),
    workSamples: getWorkSampleAnalysis(studentId),
    
    summary: [],
    recommendations: []
  };
  
  // Generate summary points
  if (report.behaviorData.trend === 'improving') {
    report.summary.push('Behavior scores show improvement');
  }
  
  if (report.frequencyData.trend === 'decreasing') {
    report.summary.push('Target behaviors decreasing in frequency');
  }
  
  if (report.workSamples.averageScore > 80) {
    report.summary.push('Academic performance meets expectations');
  }
  
  // Compile recommendations
  report.recommendations = [
    ...report.abcAnalysis.recommendations,
    ...generateDataBasedRecommendations(report)
  ];
  
  return report;
}

function generateDataBasedRecommendations(report) {
  const recommendations = [];
  
  if (report.workSamples.averageScore < 70) {
    recommendations.push('Consider additional academic support');
  }
  
  if (report.behaviorData.average < 2) {
    recommendations.push('Review behavior intervention plan');
  }
  
  if (report.frequencyData.trend === 'increasing') {
    recommendations.push('Increase frequency of reinforcement');
  }
  
  return recommendations;
}