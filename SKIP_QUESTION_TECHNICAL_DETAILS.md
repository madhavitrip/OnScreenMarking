# Skip Question Feature - Technical Implementation Details

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    ExaminerMarking Page                     │
│  - Manages overall marking workflow                         │
│  - Syncs annotations to question marks                      │
│  - Calculates total score (excluding skipped)               │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ├─────────────────────────────────────────┐
                     │                                         │
        ┌────────────▼──────────────┐      ┌──────────────────▼──────┐
        │   PDFAnnotator Component  │      │  Question Palette Panel │
        │  - Handles marking UI     │      │  - Shows all questions  │
        │  - Manages annotations    │      │  - Displays skip status │
        │  - Tracks isSkipped flag  │      │  - Allows manual skip   │
        └────────────┬──────────────┘      └──────────────────┬──────┘
                     │                                        │
                     └────────────────┬─────────────────────┘
                                      │
                          ┌───────────▼──────────┐
                          │  Question Marks      │
                          │  State Object        │
                          │  {                   │
                          │    marksAwarded: 0,  │
                          │    isSkipped: true,  │
                          │    isAttempted: false│
                          │  }                   │
                          └───────────┬──────────┘
                                      │
                          ┌───────────▼──────────┐
                          │  API Payload         │
                          │  POST /question-marks│
                          │  [{                  │
                          │    questionId: 1,    │
                          │    isSkipped: true   │
                          │  }]                  │
                          └───────────┬──────────┘
                                      │
                          ┌───────────▼──────────┐
                          │  Backend Database    │
                          │  QuestionMark Table  │
                          │  IsSkipped: true     │
                          └──────────────────────┘
```

## Component State Management

### PDFAnnotator Component

#### New State Variable
```javascript
const [isSkipped, setIsSkipped] = useState(false);
```

#### State Flow
```
User checks "Mark as Skipped" checkbox
    ↓
setIsSkipped(true)
    ↓
Marks grid hidden, "Confirm Skip" button shown
    ↓
User clicks "Confirm Skip"
    ↓
submitMark() creates annotation with isSkipped: true
    ↓
onAnnotationsChange() called with updated annotations
    ↓
setIsSkipped(false) to reset for next question
```

### ExaminerMarking Page

#### Question Marks Object Structure
```javascript
questionMarks = {
  [questionId]: {
    marksAwarded: 0,
    isSkipped: true,        // NEW FIELD
    isAttempted: false,
    remarks: "",
    maxMarks: 5,
    questionNo: 1
  }
}
```

#### Calculation Logic
```javascript
// In calculateTotal()
Object.values(marks).forEach((mark) => {
  if (!mark.isSkipped) {  // Skip if marked as skipped
    total += mark.marksAwarded || 0;
  }
});
```

## Data Flow Diagram

### Marking a Question as Skipped

```
1. User Right-Clicks PDF
   └─> handleContextMenu() triggered
       └─> setPendingAnno() with question data
       └─> setShowMarkPopup(true)
       └─> setIsSkipped(false)

2. User Checks "Mark as Skipped"
   └─> setIsSkipped(true)
       └─> Marks grid hidden
       └─> "Confirm Skip" button shown

3. User Clicks "Confirm Skip"
   └─> finalAnno created with:
       {
         ...pendingAnno,
         marks: 0,
         isSkipped: true,
         type: 'cross',
         color: '#FF6B6B'
       }
   └─> annotations array updated
   └─> onAnnotationsChange() called

4. ExaminerMarking.handleAnnotationsChange()
   └─> Processes annotation with isSkipped: true
   └─> Updates questionMarks[questionId]:
       {
         isSkipped: true,
         marksAwarded: 0,
         isAttempted: false
       }
   └─> calculateTotal() excludes this question
   └─> Question palette updates with "Skipped" badge

5. User Clicks "Save"
   └─> buildQuestionMarksPayload() creates:
       [{
         questionId: 1,
         marksAwarded: 0,
         isSkipped: true,
         isAttempted: false
       }]
   └─> markingService.saveQuestionMarks() called
   └─> API POST /api/marking/{id}/question-marks
   └─> Backend saves to QuestionMark table
```

## Component Integration Points

### PDFAnnotator → ExaminerMarking
```javascript
// Props passed to PDFAnnotator
<PDFAnnotator 
  onAnnotationsChange={handleAnnotationsChange}  // Callback
  currentQuestionId={selectedQuestion}           // Current Q
  maxMarks={findQuestionById(selectedQuestion)?.marks}
  onNextQuestion={handleNextQuestion}            // Auto-advance
  sections={sections}                            // For section dropdown
/>

// Annotation object structure
{
  type: 'cross',
  x: 100,
  y: 200,
  color: '#FF6B6B',
  lineWidth: 2,
  questionId: 1,
  marks: 0,
  stepName: 'Section A',
  isSkipped: true,  // NEW FIELD
  id: 1234567890
}
```

### ExaminerMarking → API
```javascript
// Payload sent to backend
[
  {
    questionId: 1,
    questionNo: 1,
    marksAwarded: 0,
    isSkipped: true,      // NEW FIELD
    isAttempted: false,
    remarks: ""
  }
]

