// Settings management for app configuration

function getSettings() {
  const settingsData = getTableData("Settings");
  const settings = {};
  
  settingsData.forEach(row => {
    settings[row.key] = row.value;
  });
  
  // Ensure default settings exist
  const defaults = getDefaultSettings();
  Object.keys(defaults).forEach(key => {
    if (!settings.hasOwnProperty(key)) {
      settings[key] = defaults[key].value;
    }
  });
  
  return settings;
}

function updateSetting(key, value) {
  const settingsData = getTableData("Settings");
  const existingIndex = settingsData.findIndex(row => row.key === key);
  
  if (existingIndex >= 0) {
    settingsData[existingIndex].value = value;
  } else {
    const defaults = getDefaultSettings();
    settingsData.push({
      key,
      value,
      description: defaults[key]?.description || ''
    });
  }
  
  return saveTableData("Settings", settingsData);
}

function resetSettings() {
  const defaults = getDefaultSettings();
  const settingsData = Object.keys(defaults).map(key => ({
    key,
    value: defaults[key].value,
    description: defaults[key].description
  }));
  
  return saveTableData("Settings", settingsData);
}

function getDefaultSettings() {
  return {
    // Theme settings
    themeTitle: {
      value: "FlyOver Teaching Schedule",
      description: "Main title displayed in the app"
    },
    themeSubtitle: {
      value: "Class Management System",
      description: "Subtitle displayed under the main title"
    },
    themePrimaryColor: {
      value: "#667eea",
      description: "Primary theme color (purple gradient start)"
    },
    themeSecondaryColor: {
      value: "#764ba2",
      description: "Secondary theme color (purple gradient end)"
    },
    
    // PDF Export settings
    pdfFontSize: {
      value: "12",
      description: "Base font size for PDF exports (in points)"
    },
    pdfTitleSize: {
      value: "20",
      description: "Title font size for PDF exports (in points)"
    },
    pdfLineSpacing: {
      value: "1.5",
      description: "Line spacing multiplier for PDF exports"
    },
    pdfMargins: {
      value: "15",
      description: "Page margins for PDF exports (in mm)"
    },
    pdfOrientation: {
      value: "landscape",
      description: "PDF orientation (portrait or landscape)"
    },
    pdfFormat: {
      value: "letter",
      description: "PDF page format (letter or a4)"
    },
    
    // Schedule display settings
    scheduleCardHeight: {
      value: "auto",
      description: "Height of schedule cards (auto or fixed px value)"
    },
    scheduleIconSize: {
      value: "1.2em",
      description: "Size of icons in schedule cards"
    },
    scheduleDefaultColor: {
      value: "#2196F3",
      description: "Default color for schedule entries"
    },
    scheduleBreakColor: {
      value: "#FFC107",
      description: "Color for break periods"
    },
    scheduleSpecialColor: {
      value: "#4CAF50",
      description: "Color for special activities"
    },
    
    // Behavior tracking settings
    behaviorChartType: {
      value: "line",
      description: "Default chart type for behavior tracking"
    },
    behaviorChartDays: {
      value: "30",
      description: "Number of days to show in behavior charts"
    },
    behaviorScoreGoodThreshold: {
      value: "2.5",
      description: "Score threshold for 'good' behavior trend"
    },
    behaviorAlertThreshold: {
      value: "1.5",
      description: "Score threshold for behavior alerts"
    },
    
    // UI Preferences
    sidebarWidth: {
      value: "450",
      description: "Width of the sidebar in pixels"
    },
    autoLaunchSidebar: {
      value: "true",
      description: "Automatically open sidebar on sheet open"
    },
    showTooltips: {
      value: "true",
      description: "Show helpful tooltips in the UI"
    },
    animationSpeed: {
      value: "normal",
      description: "UI animation speed (slow, normal, fast, none)"
    },
    
    // Data management
    autoBackup: {
      value: "false",
      description: "Automatically backup data to Drive daily"
    },
    backupRetentionDays: {
      value: "30",
      description: "Number of days to keep backups"
    },
    dateFormat: {
      value: "MM/DD/YYYY",
      description: "Date format for display"
    },
    timeFormat: {
      value: "12h",
      description: "Time format (12h or 24h)"
    }
  };
}

function initializeSettings() {
  const currentSettings = getTableData("Settings");
  
  if (currentSettings.length === 0) {
    resetSettings();
    return "Settings initialized with defaults";
  }
  
  // Add any missing default settings
  const defaults = getDefaultSettings();
  const existingKeys = currentSettings.map(s => s.key);
  const newSettings = [];
  
  Object.keys(defaults).forEach(key => {
    if (!existingKeys.includes(key)) {
      newSettings.push({
        key,
        value: defaults[key].value,
        description: defaults[key].description
      });
    }
  });
  
  if (newSettings.length > 0) {
    const updatedSettings = [...currentSettings, ...newSettings];
    saveTableData("Settings", updatedSettings);
    return `Added ${newSettings.length} new settings`;
  }
  
  return "Settings already up to date";
}

function exportSettings() {
  const settings = getSettings();
  const blob = Utilities.newBlob(
    JSON.stringify(settings, null, 2),
    "application/json",
    "flyover-settings.json"
  );
  
  DriveApp.createFile(blob);
  return "Settings exported to Google Drive";
}

function importSettings(jsonString) {
  try {
    const importedSettings = JSON.parse(jsonString);
    const settingsData = [];
    const defaults = getDefaultSettings();
    
    Object.keys(importedSettings).forEach(key => {
      settingsData.push({
        key,
        value: importedSettings[key],
        description: defaults[key]?.description || ''
      });
    });
    
    saveTableData("Settings", settingsData);
    return "Settings imported successfully";
  } catch (error) {
    throw new Error("Invalid settings JSON: " + error.message);
  }
}