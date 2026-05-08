# OSM Portal API Endpoints Documentation

## Overview
This document describes all available API endpoints for the OSM (Online Screening & Marking) Portal backend built with ASP.NET Core 8.0 and MySQL.

## Base URL
```
https://localhost:5001/api
```

## Authentication
All endpoints (except login/register) require JWT token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

---

## 1. Authentication Endpoints

### Register User
**POST** `/auth/register`

Request body:
```json
{
  "name": "John Examiner",
  "email": "john@example.com",
  "password": "SecurePassword123",
  "userType": "examiner",
  "departmentId": 1,
  "phone": "9876543210",
  "address": "123 Main St"
}
```

Response:
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "name": "John Examiner",
    "email": "john@example.com",
    "userType": "examiner"
  }
}
```

### Login
**POST** `/auth/login`

Request body:
```json
{
  "email": "john@example.com",
  "password": "SecurePassword123"
}
```

Response: Same as register

---

## 2. Papers Endpoints

### Get All Papers
**GET** `/papers?subjectConfigId=1`

Query parameters:
- `subjectConfigId` (optional): Filter by subject

Response:
```json
[
  {
    "id": 1,
    "subjectConfigId": 1,
    "paperCode": "MATH-2024-P1",
    "paperName": "Paper 1",
    "paperNumber": 1,
    "maxMarks": 100,
    "totalQuestions": 30,
    "description": "Mathematics Paper 1",
    "isActive": true
  }
]
```

### Get Paper by ID
**GET** `/papers/{id}`

### Create Paper
**POST** `/papers`
*Requires: admin or coordinator role*

Request body:
```json
{
  "subjectConfigId": 1,
  "paperCode": "MATH-2024-P1",
  "paperName": "Paper 1",
  "paperNumber": 1,
  "maxMarks": 100,
  "totalQuestions": 30,
  "description": "Mathematics Paper 1"
}
```

### Update Paper
**PUT** `/papers/{id}`
*Requires: admin or coordinator role*

### Delete Paper
**DELETE** `/papers/{id}`
*Requires: admin role*

---

## 3. Examiner Expertise Endpoints

### Get Examiner's Expertise
**GET** `/examinerexpertise/examiner/{examinerId}`

Response:
```json
[
  {
    "id": 1,
    "examinerId": 1,
    "subjectConfigId": 1,
    "paperId": 1,
    "isActive": true,
    "remarks": "Expert in Paper 1"
  }
]
```

### Get Subject Examiners
**GET** `/examinerexpertise/subject/{subjectConfigId}`

Returns all examiners with expertise in a subject.

### Add Examiner Expertise
**POST** `/examinerexpertise`
*Requires: admin or coordinator role*

Request body:
```json
{
  "examinerId": 1,
  "subjectConfigId": 1,
  "paperId": 1,
  "remarks": "Expert in Paper 1"
}
```

Note: `paperId` is optional. If not provided, examiner has expertise in all papers of the subject.

### Update Expertise
**PUT** `/examinerexpertise/{id}`
*Requires: admin or coordinator role*

### Remove Expertise
**DELETE** `/examinerexpertise/{id}`
*Requires: admin or coordinator role*

---

## 4. Scripts Endpoints

### Get All Scripts
**GET** `/scripts?status=pending&subject=mathematics&paperId=1&page=1&limit=10`

Query parameters:
- `status` (optional): pending, in_progress, completed
- `subject` (optional): Filter by subject
- `paperId` (optional): Filter by paper
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

Response:
```json
[
  {
    "id": 1,
    "scriptId": "SCRIPT-001",
    "rollNo": "12345",
    "studentName": "Student Name",
    "paperId": 1,
    "subject": "mathematics",
    "examDate": "2024-04-15T10:00:00Z",
    "scannedImageUrl": "https://...",
    "status": "pending",
    "assignedExaminerId": 1,
    "assignedExaminerName": "John Examiner",
    "totalMarks": 0,
    "maxMarks": 100,
    "percentage": 0,
    "remarks": null,
    "submittedAt": null
  }
]
```

### Get Script by ID
**GET** `/scripts/{id}`

### Create Script
**POST** `/scripts`
*Requires: admin or coordinator role*

Request body:
```json
{
  "scriptId": "SCRIPT-001",
  "rollNo": "12345",
  "studentName": "Student Name",
  "paperId": 1,
  "subject": "mathematics",
  "examDate": "2024-04-15T10:00:00Z",
  "scannedImageUrl": "https://...",
  "maxMarks": 100
}
```

### Update Script Status
**PUT** `/scripts/{id}`

Request body:
```json
{
  "status": "in_progress",
  "remarks": "Script received"
}
```

### Assign Script to Examiner
**PUT** `/scripts/{id}/assign`
*Requires: admin or coordinator role*

Request body:
```json
{
  "scriptId": 1,
  "examinerId": 1
}
```

Note: Examiner must have expertise in the script's subject/paper.

### Get Examiner's Scripts
**GET** `/scripts/examiner/{examinerId}`

### Get Paper's Scripts
**GET** `/scripts/paper/{paperId}`

---

## 5. Marking Endpoints

### Create Marking
**POST** `/marking`
*Requires: examiner role*

Request body:
```json
{
  "scriptId": 1,
  "examinerId": 1,
  "marksJson": "{\"q1\": 5, \"q2\": 4, ...}",
  "sectionMarksJson": "{\"section1\": 25, \"section2\": 30, ...}",
  "totalMarks": 85,
  "remarks": "Good attempt"
}
```

### Get Marking by ID
**GET** `/marking/{id}`

### Update Marking (Draft)
**PUT** `/marking/{id}`
*Requires: examiner role*

Request body: Same as create

### Submit Marking
**PUT** `/marking/{id}/submit`
*Requires: examiner role*

Changes status from "draft" to "submitted" and updates the script status to "completed".

### Get Examiner's Markings
**GET** `/marking/examiner/{examinerId}?status=draft&page=1&limit=10`

Query parameters:
- `status` (optional): draft, submitted, reviewed
- `page` (optional): Page number
- `limit` (optional): Items per page

### Get Script's Marking
**GET** `/marking/script/{scriptId}`

---

## 6. Subject Config Endpoints

### Get All Subject Configs
**GET** `/subjectconfig`

### Get Subject Config by ID
**GET** `/subjectconfig/{id}`

### Create Subject Config
**POST** `/subjectconfig`
*Requires: admin or coordinator role*

### Update Subject Config
**PUT** `/subjectconfig/{id}`
*Requires: admin or coordinator role*

---

## 7. Reports Endpoints

### Get Marking Statistics
**GET** `/reports/marking-stats?subjectId=1&paperId=1`

### Get Examiner Performance
**GET** `/reports/examiner-performance/{examinerId}`

### Get Subject Statistics
**GET** `/reports/subject-stats/{subjectId}`

---

## Data Models

### User
```
{
  id: int,
  name: string,
  email: string (unique),
  passwordHash: string,
  userType: string (examiner, coordinator, admin),
  isActive: boolean,
  profileImage: string,
  phone: string,
  address: string,
  departmentId: int,
  createdAt: datetime,
  updatedAt: datetime
}
```

### Paper
```
{
  id: int,
  subjectConfigId: int,
  paperCode: string (unique),
  paperName: string,
  paperNumber: int,
  maxMarks: decimal,
  totalQuestions: int,
  description: string,
  isActive: boolean,
  createdAt: datetime,
  updatedAt: datetime
}
```

### ExaminerExpertise
```
{
  id: int,
  examinerId: int,
  subjectConfigId: int,
  paperId: int (nullable),
  isActive: boolean,
  remarks: string,
  createdAt: datetime,
  updatedAt: datetime
}
```

### Script
```
{
  id: int,
  scriptId: string (unique),
  rollNo: string,
  studentName: string,
  paperId: int,
  subject: string,
  examDate: datetime,
  scannedImageUrl: string,
  status: string (pending, in_progress, completed),
  assignedExaminerId: int (nullable),
  totalMarks: decimal,
  maxMarks: decimal,
  percentage: decimal,
  remarks: string,
  submittedAt: datetime (nullable),
  createdAt: datetime,
  updatedAt: datetime
}
```

### Marking
```
{
  id: int,
  scriptId: int,
  examinerId: int,
  subject: string,
  marksJson: string (JSON),
  sectionMarksJson: string (JSON),
  totalMarks: decimal,
  maxMarks: decimal,
  percentage: decimal,
  remarks: string,
  status: string (draft, submitted, reviewed),
  startedAt: datetime,
  submittedAt: datetime (nullable),
  reviewedAt: datetime (nullable),
  reviewedById: int (nullable),
  createdAt: datetime,
  updatedAt: datetime
}
```

---

## Error Responses

All error responses follow this format:
```json
{
  "success": false,
  "message": "Error description"
}
```

Common HTTP status codes:
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `500`: Internal Server Error

---

## Workflow Example

### 1. Register Examiner
```
POST /auth/register
{
  "name": "Dr. Smith",
  "email": "smith@example.com",
  "password": "password123",
  "userType": "examiner",
  "departmentId": 1
}
```

### 2. Add Examiner Expertise
```
POST /examinerexpertise
{
  "examinerId": 1,
  "subjectConfigId": 1,
  "paperId": 1
}
```

### 3. Create Scripts
```
POST /scripts
{
  "scriptId": "SCRIPT-001",
  "rollNo": "12345",
  "studentName": "John Doe",
  "paperId": 1,
  "subject": "mathematics",
  "examDate": "2024-04-15T10:00:00Z",
  "scannedImageUrl": "https://...",
  "maxMarks": 100
}
```

### 4. Assign Script to Examiner
```
PUT /scripts/1/assign
{
  "scriptId": 1,
  "examinerId": 1
}
```

### 5. Create Marking (Draft)
```
POST /marking
{
  "scriptId": 1,
  "examinerId": 1,
  "marksJson": "{\"q1\": 5, \"q2\": 4}",
  "sectionMarksJson": "{\"section1\": 25}",
  "totalMarks": 85
}
```

### 6. Submit Marking
```
PUT /marking/1/submit
```

---

## Notes

- All timestamps are in UTC format (ISO 8601)
- JWT tokens expire after the configured duration (default: 60 minutes)
- Examiner expertise can be specific to a paper or general for all papers of a subject
- Scripts can only be assigned to examiners with appropriate expertise
- Markings cannot be updated after submission
