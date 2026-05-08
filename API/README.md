# OSM Portal - .NET Backend API

A comprehensive RESTful API for the On-Screen Marking (OSM) System built with ASP.NET Core and MySQL.

## 🚀 Features

- **Authentication & Authorization**
  - JWT-based authentication
  - Role-based access control (Examiner, Coordinator, Admin)
  - Secure password hashing

- **Script Management**
  - Create, read, update scripts
  - Assign scripts to examiners
  - Track script status (pending, in_progress, completed)

- **Marking System**
  - Create marking records
  - Update marks question-by-question
  - Submit and lock markings
  - Real-time score calculations

- **Subject Configuration**
  - Manage exam structure
  - Define sections and questions
  - Configure marks allocation
  - Support for 10 question types

- **Reports & Analytics**
  - Dashboard statistics
  - Subject-wise analysis
  - Examiner performance tracking
  - Score distribution analysis

## 📋 Prerequisites

- .NET 8.0 SDK or later
- MySQL 8.0 or later
- Visual Studio 2022 or VS Code

## 🔧 Installation

### 1. Clone the Repository
```bash
cd API/API
```

### 2. Install Dependencies
```bash
dotnet restore
```

### 3. Configure Database

Update `appsettings.json` with your MySQL connection string:
```json
"ConnectionStrings": {
  "DefaultConnection": "Server=localhost;Database=osm_portal;User Id=root;Password=your_password;Port=3306;"
}
```

### 4. Create Database

Run migrations to create the database:
```bash
dotnet ef database update
```

### 5. Run the Application
```bash
dotnet run
```

The API will be available at `https://localhost:5001` or `http://localhost:5000`

## 📚 API Endpoints

### Authentication

#### Register
```
POST /api/auth/register
Content-Type: application/json

{
  "name": "Dr. Sharma",
  "email": "sharma@cbse.gov.in",
  "password": "password123",
  "userType": "examiner",
  "department": "mathematics"
}
```

#### Login
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "sharma@cbse.gov.in",
  "password": "password123"
}
```

### Scripts

#### Get All Scripts
```
GET /api/scripts?status=pending&subject=mathematics&page=1&limit=10
Authorization: Bearer {token}
```

#### Get Single Script
```
GET /api/scripts/{id}
Authorization: Bearer {token}
```

#### Create Script
```
POST /api/scripts
Authorization: Bearer {token}
Content-Type: application/json

{
  "scriptId": "OSM-2024-001",
  "rollNo": "001",
  "studentName": "Aarav Kumar",
  "subject": "mathematics",
  "examDate": "2024-04-28T00:00:00Z"
}
```

#### Update Script
```
PUT /api/scripts/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "status": "completed",
  "totalMarks": 85,
  "percentage": 85,
  "remarks": "Good performance"
}
```

#### Assign Script to Examiner
```
PUT /api/scripts/{id}/assign
Authorization: Bearer {token}
Content-Type: application/json

{
  "examinerId": 1
}
```

#### Get Examiner's Scripts
```
GET /api/scripts/examiner/{examinerId}
Authorization: Bearer {token}
```

### Marking

#### Create Marking
```
POST /api/marking
Authorization: Bearer {token}
Content-Type: application/json

