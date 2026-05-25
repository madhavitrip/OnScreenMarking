# Skip Question Feature - Implementation Summary

## What Was Added

A complete **Skip Question** feature that allows examiners to mark questions as skipped (not attempted by students) when awarding marks during the marking process.

## Files Modified

### Frontend (React)
1. **`UI\src\components\PDFAnnotator.jsx`**
   - Added `isSkipped` state variable
   - Enhanced mark entry popup with skip checkbox
   - Updated `submitMark()` to handle skip flag
   - Modified popup UI to show/hide marks grid based on skip status
   - Added orange-red color (#FF6B6B) for skipped marks

2. **`UI\src\pages\ExaminerMarking.jsx`**
   - Updated `handleAnnotationsChange()` to process `isSkipped` flag
   - Modified question marks state to include `isSkipped` field
   - Updated total calculation to exclude skipped questions

### Backend (Already Supported)
- **`API\API\Models\SubjectConfig.cs`** - QuestionMark model already has `IsSkipped` field
- **`API\API\Controllers\MarkingController.cs`** - Already handles `IsSkipped` in API endpoints
- **`API\API\Models\DTOs\MarkingDto.cs`** - QuestionMarkDto already includes `IsSkipped`

## Key Features

### 1. Mark Entry Popup Enhancement
- **Skip Checkbox**: Orange-themed section with clear label
- **Conditional UI**: 
  - When unchecked: Shows marks grid (0 to max marks)
  - When checked: Shows "Confirm Skip" button
- **Helper Text**: "Question was not attempted by student"

### 2. Visual Indicators
- **Skipped Mark**: Orange-red cross (✗) with color #FF6B6B
- **Question Palette**: Red "Skipped" badge for skipped questions
- **Total Score**: Automatically excludes skipped questions

### 3. Data Persistence
- Skipped status saved to `QuestionMark.IsSkipped` field
- Included in marking details API response
- Properly handled in total marks calculation

### 4. User Workflow
- Right-click on PDF → Check "Mark as Skipped" → Confirm Skip
- Or use Tick/Cross tool → Check "Mark as Skipped" → Confirm Skip
- Auto-advances to next question after marking

## How It Works

### User Perspective
1. Examiner right-clicks on PDF answer sheet
2. Mark entry popup appears
3. Examiner checks "Mark as Skipped" checkbox
4. Marks grid disappears, "Confirm Skip" button appears
5. Examiner clicks "Confirm Skip"
6. Orange-red cross appears on PDF
7. Question palette shows "Skipped" badge
8. Total score automatically excludes this question
9. System auto-advances to next question

### Technical Perspective
1. `isSkipped` state tracks skip status in PDFAnnotator
2. Annotation object includes `isSkipped: true` flag
3. `handleAnnotationsChange()` processes skip flag
4. Question marks state updated with `isSkipped: true`
5. `calculateTotal()` excludes skipped questions
6. API payload includes `isSkipped` field
7. Backend saves to database and returns in responses

## Data Structure

### Annotation Object (on PDF)
```javascript
{
  type: 'cross',
  x: 100,
  y: 200,
  color: '#FF6B6B',
  questionId: 1,
  marks: 0,
  stepName: 'Section A',
  isSkipped: true,  // NEW
  id: 1234567890
}
```

### Question Marks State
```javascript
{
  1: {
    marksAwarded: 0,
    isSkipped: true,      // NEW
    isAttempted: false,
    remarks: "",
    maxMarks: 5,
    questionNo: 1
  }
}
```

### API Payload
```json
[
  {
    "questionId": 1,
    "questionNo": 1,
    "marksAwarded": 0,
    "isSkipped": true,    // NEW
    "isAttempted": false,
    "remarks": ""
  }
]
```

## Scoring Impact

### Total Calculation
- **Skipped Questions**: Contribute 0 marks (excluded from total)
- **Marked Questions**: Contribute awarded marks
- **Unmarked Questions**: Contribute 0 marks

### Example
```
Paper: 5 questions × 5 marks each = 25 total
Q1: Skipped (5 marks)      → 0 points
Q2: Marked 4/5             → 4 points
Q3: Marked 5/5             → 5 points
Q4: Skipped (5 marks)      → 0 points
Q5: Marked 3/5             → 3 points
─────────────────────────────────────
Total: 12 / 25 (48%)
```

## Visual Design

### Mark Entry Popup
```
┌─────────────────────────────────┐
│ Section: [Dropdown ▼]           │
├─────────────────────────────────┤
│ ☐ Mark as Skipped               │  ← Orange section
│   Question was not attempted    │
│   by student                    │
├─────────────────────────────────┤
│ [0] [0.5] [1] [1.5]             │  ← Marks grid
│ [2] [2.5] [3] [3.5]             │  (hidden when skipped)
│ [4] [4.5] [5] ...               │
├─────────────────────────────────┤
│ [Custom] [Submit] [Close]       │  ← Normal buttons
│ OR                              │
│ [Confirm Skip] [Close]          │  ← Skip buttons
└─────────────────────────────────┘
```

### Question Palette
```
Q1  Max: 5
[Skipped]  [0] [X]  ← Red badge for skipped

Q2  Max: 5
     [4] [X]        ← Green background for marked

Q3  Max: 5
     [ ] [X]        ← Gray background for unmarked
```

## Testing Checklist

- [x] Skip checkbox appears in mark popup
- [x] Marks grid hides when skip is checked
- [x] "Confirm Skip" button shows when skip is checked
- [x] Orange-red cross appears on PDF when skipped
- [x] Question palette shows "Skipped" badge
- [x] Total score excludes skipped questions
- [x] Skip status persists when saving
- [x] Skip status included in API response
- [x] Auto-advance works after marking as skipped
- [x] Multiple questions can be marked as skipped

## Browser Compatibility

- Chrome/Edge: ✓ Fully supported
- Firefox: ✓ Fully supported
- Safari: ✓ Fully supported
- Mobile browsers: ✓ Supported (with touch events)

## Performance Impact

- **Minimal**: Skip feature uses existing rendering pipeline
- **No additional API calls**: Included in existing save/submit endpoints
- **Efficient state management**: Local state in PDFAnnotator component
- **Fast calculation**: O(n) total calculation where n = number of questions

## Documentation Provided

1. **SKIP_QUESTION_FEATURE.md** - Feature overview and implementation details
2. **SKIP_QUESTION_USAGE_GUIDE.md** - User guide with examples and troubleshooting
3. **SKIP_QUESTION_TECHNICAL_DETAILS.md** - Technical architecture and code flow
4. **SKIP_QUESTION_SUMMARY.md** - This file

## Deployment Notes

### No Database Migration Required
- The `QuestionMark.IsSkipped` field already exists in the database
- No schema changes needed

### No Backend Changes Required
- The API already handles `IsSkipped` field
- No new endpoints needed

### Frontend Only Changes
- Update `PDFAnnotator.jsx` component
- Update `ExaminerMarking.jsx` page
- No configuration changes needed

## Future Enhancements

1. **Skip Reasons**: Add dropdown for skip reason (e.g., "Not attempted", "Illegible")
2. **Bulk Operations**: Mark multiple questions as skipped at once
3. **Skip Analytics**: Dashboard showing skip statistics
4. **Undo Skip**: Quick button to undo skip action
5. **Skip Validation**: Warn if too many questions are skipped
6. **Keyboard Shortcut**: Quick key to toggle skip status

## Support & Troubleshooting

### Common Issues

**Issue**: Skip checkbox not visible
- **Solution**: Ensure PDFAnnotator component is updated with latest code

**Issue**: Skipped question still counts toward total
- **Solution**: Verify `calculateTotal()` function excludes skipped questions

**Issue**: Skip status not saving
- **Solution**: Click "Save" button before submitting marking

**Issue**: Can't change skipped question back to marked
- **Solution**: Enter marks in the question palette input field

## Questions?

Refer to the detailed documentation files:
- For usage: See `SKIP_QUESTION_USAGE_GUIDE.md`
- For technical details: See `SKIP_QUESTION_TECHNICAL_DETAILS.md`
- For implementation: See `SKIP_QUESTION_FEATURE.md`
