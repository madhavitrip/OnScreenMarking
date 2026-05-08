# Backend Updates Summary - Multiple Papers & Examiner Expertise

## Overview
The backend has been updated to support:
1. **Multiple Papers per Subject**: Each subject can have multiple papers (Paper 1, Paper 2, etc.)
2. **Examiner Expertise in Multiple Subjects**: Examiners can have expertise in multiple subjects and specific papers
3. **Enhanced Script Assignment**: Scripts are assigned based on examiner expertise validation

## New Models Created

### 1. Paper Model (`API/API/Models/Paper.cs`)
Represents individual papers for each subject.

**Key Fields:**
- `Id`: Primary key
- `SubjectConfigId`: Foreign key to SubjectConfig
- `PaperCode`: Unique identifier (e.g., "MATH-2024-P1")
- `PaperName`: Display name (e.g., "Paper 1")
- `PaperNumber`: Sequential number
- `MaxMarks`: Maximum marks for the paper
- `TotalQuestions`: Number of questions
- `IsActive`: Active/inactive status
- Navigation properties: `SubjectConfig`, `Sections`, `ExaminerExpertises`

### 2. ExaminerExpertise Model (`API/API/Models/ExaminerExpertise.cs`)
Represents the many-to-many relationship between examiners and subjects/papers.

**Key Fields:**
- `Id`: Primary key
- `ExaminerId`: Foreign key to User
- `SubjectConfigId`: Foreign key to SubjectConfig
- `PaperId`: Foreign key to Paper (nullable - if null, expertise covers all papers)
- `IsActive`: Active/inactive status
- `Remarks`: Additional notes
- Navigation properties: `Examiner`, `SubjectConfig`, `Paper`

## Updated Models

### 1. User Model (`API/API/Models/User.cs`)
**Changes:**
- Added `DepartmentId` and `Department` navigation property
- Added `Expertise` collection (ICollection<ExaminerExpertise>)
- Removed direct Department string property

### 2. Script Model (`API/API/Models/Script.cs`)
**Changes:**
- Added `PaperId` foreign key
- Added `Paper` navigation property
- Kept `Subject` field for denormalization (quick access without joins)

### 3. SubjectConfig Model (`API/API/Models/SubjectConfig.cs`)
**Changes:**
- Added `Name` field (e.g., "Mathematics", "Physics")
- Added `IsActive` field
- Added `Papers` collection (ICollection<Paper>)
- Added `ExaminerExpertises` collection

### 4. Section Model (`API/API/Models/SubjectConfig.cs`)
**Changes:**
- Added `PaperId` foreign key
- Added `Paper` navigation property
- Kept `SubjectConfigId` for denormalization

### 5. Department Model (`API/API/Models/Department.cs`)
**Changes:**
- Added `IsActive` field
- Added `SubjectConfigs` collection
- Added `CreatedAt` and `UpdatedAt` timestamps

## New Controllers

### 1. PapersController (`API/API/Controllers/PapersController.cs`)
Manages paper CRUD operations.

**Endpoints:**
- `GET /api/papers` - Get all papers (with optional subject filter)
- `GET /api/papers/{id}` - Get paper by ID
- `POST /api/papers` - Create new paper (admin/coordinator)
- `PUT /api/papers/{id}` - Update paper (admin/coordinator)
- `DELETE /api/papers/{id}` - Delete paper (admin)

### 2. ExaminerExpertiseController (`API/API/Controllers/ExaminerExpertiseController.cs`)
Manages examiner expertise assignments.

**Endpoints:**
- `GET /api/examinerexpertise/examiner/{examinerId}` - Get examiner's expertise
- `GET /api/examinerexpertise/subject/{subjectConfigId}` - Get subject's examiners
- `POST /api/examinerexpertise` - Add expertise (admin/coordinator)
- `PUT /api/examinerexpertise/{id}` - Update expertise (admin/coordinator)
- `DELETE /api/examinerexpertise/{id}` - Remove expertise (admin/coordinator)

## Updated Controllers

### 1. ScriptsController (`API/API/Controllers/ScriptsController.cs`)
**Changes:**
- Updated to use `PaperId` instead of `Subject` string
- Added expertise validation when assigning scripts
- Added `paperId` query parameter for filtering
- Added `GetPaperScripts` endpoint
- Uses `ScriptDto` for responses

**Key Logic:**
```csharp
// Verify examiner has expertise in this subject/paper
var hasExpertise = await _context.ExaminerExpertises
    .AnyAsync(ee => ee.ExaminerId == request.ExaminerId && 
                   ee.SubjectConfigId == script.Paper.SubjectConfigId &&
                   (ee.PaperId == null || ee.PaperId == script.PaperId) &&
                   ee.IsActive);
```

### 2. MarkingController (`API/API/Controllers/MarkingController.cs`)
**Changes:**
- Added expertise validation before creating marking
- Updated to use DTOs
- Added `GetScriptMarking` endpoint
- Enhanced error handling

**Key Logic:**
```csharp
// Verify examiner has expertise in this subject/paper
var hasExpertise = await _context.ExaminerExpertises
    .AnyAsync(ee => ee.ExaminerId == request.ExaminerId &&
                   ee.SubjectConfigId == script.Paper.SubjectConfigId &&
                   (ee.PaperId == null || ee.PaperId == script.PaperId) &&
                   ee.IsActive);
```

