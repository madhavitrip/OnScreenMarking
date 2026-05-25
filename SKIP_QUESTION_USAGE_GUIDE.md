# Skip Question Feature - Usage Guide

## Quick Start

### How to Mark a Question as Skipped

#### Method 1: Right-Click on PDF
1. **Right-click** anywhere on the PDF answer sheet
2. The mark entry popup will appear
3. **Check** the "Mark as Skipped" checkbox
4. **Click** "Confirm Skip" button
5. An orange-red cross (✗) will appear on the PDF

#### Method 2: Using Tick/Cross Tool
1. Click the **Tick (✓)** or **Cross (✗)** button in the toolbar
2. Click on the PDF where you want to place the mark
3. The mark entry popup will appear
4. **Check** the "Mark as Skipped" checkbox
5. **Click** "Confirm Skip" button

### Mark Entry Popup Layout

```
┌─────────────────────────────────┐
│ Section: [Dropdown ▼]           │  ← Select section
├─────────────────────────────────┤
│ ☐ Mark as Skipped               │  ← Check to skip
│   Question was not attempted    │
│   by student                    │
├─────────────────────────────────┤
│ [0] [0.5] [1] [1.5]             │  ← Marks grid
│ [2] [2.5] [3] [3.5]             │  (hidden when skipped)
│ [4] [4.5] [5] ...               │
├─────────────────────────────────┤
│ [Custom] [Submit] [Close]       │  ← When NOT skipped
│ OR                              │
│ [Confirm Skip] [Close]          │  ← When skipped
└─────────────────────────────────┘
```

## Visual Indicators

### On PDF Canvas
- **Normal Mark**: Green tick (✓) or red cross (✗)
- **Skipped Mark**: Orange-red cross (✗) with color `#FF6B6B`

### In Question Palette (Right Panel)
- **Skipped Question**: Shows red "Skipped" badge
- **Marked Question**: Shows green background with marks
- **Unmarked Question**: Shows gray background

### Example Question Palette Entry
```
┌─────────────────────────────────┐
│ Q1  Max: 5                      │
│ [Skipped]  [0] [X]              │  ← Skipped badge
├─────────────────────────────────┤
│ Q2  Max: 5                      │
│      [5] [X]                    │  ← Marked with 5
├─────────────────────────────────┤
│ Q3  Max: 5                      │
│      [ ] [X]                    │  ← Unmarked
└─────────────────────────────────┘
```

## Scoring Impact

### Total Score Calculation
- **Skipped Questions**: Contribute **0 marks** to total
- **Marked Questions**: Contribute awarded marks to total
- **Unmarked Questions**: Contribute **0 marks** to total

### Example
```
Paper Max Marks: 100
Q1: 5 marks (Skipped)     → 0 points
Q2: 5 marks (Marked: 4)   → 4 points
Q3: 5 marks (Marked: 5)   → 5 points
Q4: 5 marks (Unmarked)    → 0 points
...
Total Obtained: 9 / 100
```

## Workflow Example

### Scenario: Marking a 5-Question Paper

1. **Question 1** (5 marks)
   - Student didn't attempt
   - Right-click → Check "Mark as Skipped" → Confirm Skip
   - Result: Orange-red cross, 0 marks

2. **Question 2** (5 marks)
   - Student attempted, got 4 marks
   - Right-click → Select marks grid → Click "4" → Auto-advance
   - Result: Green tick with "4" label

3. **Question 3** (5 marks)
   - Student attempted, got 5 marks
   - Right-click → Select marks grid → Click "5" → Auto-advance
   - Result: Green tick with "5" label

4. **Question 4** (5 marks)
   - Student didn't attempt
   - Right-click → Check "Mark as Skipped" → Confirm Skip
   - Result: Orange-red cross, 0 marks

5. **Question 5** (5 marks)
   - Student attempted, got 3 marks
   - Right-click → Select marks grid → Click "3" → Auto-advance
   - Result: Green tick with "3" label

### Final Result
- Total Score: 12 / 25 (48%)
- Skipped: 2 questions
- Attempted: 3 questions

## Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Right-click mark | Right Mouse Button |
| Submit mark | Enter (when custom input focused) |
| Close popup | Esc (if implemented) |

## Tips & Best Practices

1. **Use Skip for Unattempted Questions**: Only mark as skipped if the student didn't attempt the question
2. **Distinguish from Zero Marks**: 
   - Skipped = Not attempted (orange-red cross)
   - Zero Marks = Attempted but incorrect (red cross)
3. **Review Before Submitting**: Check the question palette to verify all skipped questions are marked correctly
4. **Save Frequently**: Click "Save" button to persist marks before final submission
5. **Auto-Advance**: After marking, the system automatically moves to the next question

## Troubleshooting

### Issue: Can't see "Mark as Skipped" checkbox
- **Solution**: Make sure you're using the latest version of the PDFAnnotator component

### Issue: Skipped question still counts toward total
- **Solution**: Ensure you clicked "Confirm Skip" and the orange-red cross appears on the PDF

### Issue: Marks not saving
- **Solution**: Click the "Save" button in the control center before submitting

### Issue: Need to change a skipped question back to marked
- **Solution**: 
  1. Click on the question in the palette
  2. Enter the marks in the input field
  3. The skip flag will be automatically cleared

## Data Persistence

When you click **Save** or **Submit**:
- All skipped questions are stored with `isSkipped: true`
- Skipped questions have `marksAwarded: 0`
- Skipped questions have `isAttempted: false`
- This data is saved in the `QuestionMark` table in the database

## API Response Example

When fetching marking details, skipped questions appear as:
```json
{
  "questionId": 1,
  "questionNo": 1,
  "marks": 5,
  "marksAwarded": 0,
  "isSkipped": true,
  "isAttempted": false,
  "remarks": ""
}
```
