# OSM Portal API Endpoints - Complete Hierarchy

## Overview
Complete REST API endpoints for the On-Screen Marking Portal with hierarchical structure:
University → Department → Subject → Project → Paper → Section → Question

---

## 1. UNIVERSITIES ENDPOINTS

### Get All Universities
```
GET /api/universities
Authorization: Required
Response: List of active universities with departments and projects
```

### Get University by ID
```
GET /api/universities/{id}
Authorization: Required
Response: University details with departments and projects
```

### Create University
```
POST /api/universities
Authorization: Required (admin only)
Body: {
  "universityName": "string",
  "isActive": boolean
}
Response: Created university
```

### Update University
```
PUT /api/universities/{id}
Authorization: Required (admin only)
Body: {
  "universityName": "string",
  "isActive": boolean
}
Response: Success message
```

### Get University Departments
```
GET /api/universities/{id}/departments
Authorization: Required
Response: List of departments in university
```

---

## 2. DEPARTMENTS ENDPOINTS

### Get All Departments
```
GET /api/department
Authorization: Required
Query Parameters:
  - universityId (optional): Filter by university
Response: List of active departments
```

### Get Department by ID
```
GET /api/department/{id}
Authorization: Required
Response: Department details with subjects and users
```

### Create Department
```
POST /api/department
Authorization: Required (admin, coordinator)
Body: {
  "name": "string",
  "universityId": integer,
  "isActive": boolean
}
Response: Created department
```

### Update Department
```
PUT /api/department/{id}
Authorization: Required (admin, coordinator)
Body: {
  "name": "string",
  "isActive": boolean
}
Response: Success message
```

### Get Department Subjects
```
GET /api/department/{id}/subjects
Authorization: Required
Response: List of subjects in department
```

---

## 3. SUBJECTS ENDPOINTS

### Get All Subjects
```
GET /api/subject
Authorization: Required
Query Parameters:
  - departmentId (optional): Filter by department
Response: List of active subjects
```

### Get Subject by ID
```
GET /api/subject/{id}
Authorization: Required
Response: Subject details with papers and examiners
```

### Create Subject
```
POST /api/subject
Authorization: Required (admin, coordinator)
Body: {
  "subjectName": "string",
  "departmentId": integer,
  "isActive": boolean
}
Response: Created subject
```

### Update Subject
```
PUT /api/subject/{id}
Authorization: Required (admin, coordinator)
Body: {
  "subjectName": "string",
  "isActive": boolean
}
Response: Success message
```

### Get Subject Papers
```
GET /api/subject/{id}/papers
Authorization: Required
Response: List of papers in subject
```

### Get Subject Examiners
```
GET /api/subject/{id}/examiners
Authorization: Required
Response: List of examiners with expertise in subject
```

---

## 4. SESSIONS ENDPOINTS

### Get All Sessions
```
GET /api/session
Authorization: Required
Response: List of active sessions with projects
```

### Get Session by ID
```
GET /api/session/{id}
Authorization: Required
Response: Session details with projects
```

### Create Session
```
POST /api/session
Authorization: Required (admin, coordinator)
Body: {
  "sessionName": "string",
  "isActive": boolean
}
Response: Created session
```

### Update Session
```
PUT /api/session/{id}
Authorization: Required (admin, coordinator)
Body: {
  "sessionName": "string",
  "isActive": boolean
}
Response: Success message
```

### Get Session Projects
```
GET /api/session/{id}/projects
Authorization: Required
Response: List of projects in session
```

---

## 5. PROJECTS ENDPOINTS

### Get All Projects
```
GET /api/project
Authorization: Required
Query Parameters:
  - sessionId (optional): Filter by session
  - universityId (optional): Filter by university
Response: List of active projects
```

### Get Project by ID
```
GET /api/project/{id}
Authorization: Required
Response: Project details with papers
```

