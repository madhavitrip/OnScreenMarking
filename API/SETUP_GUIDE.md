# OSM Portal Backend - Setup Guide

## 🚀 Quick Start

### Prerequisites
- .NET 8.0 SDK
- MySQL 8.0+
- Visual Studio 2022 or VS Code

### Step 1: Install .NET SDK

Download and install from: https://dotnet.microsoft.com/download

Verify installation:
```bash
dotnet --version
```

### Step 2: Install MySQL

Download from: https://dev.mysql.com/downloads/mysql/

Create a database:
```sql
CREATE DATABASE osm_portal;
```

### Step 3: Clone and Setup Project

```bash
cd API/API
```

### Step 4: Restore Dependencies

```bash
dotnet restore
```

### Step 5: Configure Database

Edit `appsettings.json`:
```json
"ConnectionStrings": {
  "DefaultConnection": "Server=localhost;Database=osm_portal;User Id=root;Password=your_password;Port=3306;"
}
```

### Step 6: Create Database Schema

```bash
dotnet ef database update
```

### Step 7: Run the Application

```bash
dotnet run
```

The API will start at:
- HTTP: http://localhost:5000
- HTTPS: https://localhost:5001

### Step 8: Access Swagger UI

Open browser and navigate to:
```
https://localhost:5001/swagger
```

## 📋 Project Structure

```
API/
├── API/
│   ├── Controllers/
│   │   ├── AuthController.cs
│   │   ├── ScriptsController.cs
│   │   ├── MarkingController.cs
│   │   ├── SubjectConfigController.cs
│   │   └── ReportsController.cs
│   ├── Models/
│   │   ├── User.cs
│   │   ├── Script.cs
│   │   ├── Marking.cs
│   │   ├── SubjectConfig.cs
│   │   └── DTOs/
│   │       └── AuthDto.cs
│   ├── Data/
│   │   └── ApplicationDbContext.cs
│   ├── Program.cs
│   ├── appsettings.json
│   ├── appsettings.Development.json
│   └── API.csproj
└── README.md
```

## 🔧 Configuration

### appsettings.json

```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "AllowedHosts": "*",
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=osm_portal;User Id=root;Password=;Port=3306;"
  },
  "Jwt": {
    "SecretKey": "your_super_secret_key_change_in_production_at_least_32_characters",
    "Issuer": "OSMPortal",
    "Audience": "OSMPortalUsers",
    "ExpirationMinutes": 60
  },
  "Cors": {
    "AllowedOrigins": "http://localhost:5173,http://localhost:3000"
  }
}
```

## 🗄️ Database Setup

### Create Database
```sql
CREATE DATABASE osm_portal;
USE osm_portal;
```

### Run Migrations
```bash
dotnet ef database update
```

### Seed Initial Data (Optional)
```bash
dotnet ef database update
```

## 🔐 Security Configuration

### JWT Secret Key
Change the secret key in production:
```json
"Jwt": {
  "SecretKey": "your_very_long_secret_key_at_least_32_characters_for_production"
}
```

### CORS Configuration
Update allowed origins:
```json
"Cors": {
  "AllowedOrigins": "https://yourdomain.com,https://www.yourdomain.com"
}
```

## 🧪 Testing the API

### 1. Register a User
```bash
curl -X POST https://localhost:5001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Dr. Sharma",
    "email": "sharma@cbse.gov.in",
    "password": "password123",
    "userType": "examiner",
    "department": "mathematics"
  }'
```

### 2. Login
```bash
curl -X POST https://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "sharma@cbse.gov.in",
    "password": "password123"
  }'
```

### 3. Get Dashboard Stats
```bash
curl -X GET https://localhost:5001/api/reports/dashboard \
  -H "Authorization: Bearer {token}"
```

## 📊 Database Diagram

```
Users
├── Id (PK)
├── Name
├── Email (Unique)
├── PasswordHash
├── UserType
└── ...

Scripts
├── Id (PK)
├── ScriptId (Unique)
├── RollNo
├── StudentName
├── Subject
├── AssignedExaminerId (FK -> Users)
└── ...

Markings
├── Id (PK)
├── ScriptId (FK -> Scripts)
├── ExaminerId (FK -> Users)
├── Subject
├── MarksJson
└── ...

SubjectConfigs
├── Id (PK)
├── Name (Unique)
├── Code
├── Sections (1:Many)
│   ├── Id (PK)
│   ├── SubjectConfigId (FK)
│   └── Questions (1:Many)
│       ├── Id (PK)
│       ├── SectionId (FK)
│       └── ...
└── ...
```

## 🚀 Development Commands

### Build Project
```bash
dotnet build
```

### Run Project
```bash
dotnet run
```

### Run in Watch Mode
```bash
dotnet watch run
```

### Create Migration
```bash
dotnet ef migrations add MigrationName
```

### Update Database
```bash
dotnet ef database update
```

### Remove Last Migration
```bash
dotnet ef migrations remove
```

### View Database
```bash
dotnet ef dbcontext info
```

## 🐛 Common Issues

### Issue: "Unable to connect to MySQL"
**Solution:**
- Verify MySQL is running
- Check connection string
- Verify database exists
- Check username and password

### Issue: "Migration failed"
**Solution:**
```bash
dotnet ef database drop
dotnet ef database update
```

### Issue: "Port already in use"
**Solution:**
```bash
dotnet run --urls "https://localhost:5002"
```

### Issue: "JWT token invalid"
**Solution:**
- Verify secret key matches
- Check token expiration
- Verify Authorization header format

## 📝 Environment Variables

Create `.env` file (optional):
```
ASPNETCORE_ENVIRONMENT=Development
ASPNETCORE_URLS=https://localhost:5001;http://localhost:5000
```

## 🔄 Deployment

### Build for Production
```bash
dotnet publish -c Release -o ./publish
```

### Run Published Version
```bash
dotnet ./publish/API.dll
```

### Docker Deployment
Create `Dockerfile`:
```dockerfile
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /app
COPY . .
RUN dotnet publish -c Release -o out

FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /app/out .
EXPOSE 80
ENTRYPOINT ["dotnet", "API.dll"]
```

Build and run:
```bash
docker build -t osm-api .
docker run -p 5000:80 osm-api
```

## 📞 Support

For issues or questions, refer to:
- Official Documentation: https://docs.microsoft.com/dotnet
- Entity Framework: https://docs.microsoft.com/ef
- MySQL: https://dev.mysql.com/doc

---

**Version:** 1.0.0  
**Last Updated:** April 2026
