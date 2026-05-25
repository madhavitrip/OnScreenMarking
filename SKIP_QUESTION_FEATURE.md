# Skip Question Feature Implementation

## Overview
Added the ability for examiners to mark questions as **skipped** when awarding marks. This indicates that a question was not attempted by the student.

## Changes Made

### 1. **PDFAnnotator Component** (`UI\src\components\PDFAnnotator.jsx`)

#### New State
- Added `isSkipped` state to track whether a question is being marked as skipped

#### Updated Functions

**`submitMark()`**
- Now includes `isSkipped` flag in the annotation object
- When a question is skipped, the annotation type is set to `'cross'` with color `'#FF6B6B'` (orange-red)
- Resets `isSkipped` state after submission

**`handleContextMenu()` & `startDrawing()`**
- Reset `isSkipped` to `false` when opening the mark popup

#### Enhanced Mark Entry Popup
- **New Section**: "Mark as Skipped" checkbox with orange background
- **Conditional UI**: 
  - When skipped is checked: Shows "Confirm Skip" button instead of marks grid
  - When skipped is unchecked: Shows normal marks grid and custom input
- **Visual Feedback**: Orange-themed section to distinguish skip action from normal marking
- **Helper Text**: "Question was not attempted by student"

### 2. **ExaminerMarking Page** (`UI\src\pages\ExaminerMarking.jsx`)

#### Updated `handleAnnotationsChange()` Function
- Now processes the `isSkipped` flag from annotations
- When a question is marked as skipped:
  - Sets `isSkipped: true` in the question marks object
  - Sets `marksAwarded: 0`
  - Sets `isAttempted: false`
- Properly syncs skipped status back to the question palette

### 3. **Backend Support** (Already Implemented)
- The `QuestionMark` model already has the `IsSkipped` field
- The `MarkingController` already handles `IsSkipped` in:
  - `SaveQuestionMarks()` - Saves skip status
  - `GetMarkingDetails()` - Returns skip status in response
- The `QuestionMarkDto` already includes `IsSkipped` property

## User Workflow

### Marking a Question as Skipped

1. **Right-click** on the PDF or use the **Tick/Cross tool** to open the mark popup
2. **Check** the "Mark as Skipped" checkbox
3. **Click** "Confirm Skip" button
4. The question is marked with an orange-red cross (✗) indicating it was skipped
5. The examiner automatically advances to the next question

### Visual Indicators

- **Skipped Questions**: Orange-red cross (✗) with color `#FF6B6B`
- **Question Palette**: Shows "Skipped" badge in red for skipped questions
- **Total Score**: Skipped questions are excluded from the total marks calculation

## Data Flow

```
Examiner marks question as skipped
    ↓
PDFAnnotator creates annotation with isSkipped: true
    ↓
ExaminerMarking.handleAnnotationsChange() processes it
    ↓
Question palette updates with isSkipped flag
    ↓
buildQuestionMarksPayload() includes isSkipped in payload
    ↓
API saves to QuestionMark.IsSkipped field
    ↓
Marking details reflect skipped status
```

## API Integration

When saving marks, the payload includes:
```json
{
  "questionId": 1,
  "questionNo": 1,
  "marksAwarded": 0,
  "isSkipped": true,
  "isAttempted": false,
  "remarks": ""
}
```

The backend endpoint `/api/marking/{markingId}/question-marks` (POST) already handles this and:
- Excludes skipped questions from total marks calculation
- Stores the skip status in the database
- Returns it in marking details

## Testing Checklist

- [ ] Right-click on PDF to open mark popup
- [ ] Check "Mark as Skipped" checkbox
- [ ] Verify marks grid disappears
- [ ] Click "Confirm Skip" button
- [ ] Verify orange-red cross appears on PDF
- [ ] Verify question palette shows "Skipped" badge
- [ ] Verify total score excludes skipped question
- [ ] Save marks and verify skip status is persisted
- [ ] Submit marking and verify skip status is included
- [ ] Fetch marking details and verify isSkipped field is true

## Notes

- Skipped questions contribute **0 marks** to the total
- The `isAttempted` flag is set to `false` for skipped questions
- Examiners can still manually mark a question as skipped using the question palette's skip button
- The feature integrates seamlessly with the existing marking workflow
