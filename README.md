# Teaching Schedule Manager

A comprehensive web-based schedule management system for teachers, featuring student and teacher assignment, color-coded time slots, and full editing capabilities. All data is stored locally in the browser using SQLite for privacy and offline access.

## Features

- 📅 **Visual Schedule Display** - Color-coded time slots with icons
- ✏️ **Full Editor** - Add, edit, and delete schedule entries
- 👥 **People Management** - Track students and teachers with contact info
- 🎨 **Customizable Themes** - Personalize colors and appearance
- 💾 **Import/Export** - Backup and share schedules as JSON files
- 📄 **PDF Export** - Generate PDFs with customizable font sizes and layout
- 🖨️ **Print Support** - Optimized print layout
- 🔒 **Privacy First** - All data stored locally in browser
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile

## Quick Start

### Option 1: Direct Browser Use
Simply open `index.html` in a modern web browser (Chrome, Firefox, Safari, Edge).

### Option 2: Docker Deployment

```bash
# Create data directory for logs
sudo mkdir -p /srv/docker_data/teacher_schedule/logs

# Build and run with Docker Compose
docker-compose up -d

# Access at http://localhost:9090
```

### Option 3: Docker Manual Build

```bash
# Create data directory for logs
sudo mkdir -p /srv/docker_data/teacher_schedule/logs

# Build the image
docker build -t teaching-schedule .

# Run the container with volume mapping
docker run -d \
  -p 9090:80 \
  --name schedule \
  -v /srv/docker_data/teacher_schedule/logs:/var/log/nginx \
  teaching-schedule

# Access at http://localhost:9090
```

## Usage Guide

### Viewing Schedule
1. Navigate to the main Schedule page
2. Use view toggles for Detailed or Compact display
3. Filter by day of the week
4. Click edit buttons (appear on hover) to modify entries

### Editing Entries
1. Go to the Editor page
2. Click "+ New" to create an entry or select existing from list
3. Configure:
   - Time range
   - Subject/Activity name
   - Grade level
   - Assign students and teachers
   - Choose icon and color
   - Add notes
4. Save changes

### Managing People
1. In Editor, click "Manage Students" or "Manage Teachers"
2. Add new people with their information
3. Assigned people appear as checkboxes when editing entries

### PDF Export Settings
1. In Editor, click "Configure PDF" in the PDF Export Settings card
2. Adjust font sizes for each element:
   - Time display (default: 7pt)
   - Grade labels (default: 7pt)
   - Subject text - Line 1 (default: 10pt)
   - Subject text - Line 2 (default: 9pt)
   - Student names (default: 7.5pt)
   - Teacher names (default: 7.5pt)
   - Notes (default: 7pt)
3. Configure layout:
   - Columns per page (2-6, default: 4)
   - Rows per page (2-6, default: 4)
4. Save settings or reset to defaults

### Backup & Restore
- **Export**: Click "Export JSON" to download your schedule (includes PDF settings)
- **Import**: Click "Import JSON" to restore from a file
- **Reset**: "Reset to Defaults" restores the demo schedule
- **PDF Export**: Click "Export PDF" to generate a PDF with your custom settings

## File Structure

```
teaching-schedule/
├── index.html          # Main schedule viewer
├── editor.html         # Schedule editor interface
├── help.html          # Comprehensive help documentation
├── css/
│   └── styles.css     # Shared styles
├── js/
│   ├── database.js    # SQLite database management
│   ├── schedule.js    # Schedule viewer logic
│   └── editor.js      # Editor functionality
├── Dockerfile         # Docker container configuration
└── docker-compose.yml # Docker Compose orchestration
```

## Technology Stack

- **Frontend**: HTML5, Bootstrap 5, Font Awesome icons
- **Database**: sql.js (SQLite in browser)
- **Storage**: Browser localStorage
- **PDF Generation**: jsPDF library
- **Deployment**: Docker with nginx

## Browser Requirements

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- JavaScript enabled
- localStorage enabled

## Data Privacy

All schedule data is stored locally in your browser's localStorage. No data is sent to external servers. Your information remains completely private and under your control.

## Docker Volume Structure

When deployed with Docker, the application uses the following volume structure:

```
/srv/docker_data/teacher_schedule/
├── logs/                 # Nginx access and error logs
│   ├── access.log
│   └── error.log
├── letsencrypt/         # SSL certificates (if using Traefik)
└── nginx.conf           # Custom nginx config (optional)
```

**Note**: The actual schedule data is stored in the browser's localStorage, not on the server. The Docker volumes are only for logs and configuration.

## Development

### Local Development
1. Clone the repository
2. Open index.html in a browser
3. Make changes to files
4. Refresh browser to see updates

### Docker Development
Uncomment the volume mounts in `docker-compose.yml` to enable live reloading:

```yaml
volumes:
  # Main HTML pages
  - ./index.html:/usr/share/nginx/html/index.html:ro
  - ./editor.html:/usr/share/nginx/html/editor.html:ro
  - ./help.html:/usr/share/nginx/html/help.html:ro
  
  # Static assets directories
  - ./css:/usr/share/nginx/html/css:ro
  - ./js:/usr/share/nginx/html/js:ro
```

### Production Deployment

For production deployment:

1. Create the data directory:
   ```bash
   sudo mkdir -p /srv/docker_data/teacher_schedule/logs
   ```

2. Deploy with docker-compose:
   ```bash
   docker-compose up -d
   ```

3. View logs:
   ```bash
   tail -f /srv/docker_data/teacher_schedule/logs/access.log
   tail -f /srv/docker_data/teacher_schedule/logs/error.log
   ```

## Troubleshooting

### Schedule Not Loading
- Check JavaScript is enabled
- Clear browser cache
- Try a different browser
- Check browser console for errors

### Changes Not Saving
- Ensure localStorage is enabled
- Check available storage space
- Try exporting and reimporting

### Docker Issues
- Ensure Docker is running
- Check port 8080 is available
- View logs: `docker logs teaching-schedule`

## License

This project is provided as-is for educational use.

## Support

For detailed usage instructions, visit the Help page within the application.