// API Endpoint
POST /api/marking/{markingId}/question-marks
```

## Backend Processing

### MarkingController.SaveQuestionMarks()
```csharp
foreach (var qm in questionMarks)
{
    var questionMark = new QuestionMark
    {
        MarkingId = markingId,
        QuestionId = qm.QuestionId,
        MarksAwarded = qm.MarksAwarded,
        IsSkipped = qm.IsSkipped,        // Saved to DB
        Remarks = qm.Remarks ?? "",
        IsAttempted = qm.IsAttempted
    };

    _context.QuestionMarks.Add(questionMark);
    
    // Only count non-skipped marks toward total
    if (!qm.IsSkipped)
        totalMarks += qm.MarksAwarded;
}
```

### MarkingController.GetMarkingDetails()
```csharp
questions = s.Questions.Select(q => new
{
    questionId = q.QuestionId,
    marksAwarded = marking.QuestionMarks
        .FirstOrDefault(qm => qm.QuestionId == q.QuestionId)?.MarksAwarded ?? 0,
    isSkipped = marking.QuestionMarks
        .FirstOrDefault(qm => qm.QuestionId == q.QuestionId)?.IsSkipped ?? false,
    isAttempted = marking.QuestionMarks
        .FirstOrDefault(qm => qm.QuestionId == q.QuestionId)?.IsAttempted ?? false
}).ToList()
```

## UI/UX Implementation

### Mark Entry Popup States

#### State 1: Normal (isSkipped = false)
```
┌─────────────────────────────────┐
│ Section: [Dropdown]             │
├─────────────────────────────────┤
│ ☐ Mark as Skipped               │
│   Question was not attempted    │
├─────────────────────────────────┤
│ [0] [0.5] [1] [1.5]             │
│ [2] [2.5] [3] [3.5]             │
│ [4] [4.5] [5] ...               │
├─────────────────────────────────┤
│ [Custom] [Submit] [Close]       │
└─────────────────────────────────┘
```

#### State 2: Skipped (isSkipped = true)
```
┌─────────────────────────────────┐
│ Section: [Dropdown]             │
├─────────────────────────────────┤
│ ☑ Mark as Skipped               │
│   Question was not attempted    │
├─────────────────────────────────┤
│ (Marks grid hidden)             │
├─────────────────────────────────┤
│ [Confirm Skip] [Close]          │
└─────────────────────────────────┘
```

### Conditional Rendering
```javascript
{!isSkipped && (
  <div className="p-3 max-h-48 overflow-y-auto">
    {/* Marks grid shown only when NOT skipped */}
  </div>
)}

{isSkipped ? (
  <button>Confirm Skip</button>
) : (
  <>
    <input type="number" />
    <button>Submit</button>
  </>
)}
```

## Color Scheme

| Element | Color | Hex | Usage |
|---------|-------|-----|-------|
| Skipped Mark | Orange-Red | #FF6B6B | Cross mark on PDF |
| Correct Mark | Green | #00AA00 | Tick mark on PDF |
| Wrong Mark | Red | #FF0000 | Cross mark on PDF |
| Skip Section BG | Light Orange | Orange-50 | Popup background |
| Skip Text | Dark Orange | Orange-900 | Checkbox label |

## Performance Considerations

1. **Annotation Rendering**: Skipped marks use same rendering pipeline as other marks
2. **State Updates**: isSkipped state is local to PDFAnnotator, minimal re-renders
3. **Calculation**: Total calculation is O(n) where n = number of questions
4. **API Payload**: No additional data beyond existing structure

## Error Handling

### Frontend
- Validates isSkipped flag before submission
- Ensures skipped questions have marksAwarded = 0
- Prevents conflicting states (skipped + marks > 0)

### Backend
- Validates isSkipped in QuestionMarkDto
- Excludes skipped questions from total calculation
- Returns isSkipped in marking details response

## Testing Scenarios

### Unit Tests
```javascript
// Test 1: Skipped question excluded from total
const marks = {
  1: { marksAwarded: 5, isSkipped: false },
  2: { marksAwarded: 0, isSkipped: true },
  3: { marksAwarded: 3, isSkipped: false }
};
// Expected total: 8 (not 8)

// Test 2: Annotation with isSkipped creates correct object
const anno = { marks: 0, isSkipped: true };
// Expected: type = 'cross', color = '#FF6B6B'

// Test 3: Payload includes isSkipped
const payload = buildQuestionMarksPayload();
// Expected: payload[1].isSkipped === true
```

### Integration Tests
```javascript
// Test 1: Mark question as skipped via UI
// 1. Right-click PDF
// 2. Check "Mark as Skipped"
// 3. Click "Confirm Skip"
// Expected: Orange-red cross appears, palette shows "Skipped"

// Test 2: Save and retrieve skipped status
// 1. Mark Q1 as skipped
// 2. Click Save
// 3. Fetch marking details
// Expected: isSkipped = true in response

// Test 3: Total calculation excludes skipped
// 1. Mark Q1 as skipped (5 marks)
// 2. Mark Q2 with 4 marks
// 3. Check total
// Expected: Total = 4 (not 9)
```

## Future Enhancements

1. **Bulk Skip**: Mark multiple questions as skipped at once
2. **Skip Reasons**: Add dropdown for skip reason (e.g., "Not attempted", "Illegible", "Out of scope")
3. **Skip Analytics**: Dashboard showing skip statistics per examiner/paper
4. **Undo Skip**: Quick button to undo skip and mark normally
5. **Skip Validation**: Warn if too many questions are skipped
