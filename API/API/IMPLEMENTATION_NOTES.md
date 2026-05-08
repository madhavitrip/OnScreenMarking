# Implementation Notes - Multiple Papers & Examiner Expertise

## What Was Changed

This document provides implementation details for developers working with the updated backend.

## Architecture Overview

### Entity Relationships

```
Department (1) ──→ (Many) SubjectConfig
    ↓
SubjectConfig (1) ──→ (Many) Paper
    ↓                    ↓
Section ←──────────────┘
    ↓
Question

User (1) ──→ (Many) ExaminerExpertise ←── (1) SubjectConfig
                         ↓
                      Paper (optional)

Script (Many) ──→ (1) Paper
    ↓
Marking ←── (1) User (Examiner)
```

### Key Design Decisions

1. **Paper Model**: Separate entity for papers instead of just a string field
   - Allows multiple papers per subject
   - Enables paper-specific configurations
   - Supports paper-specific examiner expertise

2. **ExaminerExpertise Model**: Many-to-many relationship with optional Paper
   - `PaperId = NULL`: Examiner has expertise in all papers of the subject
   - `PaperId = X`: Examiner has expertise only in specific paper
   - Allows flexible expertise assignment

3. **Denormalization**: Subject field kept in Scripts
   - Improves query performance
   - Reduces need for joins in common queries
   - Maintains data consistency through application logic

4. **Unique Constraint**: `(ExaminerId, SubjectConfigId, PaperId)` on ExaminerExpertise
   - Prevents duplicate expertise records
   - Allows NULL PaperId to be unique (SQL treats NULL as distinct)

## Code Patterns

### 1. Expertise Validation Pattern

Used in ScriptsController and MarkingController:

```csharp
// Verify examiner has expertise in this subject/paper
var hasExpertise = await _context.ExaminerExpertises
    .AnyAsync(ee => ee.ExaminerId == examinerId && 
                   ee.SubjectConfigId == script.Paper.SubjectConfigId &&
                   (ee.PaperId == null || ee.PaperId == script.PaperId) &&
                   ee.IsActive);

if (!hasExpertise)
    return BadRequest(new { success = false, message = "Examiner does not have expertise" });
```

**Logic Explanation:**
- `ee.PaperId == null`: Matches if examiner has general expertise (all papers)
- `ee.PaperId == script.PaperId`: Matches if examiner has specific paper expertise
- Both conditions combined with OR: Accepts either general or specific expertise

### 2. DTO Pattern

All controllers use DTOs for responses:

```csharp
var scriptDto = new ScriptDto
{
    Id = script.Id,
    ScriptId = script.ScriptId,
    // ... other fields
    AssignedExaminerName = script.AssignedExaminer?.Name
};
```

**Benefits:**
- Decouples API contract from database models
- Allows selective field exposure
- Enables computed fields (like AssignedExaminerName)

### 3. Eager Loading Pattern

Used to prevent N+1 queries:

```csharp
var scripts = await _context.Scripts
    .Include(s => s.Paper)
    .Include(s => s.AssignedExaminer)
    .ToListAsync();
```

**Important:** Always include related entities before converting to DTOs.

## Common Workflows

### Workflow 1: Register Examiner with Expertise

```csharp
// 1. Register user
var user = new User { /* ... */ };
_context.Users.Add(user);
await _context.SaveChangesAsync();

// 2. Add expertise
var expertise = new ExaminerExpertise
{
    ExaminerId = user.Id,
    SubjectConfigId = 1,
    PaperId = null, // All papers
    IsActive = true
};
_context.ExaminerExpertises.Add(expertise);
await _context.SaveChangesAsync();
```

### Workflow 2: Create and Assign Script

```csharp
// 1. Create script
var script = new Script
{
    ScriptId = "SCRIPT-001",
    PaperId = 1,
    Subject = "mathematics",
    // ... other fields
};
_context.Scripts.Add(script);
await _context.SaveChangesAsync();

// 2. Verify expertise
var hasExpertise = await _context.ExaminerExpertises
    .AnyAsync(ee => ee.ExaminerId == examinerId &&
                   ee.SubjectConfigId == script.Paper.SubjectConfigId &&
                   (ee.PaperId == null || ee.PaperId == script.PaperId) &&
                   ee.IsActive);

// 3. Assign if expertise exists
if (hasExpertise)
{
    script.AssignedExaminerId = examinerId;
    script.Status = "in_progress";
    _context.Scripts.Update(script);
    await _context.SaveChangesAsync();
}
```

### Workflow 3: Create and Submit Marking

```csharp
// 1. Verify expertise (same as above)
var hasExpertise = await _context.ExaminerExpertises
    .AnyAsync(ee => ee.ExaminerId == examinerId &&
                   ee.SubjectConfigId == script.Paper.SubjectConfigId &&
                   (ee.PaperId == null || ee.PaperId == script.PaperId) &&
                   ee.IsActive);

// 2. Create marking
var marking = new Marking
{
    ScriptId = scriptId,
    ExaminerId = examinerId,
    MarksJson = request.MarksJson,
    TotalMarks = request.TotalMarks,
    Status = "draft"
};
_context.Markings.Add(marking);
await _context.SaveChangesAsync();

// 3. Submit marking
marking.Status = "submitted";
marking.SubmittedAt = DateTime.UtcNow;

// 4. Update script
script.Status = "completed";
script.TotalMarks = marking.TotalMarks;
script.Percentage = marking.Percentage;
script.SubmittedAt = DateTime.UtcNow;

_context.Markings.Update(marking);
_context.Scripts.Update(script);
await _context.SaveChangesAsync();
```

