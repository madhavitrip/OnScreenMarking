# Examiner Marking Interface - Visual Guide

## Screen Layout

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    EXAMINER MARKING INTERFACE                               │
│  Script: OSM-2024-001 | Examiner: Dr. Rajesh Kumar | Status: Draft | 100   │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────┬──────────────────────────┐
│                                                  │                          │
│  ┌────────────────────────────────────────────┐  │  ┌──────────────────────┐│
│  │         ANSWER SHEET VIEWER                │  │  │  SCORE SUMMARY       ││
│  │  📄 Scanned Answer Sheet                   │  │  │                      ││
│  │  (High-resolution image here)              │  │  │  Total Obtained: 45  ││
│  │                                            │  │  │  Total Marks: 100    ││
│  └────────────────────────────────────────────┘  │  │  Progress: ████░░░░░ ││
│                                                  │  │  Percentage: 45%     ││
│  ┌────────────────────────────────────────────┐  │  └──────────────────────┘│
│  │ ▼ SECTION A - Multiple Choice (10/20)     │  │                          │
│  │   Objective type questions                 │  │  ┌──────────────────────┐│
│  │                                            │  │  │ SECTION-WISE MARKS   ││
│  │  Q1 [MCQ] Max: 2 marks                    │  │  │                      ││
│  │  ┌──────────────────────────────────────┐ │  │  │ Section A: 10/20     ││
│  │  │ Input: [2] / 2  ✓                    │ │  │  │ Section B: 20/40     ││
│  │  │ [Annotation] [Skip]                  │ │  │  │ Section C: 15/40     ││
│  │  └──────────────────────────────────────┘ │  │  └──────────────────────┘│
│  │                                            │  │                          │
│  │  Q2 [MCQ] Max: 2 marks                    │  │  ┌──────────────────────┐│
│  │  ┌──────────────────────────────────────┐ │  │  │ EXAMINER REMARKS     ││
│  │  │ Input: [1] / 2  ⚠                    │ │  │  │                      ││
│  │  │ [Annotation] [Skip]                  │ │  │  │ [Text area for       ││
│  │  │ Annotation:                          │ │  │  │  remarks]            ││
│  │  │ [Partial credit - calculation error] │ │  │  │                      ││
│  │  └──────────────────────────────────────┘ │  │  └──────────────────────┘│
│  │                                            │  │                          │
│  │  Q3 [MCQ] Max: 2 marks                    │  │  ┌──────────────────────┐│
│  │  ┌──────────────────────────────────────┐ │  │  │ [Save Marks]         ││
│  │  │ Input: [0] / 2  ✗                    │ │  │  │ [Submit Marks]       ││
│  │  │ [Annotation] [Unskip]                │ │  │  │ [Reset]              ││
│  │  └──────────────────────────────────────┘ │  │  └──────────────────────┘│
│  │                                            │  │                          │
│  │ ▼ SECTION B - Short Answer (20/40)        │  │  ┌──────────────────────┐│
│  │   Short answer type questions             │  │  │ INSTRUCTIONS         ││
│  │                                            │  │  │                      ││
│  │  Q11 [SA] Max: 5 marks                   │  │  │ • Enter marks        ││
│  │  ┌──────────────────────────────────────┐ │  │  │ • Add annotations    ││
│  │  │ Input: [5] / 5  ✓                    │ │  │  │ • Skip unattempted   ││
│  │  │ [Annotation] [Skip]                  │ │  │  │ • Save before submit ││
│  │  └──────────────────────────────────────┘ │  │  │ • Submit to finalize ││
│  │                                            │  │  └──────────────────────┘│
│  │  Q12 [SA] Max: 5 marks                   │  │                          │
│  │  ┌──────────────────────────────────────┐ │  │                          │
│  │  │ Input: [3] / 5  ⚠                    │ │  │                          │
│  │  │ [Annotation] [Skip]                  │ │  │                          │
│  │  │ Annotation:                          │ │  │                          │
│  │  │ [Incomplete answer - missing steps]  │ │  │                          │
│  │  └──────────────────────────────────────┘ │  │                          │
│  │                                            │  │                          │
│  │ ▼ SECTION C - Long Answer (15/40)         │  │                          │
│  │   Long answer type questions              │  │                          │
│  │                                            │  │                          │
│  │  Q19 [LA] Max: 10 marks                  │  │                          │
│  │  ┌──────────────────────────────────────┐ │  │                          │
│  │  │ Input: [10] / 10  ✓                  │ │  │                          │
│  │  │ [Annotation] [Skip]                  │ │  │                          │
│  │  └──────────────────────────────────────┘ │  │                          │
│  │                                            │  │                          │
│  │  Q20 [LA] Max: 10 marks                  │  │                          │
│  │  ┌──────────────────────────────────────┐ │  │                          │
│  │  │ Input: [5] / 10  ⚠                   │ │  │                          │
│  │  │ [Annotation] [Skip]                  │ │  │                          │
│  │  │ Annotation:                          │ │  │                          │
│  │  │ [Good explanation but lacks depth]   │ │  │                          │
│  │  └──────────────────────────────────────┘ │  │                          │
│  │                                            │  │                          │
│  │  Q21 [LA] Optional Max: 10 marks         │  │                          │
│  │  ┌──────────────────────────────────────┐ │  │                          │
│  │  │ Input: [0] / 10  ✗                   │ │  │                          │
│  │  │ [Annotation] [Unskip]                │ │  │                          │
│  │  └──────────────────────────────────────┘ │  │                          │
│  │                                            │  │                          │
│  │  Q22 [LA] Optional Max: 10 marks         │  │                          │
│  │  ┌──────────────────────────────────────┐ │  │                          │
│  │  │ Input: [0] / 10  ✗                   │ │  │                          │
│  │  │ [Annotation] [Unskip]                │ │  │                          │
│  │  └──────────────────────────────────────┘ │  │                          │
│  │                                            │  │                          │
│  └────────────────────────────────────────────┘  │                          │
│                                                  │                          │
└──────────────────────────────────────────────────┴──────────────────────────┘
```

## Color Coding

### Question Type Colors:
```
┌─────────┬──────────────────────────────────────┐
│ MCQ     │ 🔵 Blue - Multiple Choice Questions  │
│ SA      │ 🟢 Green - Short Answer              │
│ LA      │ 🟣 Purple - Long Answer              │
│ CS      │ 🟠 Orange - Case Study               │
│ NP      │ 🔴 Red - Numerical Problem           │
│ EXP     │ 🟦 Indigo - Explanation              │
│ RC      │ 🔷 Cyan - Reading Comprehension      │
│ WS      │ 🟥 Pink - Word Search                │
│ LIT     │ 🟨 Yellow - Literature               │
│ GV      │ 🟦 Teal - Grammar/Vocabulary         │
└─────────┴──────────────────────────────────────┘
```

### Mark Status Indicators:
```
┌──────────────────┬─────────────────────────────────┐
│ ✓ Green Circle   │ Full marks awarded              │
│ ⚠ Yellow Alert   │ Partial marks awarded           │
│ ✗ Red X          │ Question skipped/unattempted    │
│ (blank)          │ No marks entered yet            │
└──────────────────┴─────────────────────────────────┘
```

## Interaction Flow

### Marking a Question:

```
1. View Question
   ↓
