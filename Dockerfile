# Build stage
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copy solution and project files
COPY ["FlyOverTeaching.sln", "./"]
COPY ["FlyOverTeaching.Server/FlyOverTeaching.Server.csproj", "FlyOverTeaching.Server/"]
COPY ["FlyOverTeaching.Client/FlyOverTeaching.Client.csproj", "FlyOverTeaching.Client/"]
COPY ["FlyOverTeaching.Shared/FlyOverTeaching.Shared.csproj", "FlyOverTeaching.Shared/"]

# Restore dependencies
RUN dotnet restore

# Copy everything else
COPY . .

# Build the application
WORKDIR "/src/FlyOverTeaching.Server"
RUN dotnet build -c Release -o /app/build

# Publish stage
FROM build AS publish
RUN dotnet publish -c Release -o /app/publish /p:UseAppHost=false

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app
EXPOSE 80
EXPOSE 443

# Install necessary libraries for QuestPDF
RUN apt-get update && \
    apt-get install -y libgdiplus libc6-dev && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "FlyOverTeaching.Server.dll"]