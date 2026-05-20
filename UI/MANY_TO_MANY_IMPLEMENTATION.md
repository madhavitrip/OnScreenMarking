# Many-to-Many Relationships Implementation

## Overview
Updated the UI to support the new many-to-many relationships in the backend:
- **Department ↔ Subject**: Many-to-many (via DepartmentSubject)
- **Subject ↔ Paper**: Many-to-many (via SubjectPaper)

## Changes Made

### 1. Service Updates

#### subjectService.js
Added new methods for many-to-many operations:
- `getSubjectDepartments(subjectId)` - Get all departments for a subject
- `getSubjectPapers(subjectId)` - Get all papers for a subject
- `addDepartmentToSubject(subjectId, departmentId)` - Add department to subject
- `removeDepartmentFromSubject(subjectId, departmentId)` - Remove department from subject

#### paperService.js
Added new methods for many-to-many operations:
- `getPapersByProject(projectId)` - Get papers by project
- `getPapersBySubject(subjectId)` - Get papers by subject
- `getPaperSubjects(paperId)` - Get all subjects for a paper
- `addSubjectToPaper(paperId, subjectId)` - Add subject to paper
- `removeSubjectFromPaper(paperId, subjectId)` - Remove subject from paper

### 2. UI Component Updates

#### DepartmentManagement.jsx
- Updated to send `departmentSubjects: []` when creating departments
- This satisfies the backend validation requirement

#### SubjectManagement.jsx
**Major Changes:**
- Changed from single department selection to multiple department selection
- Added checkbox grid for selecting multiple departments
- Added "View Departments" button to expand and show assigned departments
- Updated form to display `subjectCode` field
- When creating a subject:
  1. Creates subject with first selected department
  2. Adds remaining departments via `addDepartmentToSubject()` API calls
- Table now shows all departments assigned to each subject
- Added `expandedSubject` state to toggle department visibility

**Key Features:**
- Multi-select departments with checkboxes
- Visual feedback showing number of selected departments
- Expandable department list in table
- Proper error handling for multiple department assignments

#### PapersManagement.jsx
**Major Changes:**
- Changed from single subject selection to multiple subject selection
- Added checkbox grid for selecting multiple subjects
- Updated form to send `subjectIds` (array) instead of `subjectId`
- Table now displays all subjects assigned to each paper with badges
- Updated edit functionality to load all assigned subjects

**Key Features:**
- Multi-select subjects with checkboxes
- Visual feedback showing number of selected subjects
- Subject badges displayed in table with subject names
- Proper payload structure matching backend expectations

### 3. API Payload Changes

#### Creating a Department
**Before:**
```json
{
  "name": "Science",
  "universityId": 2,
  "isActive": true
}
```

**After:**
```json
{
  "name": "Science",
  "universityId": 2,
  "isActive": true,
  "departmentSubjects": []
}
```

#### Creating a Subject
**Before:**
```json
{
  "subjectName": "Mathematics",
  "departmentId": 1,
  "isActive": true
}
```

**After:**
```json
{
  "subjectName": "Mathematics",
  "subjectCode": "MATH101",
  "departmentId": 1,
  "isActive": true
}
```
Then additional departments are added via:
```
POST /api/subject/{subjectId}/departments/{departmentId}
```

#### Creating a Paper
**Before:**
```json
{
  "paperCode": "MATH-P1",
  "paperName": "Paper 1",
  "paperNumber": 1,
  "maxMarks": 100,
  "totalQuestions": 50,
  "description": "...",
  "catchNo": "...",
  "subjectId": 1,
  "projectId": 1,
  "isActive": true
}
```

**After:**
```json
{
  "paperCode": "MATH-P1",
  "paperName": "Paper 1",
  "paperNumber": 1,
  "maxMarks": 100,
  "totalQuestions": 50,
  "description": "...",
  "catchNo": "...",
  "subjectIds": [1, 2, 3],
  "projectId": 1,
  "isActive": true
}
```

## UI Workflow

### Subject Management Workflow
1. User clicks "Add Subject"
2. Form displays:
   - Subject Name (required)
   - Subject Code (optional)
   - Departments (multi-select checkboxes)
   - Active status
3. User selects multiple departments
4. On submit:
   - Subject created with first department
   - Remaining departments added via API calls
   - Success message displayed
