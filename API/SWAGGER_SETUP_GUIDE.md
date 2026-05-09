# Swagger API Documentation Setup Guide

## Overview
Swagger (OpenAPI) is now fully configured for the OSM Portal API. It provides interactive API documentation and testing capabilities.

---

## Access Swagger UI

### Development Environment
```
http://localhost:5000/
```
or
```
http://localhost:5000/swagger
```

### Production Environment
```
http://localhost:5000/swagger
```

---

## What Changed

### Program.cs Updates
✅ **Swagger now enabled in both Development and Production**
- Development: Swagger is the default page (root URL)
- Production: Swagger accessible at `/swagger` endpoint
- Added proper SwaggerUI configuration
- Added route prefix configuration

### Configuration
```csharp
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "OSM Portal API v1");
        c.RoutePrefix = string.Empty; // Make Swagger the default page
    });
}
else
{
    // Also enable Swagger in Production for testing
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "OSM Portal API v1");
        c.RoutePrefix = "swagger";
    });
}
```

---

## How to Use Swagger

### 1. Start the API Server
```bash
cd API/API
dotnet run
```

### 2. Open Swagger UI
Navigate to:
```
http://localhost:5000
```

### 3. Explore Endpoints
- All API endpoints are listed by controller
- Click on any endpoint to expand it
- See request/response schemas
- View parameter descriptions

### 4. Test Endpoints

#### Without Authentication
1. Click on any endpoint (e.g., GET /api/universities)
2. Click "Try it out"
3. Click "Execute"
4. View the response

#### With Authentication (JWT Token)
1. Get a token by calling POST /api/auth/login
2. Copy the token from response
3. Click the "Authorize" button (lock icon) at the top
4. Paste the token in the format: `Bearer <token>`
5. Click "Authorize"
6. Now all subsequent requests will include the token

---

## API Endpoints Available in Swagger

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Universities
- `GET /api/universities` - Get all universities
- `GET /api/universities/{id}` - Get university by ID
- `POST /api/universities` - Create university
- `PUT /api/universities/{id}` - Update university
- `GET /api/universities/{id}/departments` - Get university departments

### Departments
- `GET /api/department` - Get all departments
- `GET /api/department/{id}` - Get department by ID
- `POST /api/department` - Create department
- `PUT /api/department/{id}` - Update department
- `GET /api/department/{id}/subjects` - Get department subjects

### Subjects
- `GET /api/subject` - Get all subjects
- `GET /api/subject/{id}` - Get subject by ID
- `POST /api/subject` - Create subject
- `PUT /api/subject/{id}` - Update subject
- `GET /api/subject/{id}/papers` - Get subject papers
- `GET /api/subject/{id}/examiners` - Get subject examiners

### Sessions
- `GET /api/session` - Get all sessions
- `GET /api/session/{id}` - Get session by ID
- `POST /api/session` - Create session
- `PUT /api/session/{id}` - Update session
- `GET /api/session/{id}/projects` - Get session projects

### Projects
- `GET /api/project` - Get all projects
- `GET /api/project/{id}` - Get project by ID
- `POST /api/project` - Create project
- `PUT /api/project/{id}` - Update project
- `GET /api/project/{id}/papers` - Get project papers

### Papers
- `GET /api/papers` - Get all papers
- `GET /api/papers/{id}` - Get paper by ID
- `POST /api/papers` - Create paper
- `PUT /api/papers/{id}` - Update paper
- `DELETE /api/papers/{id}` - Delete paper
- `GET /api/papers/{id}/sections` - Get paper sections

### Sections
- `GET /api/section` - Get all sections
- `GET /api/section/{id}` - Get section by ID
- `POST /api/section` - Create section
- `PUT /api/section/{id}` - Update section
- `DELETE /api/section/{id}` - Delete section
- `GET /api/section/{id}/questions` - Get section questions

### Questions
- `GET /api/question` - Get all questions
- `GET /api/question/{id}` - Get question by ID
- `POST /api/question` - Create question
- `PUT /api/question/{id}` - Update question
- `DELETE /api/question/{id}` - Delete question
- `GET /api/question/{id}/marks` - Get question marks

### Scripts
- `GET /api/scripts` - Get all scripts
- `GET /api/scripts/{id}` - Get script by ID
- `POST /api/scripts` - Create script
- `PUT /api/scripts/{id}` - Update script
- `PUT /api/scripts/{id}/assign` - Assign script to examiner
- `GET /api/scripts/examiner/{examinerId}` - Get examiner scripts
- `GET /api/scripts/paper/{paperId}` - Get paper scripts

