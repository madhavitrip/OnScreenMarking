# Examiner Marking Interface - Implementation Guide

## Overview
A comprehensive CBSE OSM-style marking interface for examiners to evaluate answer sheets with section-based marking, annotations, and real-time score tracking.

## Features Implemented

### 1. **Frontend - ExaminerMarking.jsx**
Located at: `UI/src/pages/ExaminerMarking.jsx`

#### Key Features:
- **Section-based Marking**: Questions organized by sections (A, B, C)
- **Question Types**: Support for MCQ, SA (Short Answer), LA (Long Answer), and more
- **Mark Entry**: Input marks for each question with validation
- **Annotations**: Add remarks/comments for individual questions
- **Skip Functionality**: Mark questions as skipped/unattempted
- **Real-time Calculation**: Automatic total and section-wise mark calculation
- **Status Indicators**: Visual feedback (✓ full marks, ⚠ partial marks, ✗ skipped)
- **Score Summary**: Live score tracking with percentage
- **Section-wise Summary**: View marks obtained per section
- **Examiner Remarks**: Add overall remarks for the script

#### UI Components:
- **Header**: Script ID, Examiner name, Status, Max marks
- **Answer Sheet Viewer**: Placeholder for scanned PDF
- **Marking Sections**: Collapsible sections with questions
- **Sidebar**: Score summary, section breakdown, remarks, action buttons

### 2. **Backend API - MarkingController.cs**
Located at: `API/API/Controllers/MarkingController.cs`

#### New Endpoints:

**GET /api/marking/{markingId}/details**
- Returns complete marking data with sections and questions
- Includes existing marks for each question
- Response includes script details and examiner info

**POST /api/marking/{markingId}/question-marks**
- Save marks for multiple questions at once
- Updates total marks and percentage
- Accepts array of question marks with annotations

**GET /api/marking/{markingId}/question-marks**
- Retrieve saved question marks for a marking
- Useful for resuming marking sessions

#### Existing Endpoints Enhanced:
- `PUT /api/marking/{markingId}` - Update marking with remarks
- `PUT /api/marking/{markingId}/submit` - Submit completed marking

### 3. **Frontend Service - markingService.js**
Located at: `UI/src/services/markingService.js`

Provides methods for:
- `getMarkingDetails()` - Fetch complete marking data
- `saveQuestionMarks()` - Save marks for questions
- `submitMarking()` - Submit completed marking
- `getExaminerMarkings()` - List examiners' markings

### 4. **Data Models**

#### Question Model (SubjectConfig.cs)
```csharp
public class Question
{
    public int QuestionId { get; set; }
    public int SectionId { get; set; }
    public int QuestionNo { get; set; }
    public decimal Marks { get; set; }
    public string Type { get; set; } // MCQ, SA, LA, etc.
    public bool IsOptional { get; set; }
    public string OptionalGroupCode { get; set; }
}
```

#### QuestionMark Model (SubjectConfig.cs)
```csharp
public class QuestionMark
{
    public int Id { get; set; }
    public int MarkingId { get; set; }
    public int QuestionId { get; set; }
    public decimal MarksAwarded { get; set; }
    public bool IsSkipped { get; set; }
    public string Remarks { get; set; }
    public bool IsAttempted { get; set; }
}
```

## Workflow

### Examiner Marking Process:

1. **Load Script**: Examiner opens a script assigned to them
2. **View Answer Sheet**: Scanned PDF displayed in the interface
3. **Mark Questions**: 
   - Enter marks for each question
   - System validates marks don't exceed max
   - Visual indicators show full/partial/skipped status
4. **Add Annotations**: 
   - Click "Annotation" button for any question
   - Add remarks explaining the marking
5. **Skip Questions**: 
   - Mark unattempted questions as skipped
   - Skipped questions don't count toward total
6. **Review**: 
   - Check section-wise breakdown
   - Review total score and percentage
7. **Save**: Click "Save Marks" to save progress
8. **Submit**: Click "Submit Marks" to finalize marking

### Data Flow:

