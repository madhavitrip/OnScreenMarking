# Database Migration Guide

## Overview
This guide explains the new database schema changes to support multiple papers per subject and examiner expertise in multiple subjects.

## Key Changes

### 1. New Tables

#### Paper Table
Represents individual papers for each subject. Each subject can have multiple papers (e.g., Paper 1, Paper 2).

```sql
CREATE TABLE Papers (
    Id INT PRIMARY KEY AUTO_INCREMENT,
    SubjectConfigId INT NOT NULL,
    PaperCode VARCHAR(50) UNIQUE NOT NULL,
    PaperName VARCHAR(100) NOT NULL,
    PaperNumber INT NOT NULL,
    MaxMarks DECIMAL(10,2) DEFAULT 100,
    TotalQuestions INT NOT NULL,
    Description VARCHAR(500),
    IsActive BOOLEAN DEFAULT TRUE,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (SubjectConfigId) REFERENCES SubjectConfigs(Id) ON DELETE CASCADE
);
```

#### ExaminerExpertise Table
Represents the many-to-many relationship between examiners and subjects/papers.

```sql
CREATE TABLE ExaminerExpertises (
    Id INT PRIMARY KEY AUTO_INCREMENT,
    ExaminerId INT NOT NULL,
    SubjectConfigId INT NOT NULL,
    PaperId INT,
    IsActive BOOLEAN DEFAULT TRUE,
    Remarks VARCHAR(500),
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_expertise (ExaminerId, SubjectConfigId, PaperId),
    FOREIGN KEY (ExaminerId) REFERENCES Users(Id) ON DELETE CASCADE,
    FOREIGN KEY (SubjectConfigId) REFERENCES SubjectConfigs(Id) ON DELETE CASCADE,
    FOREIGN KEY (PaperId) REFERENCES Papers(Id) ON DELETE SET NULL
);
```

### 2. Modified Tables

#### Users Table
Added Department relationship:

```sql
ALTER TABLE Users ADD COLUMN DepartmentId INT;
ALTER TABLE Users ADD FOREIGN KEY (DepartmentId) REFERENCES Departments(Id) ON DELETE SET NULL;
```

#### Scripts Table
Changed from Subject string to PaperId foreign key:

```sql
ALTER TABLE Scripts ADD COLUMN PaperId INT NOT NULL;
ALTER TABLE Scripts ADD FOREIGN KEY (PaperId) REFERENCES Papers(Id) ON DELETE RESTRICT;
-- Keep Subject column for denormalization (quick access)
```

#### Sections Table
Added PaperId to link sections to specific papers:

```sql
ALTER TABLE Sections ADD COLUMN PaperId INT NOT NULL;
ALTER TABLE Sections ADD FOREIGN KEY (PaperId) REFERENCES Papers(Id) ON DELETE CASCADE;
```

#### SubjectConfigs Table
Added Name field and relationships:

```sql
ALTER TABLE SubjectConfigs ADD COLUMN Name VARCHAR(100);
ALTER TABLE SubjectConfigs ADD COLUMN IsActive BOOLEAN DEFAULT TRUE;
```

#### Departments Table
Added timestamps and navigation:

```sql
ALTER TABLE Departments ADD COLUMN IsActive BOOLEAN DEFAULT TRUE;
ALTER TABLE Departments ADD COLUMN CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE Departments ADD COLUMN UpdatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;
```

## Migration Steps

### Step 1: Create New Tables
Execute the Paper and ExaminerExpertise table creation scripts above.

### Step 2: Modify Existing Tables
Execute the ALTER TABLE statements to add new columns and relationships.

### Step 3: Migrate Data

#### Create Papers from Subjects
If you have existing subjects, create default papers:

```sql
INSERT INTO Papers (SubjectConfigId, PaperCode, PaperName, PaperNumber, MaxMarks, TotalQuestions, IsActive)
SELECT 
    Id,
    CONCAT(Code, '-P1'),
    'Paper 1',
    1,
    TotalMarks,
    (SELECT COUNT(*) FROM Sections WHERE SubjectConfigId = SubjectConfigs.Id),
    TRUE
FROM SubjectConfigs;
```

