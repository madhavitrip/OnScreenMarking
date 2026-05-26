# Script Allocation System - Design Document

## Overview
The Script Allocation system allows coordinators/admins to allocate exam scripts to examiners based on **subject expertise**. The allocation is done **paper-wise**, with examiners filtered by their expertise in the subjects associated with each paper.

## Architecture

### Data Flow
```
Project → Papers → Scripts (for that paper)
                ↓
         Subjects (associated with paper)
                ↓
         Examiners (with expertise in those subjects)
```

### Key Relationships
- **Paper** has many **Subjects** (via SubjectPaper junction table)
- **Paper** has many **Scripts**
- **Examiner** has many **ExaminerExpertise** records (one per subject they're expert in)
- **Allocation** links a **Script** to an **Examiner**

## Frontend Component: ScriptAllocation.jsx

### Three-Step Workflow

#### Step 1: Select Project
- User selects a project from available projects
- Fetches all papers for that project

#### Step 2: Select Paper
- User selects a paper from the project
- Displays paper information (code, name, max marks, associated subjects)
- Fetches pending scripts for that paper
- Fetches examiners with expertise in ANY subject associated with the paper

#### Step 3: Allocate Scripts
- User sees all pending scripts for the selected paper
- For each script, user selects an examiner from the list of subject experts
- User can see examiner details including:
  - Name and email
  - Subject expertise (all subjects they're expert in)
  - Current allocation count
- User clicks "Allocate" to bulk allocate all selected scripts

### Key Features
- **Subject-based Filtering**: Only examiners with expertise in the paper's subjects are shown
- **Expertise Display**: Shows all subjects each examiner is expert in
- **Allocation Tracking**: Shows how many scripts each examiner already has allocated
- **Bulk Allocation**: Allocate multiple scripts in one operation
- **Error Handling**: Validates selections and provides clear error messages
- **Success Feedback**: Confirms successful allocations

## Backend API Endpoints

### New Endpoint: GET /api/allocation/paper/{paperId}/pending-scripts

**Purpose**: Get pending scripts for a paper with examiners filtered by subject expertise

**Response**:
```json
{
  "scripts": [
    {
      "id": 1,
      "scriptId": "SCRIPT001",
      "barcode": "123456",
      "paperId": 1,
      "status": "pending",
      "createdAt": "2024-05-25T10:00:00Z"
    }
  ],
  "examiners": [
    {
      "userId": 5,
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "expertise": ["Mathematics", "Physics"],
      "allocatedCount": 3
    }
  ],
  "paper": {
    "paperId": 1,
    "paperCode": "MATH-2024-P1",
    "paperName": "Paper 1",
    "paperNumber": 1,
    "maxMarks": 100,
    "subjects": [
      {
        "subjectId": 1,
        "subName": "Mathematics",
        "subjectCode": "MATH"
      }
    ]
  }
}
```

### Existing Endpoint: POST /api/allocation/bulk-allocate

**Purpose**: Allocate multiple scripts to examiners in bulk

**Request**:
```json
{
  "allocations": [
    {
      "scriptId": 1,
      "examinerId": 5
    },
    {
      "scriptId": 2,
      "examinerId": 6
    }
  ]
}
```

**Response**:
```json
{
  "success": true,
  "totalAllocations": 2,
  "successfulAllocations": 2,
  "failedAllocations": 0,
  "results": [
    {
      "scriptId": 1,
      "examinerId": 5,
      "success": true
    }
  ],
  "errors": []
}
```

## Database Schema

### Key Tables

#### SubjectPaper (Junction Table)
```
- Id (PK)
- SubjectId (FK)
- PaperId (FK)
- CreatedAt
```

#### ExaminerExpertise
```
- Id (PK)
- ExaminerId (FK)
- SubjectId (FK)
- IsActive
- CreatedAt
```

#### Allocation
```
- AllocationId (PK)
- ScriptId (FK)
- ExaminerId (FK)
- AllocatedAt
- StartedAt
- SubmittedAt
- TimeTakenSeconds
- Status (allocated, in_progress, submitted, cancelled)
```

## Workflow Example

1. **Admin selects Project**: "Semester 1 - 2024"
2. **Admin selects Paper**: "Mathematics Paper 1"
   - System shows: Associated subjects are "Mathematics" and "Applied Math"
3. **System fetches**:
   - 50 pending scripts for this paper
   - 8 examiners with expertise in Mathematics or Applied Math
4. **Admin allocates**:
   - Assigns scripts to examiners based on their expertise
   - Can see each examiner's current workload
5. **System confirms**:
   - "Successfully allocated 50 scripts"
   - Scripts status changes from "pending" to "allocated"
   - Examiners can now see their allocated scripts

## Key Validations

### Backend
- Paper must exist
- Scripts must be in "pending" status
- Examiners must have expertise in paper's subjects
- Script cannot be allocated twice (unless previous allocation is cancelled)
- Examiner must exist and be active

### Frontend
- At least one script must be selected for allocation
- Each selected script must have an examiner assigned
- Error messages guide user to correct issues

## UI/UX Highlights

- **Progressive Disclosure**: Step-by-step workflow (Project → Paper → Allocate)
- **Visual Feedback**: Color-coded selections and status indicators
- **Information Density**: Shows relevant info without overwhelming user
- **Accessibility**: Clear labels, proper form controls, keyboard navigation
- **Responsive Design**: Works on desktop, tablet, and mobile

## Integration Points

### With Existing Systems
- **User Management**: Examiners must be created and assigned expertise
- **Subject Management**: Papers must be linked to subjects
- **Project Management**: Papers must be created within projects
- **Marking System**: Examiners see allocated scripts in their marking interface

## Future Enhancements

1. **Load Balancing**: Auto-suggest examiner based on current workload
2. **Expertise Matching**: Show match percentage between examiner expertise and paper subjects
3. **Batch Import**: Upload CSV to allocate multiple scripts at once
4. **Allocation History**: Track who allocated what and when
5. **Reallocation**: Easily reassign scripts if needed
6. **Notifications**: Notify examiners when scripts are allocated

## Security Considerations

- Only admin/coordinator can allocate scripts
- Examiners can only see their own allocations
- Audit trail of all allocations
- Validation at both frontend and backend