### Create Project
```
POST /api/project
Authorization: Required (admin, coordinator)
Body: {
  "projectName": "string",
  "sessionId": integer,
  "universityId": integer,
  "isActive": boolean
}
Response: Created project
```

### Update Project
```
PUT /api/project/{id}
Authorization: Required (admin, coordinator)
Body: {
  "projectName": "string",
  "isActive": boolean
}
Response: Success message
```

### Get Project Papers
```
GET /api/project/{id}/papers
Authorization: Required
Response: List of papers in project
```

---

## 6. PAPERS ENDPOINTS

### Get All Papers
```
GET /api/papers
Authorization: Required
Query Parameters:
  - subjectId (optional): Filter by subject
  - projectId (optional): Filter by project
Response: List of papers
```

### Get Paper by ID
```
GET /api/papers/{id}
Authorization: Required
Response: Paper details with sections
```

### Create Paper
```
POST /api/papers
Authorization: Required (admin, coordinator)
Body: {
  "paperCode": "string",
  "paperName": "string",
  "paperNumber": integer,
  "subjectId": integer,
  "projectId": integer,
  "maxMarks": decimal,
  "totalQuestions": integer,
  "description": "string",
  "isActive": boolean
}
Response: Created paper
```

### Update Paper
```
PUT /api/papers/{id}
Authorization: Required (admin, coordinator)
Body: {
  "paperName": "string",
  "maxMarks": decimal,
  "totalQuestions": integer,
  "description": "string",
  "isActive": boolean
}
Response: Success message
```

### Delete Paper
```
DELETE /api/papers/{id}
Authorization: Required (admin only)
Response: Success message
```

### Get Paper Sections
```
GET /api/papers/{id}/sections
Authorization: Required
Response: List of sections in paper
```

---

## 7. SECTIONS ENDPOINTS

### Get All Sections
```
GET /api/section
Authorization: Required
Query Parameters:
  - paperId (optional): Filter by paper
Response: List of sections
```

### Get Section by ID
```
GET /api/section/{id}
Authorization: Required
Response: Section details with questions
```

### Create Section
```
POST /api/section
Authorization: Required (admin, coordinator)
Body: {
  "paperId": integer,
  "name": "string",
  "description": "string",
  "totalQuestions": integer,
  "totalMarks": integer
}
Response: Created section
```

### Update Section
```
PUT /api/section/{id}
Authorization: Required (admin, coordinator)
Body: {
  "name": "string",
  "description": "string",
  "totalQuestions": integer,
  "totalMarks": integer
}
Response: Success message
```

### Delete Section
```
DELETE /api/section/{id}
Authorization: Required (admin only)
Response: Success message
```

### Get Section Questions
```
GET /api/section/{id}/questions
Authorization: Required
Response: List of questions in section
```

---

## 8. QUESTIONS ENDPOINTS

### Get All Questions
```
GET /api/question
Authorization: Required
Query Parameters:
  - sectionId (optional): Filter by section
Response: List of questions
```

### Get Question by ID
```
GET /api/question/{id}
Authorization: Required
Response: Question details with marks
```

### Create Question
```
POST /api/question
Authorization: Required (admin, coordinator)
Body: {
  "sectionId": integer,
  "questionNo": integer,
  "marks": decimal,
  "type": "string" (MCQ, SA, LA, CS, NP, EXP, RC, WS, LIT, GV),
  "isOptional": boolean,
  "optionalGroupCode": "string"
}
Response: Created question
```

### Update Question
```
PUT /api/question/{id}
Authorization: Required (admin, coordinator)
Body: {
  "questionNo": integer,
  "marks": decimal,
  "type": "string",
  "isOptional": boolean,
  "optionalGroupCode": "string"
}
Response: Success message
```

### Delete Question
```
DELETE /api/question/{id}
Authorization: Required (admin only)
Response: Success message
```

### Get Question Marks
```
GET /api/question/{id}/marks
Authorization: Required
Response: List of marks awarded for question
```

---

