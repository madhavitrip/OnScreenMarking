# Skip Question Feature - Visual Reference Guide

## Mark Entry Popup - Visual States

### State 1: Initial (No Skip)
```
┌─────────────────────────────────────────┐
│ Section: [Section A ▼]                  │
├─────────────────────────────────────────┤
│ ☐ Mark as Skipped                       │
│   Question was not attempted by student │
├─────────────────────────────────────────┤
│ [0]   [0.5] [1]   [1.5]                 │
│ [2]   [2.5] [3]   [3.5]                 │
│ [4]   [4.5] [5]   [5.5]                 │
│ [6]   [6.5] [7]   [7.5]                 │
│ [8]   [8.5] [9]   [9.5]                 │
│ [10]                                    │
├─────────────────────────────────────────┤
│ [Custom Input] [Submit] [Close]         │
└─────────────────────────────────────────┘
```

### State 2: Skip Checked
```
┌─────────────────────────────────────────┐
│ Section: [Section A ▼]                  │
├─────────────────────────────────────────┤
│ ☑ Mark as Skipped                       │  ← Orange background
│   Question was not attempted by student │
├─────────────────────────────────────────┤
│ (Marks grid hidden)                     │
├─────────────────────────────────────────┤
│ [Confirm Skip] [Close]                  │
└─────────────────────────────────────────┘
```

## Question Palette - Visual States

### Unmarked Question
```
┌─────────────────────────────────────────┐
│ Q1  Max: 5                              │
│      [ ] [X]                            │
└─────────────────────────────────────────┘
```

### Marked Question
```
┌─────────────────────────────────────────┐
│ Q2  Max: 5                              │
│      [4] [X]                            │  ← Green background
└─────────────────────────────────────────┘
```

### Skipped Question
```
┌─────────────────────────────────────────┐
│ Q3  Max: 5                              │
│ [Skipped]  [0] [X]                      │  ← Red badge
└─────────────────────────────────────────┘
```

## PDF Canvas - Visual Indicators

### Normal Marks
```
┌─────────────────────────────────────────┐
│                                         │
│  ✓ (1) Q01 | Section A                  │  ← Green tick
│                                         │
│  ✗ (0) Q02 | Section A                  │  ← Red cross
│                                         │
└─────────────────────────────────────────┘
```

### Skipped Mark
```
┌─────────────────────────────────────────┐
│                                         │
│  ✗ (0) Q03 | Section A                  │  ← Orange-red cross
│  (Skipped)                              │
│                                         │
└─────────────────────────────────────────┘
```

## Color Palette

### Skip Feature Colors
```
Skip Checkbox:
  ☐ Unchecked: Gray border
  ☑ Checked: Orange-600 (#FF6B6B)

Skip Section Background:
  Color: Orange-50 (Light orange)
  RGB: rgb(255, 247, 237)

Skip Text:
  Label: Orange-900 (Dark orange)
  Helper: Orange-700 (Medium orange)

Skipped Mark on PDF:
  Color: Orange-Red (#FF6B6B)
  RGB: rgb(255, 107, 107)

Skipped Badge:
  Background: Red-100
  Text: Red-700
  Border: Red-300
```

### Existing Colors (Reference)
```
Correct Mark:
  Color: Green (#00AA00)
  RGB: rgb(0, 170, 0)

Wrong Mark:
  Color: Red (#FF0000)
  RGB: rgb(255, 0, 0)

Selected Question:
  Background: Blue-50
  Border: Blue-500
  Ring: Blue-100

Marked Question:
  Background: Green-50
  Border: Green-300
  Text: Green-700
```

## UI Component Hierarchy

```
ExaminerMarking Page
├── Header
│   ├── Title
│   ├── Paper Info
│   └── Total Score Display
├── Main Layout (Grid)
│   ├── Left Column (9/12)
│   │   └── PDFAnnotator Component
│   │       ├── Toolbar
│   │       │   ├── Upload Section
│   │       │   ├── Tools (Move, Pen, Text, Tick, Cross, Circle, Square)
│   │       │   ├── History (Undo)
│   │       │   ├── Color & Size
│   │       │   ├── Zoom
│   │       │   ├── Actions (Copy, Clear)
│   │       │   └── Quick Marks (Correct, Wrong)
│   │       ├── Canvas Area
│   │       │   └── PDF/Image Display
│   │       └── PDF Navigation (if multi-page)
│   │
│   └── Right Column (3/12)
│       ├── Control Center
│       │   ├── Save Button
│       │   └── Reset Button
│       ├── Question Palette
│       │   ├── Section Headers (Collapsible)
│       │   └── Question Items
│       │       ├── Question Number
│       │       ├── Max Marks
│       │       ├── Marks Input
│       │       ├── Skip Button
│       │       └── Skipped Badge (if skipped)
│       └── Remarks Section
│           └── Textarea
│
└── Status Toast (Bottom Right)
    ├── Success Message
    └── Error Message

Mark Entry Popup (Modal)
├── Section Selector
├── Skip Checkbox Section
│   ├── Checkbox
│   ├── Label
│   └── Helper Text
├── Marks Grid (Conditional)
│   └── Mark Buttons
├── Action Buttons
│   ├── Submit / Confirm Skip
│   └── Close
```

## Workflow Diagram

