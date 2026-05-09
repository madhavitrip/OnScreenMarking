# DTOs Update - Complete

## Summary
All DTOs have been updated to match the new model structure and are now compatible with all controllers.

## Changes Made

### 1. **AuthDto.cs** ✅
- Added `UniversityId` to `RegisterRequest`
- Changed `ExaminerExpertiseDto.DepartmentId` to `SubjectId`
- Updated `PaperDto`:
  - Changed `Id` to `PaperId`
  - Changed `SubjectConfigId` to `SubjectId`
  - Added `ProjectId`

### 2. **MarkingDto.cs** ✅
- Updated `MarkingDto`:
  - Removed `DepartmentId`
  - Added `AllocationId`
  - Removed `MarksJson` and `SectionMarksJson`
- Updated `SubmitMarkingRequest`:
  - Changed `ScriptId` to `AllocationId`
  - Removed `MarksJson` and `SectionMarksJson`

### 3. **ScriptDto.cs** ✅
- Updated `ScriptDto`:
  - Removed: `RollNo`, `StudentName`, `Subject`, `ExamDate`, `ScannedImageUrl`, `AssignedExaminerId`, `AssignedExaminerName`
  - Added: `Barcode`, `CleanPdfUrl`, `IsReEvaluationRequested`
- Updated `AssignScriptRequest`:
  - Removed `ScriptId` (passed in URL)
- Updated `ScriptStatusUpdateRequest`:
  - Removed `ScriptId` (passed in URL)

### 4. **SubjectConfigDto.cs** ✅
- Removed old `SubjectConfigDto` (no longer used)
- Added `SubjectDto` with proper properties
- Added `SessionDto` with proper properties
- Added `ProjectDto` with proper properties
- Added `AllocationDto` with proper properties
- Updated `SectionDto`:
  - Removed `SubjectConfigId`
  - Removed `SectionId` (string)
- Updated `QuestionDto`:
  - Changed `Id` to `QuestionId`
  - Changed `Marks` from int to decimal
  - Added `IsOptional` and `OptionalGroupCode`
- Added `QuestionMarkDto` with all required properties

## DTO Property Mappings

### AuthDto
- `RegisterRequest.UniversityId` → `User.UniversityId`
- `ExaminerExpertiseDto.SubjectId` → `ExaminerExpertise.SubjectId`
- `PaperDto.PaperId` → `Paper.PaperId`
- `PaperDto.SubjectId` → `Paper.SubjectId`
- `PaperDto.ProjectId` → `Paper.ProjectId`

### MarkingDto
- `MarkingDto.AllocationId` → `Marking.AllocationId`
- `SubmitMarkingRequest.AllocationId` → `Allocation.Id`

### ScriptDto
- `ScriptDto.Barcode` → `Script.Barcode`
- `ScriptDto.CleanPdfUrl` → `Script.CleanPdfUrl`
- `ScriptDto.IsReEvaluationRequested` → `Script.IsReEvaluationRequested`

### SubjectConfigDto
- `SubjectDto.SubjectId` → `Subject.SubjectId`
- `SessionDto.SessionId` → `Session.SessionId`
- `ProjectDto.ProjectId` → `Project.ProjectId`
- `AllocationDto.Id` → `Allocation.Id`
- `QuestionDto.QuestionId` → `Question.QuestionId`
- `QuestionMarkDto.Id` → `QuestionMark.Id`

## Compilation Status
✅ **All DTOs compile without errors**
✅ **All controllers compile without errors**
✅ **All DTO properties match model definitions**
✅ **All controller references to DTOs are valid**

## Files Modified
- `API/API/Models/DTOs/AuthDto.cs`
- `API/API/Models/DTOs/MarkingDto.cs`
- `API/API/Models/DTOs/ScriptDto.cs`
- `API/API/Models/DTOs/SubjectConfigDto.cs`

## Next Steps
1. Create missing controllers:
   - SubjectController
   - SessionController
   - ProjectController
   - AllocationController
   - DepartmentController
2. Run database migrations
3. Test all endpoints
4. Update frontend to match new API structure