## 9. ALLOCATIONS ENDPOINTS

### Get All Allocations
```
GET /api/allocation
Authorization: Required
Query Parameters:
  - examinerId (optional): Filter by examiner
  - scriptId (optional): Filter by script
  - status (optional): Filter by status (allocated, in_progress, submitted, cancelled)
  - page (optional): Page number (default: 1)
  - limit (optional): Items per page (default: 10)
Response: List of allocations with pagination
```

### Get Allocation by ID
```
GET /api/allocation/{id}
Authorization: Required
Response: Allocation details
```

### Create Allocation
```
POST /api/allocation
Authorization: Required (admin, coordinator)
Body: {
  "scriptId": integer,
  "examinerId": integer
}
Response: Created allocation
```

### Start Marking
```
PUT /api/allocation/{id}/start
Authorization: Required (examiner)
Response: Success message
```

### Submit Marking
```
PUT /api/allocation/{id}/submit
Authorization: Required (examiner)
Response: Success message with time taken
```

### Cancel Allocation
```
PUT /api/allocation/{id}/cancel
Authorization: Required (admin, coordinator)
Response: Success message
```

### Get Examiner Allocations
```
GET /api/allocation/examiner/{examinerId}
Authorization: Required
Response: List of allocations for examiner
```

### Get Script Allocation
```
GET /api/allocation/script/{scriptId}
Authorization: Required
Response: Active allocation for script
```

---

## 10. SCRIPTS ENDPOINTS

### Get All Scripts
```
GET /api/scripts
Authorization: Required
Query Parameters:
  - status (optional): Filter by status
  - paperId (optional): Filter by paper
  - page (optional): Page number
  - limit (optional): Items per page
Response: List of scripts with pagination
```

### Get Script by ID
```
GET /api/scripts/{id}
Authorization: Required
Response: Script details
```

### Create Script
```
POST /api/scripts
Authorization: Required (admin, coordinator)
Body: {
  "scriptId": "string",
  "barcode": "string",
  "paperId": integer,
  "cleanPdfUrl": "string",
  "maxMarks": decimal
}
Response: Created script
```

### Update Script Status
```
PUT /api/scripts/{id}
Authorization: Required
Body: {
  "status": "string",
  "remarks": "string"
}
Response: Success message
```

### Assign Script to Examiner
```
PUT /api/scripts/{id}/assign
Authorization: Required (admin, coordinator)
Body: {
  "examinerId": integer
}
Response: Success message with allocation ID
```

### Get Examiner Scripts
```
GET /api/scripts/examiner/{examinerId}
Authorization: Required
Response: List of scripts allocated to examiner
```

### Get Paper Scripts
```
GET /api/scripts/paper/{paperId}
Authorization: Required
Response: List of scripts for paper
```

---

## 11. MARKING ENDPOINTS

### Get All Markings
```
GET /api/marking/examiner/{examinerId}
Authorization: Required
Query Parameters:
  - status (optional): Filter by status
  - page (optional): Page number
  - limit (optional): Items per page
Response: List of markings with pagination
```

### Get Marking by ID
```
GET /api/marking/{id}
Authorization: Required
Response: Marking details
```

### Create Marking
```
POST /api/marking
Authorization: Required (examiner)
Body: {
  "allocationId": integer,
  "examinerId": integer,
  "totalMarks": decimal,
  "remarks": "string"
}
Response: Created marking
```

### Update Marking
```
PUT /api/marking/{id}
Authorization: Required (examiner)
Body: {
  "allocationId": integer,
  "examinerId": integer,
  "totalMarks": decimal,
  "remarks": "string"
}
Response: Success message
```

### Submit Marking
```
PUT /api/marking/{id}/submit
Authorization: Required (examiner)
Response: Success message
```

### Get Script Marking
```
GET /api/marking/script/{scriptId}
Authorization: Required
Response: Marking for script
```

---

## 12. EXAMINER EXPERTISE ENDPOINTS

