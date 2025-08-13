# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a single-page web application for managing and displaying a teacher's class schedule. The application is built as a standalone HTML file with embedded CSS and JavaScript, using Bootstrap 5 and Font Awesome for styling.

## Key Architecture

The application consists of a single file `teacher-schedule.html` containing:

1. **Theme Configuration** (`themeConfig` object): Controls the visual appearance including colors, gradients, and text
2. **Schedule Data** (`scheduleData` array): Contains all time slots with details like time, subject, students, grades, and visual styling
3. **Dynamic Rendering**: JavaScript functions that generate the schedule grid from the data array
4. **View Modes**: Detailed and compact views for different display preferences
5. **Export/Print**: Functionality to export schedule as JSON or print-friendly format

## Common Development Tasks

### Modifying the Schedule
Edit the `scheduleData` array (starting at line 410) to update schedule entries. Each entry has:
- `time`: Time range string
- `subject`: Class/activity name
- `students`: Array of student names
- `grade`: Grade level (optional)
- `type`: Activity type (normal/special/break)
- `icon`: Font Awesome icon class
- `color`: Hex color for visual styling
- `note`: Additional information (optional)

### Changing Theme/Colors
Modify the `themeConfig` object (starting at line 397) to customize:
- Title and subtitle text
- Background gradients
- Button colors
- Control panel styling

### Testing Changes
Simply open `teacher-schedule.html` in a web browser to test. No build process or server required.

## Dependencies

The application uses CDN-hosted libraries:
- Bootstrap 5.3.0 (CSS framework)
- Font Awesome 6.4.0 (icons)

No package management or build tools needed.