# Script Allocation Implementation Summary

## Overview
Implemented a comprehensive **paper-wise script allocation system** where coordinators/admins can allocate exam scripts to examiners based on their subject expertise.

## Files Created

### 1. Backend API Endpoint
**File**: `API/API/Controllers/AllocationController.cs`

**New Endpoint**: `GET /api/allocation/paper/{paperId}/pending-scripts`

**Functionality**:
- Fetches a paper with all its associated subjects
- Gets all pending scripts for that paper
- Retrieves examiners with expertise in ANY of the paper's subjects
- Groups examiners by ID to show all their expertise areas
- Returns paper info, scripts, and examiners in one response

**Key Logic**:
```csharp
// Get paper with subjects
var paper = await _context.Papers
    .Include(p => p.SubjectPapers)
    .ThenInclude(sp => sp.Subject)
    .FirstOrDefaultAsync(p => p.PaperId == paperId);

// Get subject IDs for this paper
var subjectIds = paper.SubjectPapers.Select(sp => sp.SubjectId).ToList();

// Get examiners with expertise in ANY of these subjects
var examiners = await _context.ExaminerExpertises
    .Where(ee => subjectIds.Contains(ee.SubjectId) && ee.IsActive)
    .GroupBy(ee => ee.ExaminerId)
    .Select(g => new { /* examiner details */ })
    .ToListAsync();
```

### 2. Frontend Component
**File**: `UI/src/pages/ScriptAllocation.jsx`

**Features**:
- Three-step workflow: Project → Paper → Allocate
- Real-time data fetching based on selections
- Bulk allocation of multiple scripts
- Examiner expertise display
- Workload tracking (allocation count per examiner)
- Error handling and success feedback
- Responsive design (mobile, tablet, desktop)

**Key Components**:
- Project selector
- Paper selector with details
- Script list with examiner dropdown
- Examiner reference panel showing expertise
- Action buttons (Clear, Allocate)

### 3. Allocation Service
**File**: `UI/src/services/allocationService.js`

**Methods**:
- `getPendingScriptsBySubject(subjectId)` - Get scripts by subject
- `bulkAllocateScripts(allocations)` - Allocate multiple scripts
- `getAllocations(filters)` - Get allocations with filters
- `getAllocationById(id)` - Get single allocation
- `createAllocation(scriptId, examinerId)` - Create single allocation
- `cancelAllocation(id)` - Cancel allocation
- `getExaminerAllocations(examinerId)` - Get examiner's allocations
- `getScriptAllocation(scriptId)` - Get script's allocation

### 4. Route Configuration
**File**: `UI/src/App.jsx`

**Changes**:
- Added import for `ScriptAllocation` component
- Added route for admin: `/admin/allocate-scripts`
- Added route for coordinator: `/allocate-scripts`

### 5. Dashboard Integration
**Files**: 
- `UI/src/pages/AdminDashboard.jsx`
- `UI/src/pages/CoordinatorDashboard.jsx`

**Changes**:
- Added "Script Allocation" module card
- Icon: Lightning bolt (Zap)
- Color: Blue
- Links to allocation page

### 6. Documentation
**Files**:
- `SCRIPT_ALLOCATION_DESIGN.md` - Technical design document
- `SCRIPT_ALLOCATION_USAGE.md` - User guide
- `SCRIPT_ALLOCATION_IMPLEMENTATION.md` - This file

## Data Flow

### Allocation Process
```
1. User selects Project
   ↓
2. System fetches Papers for that project
   ↓
3. User selects Paper
   ↓
4. System fetches:
   - Paper details (code, name, subjects)
   - Pending scripts for that paper
   - Examiners with expertise in paper's subjects
   ↓
5. User assigns examiners to scripts
   ↓
6. User clicks "Allocate"
   ↓
7. System bulk allocates all selected scripts
   ↓
8. Scripts status changes: pending → allocated
   ↓
9. Examiners can now see their allocated scripts
```

## API Endpoints

### New Endpoint
```
GET /api/allocation/paper/{paperId}/pending-scripts
Authorization: Bearer {token}
Roles: admin, coordinator

Response:
{
  "scripts": [...],
  "examiners": [...],
  "paper": {...}
}
```

### Existing Endpoints Used
```
GET /api/project
GET /api/papers?projectId={projectId}
POST /api/allocation/bulk-allocate
```

## Database Relationships

### Key Tables
```
Paper
├── SubjectPaper (junction)
│   └── Subject
└── Script
    └── Allocation
        └── User (Examiner)
            └── ExaminerExpertise
                └── Subject
```