### Get Examiner Expertise
```
GET /api/examinerexpertise/examiner/{examinerId}
Authorization: Required
Response: List of subjects examiner has expertise in
```

### Get Subject Examiners
```
GET /api/examinerexpertise/subject/{subjectId}
Authorization: Required
Response: List of examiners with expertise in subject
```

### Add Expertise
```
POST /api/examinerexpertise
Authorization: Required (admin, coordinator)
Body: {
  "examinerId": integer,
  "subjectId": integer,
  "isActive": boolean
}
Response: Success message
```

### Update Expertise
```
PUT /api/examinerexpertise/{id}
Authorization: Required (admin, coordinator)
Body: {
  "isActive": boolean
}
Response: Success message
```

### Remove Expertise
```
DELETE /api/examinerexpertise/{id}
Authorization: Required (admin, coordinator)
Response: Success message
```

---

## 13. REPORTS ENDPOINTS

### Get Dashboard Statistics
```
GET /api/reports/dashboard
Authorization: Required
Response: Overall statistics
```

### Get Department-wise Statistics
```
GET /api/reports/department-wise
Authorization: Required
Response: Statistics by department
```

### Get Examiner Performance
```
GET /api/reports/examiner-performance
Authorization: Required (coordinator, admin)
Response: Performance metrics for all examiners
```

### Get Examiner Report
```
GET /api/reports/examiner/{examinerId}
Authorization: Required
Response: Detailed report for specific examiner
```

---

## WORKFLOW EXAMPLE

### Step 1: Create University
```
POST /api/universities
{
  "universityName": "XYZ University",
  "isActive": true
}
```

### Step 2: Create Department
```
POST /api/department
{
  "name": "Computer Science",
  "universityId": 1,
  "isActive": true
}
```

### Step 3: Create Subject
```
POST /api/subject
{
  "subjectName": "Data Structures",
  "departmentId": 1,
  "isActive": true
}
```

### Step 4: Create Session
```
POST /api/session
{
  "sessionName": "2024-2025",
  "isActive": true
}
```

### Step 5: Create Project
```
POST /api/project
{
  "projectName": "Mid-Term Exam",
  "sessionId": 1,
  "universityId": 1,
  "isActive": true
}
```

### Step 6: Create Paper
```
POST /api/papers
{
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

### Step 7: Create Section
```
POST /api/section
{
  "paperId": 1,
  "name": "Section A",
  "description": "Multiple Choice Questions",
  "totalQuestions": 20,
  "totalMarks": 20
}
```

### Step 8: Create Questions
```
POST /api/question
{
  "sectionId": 1,
  "questionNo": 1,
  "marks": 1,
  "type": "MCQ",
  "isOptional": false,
  "optionalGroupCode": null
}
```

### Step 9: Create Scripts
```
POST /api/scripts
{
  "scriptId": "SCRIPT-001",
  "barcode": "123456789",
  "paperId": 1,
  "cleanPdfUrl": "https://...",
  "maxMarks": 100
}
```

### Step 10: Allocate Script to Examiner
```
PUT /api/scripts/1/assign
{
  "examinerId": 5
}
```

### Step 11: Start Marking
```
PUT /api/allocation/1/start
```

### Step 12: Submit Marking
```
PUT /api/allocation/1/submit
```

---

## STATUS CODES

- **200**: Success
- **201**: Created
- **400**: Bad Request
- **401**: Unauthorized
- **403**: Forbidden
- **404**: Not Found
- **500**: Internal Server Error

---

## AUTHENTICATION

All endpoints require JWT token in Authorization header:
```
Authorization: Bearer <token>
```

---

## ROLES

- **admin**: Full access to all endpoints
- **coordinator**: Can create/manage papers, allocate scripts, view reports
- **examiner**: Can view allocated scripts, submit markings

---

**Total Endpoints**: 80+
**Controllers**: 13
**Status**: ✅ Complete and Production Ready