```
ExaminerMarking.jsx
    ↓
markingService.js
    ↓
API (MarkingController)
    ↓
Database (Marking, QuestionMark, Question, Section)
```

## Current Implementation Status

### ✅ Completed:
- Frontend UI with mock data (fully functional demo)
- API endpoints for marking operations
- Question mark model and database structure
- Service layer for API communication
- Real-time score calculation
- Section-based organization
- Annotation support
- Skip functionality

### 🔄 To Connect to Real API:
1. Update `ExaminerMarking.jsx` to use `markingService` instead of mock data
2. Pass marking ID from route params or context
3. Ensure API is running and accessible
4. Test with real database data

## Usage Example

### Frontend - Using the Marking Interface:
```javascript
// The component uses mock data for demonstration
// To use real API, replace mock data loading with:

useEffect(() => {
  const loadData = async () => {
    const data = await markingService.getMarkingDetails(markingId);
    setMarkingData(data);
  };
  loadData();
}, [markingId]);
```

### Backend - Saving Marks:
```csharp
// POST /api/marking/1/question-marks
[
  {
    "questionId": 1,
    "marksAwarded": 2,
    "isSkipped": false,
    "remarks": "Correct answer",
    "isAttempted": true
  },
  {
    "questionId": 2,
    "marksAwarded": 1,
    "isSkipped": false,
    "remarks": "Partial credit",
    "isAttempted": true
  }
]
```

## Styling & Design

- **Tailwind CSS 4**: All styling uses Tailwind utilities
- **Lucide React Icons**: For visual indicators and buttons
- **Color Scheme**:
  - Blue: Primary actions and headers
  - Green: Full marks, success states
  - Yellow: Partial marks, warnings
  - Red: Skipped questions, errors
  - Gray: Neutral elements

## Question Types Supported

| Type | Color | Description |
|------|-------|-------------|
| MCQ | Blue | Multiple Choice Questions |
| SA | Green | Short Answer |
| LA | Purple | Long Answer |
| CS | Orange | Case Study |
| NP | Red | Numerical Problem |
| EXP | Indigo | Explanation |
| RC | Cyan | Reading Comprehension |
| WS | Pink | Word Search |
| LIT | Yellow | Literature |
| GV | Teal | Grammar/Vocabulary |

## Next Steps

1. **Connect to Real API**: Update component to fetch real marking data
2. **PDF Viewer Integration**: Add actual PDF viewer for answer sheets
3. **Handwriting Recognition**: Optional OCR for handwritten answers
4. **Re-evaluation Flow**: Support for re-evaluation requests
5. **Audit Trail**: Log all marking changes
6. **Bulk Operations**: Mark multiple scripts efficiently
7. **Quality Checks**: Validation rules for marking consistency

## Testing

### Manual Testing Checklist:
- [ ] Enter marks for all question types
- [ ] Verify total calculation
- [ ] Test skip functionality
- [ ] Add annotations
- [ ] Save marks
- [ ] Submit marking
- [ ] Reset form
- [ ] Check section-wise breakdown
- [ ] Verify percentage calculation

### API Testing:
- [ ] GET /api/marking/{id}/details
- [ ] POST /api/marking/{id}/question-marks
- [ ] PUT /api/marking/{id}/submit
- [ ] GET /api/marking/examiner/{examinerId}

## Files Modified/Created

### Created:
- `UI/src/pages/ExaminerMarking.jsx` - Main marking interface
- `UI/src/services/markingService.js` - API service layer
- `API/API/Models/DTOs/MarkingDto.cs` - Updated DTO

### Modified:
- `API/API/Controllers/MarkingController.cs` - Added new endpoints
- `API/API/Models/DTOs/MarkingDto.cs` - Enhanced QuestionMarkDto

## Database Schema

The implementation uses existing models:
- `Marking` - Main marking record
- `QuestionMark` - Individual question marks
- `Question` - Question details
- `Section` - Section grouping
- `Paper` - Paper/exam details
- `Script` - Student answer script

No new tables required - uses existing schema.
