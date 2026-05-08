# Quick Reference Guide - Backend Updates

## New Endpoints

### Papers Management
```
GET    /api/papers                    # Get all papers
GET    /api/papers/{id}               # Get paper by ID
POST   /api/papers                    # Create paper
PUT    /api/papers/{id}               # Update paper
DELETE /api/papers/{id}               # Delete paper
```

### Examiner Expertise
```
GET    /api/examinerexpertise/examiner/{examinerId}      # Get examiner's expertise
GET    /api/examinerexpertise/subject/{subjectConfigId}  # Get subject's examiners
POST   /api/examinerexpertise                            # Add expertise
PUT    /api/examinerexpertise/{id}                       # Update expertise
DELETE /api/examinerexpertise/{id}                       # Remove expertise
```

### Scripts (Updated)
```
GET    /api/scripts?paperId=1                # Get scripts (with paper filter)
GET    /api/scripts/{id}                     # Get script by ID
POST   /api/scripts                         # Create script
PUT    /api/scripts/{id}                    # Update script status
PUT    /api/scripts/{id}/assign             # Assign to examiner
GET    /api/scripts/examiner/{examinerId}   # Get examiner's scripts
GET    /api/scripts/paper/{paperId}         # Get paper's scripts (NEW)
```

### Marking (Updated)
```
POST   /api/marking                         # Create marking
GET    /api/marking/{id}                    # Get marking by ID
PUT    /api/marking/{id}                    # Update marking (draft)
PUT    /api/marking/{id}/submit             # Submit marking
GET    /api/marking/examiner/{examinerId}   # Get examiner's markings
GET    /api/marking/script/{scriptId}       # Get script's marking (NEW)
```

## Key Models

### Paper
```json
{
  "id": 1,
  "subjectConfigId": 1,
  "paperCode": "MATH-2024-P1",
  "paperName": "Paper 1",
  "paperNumber": 1,
  "maxMarks": 100,
  "totalQuestions": 30,
  "isActive": true
}
```

### ExaminerExpertise
```json
{
  "id": 1,
  "examinerId": 1,
  "subjectConfigId": 1,
  "paperId": null,  // null = all papers, number = specific paper
  "isActive": true,
  "remarks": "Expert in all papers"
}
```

### Script (Updated)
```json
{
  "id": 1,
  "scriptId": "SCRIPT-001",
  "paperId": 1,           // NEW: Paper reference
  "subject": "mathematics",
  "status": "pending",
  "assignedExaminerId": 1,
  "totalMarks": 0
}
```

## Common Workflows

### 1. Add Examiner Expertise
```bash
POST /api/examinerexpertise
{
  "examinerId": 1,
  "subjectConfigId": 1,
  "paperId": null,  # null for all papers
  "remarks": "Expert in Mathematics"
}
```

### 2. Create Paper
```bash
POST /api/papers
{
  "subjectConfigId": 1,
  "paperCode": "MATH-2024-P1",
  "paperName": "Paper 1",
  "paperNumber": 1,
  "maxMarks": 100,
  "totalQuestions": 30
}
```

### 3. Create Script
```bash
POST /api/scripts
{
  "scriptId": "SCRIPT-001",
  "rollNo": "12345",
  "studentName": "John Doe",
  "paperId": 1,           # NEW: Paper ID required
  "subject": "mathematics",
  "examDate": "2024-04-15T10:00:00Z",
  "maxMarks": 100
}
```

### 4. Assign Script (Validates Expertise)
```bash
PUT /api/scripts/1/assign
{
  "scriptId": 1,
  "examinerId": 1
}
# Returns error if examiner doesn't have expertise
```

### 5. Create Marking (Validates Expertise)
```bash
POST /api/marking
{
  "scriptId": 1,
  "examinerId": 1,
  "marksJson": "{\"q1\": 5, \"q2\": 4}",
  "sectionMarksJson": "{\"section1\": 25}",
  "totalMarks": 85
}
# Returns error if examiner doesn't have expertise
```

## Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| "Examiner does not have expertise" | Missing ExaminerExpertise record | Add expertise via POST /api/examinerexpertise |
| "Paper not found" | Invalid PaperId | Create paper via POST /api/papers |
| "Script already exists" | Duplicate ScriptId | Use unique ScriptId |
| "Cannot update submitted marking" | Marking already submitted | Create new marking for same script |

## Database Changes

### New Tables
- `Papers` - Individual papers for subjects
- `ExaminerExpertises` - Examiner expertise assignments

### Modified Tables
- `Users` - Added DepartmentId
- `Scripts` - Added PaperId (changed from Subject string)
- `Sections` - Added PaperId
- `SubjectConfigs` - Added Name, IsActive
- `Departments` - Added IsActive, timestamps

## Migration Checklist

- [ ] Backup database
- [ ] Create Paper table
- [ ] Create ExaminerExpertise table
- [ ] Add columns to existing tables
- [ ] Migrate data
- [ ] Create indexes
- [ ] Test workflows
- [ ] Deploy

## Important Notes

1. **Expertise Validation**: Scripts can only be assigned to examiners with expertise
2. **Paper Reference**: Scripts now require PaperId instead of Subject string
3. **Backward Compatibility**: Subject field kept in Scripts for denormalization
4. **Unique Constraint**: (ExaminerId, SubjectConfigId, PaperId) prevents duplicates
5. **NULL PaperId**: Means expertise in all papers of the subject

## Documentation Files

- **API_ENDPOINTS.md** - Complete endpoint reference
- **MIGRATION_GUIDE.md** - Database migration instructions
- **IMPLEMENTATION_NOTES.md** - Code patterns and examples
- **BACKEND_UPDATES_SUMMARY.md** - High-level overview

## Quick Troubleshooting

**Q: "Examiner does not have expertise" error**
A: Create ExaminerExpertise record: `POST /api/examinerexpertise`

**Q: How to give examiner expertise in all papers?**
A: Set `paperId: null` in ExaminerExpertise

**Q: How to give examiner expertise in specific paper only?**
A: Set `paperId: <paper_id>` in ExaminerExpertise

**Q: Can I still use Subject string?**
A: Yes, Subject field is kept for denormalization, but PaperId is required

**Q: What happens if I delete a Paper?**
A: Sections and ExaminerExpertises linked to it are deleted (cascade)

---

For detailed information, see the documentation files listed above.
