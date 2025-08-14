# Deployment Guide for FlyOver Teaching App

## Prerequisites

- Google account
- Node.js installed (for CLASP)
- Basic command line knowledge

## Step-by-Step Deployment

### 1. Install CLASP

Open your terminal/command prompt and run:

```bash
npm install -g @google/clasp
```

### 2. Authenticate with Google

```bash
clasp login
```

This will open a browser window. Log in with the Google account where you want to deploy the app.

### 3. Deploy the Project

#### Option A: Fresh Deployment

```bash
# Navigate to project folder
cd flyover-teaching

# Create new Google Sheet with Apps Script
clasp create --title "FlyOver Teaching" --type sheets

# This creates a new Google Sheet and updates .clasp.json with the script ID
```

#### Option B: Deploy to Existing Sheet

1. Open your existing Google Sheet
2. Go to Extensions → Apps Script
3. Copy the Script ID from the URL (between `/projects/` and `/edit`)
4. Update `.clasp.json`:

```json
{
  "scriptId": "YOUR_SCRIPT_ID_HERE",
  "rootDir": "src"
}
```

### 4. Push Code to Google

```bash
clasp push
```

You'll see output like:
```
└─ backend/Code.gs
└─ backend/SheetModels.gs
└─ backend/ScheduleLogic.gs
└─ frontend/Page.html
└─ frontend/App.html
└─ frontend/Components.html
└─ frontend/Settings.html
└─ frontend/Style.css.html
Pushed 8 files.
```

### 5. Open and Test

```bash
# Open the Google Sheet
clasp open --webapp

# Or open the script editor
clasp open
```

### 6. First Run Setup

1. Refresh your Google Sheet
2. You should see "FlyOver Teaching" in the menu bar
3. Click **FlyOver Teaching → Launch Dashboard**
4. Grant permissions when prompted
5. The sidebar will open with your app

## Sharing with Other Teachers

### Method 1: Direct Deployment

Share these files with the teacher:
- The entire `flyover-teaching` folder
- This deployment guide

They follow steps 1-6 above on their own Google account.

### Method 2: Copy Spreadsheet

1. Deploy to your account first
2. Share the Google Sheet with "View" permission
3. They make a copy: File → Make a copy
4. The Apps Script is copied with it
5. They may need to re-authorize on first run

### Method 3: GitHub Repository

1. Upload project to GitHub
2. Teachers clone/download the repository
3. They follow the deployment steps

## Managing Multiple Deployments

### For IT Administrators

```bash
# Deploy to teacher account 1
clasp logout
clasp login  # Login as teacher1@school.edu
clasp create --title "FlyOver Teaching - Teacher 1" --type sheets
clasp push

# Deploy to teacher account 2  
clasp logout
clasp login  # Login as teacher2@school.edu
clasp create --title "FlyOver Teaching - Teacher 2" --type sheets
clasp push
```

### Batch Deployment Script

Create `deploy-all.sh`:

```bash
#!/bin/bash
TEACHERS=("teacher1@school.edu" "teacher2@school.edu" "teacher3@school.edu")

for teacher in "${TEACHERS[@]}"
do
  echo "Deploying for $teacher"
  clasp logout
  echo "Please login as $teacher"
  clasp login
  clasp create --title "FlyOver Teaching - $teacher" --type sheets
  clasp push
  echo "Deployed successfully for $teacher"
done
```

## Updating Deployed Apps

```bash
# Make your code changes
# Then push updates
clasp push

# View version history
clasp deployments

# Create a new version
clasp deploy --description "Added new features"
```

## Troubleshooting Deployment

### Error: "User has not enabled the Apps Script API"

1. Visit: https://script.google.com/home/usersettings
2. Toggle "Google Apps Script API" to ON

### Error: "Authorization needed"

Run the app function manually first:
1. Open Apps Script editor: `clasp open`
2. Select `onOpen` function
3. Click Run
4. Authorize when prompted

### Error: "Script ID not found"

Check `.clasp.json` has correct format:
```json
{
  "scriptId": "1234567890abcdefg",
  "rootDir": "src"
}
```

## Production Best Practices

1. **Test First**: Deploy to a test account before production
2. **Version Control**: Use Git to track changes
3. **Documentation**: Keep README updated with any customizations
4. **Backup**: Export Google Sheet data regularly
5. **Permissions**: Only grant edit access to trusted users

## Support

For deployment issues:
1. Check CLASP documentation: https://github.com/google/clasp
2. Review Apps Script logs: `clasp logs`
3. Contact IT support with error messages

---

Last updated: 2024
Version: 1.0.0