### Query Logic
1. Get Paper → Get SubjectPapers → Get Subjects
2. Get Scripts where PaperId = selected AND Status = "pending"
3. Get ExaminerExpertises where SubjectId IN (paper's subjects) AND IsActive = true
4. Group by ExaminerId to show all expertise areas

## UI/UX Design

### Layout
- **Header**: Title and description
- **Error/Success Messages**: Alert boxes at top
- **Step 1**: Project selection grid
- **Step 2**: Paper selection grid (appears after project selected)
- **Paper Info**: Gradient card showing paper details and subjects
- **Stats**: Three cards showing pending, allocated, and expert counts
- **Scripts List**: Table-like layout with script info and examiner dropdown
- **Examiners Panel**: Grid of examiner cards with expertise badges
- **Actions**: Clear and Allocate buttons

### Colors & Icons
- **Project**: Blue (primary)
- **Paper**: Green (success)
- **Scripts**: Blue (info)
- **Examiners**: Purple (secondary)
- **Icons**: Lucide React icons for visual clarity

### Responsive Design
- Mobile: Single column layout
- Tablet: 2-column layout
- Desktop: 3-column layout

## Validation

### Backend Validation
- Paper exists
- Scripts exist and are in "pending" status
- Examiners exist and are active
- Script not already allocated (unless previous allocation cancelled)
- Examiner has expertise in paper's subjects

### Frontend Validation
- At least one script selected
- Each selected script has examiner assigned
- User confirmation before allocation

## Error Handling

### Backend Errors
- 404: Paper/Script/Examiner not found
- 400: Invalid request (missing fields, already allocated)
- 500: Server error

### Frontend Errors
- Network errors: Display error message with retry option
- Validation errors: Highlight problematic fields
- Success feedback: Show confirmation with count

## Security

### Authorization
- Only admin/coordinator can allocate scripts
- Examiners can only view their own allocations
- Role-based access control enforced

### Data Protection
- JWT token required for all API calls
- Input validation on both frontend and backend
- No sensitive data exposed in responses

## Performance Considerations

### Optimizations
- Single API call to fetch paper, scripts, and examiners
- Grouping examiners by ID to avoid duplicates
- Pagination support for large datasets (future)
- Lazy loading of data based on user selections

### Database Queries
- Efficient joins using Include/ThenInclude
- Filtered queries to reduce data transfer
- Indexed lookups on foreign keys

## Testing Checklist

### Manual Testing
- [ ] Select project → papers load
- [ ] Select paper → scripts and examiners load
- [ ] Paper info displays correctly
- [ ] Can select examiner for each script
- [ ] Examiner details show correctly
- [ ] Can allocate scripts
- [ ] Success message appears
- [ ] Scripts status changes to "allocated"
- [ ] Can clear selections
- [ ] Error handling works

### Edge Cases
- [ ] No papers in project
- [ ] No pending scripts
- [ ] No examiners with expertise
- [ ] Allocate with no selections
- [ ] Network error during allocation
- [ ] Duplicate allocation attempt

## Future Enhancements

### Phase 2
1. **Load Balancing**: Auto-suggest examiner based on workload
2. **Expertise Matching**: Show match percentage
3. **Batch Import**: CSV upload for bulk allocation
4. **Allocation History**: Track all changes

### Phase 3
1. **Reallocation**: Reassign scripts if needed
2. **Notifications**: Email examiners about allocations
3. **Analytics**: Allocation statistics and reports
4. **Scheduling**: Schedule allocations for future dates

## Deployment Notes

### Prerequisites
- Database migrations applied
- ExaminerExpertise records created for examiners
- Papers linked to subjects
- Scripts created and in "pending" status

### Configuration
- No additional configuration needed
- Uses existing API base URL
- Uses existing authentication

### Rollback Plan
- Remove routes from App.jsx
- Remove component files
- Remove API endpoint (or keep for backward compatibility)
- No database changes required

## Support & Maintenance

### Common Issues
1. **Examiners not showing**: Check expertise assignments
2. **Scripts not showing**: Check script status and paper link
3. **Allocation fails**: Check user permissions and data integrity

### Monitoring
- Track allocation success rate
- Monitor API response times
- Log all allocation operations
- Alert on errors

## Documentation

### For Users
- `SCRIPT_ALLOCATION_USAGE.md` - Step-by-step guide
- In-app help text and tooltips
- Error messages with solutions

### For Developers
- `SCRIPT_ALLOCATION_DESIGN.md` - Technical design
- Code comments in components
- API documentation

## Conclusion

The Script Allocation system provides a user-friendly, efficient way to allocate exam scripts to examiners based on their subject expertise. The paper-wise approach ensures that examiners only see scripts for papers they're qualified to mark, improving quality and fairness in the marking process.

The system is built with scalability, security, and usability in mind, with clear error handling and comprehensive documentation for both users and developers.