5. Table shows all departments for each subject
6. User can click "View Departments" to expand/collapse list

### Paper Management Workflow
1. User clicks "Add Paper"
2. Form displays:
   - Paper Code (required)
   - Paper Name (required)
   - Catch Number (optional)
   - Subjects (multi-select checkboxes) - NEW
   - Project (required)
   - Paper Number, Max Marks, Total Questions
   - Description
3. User selects multiple subjects
4. On submit:
   - Paper created with all selected subjects
   - Success message displayed
5. Table shows all subjects for each paper as badges
6. Edit functionality loads all assigned subjects

## Data Display

### SubjectManagement Table
| Column | Content |
|--------|---------|
| Name | Subject name |
| Code | Subject code |
| Departments | Expandable list of assigned departments |
| Status | Active/Inactive badge |
| Actions | Edit, View Papers |

### PapersManagement Table
| Column | Content |
|--------|---------|
| Paper Info | Code and name |
| Subjects & Project | Subject badges + project name |
| Stats | Max marks and question count |
| Status | Active/Inactive badge |
| Actions | Assign Examiners, Edit |

## Error Handling

- Validates at least one department/subject is selected
- Handles API errors gracefully
- Shows error messages for failed operations
- Displays success messages after successful operations
- Handles partial failures when adding multiple relationships

## Backward Compatibility

- Services still support single ID operations
- Existing API endpoints work as before
- New endpoints added for many-to-many operations
- UI gracefully handles both old and new data structures

## Testing Checklist

- [ ] Create subject with multiple departments
- [ ] Edit subject and modify departments
- [ ] View departments for a subject
- [ ] Create paper with multiple subjects
- [ ] Edit paper and modify subjects
- [ ] View subjects for a paper
- [ ] Delete subject/paper with relationships
- [ ] Error handling for invalid selections
- [ ] Success messages display correctly
- [ ] Table displays all relationships correctly

## Future Enhancements

1. **Bulk Operations**
   - Assign multiple subjects to papers at once
   - Assign multiple departments to subjects at once

2. **Relationship Management**
   - Dedicated page to manage subject-department relationships
   - Dedicated page to manage paper-subject relationships
   - Visual relationship diagrams

3. **Advanced Filtering**
   - Filter subjects by department
   - Filter papers by subject
   - Filter departments by subject

4. **Performance**
   - Batch API calls for multiple relationships
   - Caching of relationships
   - Lazy loading of related data

## API Endpoints Used

### Subject Endpoints
- `GET /api/subject` - Get all subjects
- `GET /api/subject/{id}` - Get subject by ID
- `GET /api/subject/{id}/departments` - Get departments for subject
- `GET /api/subject/{id}/papers` - Get papers for subject
- `POST /api/subject` - Create subject
- `PUT /api/subject/{id}` - Update subject
- `DELETE /api/subject/{id}` - Delete subject
- `POST /api/subject/{id}/departments/{deptId}` - Add department to subject
- `DELETE /api/subject/{id}/departments/{deptId}` - Remove department from subject

### Paper Endpoints
- `GET /api/papers` - Get all papers
- `GET /api/papers?projectId={id}` - Get papers by project
- `GET /api/papers?subjectId={id}` - Get papers by subject
- `GET /api/papers/{id}` - Get paper by ID
- `GET /api/papers/{id}/subjects` - Get subjects for paper
- `POST /api/papers` - Create paper (with subjectIds array)
- `PUT /api/papers/{id}` - Update paper
- `DELETE /api/papers/{id}` - Delete paper
- `POST /api/papers/{id}/subjects/{subjId}` - Add subject to paper
- `DELETE /api/papers/{id}/subjects/{subjId}` - Remove subject from paper

### Department Endpoints
- `GET /api/department` - Get all departments
- `GET /api/department?universityId={id}` - Get departments by university
- `GET /api/department/{id}` - Get department by ID
- `GET /api/department/{id}/subjects` - Get subjects for department
- `POST /api/department` - Create department (with departmentSubjects array)
- `PUT /api/department/{id}` - Update department
- `DELETE /api/department/{id}` - Delete department

## Notes

- All many-to-many relationships are managed through dedicated endpoints
- The UI handles the complexity of multiple selections and API calls
- Error handling ensures data consistency
- Success messages provide user feedback
- Table displays show all relationships clearly