## Error Handling

### Common Error Scenarios

1. **Examiner without expertise**
   ```
   Status: 400 Bad Request
   Message: "Examiner does not have expertise in this subject/paper"
   ```

2. **Paper not found**
   ```
   Status: 400 Bad Request
   Message: "Paper not found"
   ```

3. **Script already assigned**
   ```
   Status: 400 Bad Request
   Message: "Script already assigned to another examiner"
   ```

4. **Marking already submitted**
   ```
   Status: 400 Bad Request
   Message: "Cannot update submitted marking"
   ```

## Testing Considerations

### Unit Tests

```csharp
[Test]
public async Task AssignScript_WithoutExpertise_ReturnsBadRequest()
{
    // Arrange
    var examiner = new User { Id = 1, UserType = "examiner" };
    var script = new Script { Id = 1, PaperId = 1 };
    
    // Act
    var result = await controller.AssignScript(1, new AssignScriptRequest { ExaminerId = 1 });
    
    // Assert
    Assert.That(result, Is.InstanceOf<BadRequestObjectResult>());
}

[Test]
public async Task AssignScript_WithExpertise_Succeeds()
{
    // Arrange
    var expertise = new ExaminerExpertise 
    { 
        ExaminerId = 1, 
        SubjectConfigId = 1, 
        PaperId = null,
        IsActive = true 
    };
    
    // Act
    var result = await controller.AssignScript(1, new AssignScriptRequest { ExaminerId = 1 });
    
    // Assert
    Assert.That(result, Is.InstanceOf<OkObjectResult>());
}
```

### Integration Tests

```csharp
[Test]
public async Task CompleteMarkingWorkflow()
{
    // 1. Create examiner with expertise
    // 2. Create paper and script
    // 3. Assign script
    // 4. Create marking
    // 5. Submit marking
    // 6. Verify script status updated
}
```

## Performance Optimization

### Query Optimization

**Bad:**
```csharp
var scripts = _context.Scripts.ToList();
foreach (var script in scripts)
{
    var paper = _context.Papers.Find(script.PaperId);
    var examiner = _context.Users.Find(script.AssignedExaminerId);
}
```

**Good:**
```csharp
var scripts = await _context.Scripts
    .Include(s => s.Paper)
    .Include(s => s.AssignedExaminer)
    .ToListAsync();
```

### Indexing Strategy

```sql
-- Essential indexes
CREATE INDEX idx_scripts_paperId ON Scripts(PaperId);
CREATE INDEX idx_scripts_examinerId ON Scripts(AssignedExaminerId);
CREATE INDEX idx_expertise_examinerId ON ExaminerExpertises(ExaminerId);
CREATE INDEX idx_expertise_subjectId ON ExaminerExpertises(SubjectConfigId);
CREATE INDEX idx_expertise_paperId ON ExaminerExpertises(PaperId);

-- Composite indexes for common queries
CREATE INDEX idx_expertise_lookup ON ExaminerExpertises(ExaminerId, SubjectConfigId, PaperId);
```

## Migration Checklist

- [ ] Backup existing database
- [ ] Create Paper table
- [ ] Create ExaminerExpertise table
- [ ] Add PaperId to Scripts
- [ ] Add PaperId to Sections
- [ ] Add DepartmentId to Users
- [ ] Migrate existing data
- [ ] Verify data integrity
- [ ] Create indexes
- [ ] Test all workflows
- [ ] Update API documentation
- [ ] Deploy to production

## Troubleshooting

### Issue: "Examiner does not have expertise"
**Cause:** ExaminerExpertise record not created or IsActive = false
**Solution:** 
1. Verify expertise record exists: `SELECT * FROM ExaminerExpertises WHERE ExaminerId = X`
2. Check IsActive flag
3. Verify SubjectConfigId and PaperId match

### Issue: "Paper not found"
**Cause:** Script references non-existent PaperId
**Solution:**
1. Verify Paper exists: `SELECT * FROM Papers WHERE Id = X`
2. Check SubjectConfig has Papers created
3. Verify migration completed successfully

### Issue: N+1 Query Performance
**Cause:** Missing `.Include()` statements
**Solution:**
1. Add `.Include()` for all related entities
2. Use `.AsNoTracking()` for read-only queries
3. Profile queries with SQL Server Profiler

## Future Enhancements

1. **Paper Templates**: Pre-defined paper structures
2. **Expertise Levels**: Beginner, Intermediate, Expert
3. **Paper Scheduling**: Exam dates and deadlines
4. **Batch Operations**: Bulk assign scripts, bulk add expertise
5. **Analytics**: Examiner performance metrics, marking statistics
6. **Audit Logging**: Track all changes to expertise and assignments

## References

- **API_ENDPOINTS.md**: Complete endpoint documentation
- **MIGRATION_GUIDE.md**: Database migration instructions
- **BACKEND_UPDATES_SUMMARY.md**: High-level overview of changes
- **README.md**: General setup and overview
