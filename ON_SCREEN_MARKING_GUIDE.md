# On-Screen Marking (OSM) Interface - Complete Guide

## Overview
A comprehensive on-screen marking system that allows examiners to:
- View scanned answer sheets (PDF)
- Annotate directly on the PDF (draw, write, mark)
- Link annotations to specific questions
- Enter marks for each question
- Track scores in real-time

## Features

### 1. PDF Annotation Tools

#### Drawing Tools
- **Pen**: Freehand drawing for marking answers
- **Text**: Add text annotations directly on the sheet
- **Circle**: Mark correct answers with circles
- **Square**: Highlight sections with squares
- **Eraser**: Remove annotations

#### Quick Marks
- **✓ Correct** (Green circle)
- **✗ Wrong** (Red pen)
- **⚠ Partial** (Orange circle)

#### Customization
- **Color Picker**: Choose any color for annotations
- **Line Width**: Adjust thickness (1-10px)
- **Copy Text**: Select and copy text from the answer sheet

### 2. Marking Interface

#### Question Management
- View all questions organized by sections
- Enter marks for each question
- Skip unattempted questions
- Link annotations to questions

#### Real-time Tracking
- Total marks calculation
- Percentage display
- Section-wise breakdown
- Progress bar

#### Remarks
- Add overall examiner remarks
- Save marks as draft
- Submit final marks

## Workflow

### Step 1: View Answer Sheet
```
1. Open the On-Screen Marking Interface
2. Scanned PDF appears on the left side
3. Use Previous/Next buttons to navigate pages
```

### Step 2: Annotate the Sheet
```
1. Select annotation tool (Pen, Text, Circle, etc.)
2. Choose color and line width
3. Draw/write on the PDF
4. Annotations are saved automatically
```

### Step 3: Mark Questions
```
1. View questions on the right panel
2. Enter marks for each question
3. Marks update total automatically
4. Skip unattempted questions
```

### Step 4: Link Annotations
```
1. Click "Link Annotation" on a question
2. Select the annotation from the PDF
3. Annotation is linked to that question
4. Visual indicator shows linked status
```

### Step 5: Review & Submit
```
1. Review score summary
2. Check section-wise breakdown
3. Add remarks if needed
4. Click "Save Marks" (draft)
5. Click "Submit Marks" (final)
```

## UI Layout

```
┌─────────────────────────────────────────────────────────────────┐
│                    ON-SCREEN MARKING INTERFACE                  │
│  Script: OSM-2024-001 | Examiner: Dr. Rajesh Kumar | Status: Draft
└─────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────┬──────────────────────────┐
│                                      │                          │
│  ┌────────────────────────────────┐  │  ┌──────────────────────┐│
│  │   PDF ANNOTATION TOOLBAR       │  │  │  SCORE SUMMARY       ││
│  │ [Pen] [Text] [Circle] [Square] │  │  │  Total: 45/100 (45%) ││
│  │ Color: [■] Width: [━━━━] 2px   │  │  └──────────────────────┘│
│  │ [Copy] [Clear]                 │  │                          │
│  │ Quick: [✓] [✗] [⚠]            │  │  ┌──────────────────────┐│
│  └────────────────────────────────┘  │  │  QUESTIONS           ││
│                                      │  │  ▼ Section A         ││
│  ┌────────────────────────────────┐  │  │  Q1 [2] [Link] [Skip]││
│  │                                │  │  │  Q2 [1] [Link] [Skip]││
│  │   SCANNED ANSWER SHEET         │  │  │  Q3 [0] [Link] [Skip]││
│  │                                │  │  │  Q4 [2] [Link] [Skip]││
│  │   (PDF with annotations)       │  │  │  Q5 [0] [Link] [Skip]││
│  │                                │  │  │  ▼ Section B         ││
│  │   ✓ Q1 marked correct          │  │  │  Q6 [5] [Link] [Skip]││
│  │   ✗ Q2 marked wrong            │  │  │  Q7 [3] [Link] [Skip]││
│  │   ⚠ Q3 partial credit          │  │  │  Q8 [0] [Link] [Skip]││
│  │   "2 marks" written on Q4      │  │  │  Q9 [0] [Link] [Skip]││
│  │                                │  │  │  ▼ Section C         ││
│  │                                │  │  │  Q10 [10] [Link] [Skip]
│  │                                │  │  │  Q11 [7] [Link] [Skip]
│  │                                │  │  └──────────────────────┘│
│  │                                │  │                          │
│  │  [Previous] Page 1/5 [Next]    │  │  ┌──────────────────────┐│
│  │                                │  │  │ SECTION BREAKDOWN    ││
│  │  Annotations (4)               │  │  │ Section A: 5/10      ││
│  │  • Page 1 - Pen                │  │  │ Section B: 8/20      ││
│  │  • Page 1 - Text: "2 marks"    │  │  │ Section C: 17/20     ││
│  │  • Page 2 - Circle             │  │  └──────────────────────┘│
│  │  • Page 3 - Pen                │  │                          │
│  │                                │  │  ┌──────────────────────┐│
│  └────────────────────────────────┘  │  │ REMARKS              ││
│                                      │  │ [Text area]          ││
│                                      │  │                      ││
│                                      │  │ [Save Marks]         ││
│                                      │  │ [Submit Marks]       ││
│                                      │  │ [Reset]              ││
│                                      │  └──────────────────────┘│
│                                      │                          │
└──────────────────────────────────────┴──────────────────────────┘
```

## Annotation Types

### Pen (Freehand Drawing)
- Use for marking answers
- Can write marks directly
- Supports any color

### Text
- Add typed text annotations
- Specify position on sheet
- Useful for explanations