### Allocations
- `GET /api/allocation` - Get all allocations
- `GET /api/allocation/{id}` - Get allocation by ID
- `POST /api/allocation` - Create allocation
- `PUT /api/allocation/{id}/start` - Start marking
- `PUT /api/allocation/{id}/submit` - Submit marking
- `PUT /api/allocation/{id}/cancel` - Cancel allocation
- `GET /api/allocation/examiner/{examinerId}` - Get examiner allocations
- `GET /api/allocation/script/{scriptId}` - Get script allocation

### Marking
- `GET /api/marking/{id}` - Get marking by ID
- `POST /api/marking` - Create marking
- `PUT /api/marking/{id}` - Update marking
- `PUT /api/marking/{id}/submit` - Submit marking
- `GET /api/marking/examiner/{examinerId}` - Get examiner markings
- `GET /api/marking/script/{scriptId}` - Get script marking

### Examiner Expertise
- `GET /api/examinerexpertise/examiner/{examinerId}` - Get examiner expertise
- `GET /api/examinerexpertise/subject/{subjectId}` - Get subject examiners
- `POST /api/examinerexpertise` - Add expertise
- `PUT /api/examinerexpertise/{id}` - Update expertise
- `DELETE /api/examinerexpertise/{id}` - Remove expertise

### Reports
- `GET /api/reports/dashboard` - Get dashboard statistics
- `GET /api/reports/department-wise` - Get department-wise statistics
- `GET /api/reports/examiner-performance` - Get examiner performance
- `GET /api/reports/examiner/{examinerId}` - Get examiner report

### Health Check
- `GET /api/health` - Check server health

---

## Testing Workflow in Swagger

### 1. Create University
```
POST /api/universities
Body: {
  "universityName": "XYZ University",
  "isActive": true
}
```

### 2. Create Department
```
POST /api/department
Body: {
  "name": "Computer Science",
  "universityId": 1,
  "isActive": true
}
```

### 3. Create Subject
```
POST /api/subject
Body: {
  "subjectName": "Data Structures",
  "departmentId": 1,
  "isActive": true
}
```

### 4. Create Session
```
POST /api/session
Body: {
  "sessionName": "2024-2025",
  "isActive": true
}
```

### 5. Create Project
```
POST /api/project
Body: {
  "projectName": "Mid-Term Exam",
  "sessionId": 1,
  "universityId": 1,
  "isActive": true
}
```

### 6. Create Paper
```
POST /api/papers
Body: {
  "paperCode": "CS-DS-2024-P1",
  "paperName": "Paper 1",
  "paperNumber": 1,
  "subjectId": 1,
  "projectId": 1,
  "maxMarks": 100,
  "totalQuestions": 50,
  "description": "Mid-term examination",
  "isActive": true
}
```

---

## Troubleshooting

### Issue: Swagger not loading
**Solution**: 
1. Make sure API is running: `dotnet run`
2. Check if port 5000 is available
3. Try accessing: `http://localhost:5000/swagger`

### Issue: "Cannot GET /"
**Solution**: 
1. Swagger is configured as default page in Development
2. Try: `http://localhost:5000/swagger`
3. Or check if API is running

### Issue: Endpoints not showing
**Solution**:
1. Rebuild the project: `dotnet build`
2. Restart the API server
3. Clear browser cache (Ctrl+Shift+Delete)

### Issue: Authorization not working
**Solution**:
1. First login to get a token: `POST /api/auth/login`
2. Copy the token from response
3. Click "Authorize" button
4. Paste token in format: `Bearer <token>`

---

## Features

✅ **Interactive API Documentation**
- All endpoints listed and organized by controller
- Request/response schemas visible
- Parameter descriptions

✅ **API Testing**
- Try endpoints directly from Swagger
- Send requests with custom parameters
- View responses in real-time

✅ **Authentication Support**
- JWT token authorization
- Persistent token across requests
- Easy token management

✅ **Response Examples**
- See example request/response bodies
- Understand data structures
- Learn API usage patterns

---

## Production Considerations

⚠️ **For Production Deployment**:
1. Consider disabling Swagger in production for security
2. Or restrict access to Swagger endpoint
3. Use API Gateway for additional security
4. Implement rate limiting
5. Use HTTPS only

---

## Files Modified

- `API/API/Program.cs` - Updated Swagger configuration

---

**Status**: ✅ Swagger is now fully configured and accessible
**Access URL**: http://localhost:5000
**Total Endpoints**: 80+
**Documentation**: Complete with all parameters and schemas