{
  "scriptId": 1,
  "subject": "mathematics",
  "marksJson": "{\"1\": 1, \"2\": 1, \"3\": 0}",
  "remarks": "Good attempt"
}
```

#### Get Marking
```
GET /api/marking/{id}
Authorization: Bearer {token}
```

#### Update Marking
```
PUT /api/marking/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "marksJson": "{\"1\": 1, \"2\": 1, \"3\": 1}",
  "totalMarks": 85,
  "percentage": 85,
  "remarks": "Updated marks"
}
```

#### Submit Marking
```
PUT /api/marking/{id}/submit
Authorization: Bearer {token}
```

#### Get Examiner's Markings
```
GET /api/marking/examiner/{examinerId}?status=submitted&page=1&limit=10
Authorization: Bearer {token}
```

### Subject Configuration

#### Get All Subjects
```
GET /api/subjectconfig
```

#### Get Subject Configuration
```
GET /api/subjectconfig/{subject}
```

#### Create Subject Configuration
```
POST /api/subjectconfig
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Mathematics",
  "code": "MAT",
  "totalMarks": 100,
  "duration": 180,
  "sections": [...]
}
```

### Reports

#### Get Dashboard Statistics
```
GET /api/reports/dashboard
Authorization: Bearer {token}
```

#### Get Subject-wise Statistics
```
GET /api/reports/subject-wise
Authorization: Bearer {token}
```

#### Get Examiner Performance
```
GET /api/reports/examiner-performance
Authorization: Bearer {token}
```

#### Get Score Distribution
```
GET /api/reports/score-distribution
Authorization: Bearer {token}
```

#### Get Examiner Report
```
GET /api/reports/examiner/{examinerId}
Authorization: Bearer {token}
```

## 🗄️ Database Schema

### Users Table
- Id (Primary Key)
- Name
- Email (Unique)
- PasswordHash
- UserType (examiner, coordinator, admin)
- Department
- IsActive
- ProfileImage
- Phone
- Address
- CreatedAt
- UpdatedAt

### Scripts Table
- Id (Primary Key)
- ScriptId (Unique)
- RollNo
- StudentName
- Subject
- ExamDate
- ScannedImageUrl
- Status
- AssignedExaminerId (Foreign Key)
- TotalMarks
- MaxMarks
- Percentage
- Remarks
- SubmittedAt
- CreatedAt
- UpdatedAt

### Markings Table
- Id (Primary Key)
- ScriptId (Foreign Key)
- ExaminerId (Foreign Key)
- Subject
- MarksJson
- SectionMarksJson
- TotalMarks
- MaxMarks
- Percentage
- Remarks
- Status
- StartedAt
- SubmittedAt
- ReviewedAt
- ReviewedById
- CreatedAt
- UpdatedAt

### SubjectConfigs Table
- Id (Primary Key)
- Name (Unique)
- Code
- TotalMarks
- Duration
- CreatedAt
- UpdatedAt

### Sections Table
- Id (Primary Key)
- SubjectConfigId (Foreign Key)
- SectionId
- Name
- Description
- TotalQuestions
- TotalMarks

### Questions Table
- Id (Primary Key)
- SectionId (Foreign Key)
- QuestionNo
- Marks
- Type

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer {token}
```

### Token Claims
- id: User ID
- email: User email
- userType: User role

## 👥 User Roles

### Examiner
- Can view assigned scripts
- Can create and update markings
- Can submit marks
- Can view personal reports

### Coordinator
- Can view all scripts
- Can assign scripts to examiners
- Can view all markings
- Can view examiner performance
- Can generate reports

### Admin
- Full access to all endpoints
- Can manage users
- Can manage subject configurations
- Can manage all scripts and markings

## 🛠️ Configuration

### JWT Settings
Update in `appsettings.json`:
```json
"Jwt": {
  "SecretKey": "your_secret_key_at_least_32_characters",
  "Issuer": "OSMPortal",
  "Audience": "OSMPortalUsers",
  "ExpirationMinutes": 60
}
```

### CORS Settings
```json
"Cors": {
  "AllowedOrigins": "http://localhost:5173,http://localhost:3000"
}
```

### Database Connection
```json
"ConnectionStrings": {
  "DefaultConnection": "Server=localhost;Database=osm_portal;User Id=root;Password=;Port=3306;"
}
```

## 📊 Response Format

### Success Response
```json
{
  "success": true,
  "data": {...},
  "message": "Operation successful"
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description"
}
```

## 🧪 Testing

### Using Swagger UI
Navigate to `https://localhost:5001/swagger` to access the interactive API documentation.

### Using Postman
Import the API endpoints and test with sample data.

### Using cURL
```bash
curl -X POST https://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"examiner@cbse.gov.in","password":"password123"}'
```

## 📝 Logging

Logs are configured in `appsettings.json`. By default, logs are written to the console.

## 🚀 Deployment

### Build for Production
```bash
dotnet publish -c Release -o ./publish
```

### Docker Support
Create a Dockerfile for containerization (optional).

## 🐛 Troubleshooting

### Database Connection Issues
- Verify MySQL is running
- Check connection string in appsettings.json
- Ensure database exists

### JWT Token Issues
- Verify secret key is configured
- Check token expiration
- Ensure Authorization header format is correct

### CORS Issues
- Verify frontend URL is in AllowedOrigins
- Check CORS policy configuration

## 📞 Support

For issues or questions, please refer to the documentation or contact the development team.

## 📄 License

This project is licensed under the ISC License.

---

**Version:** 1.0.0  
**Last Updated:** April 2026  
**Status:** Production Ready