```
START
  │
  ├─→ Right-click on PDF
  │   └─→ Mark Entry Popup Opens
  │       ├─→ User checks "Mark as Skipped"
  │       │   └─→ Marks grid hidden
  │       │   └─→ "Confirm Skip" button shown
  │       │
  │       └─→ User clicks "Confirm Skip"
  │           └─→ Annotation created with isSkipped: true
  │           └─→ Orange-red cross appears on PDF
  │           └─→ Question palette updated with "Skipped" badge
  │           └─→ Total score recalculated (excludes skipped)
  │           └─→ Auto-advance to next question
  │
  ├─→ Continue marking other questions
  │
  ├─→ Click "Save"
  │   └─→ API saves skip status to database
  │
  ├─→ Click "Submit"
  │   └─→ Marking submitted with skip status
  │
  └─→ END
```

## State Transition Diagram

```
┌─────────────────────────────────────────────────────────┐
│                  PDFAnnotator State                     │
└─────────────────────────────────────────────────────────┘

isSkipped: false (Initial)
    │
    ├─→ User checks checkbox
    │   └─→ isSkipped: true
    │       ├─→ Marks grid hidden
    │       ├─→ "Confirm Skip" button shown
    │       │
    │       └─→ User clicks "Confirm Skip"
    │           └─→ Annotation created
    │           └─→ isSkipped: false (reset)
    │           └─→ Popup closes
    │
    └─→ User unchecks checkbox
        └─→ isSkipped: false
            └─→ Marks grid shown
            └─→ "Submit" button shown
```

## Data Flow Diagram

```
User Action
    │
    ├─→ Right-click PDF
    │   └─→ handleContextMenu()
    │       └─→ setPendingAnno()
    │       └─→ setShowMarkPopup(true)
    │       └─→ setIsSkipped(false)
    │
    ├─→ Check "Mark as Skipped"
    │   └─→ setIsSkipped(true)
    │
    ├─→ Click "Confirm Skip"
    │   └─→ submitMark()
    │       └─→ Create annotation with isSkipped: true
    │       └─→ setAnnotations([...annotations, finalAnno])
    │       └─→ onAnnotationsChange(annotations)
    │
    └─→ ExaminerMarking.handleAnnotationsChange()
        └─→ Process annotation with isSkipped: true
        └─→ Update questionMarks[questionId]:
        │   ├─→ isSkipped: true
        │   ├─→ marksAwarded: 0
        │   └─→ isAttempted: false
        │
        └─→ calculateTotal()
            └─→ Exclude skipped questions
            └─→ Update totalObtained
```

## Responsive Design

### Desktop (1920px+)
```
┌─────────────────────────────────────────────────────────┐
│ Header (Full Width)                                     │
├──────────────────────────────┬──────────────────────────┤
│ PDFAnnotator (9/12)          │ Right Panel (3/12)       │
│                              │ ├─ Control Center       │
│                              │ ├─ Question Palette     │
│                              │ └─ Remarks              │
└──────────────────────────────┴──────────────────────────┘
```

### Tablet (768px - 1024px)
```
┌─────────────────────────────────────────────────────────┐
│ Header (Full Width)                                     │
├──────────────────────────────┬──────────────────────────┤
│ PDFAnnotator (6/12)          │ Right Panel (6/12)       │
│                              │ (Scrollable)             │
└──────────────────────────────┴──────────────────────────┘
```

### Mobile (< 768px)
```
┌─────────────────────────────────────────────────────────┐
│ Header (Full Width)                                     │
├─────────────────────────────────────────────────────────┤
│ PDFAnnotator (Full Width)                               │
├─────────────────────────────────────────────────────────┤
│ Right Panel (Full Width, Scrollable)                    │
└─────────────────────────────────────────────────────────┘
```

## Accessibility Features

### Keyboard Navigation
```
Tab: Navigate through form elements
Enter: Submit form / Confirm action
Escape: Close popup (if implemented)
Space: Toggle checkbox
```

### Screen Reader Support
```
Checkbox: "Mark as Skipped, checkbox, unchecked"
Helper Text: "Question was not attempted by student"
Buttons: "Confirm Skip button", "Close button"
Badges: "Skipped badge, red"
```

### Color Contrast
```
Orange-900 on Orange-50: ✓ WCAG AA compliant
Orange-700 on Orange-50: ✓ WCAG AA compliant
Red-700 on Red-100: ✓ WCAG AA compliant
```

## Animation & Transitions

### Popup Appearance
```
Animation: zoom-in
Duration: 150ms
Easing: ease-out
```

### Button Hover
```
Transition: background-color
Duration: 150ms
Easing: ease-in-out
```

### Badge Appearance
```
Animation: fade-in
Duration: 200ms
```

## Error States

### No Sections Available
```
┌─────────────────────────────────────────┐
│ Section: [No sections ▼]                │
│ (Dropdown disabled)                     │
└─────────────────────────────────────────┘
```

### Invalid Mark Input
```
┌─────────────────────────────────────────┐
│ [Custom Input] (Red border)             │
│ Error: Mark exceeds maximum             │
└─────────────────────────────────────────┘
```

## Success States

### Mark Saved
```
┌─────────────────────────────────────────┐
│ ✓ Draft saved — marks stored            │
│   (Green toast, bottom right)           │
└─────────────────────────────────────────┘
```

### Marking Submitted
```
┌─────────────────────────────────────────┐
│ ✓ Submitted! Total: 45 / 100            │
│   (Green toast, bottom right)           │
└─────────────────────────────────────────┘
```