### 3. AuthController (`API/API/Controllers/AuthController.cs`)
**Changes:**
- Updated to use `DepartmentId` instead of `Department` string
- Added `Phone` and `Address` fields to registration

## New DTOs

### 1. SubjectConfigDto (`API/API/Models/DTOs/SubjectConfigDto.cs`)
- `SubjectConfigDto`: Subject configuration with papers and sections
- `SectionDto`: Section details
- `QuestionDto`: Question details

### 2. ScriptDto (`API/API/Models/DTOs/ScriptDto.cs`)
- `ScriptDto`: Script details with examiner information
- `AssignScriptRequest`: Request to assign script
- `ScriptStatusUpdateRequest`: Request to update script status

### 3. MarkingDto (`API/API/Models/DTOs/MarkingDto.cs`)
- `MarkingDto`: Marking details
- `SubmitMarkingRequest`: Request to submit marking
- `QuestionMarkDto`: Individual question marks
- `SectionMarkDto`: Section marks with questions

### 4. AuthDto Updates (`API/API/Models/DTOs/AuthDto.cs`)
- Updated `RegisterRequest` to use `DepartmentId`
- Added `ExaminerExpertiseDto` and `PaperDto`

## Database Context Updates

### ApplicationDbContext (`API/API/Data/ApplicationDbContext.cs`)
**Changes:**
- Added `DbSet<Paper>` and `DbSet<ExaminerExpertise>`
- Added `DbSet<Department>`
- Configured all relationships:
  - Department → SubjectConfigs (one-to-many)
  - SubjectConfig → Papers (one-to-many)
  - SubjectConfig → Sections (one-to-many)
  - Paper → Sections (one-to-many)
  - Paper → ExaminerExpertises (one-to-many)
  - User → ExaminerExpertises (one-to-many)
  - User → Department (many-to-one)
  - ExaminerExpertise unique constraint on (ExaminerId, SubjectConfigId, PaperId)

## API Documentation

### New Files
1. **API_ENDPOINTS.md** - Complete API endpoint documentation with examples
2. **MIGRATION_GUIDE.md** - Database migration instructions

## Workflow Changes

### Before (Old Workflow)
1. Register examiner with subject string
2. Create scripts with subject string
3. Assign scripts to examiners
4. Create marking

### After (New Workflow)
1. Register examiner
2. Add examiner expertise (subject + optional paper)
3. Create papers for subjects
4. Create scripts with paper reference
5. Assign scripts to examiners (validates expertise)
6. Create marking (validates expertise)

## Key Features

### 1. Flexible Expertise Assignment
- Examiner can have expertise in entire subject (all papers)
- Examiner can have expertise in specific paper only
- Multiple expertise records per examiner

### 2. Automatic Validation
- Scripts can only be assigned to examiners with expertise
- Markings can only be created by examiners with expertise
- Prevents unauthorized marking

### 3. Denormalization
- Subject field kept in Scripts for quick filtering
- Reduces need for joins in common queries

### 4. Audit Trail
- All models have `CreatedAt` and `UpdatedAt` timestamps
- Track when expertise was added/modified

## Migration Path

### For Existing Installations
1. Create Paper records from existing SubjectConfigs
2. Update Scripts to reference Papers
3. Update Sections to reference Papers
4. Create ExaminerExpertise records from existing data
5. Verify data integrity

See **MIGRATION_GUIDE.md** for detailed steps.

## Testing Recommendations

### Unit Tests
- Test expertise validation logic
- Test script assignment with expertise
- Test marking creation with expertise

### Integration Tests
- Test complete workflow: register → add expertise → create paper → create script → assign → mark
- Test error cases: missing expertise, invalid paper, etc.

### API Tests
- Test all new endpoints
- Test authorization on protected endpoints
- Test error responses

## Performance Considerations

### Indexes
- `Papers(SubjectConfigId)`
- `ExaminerExpertises(ExaminerId, SubjectConfigId, PaperId)`
- `Scripts(PaperId, AssignedExaminerId)`

### Query Optimization
- Use eager loading with `.Include()` to avoid N+1 queries
- Leverage denormalized Subject field for filtering

## Backward Compatibility

### Breaking Changes
- Scripts now require `PaperId` instead of `Subject` string
- User registration now requires `DepartmentId` instead of `Department` string
- Examiner expertise must be explicitly assigned

### Migration Required
- Existing data must be migrated to new schema
- API clients must be updated to use new endpoints

## Next Steps

1. **Database Migration**: Run migration scripts to update schema
2. **Data Migration**: Migrate existing data to new structure
3. **Testing**: Comprehensive testing of new functionality
4. **Deployment**: Deploy updated backend
5. **Frontend Updates**: Update React frontend to use new endpoints
6. **Documentation**: Update user documentation

## Support & Documentation

- **API_ENDPOINTS.md**: Complete endpoint reference
- **MIGRATION_GUIDE.md**: Database migration instructions
- **README.md**: General setup and overview
- **SETUP_GUIDE.md**: Initial setup instructions