#### Update Scripts with PaperId
Assuming you have a mapping or default paper per subject:

```sql
UPDATE Scripts s
SET s.PaperId = (
    SELECT p.Id FROM Papers p 
    WHERE p.SubjectConfigId = (
        SELECT sc.Id FROM SubjectConfigs sc 
        WHERE sc.Code = s.Subject
    )
    LIMIT 1
);
```

#### Update Sections with PaperId
Link sections to the default paper:

```sql
UPDATE Sections sec
SET sec.PaperId = (
    SELECT p.Id FROM Papers p 
    WHERE p.SubjectConfigId = sec.SubjectConfigId 
    LIMIT 1
);
```

#### Create ExaminerExpertise Records
If you have existing examiner-subject relationships, migrate them:

```sql
-- This depends on your existing data structure
-- Example: If you had an ExaminerSubjects table
INSERT INTO ExaminerExpertises (ExaminerId, SubjectConfigId, PaperId, IsActive)
SELECT ExaminerId, SubjectConfigId, NULL, TRUE
FROM ExaminerSubjects;
```

### Step 4: Verify Data Integrity

```sql
-- Check all scripts have valid PaperId
SELECT COUNT(*) FROM Scripts WHERE PaperId IS NULL;

-- Check all sections have valid PaperId
SELECT COUNT(*) FROM Sections WHERE PaperId IS NULL;

-- Check examiner expertise is properly set
SELECT COUNT(*) FROM ExaminerExpertises WHERE IsActive = TRUE;
```

## Rollback Plan

If you need to rollback:

```sql
-- Drop new tables
DROP TABLE ExaminerExpertises;
DROP TABLE Papers;

-- Revert table modifications
ALTER TABLE Scripts DROP FOREIGN KEY Scripts_ibfk_paperId;
ALTER TABLE Scripts DROP COLUMN PaperId;

ALTER TABLE Sections DROP FOREIGN KEY Sections_ibfk_paperId;
ALTER TABLE Sections DROP COLUMN PaperId;

ALTER TABLE Users DROP FOREIGN KEY Users_ibfk_departmentId;
ALTER TABLE Users DROP COLUMN DepartmentId;
```

## Entity Framework Core Migrations

If using EF Core migrations:

```bash
# Create migration
dotnet ef migrations add AddPapersAndExpertise

# Apply migration
dotnet ef database update

# Rollback if needed
dotnet ef database update <previous-migration-name>
```

## Testing Checklist

- [ ] All scripts have valid PaperId
- [ ] All sections have valid PaperId
- [ ] Examiner expertise records are created
- [ ] Scripts can be assigned to examiners with expertise
- [ ] Marking workflow works with new structure
- [ ] Reports generate correctly
- [ ] API endpoints return correct data

## Performance Considerations

1. **Indexes**: Ensure indexes on frequently queried columns:
   ```sql
   CREATE INDEX idx_scripts_paperId ON Scripts(PaperId);
   CREATE INDEX idx_scripts_examinerId ON Scripts(AssignedExaminerId);
   CREATE INDEX idx_expertise_examinerId ON ExaminerExpertises(ExaminerId);
   CREATE INDEX idx_expertise_subjectId ON ExaminerExpertises(SubjectConfigId);
   ```

2. **Query Optimization**: Use eager loading in EF Core to avoid N+1 queries:
   ```csharp
   var scripts = await _context.Scripts
       .Include(s => s.Paper)
       .Include(s => s.AssignedExaminer)
       .ToListAsync();
   ```

3. **Denormalization**: Keep Subject field in Scripts table for quick filtering without joins.

## Backup Recommendation

Before running migrations:
```bash
# Backup database
mysqldump -u root -p osm_portal > osm_portal_backup.sql
```

## Support

For issues or questions about the migration, refer to:
- API_ENDPOINTS.md for endpoint documentation
- SETUP_GUIDE.md for initial setup
- README.md for general information
