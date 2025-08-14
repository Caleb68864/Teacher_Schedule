# FlyOver Teaching - Schedule Manager

A modern Progressive Web App (PWA) for managing teaching schedules, built with .NET Core 9 Blazor WebAssembly, MudBlazor UI components, and QuestPDF for document generation.

## 🚀 Features

- **Schedule Management**: Create, edit, and organize class schedules with drag-and-drop support
- **Student & Teacher Management**: Track students and teachers with detailed profiles
- **PDF Export**: Generate professional PDFs using QuestPDF with customizable layouts
- **Theme Customization**: Personalize the app's appearance with custom colors and gradients
- **Offline Support**: PWA capabilities with service workers for offline functionality
- **Client-Side Storage**: SQLite database runs entirely in the browser using LocalStorage
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices

## 📁 Project Structure

```
FlyOverTeaching/
├── FlyOverTeaching.Server/     # ASP.NET Core server hosting the Blazor app
│   ├── Controllers/            # API controllers (PDF generation)
│   └── Program.cs             # Server configuration
├── FlyOverTeaching.Client/     # Blazor WebAssembly client app
│   ├── Components/            # Reusable Blazor components
│   ├── Pages/                 # Page components (Schedule, Editor, etc.)
│   ├── Services/              # Business logic and data services
│   ├── Layout/                # Layout components (MainLayout, NavMenu)
│   └── wwwroot/               # Static assets (CSS, JS, images)
├── FlyOverTeaching.Shared/     # Shared models between client and server
│   └── Models/                # Data models (ScheduleEntry, Student, etc.)
└── .mcp/                      # MCP configuration files for development
```

## 🛠️ Prerequisites

- .NET 9.0 SDK or later
- Docker (optional, for containerized deployment)
- Visual Studio 2022 / VS Code / JetBrains Rider

## 🚀 Quick Start

### Development Mode

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Teacher_Schedule
   ```

2. **Run the application**
   ```bash
   dotnet run --project FlyOverTeaching.Server
   ```

3. **Access the application**
   - Open your browser and navigate to `https://localhost:5001` or `http://localhost:5000`

### Docker Deployment

1. **Build and run with Docker Compose**
   ```bash
   docker-compose up -d
   ```

2. **Access the application**
   - Navigate to `http://localhost:5000`

## 🧪 Testing

### Unit Tests
```bash
dotnet test
```

### UI Tests with Playwright
```bash
# Install Playwright
pwsh bin/Debug/net9.0/playwright.ps1 install

# Run tests
dotnet test --filter "Category=E2E"
```

## 📦 Building for Production

```bash
# Build the solution
dotnet build -c Release

# Publish the server project (includes client)
dotnet publish FlyOverTeaching.Server -c Release -o ./publish
```

## 🐳 Docker Support

The application includes a multi-stage Dockerfile for optimized production builds:

```bash
# Build Docker image
docker build -t flyover-teaching:latest .

# Run container
docker run -d -p 5000:80 --name flyover-teaching flyover-teaching:latest
```

## 🔧 MCP (Model Context Protocol) Tools

The project includes several MCP configurations for enhanced development:

- **playwright.json**: UI testing automation
- **database.json**: Database management and migrations
- **deployment.json**: CI/CD pipeline configuration
- **development.json**: Development workflow automation
- **monitoring.json**: Application monitoring and observability

## 🎨 Technology Stack

- **Frontend**: Blazor WebAssembly, MudBlazor, Bootstrap 5
- **Backend**: ASP.NET Core 9.0
- **PDF Generation**: QuestPDF
- **Database**: SQLite (client-side via LocalStorage)
- **Icons**: Font Awesome 6.4
- **PWA**: Service Workers for offline support

## 📱 PWA Features

- **Installable**: Can be installed as a standalone app on desktop and mobile
- **Offline Support**: Works offline with cached resources
- **Push Notifications**: Ready for push notification implementation
- **App Manifest**: Configured for app store submission

## 🔐 Security

- CORS configured for secure cross-origin requests
- HTTPS enforced in production
- Client-side data storage with encryption support (can be enabled)
- No sensitive data transmitted to server (all storage is client-side)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support, please open an issue in the GitHub repository or contact the development team.

## 🔄 Migration from Legacy HTML Version

This is a complete rewrite of the original HTML/JavaScript application as a modern Blazor PWA. Key improvements include:

- Type-safe C# code replacing JavaScript
- Component-based architecture
- Server-side PDF generation with QuestPDF
- Enhanced performance with WebAssembly
- Better maintainability and testing capabilities

To migrate existing data:
1. Export your schedule from the old version as JSON
2. Import the JSON file in the new Blazor application
3. All data will be automatically converted to the new format