2. Enter Marks (0 to max)
   ↓
3. [Optional] Add Annotation
   ↓
4. [Optional] Mark as Skip
   ↓
5. Move to Next Question
   ↓
6. Repeat for all questions
   ↓
7. Review Score Summary
   ↓
8. Save Marks (Draft)
   ↓
9. Submit Marks (Final)
```

### Adding Annotation:

```
Click [Annotation] Button
   ↓
Textarea appears below question
   ↓
Type remarks/comments
   ↓
Remarks auto-saved to question
   ↓
Click [Annotation] again to hide
```

### Skipping a Question:

```
Click [Skip] Button
   ↓
Question background turns gray
   ↓
Mark input disabled
   ↓
Question excluded from total
   ↓
Click [Unskip] to re-enable
```

## Real-time Updates

### Score Summary Updates:
- **Total Obtained**: Updates as marks are entered
- **Percentage**: Recalculates automatically
- **Progress Bar**: Fills as marks increase
- **Section Breakdown**: Shows marks per section

### Example:
```
Initial State:
Total Obtained: 0/100 (0%)

After Q1 (2 marks):
Total Obtained: 2/100 (2%)

After Q2 (1 mark):
Total Obtained: 3/100 (3%)

After Q11 (5 marks):
Total Obtained: 8/100 (8%)

After Skipping Q3:
Total Obtained: 8/100 (8%) [Q3 not counted]
```

## Button States

### Save Marks Button:
```
Normal:     [💾 Save Marks]  - Blue, clickable
Saving:     [⏳ Saving...]   - Gray, disabled, spinner
Submitted:  [💾 Save Marks]  - Gray, disabled
```

### Submit Marks Button:
```
Normal:     [✓ Submit Marks] - Green, clickable
Saving:     [⏳ Submitting...] - Gray, disabled, spinner
Submitted:  [✓ Submit Marks] - Gray, disabled
```

### Reset Button:
```
Normal:     [↻ Reset]        - Gray, clickable
Submitted:  [↻ Reset]        - Gray, disabled
```

## Responsive Design

### Desktop (1200px+):
- 3-column layout: Answer sheet (left), Sections (center), Sidebar (right)
- Full width utilization
- Sticky sidebar for easy access

### Tablet (768px - 1199px):
- 2-column layout: Sections (left), Sidebar (right)
- Answer sheet in collapsible section
- Adjusted spacing

### Mobile (< 768px):
- Single column layout
- Stacked sections
- Sidebar below sections
- Touch-friendly buttons

## Accessibility Features

- ✓ Keyboard navigation support
- ✓ ARIA labels for screen readers
- ✓ Color contrast compliance
- ✓ Focus indicators on buttons
- ✓ Disabled state visual feedback
- ✓ Error messages clearly visible
- ✓ Form validation feedback

## Performance Considerations

- Lazy loading of sections
- Efficient state management
- Debounced calculations
- Optimized re-renders
- Minimal API calls
- Local state caching