### Circle
- Mark correct answers
- Highlight important sections
- Quick visual feedback

### Square
- Highlight sections
- Mark areas for review
- Organize annotations

### Eraser
- Remove unwanted annotations
- Clean up mistakes
- Precise erasing

## Linking Annotations to Questions

### Process
1. Examiner annotates the PDF (e.g., marks Q1 with a circle)
2. Examiner clicks "Link Annotation" on Q1 in the questions panel
3. Modal shows all available annotations
4. Examiner selects the annotation that corresponds to Q1
5. System links the annotation to Q1
6. Visual indicator shows "Linked" status

### Benefits
- Traceability: Know which annotation corresponds to which question
- Audit Trail: Track marking decisions
- Review: Easy to review marking rationale
- Consistency: Ensure all questions are properly marked

## Marking Workflow Example

### Scenario: Marking a 100-mark paper

```
1. SECTION A (20 marks, 5 questions × 2 marks each)
   - Q1: Correct → Circle with green pen → Mark: 2
   - Q2: Partial → Circle with orange pen → Mark: 1
   - Q3: Wrong → Cross with red pen → Mark: 0
   - Q4: Correct → Circle with green pen → Mark: 2
   - Q5: Skipped → Mark as skip → Mark: 0
   Section A Total: 5/10

2. SECTION B (40 marks, 4 questions × 5 marks each)
   - Q6: Excellent → Write "5" on sheet → Mark: 5
   - Q7: Good → Write "3" on sheet → Mark: 3
   - Q8: Incomplete → Write "2" on sheet → Mark: 2
   - Q9: Blank → Mark as skip → Mark: 0
   Section B Total: 10/20

3. SECTION C (40 marks, 2 questions × 10 marks each)
   - Q10: Comprehensive → Write "10" on sheet → Mark: 10
   - Q11: Good but incomplete → Write "7" on sheet → Mark: 7
   Section C Total: 17/20

4. FINAL TOTALS
   Total Obtained: 32/100 (32%)
   Add Remarks: "Student has basic understanding but lacks depth"
   Save Marks (Draft)
   Submit Marks (Final)
```

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| P | Pen tool |
| T | Text tool |
| C | Circle tool |
| S | Square tool |
| E | Eraser tool |
| Ctrl+Z | Undo (if supported) |
| Ctrl+C | Copy selected text |
| Delete | Clear all annotations |

## Tips & Best Practices

### Annotation Tips
1. Use consistent colors for similar marks
2. Write marks clearly and legibly
3. Use circles for correct answers
4. Use crosses for wrong answers
5. Use different colors for different feedback types

### Marking Tips
1. Mark questions in order
2. Link annotations as you mark
3. Save marks frequently
4. Review before submitting
5. Add remarks for clarity

### Performance Tips
1. Zoom in for detailed marking
2. Use keyboard shortcuts
3. Link annotations immediately after marking
4. Save marks every 5-10 questions
5. Use quick mark buttons for speed

## Supported File Formats

- **PDF**: Primary format for answer sheets
- **Image**: JPG, PNG (converted to PDF)
- **Multi-page**: Full support for multi-page documents

## Browser Compatibility

- Chrome/Chromium: ✓ Full support
- Firefox: ✓ Full support
- Safari: ✓ Full support
- Edge: ✓ Full support

## Accessibility Features

- ✓ Keyboard navigation
- ✓ Screen reader support
- ✓ High contrast mode
- ✓ Adjustable text size
- ✓ Color-blind friendly options

## Data Storage

### Annotations Stored
- Drawing coordinates
- Text content
- Color information
- Tool type
- Page number
- Timestamp

### Marks Stored
- Question ID
- Marks awarded
- Skip status
- Remarks
- Linked annotation reference
- Timestamp

## API Integration

### Save Annotations
```
POST /api/marking/{markingId}/annotations
{
  "annotations": [
    {
      "page": 1,
      "tool": "pen",
      "color": "#FF0000",
      "coordinates": [...],
      "timestamp": "2024-05-22T10:30:00Z"
    }
  ]
}
```

### Link Annotation to Question
```
POST /api/marking/{markingId}/link-annotation
{
  "questionId": 1,
  "annotationIndex": 0
}
```

### Save Marks with Annotations
```
POST /api/marking/{markingId}/question-marks
{
  "marks": [
    {
      "questionId": 1,
      "marksAwarded": 2,
      "linkedAnnotationIndex": 0,
      "remarks": "Correct answer"
    }
  ]
}
```

## Troubleshooting

### PDF Not Loading
- Check file format (must be PDF)
- Verify file size (max 50MB)
- Check internet connection
- Try refreshing the page

### Annotations Not Saving
- Check browser storage quota
- Clear browser cache
- Try different browser
- Check file permissions

### Marks Not Calculating
- Refresh the page
- Check for JavaScript errors
- Verify question data
- Try resetting marks

## Performance Metrics

- PDF Load Time: < 2 seconds
- Annotation Response: < 100ms
- Mark Calculation: < 50ms
- Save Operation: < 1 second
- Submit Operation: < 2 seconds

## Security Considerations

- ✓ All data encrypted in transit (HTTPS)
- ✓ Authentication required
- ✓ Authorization checks on all operations
- ✓ Audit logging of all actions
- ✓ No data stored locally without encryption

## Future Enhancements

- [ ] Handwriting recognition
- [ ] Automatic mark calculation from annotations
- [ ] Collaborative marking
- [ ] Voice annotations
- [ ] Rubric-based marking
- [ ] Plagiarism detection
- [ ] Re-evaluation workflow
- [ ] Analytics dashboard
