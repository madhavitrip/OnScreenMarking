# Script Allocation - Visual Guide

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    SCRIPT ALLOCATION SYSTEM                      │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│                      FRONTEND (React)                             │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  Step 1: Select Project                                 │    │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │    │
│  │  │ Project 1   │  │ Project 2   │  │ Project 3   │     │    │
│  │  └─────────────┘  └─────────────┘  └─────────────┘     │    │
│  └─────────────────────────────────────────────────────────┘    │
│                              ↓                                    │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  Step 2: Select Paper                                   │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │    │
│  │  │ Paper 1      │  │ Paper 2      │  │ Paper 3      │  │    │
│  │  │ Code: MATH-1 │  │ Code: PHYS-1 │  │ Code: CHEM-1 │  │    │
│  │  └──────────────┘  └──────────────┘  └──────────────┘  │    │
│  └─────────────────────────────────────────────────────────┘    │
│                              ↓                                    │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  Paper Info & Subjects                                  │    │
│  │  ┌─────────────────────────────────────────────────┐   │    │
│  │  │ Paper: Mathematics Paper 1                      │   │    │
│  │  │ Subjects: [Mathematics] [Applied Math]          │   │    │
│  │  │ Max Marks: 100                                  │   │    │
│  │  └─────────────────────────────────────────────────┘   │    │
│  └─────────────────────────────────────────────────────────┘    │
│                              ↓                                    │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  Step 3: Allocate Scripts                               │    │
│  │                                                          │    │
│  │  Script List:                                            │    │
│  │  ┌──────────────────────────────────────────────────┐  │    │
│  │  │ Script 001 │ [Select Examiner ▼]  │ John Doe    │  │    │
│  │  │ Script 002 │ [Select Examiner ▼]  │ Jane Smith  │  │    │
│  │  │ Script 003 │ [Select Examiner ▼]  │ Bob Wilson  │  │    │
│  │  └──────────────────────────────────────────────────┘  │    │
│  │                                                          │    │
│  │  Examiners Panel:                                        │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │    │
│  │  │ John Doe     │  │ Jane Smith   │  │ Bob Wilson   │  │    │
│  │  │ john@uni.edu │  │ jane@uni.edu │  │ bob@uni.edu  │  │    │
│  │  │ Expertise:   │  │ Expertise:   │  │ Expertise:   │  │    │
│  │  │ [Math]       │  │ [Math]       │  │ [App Math]   │  │    │
│  │  │ [App Math]   │  │ [Physics]    │  │ [Physics]    │  │    │
│  │  │ 2 allocated  │  │ 1 allocated  │  │ 3 allocated  │  │    │
│  │  └──────────────┘  └──────────────┘  └──────────────┘  │    │
│  │                                                          │    │
│  │  [Clear Selection]  [Allocate 3 Scripts]               │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│                      BACKEND (ASP.NET Core)                       │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  AllocationController                                             │
│  ├── GET /allocation/paper/{paperId}/pending-scripts             │
│  │   ├── Fetch Paper with Subjects                               │
│  │   ├── Fetch Pending Scripts                                   │
│  │   └── Fetch Examiners with Expertise                          │
│  │                                                                │
│  └── POST /allocation/bulk-allocate                              │
│      ├── Validate Scripts & Examiners                            │
│      ├── Create Allocations                                      │
│      └── Update Script Status                                    │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│                      DATABASE (MySQL)                             │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Paper ──┬─→ SubjectPaper ──→ Subject                            │
│          │                                                        │
│          └─→ Script ──→ Allocation ──→ User (Examiner)           │
│                                          │                       │
│                                          └─→ ExaminerExpertise   │
│                                              ──→ Subject         │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    USER INTERACTION FLOW                         │
└─────────────────────────────────────────────────────────────────┘

START
  │
  ├─→ [Admin/Coordinator logs in]
  │
  ├─→ [Navigate to Script Allocation]
  │
  ├─→ [Select Project]
  │    │
  │    └─→ API: GET /project
  │         └─→ Display projects
  │
  ├─→ [Select Paper]
  │    │
  │    ├─→ API: GET /papers?projectId={id}
  │    │    └─→ Display papers
  │    │
  │    └─→ [Paper selected]
  │         │
  │         ├─→ API: GET /allocation/paper/{paperId}/pending-scripts
  │         │    │
  │         │    ├─→ Fetch Paper with Subjects
  │         │    ├─→ Fetch Pending Scripts
  │         │    └─→ Fetch Examiners with Expertise
  │         │
  │         └─→ Display:
  │              ├─ Paper info
  │              ├─ Scripts list
  │              └─ Examiners panel
  │
  ├─→ [For each script, select examiner]
  │    │
  │    └─→ Store selection in state
  │
  ├─→ [Click "Allocate"]
  │    │
  │    ├─→ Validate selections
  │    │
  │    ├─→ API: POST /allocation/bulk-allocate
  │    │    │
  │    │    ├─→ Backend validates
  │    │    ├─→ Creates Allocation records
  │    │    ├─→ Updates Script status
  │    │    └─→ Returns results
  │    │
  │    └─→ Display success/error message
  │
  ├─→ [Refresh data]
  │    │
  │    └─→ API: GET /allocation/paper/{paperId}/pending-scripts
  │         └─→ Show updated pending scripts
  │
  └─→ END

```

## Database Schema Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                    DATABASE RELATIONSHIPS                         │
└──────────────────────────────────────────────────────────────────┘

┌─────────────┐
│   Project   │
├─────────────┤
│ ProjectId   │◄─────────┐
│ ProjectName │          │
│ SessionId   │          │
└─────────────┘          │
       │                 │
       │ 1:N             │
       ▼                 │
┌─────────────┐          │
│    Paper    │          │
├─────────────┤          │
│ PaperId     │◄─────────┤
│ PaperCode   │          │
│ PaperName   │          │
│ ProjectId   │──────────┘
│ MaxMarks    │
└─────────────┘
       │
       │ 1:N
       ▼
┌──────────────────┐
│  SubjectPaper    │ (Junction Table)
├──────────────────┤
│ Id               │
│ PaperId          │◄──────┐
│ SubjectId        │       │
└──────────────────┘       │
       │                   │
       │ N:1               │
       ▼                   │
┌─────────────┐            │
│   Subject   │            │
├─────────────┤            │
│ SubjectId   │            │
│ SubName     │            │
│ SubjectCode │            │
└─────────────┘            │
       │                   │
       │ 1:N               │
       ▼                   │
┌──────────────────────┐   │
│ ExaminerExpertise    │   │
├──────────────────────┤   │
│ Id                   │   │
│ ExaminerId           │   │
│ SubjectId            │───┘
│ IsActive             │
└──────────────────────┘
       │
       │ N:1
       ▼
┌─────────────┐
│    User     │
├─────────────┤
│ UserId      │◄──────────┐
│ FirstName   │           │
│ LastName    │           │
│ Email       │           │
└─────────────┘           │
       │                  │
       │ 1:N              │
       ▼                  │
┌─────────────┐           │
│   Script    │           │
├─────────────┤           │
│ Id          │           │
│ ScriptId    │           │
│ PaperId     │───────────┘
│ Status      │
│ Barcode     │
└─────────────┘
       │
       │ 1:N
       ▼
┌──────────────────┐
│   Allocation     │
├──────────────────┤
│ AllocationId     │
│ ScriptId         │◄──────┐
│ ExaminerId       │       │
│ Status           │       │
│ AllocatedAt      │       │
│ StartedAt        │       │
│ SubmittedAt      │       │
└──────────────────┘       │
                           │
                    N:1    │
                           │
                    User ──┘
```

## UI Component Hierarchy

```
┌─────────────────────────────────────────────────────────────────┐
│                    ScriptAllocation.jsx                          │
└─────────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
    ┌────────┐          ┌──────────┐          ┌──────────┐
    │ Header │          │ Messages │          │ Content  │
    └────────┘          └──────────┘          └──────────┘
                                                    │
                        ┌───────────────────────────┼───────────────────────────┐
                        │                           │                           │
                        ▼                           ▼                           ▼
                  ┌──────────────┐          ┌──────────────┐          ┌──────────────┐
                  │ ProjectStep  │          │ PaperStep    │          │ AllocationStep
                  └──────────────┘          └──────────────┘          └──────────────┘
                        │                           │                           │
                        │                           │                           │
                        │                           ▼                           ▼
                        │                    ┌──────────────┐          ┌──────────────┐
                        │                    │ PaperInfo    │          │ ScriptsList  │
                        │                    └──────────────┘          └──────────────┘
                        │                           │                           │
                        │                           ▼                           ▼
                        │                    ┌──────────────┐          ┌──────────────┐
                        │                    │ StatsBar     │          │ ExaminersPanel
                        │                    └──────────────┘          └──────────────┘
                        │                                                       │
                        │                                                       ▼
                        │                                                ┌──────────────┐
                        │                                                │ ActionButtons│
                        │                                                └──────────────┘
```

## State Management Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    STATE MANAGEMENT                              │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│ Component State (useState)                                        │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│ projects: Project[]              ← Fetched from API              │
│ selectedProject: number | null   ← User selection                │
│                                                                   │
│ papers: Paper[]                  ← Fetched from API              │
│ selectedPaper: number | null     ← User selection                │
│                                                                   │
│ scripts: Script[]                ← Fetched from API              │
│ examiners: Examiner[]            ← Fetched from API              │
│ paperInfo: PaperInfo | null      ← Fetched from API              │
│                                                                   │
│ allocations: {                   ← User selections                │
│   [scriptId]: examinerId         │ (scriptId → examinerId)       │
│ }                                │                               │
│                                                                   │
│ loading: boolean                 ← API call status               │
│ submitting: boolean              ← Allocation in progress        │
│ error: string                    ← Error message                 │
│ success: string                  ← Success message               │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘

State Transitions:
┌─────────────────────────────────────────────────────────────────┐
│                                                                   │
│  Initial State                                                    │
│  ├─ projects: []                                                 │
│  ├─ selectedProject: null                                        │
│  └─ loading: true                                                │
│       │                                                           │
│       ├─→ Fetch projects                                          │
│       │    └─→ projects: [...]                                   │
│       │         loading: false                                   │
│       │                                                           │
│       └─→ User selects project                                   │
│            ├─ selectedProject: 1                                 │
│            ├─ loading: true                                      │
│            │                                                     │
│            └─→ Fetch papers                                      │
│                 ├─ papers: [...]                                 │
│                 └─ loading: false                                │
│                      │                                           │
│                      └─→ User selects paper                      │
│                           ├─ selectedPaper: 1                    │
│                           ├─ loading: true                       │
│                           │                                      │
│                           └─→ Fetch scripts & examiners          │
│                                ├─ scripts: [...]                │
│                                ├─ examiners: [...]              │
│                                ├─ paperInfo: {...}              │
│                                └─ loading: false                │
│                                     │                            │
│                                     └─→ User allocates           │
│                                          ├─ submitting: true     │
│                                          │                       │
│                                          └─→ API call           │
│                                               ├─ success: "..."  │
│                                               ├─ allocations: {} │
│                                               └─ submitting: false
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

## Allocation Process Timeline

```
┌─────────────────────────────────────────────────────────────────┐
│                    ALLOCATION TIMELINE                           │
└─────────────────────────────────────────────────────────────────┘

Time    Event                           Status
────────────────────────────────────────────────────────────────────

T0      Admin opens allocation page     
        ├─ Fetch projects              loading: true
        └─ Display projects            loading: false

T1      Admin selects project
        ├─ Fetch papers                loading: true
        └─ Display papers              loading: false

T2      Admin selects paper
        ├─ Fetch scripts & examiners   loading: true
        ├─ Display paper info          
        ├─ Display scripts list        
        └─ Display examiners panel     loading: false

T3      Admin selects examiners
        ├─ Update allocations state    allocations: {...}
        └─ Show selected examiners

T4      Admin clicks "Allocate"
        ├─ Validate selections         
        ├─ Send bulk-allocate request  submitting: true
        └─ Show loading indicator

T5      Backend processes allocation
        ├─ Validate data
        ├─ Create Allocation records
        ├─ Update Script status
        └─ Return results

T6      Frontend receives response
        ├─ Show success message        success: "..."
        ├─ Clear allocations           allocations: {}
        ├─ Refresh scripts list        loading: true
        └─ Update UI                   loading: false, submitting: false

T7      Admin can allocate more
        └─ Repeat from T3
```

## Error Handling Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    ERROR HANDLING FLOW                           │
└─────────────────────────────────────────────────────────────────┘

User Action
    │
    ├─→ Validation Check
    │    │
    │    ├─→ PASS ──→ API Call
    │    │            │
    │    │            ├─→ Success ──→ Update State ──→ Show Success
    │    │            │
    │    │            └─→ Error ──→ Parse Error ──→ Show Error Message
    │    │
    │    └─→ FAIL ──→ Show Validation Error
    │
    └─→ Network Error ──→ Show Network Error ──→ Retry Option

Error Types:
├─ Validation Error
│  └─ "Please select an examiner for at least one script"
│
├─ Network Error
│  └─ "Failed to fetch scripts and examiners"
│
├─ Server Error
│  └─ "Script already allocated"
│  └─ "Examiner not found"
│  └─ "Paper not found"
│
└─ Allocation Error
   └─ "Allocation completed with X error(s)"
```

## Color Scheme

```
┌─────────────────────────────────────────────────────────────────┐
│                    COLOR SCHEME                                  │
└─────────────────────────────────────────────────────────────────┘

Primary Colors:
├─ Blue (#3B82F6)        - Primary actions, project selection
├─ Green (#10B981)       - Success, paper selection
├─ Purple (#A855F7)      - Secondary, examiners
└─ Red (#EF4444)         - Errors, alerts

Neutral Colors:
├─ Slate-50 (#F8FAFC)    - Background
├─ Slate-200 (#E2E8F0)   - Borders
├─ Slate-600 (#475569)   - Text
└─ Slate-900 (#0F172A)   - Headings

Status Colors:
├─ Green (#10B981)       - Success, allocated
├─ Blue (#3B82F6)        - Info, pending
├─ Yellow (#F59E0B)      - Warning
└─ Red (#EF4444)         - Error, failed

Component Colors:
├─ Project Card          - Blue border, blue-50 background
├─ Paper Card            - Green border, green-50 background
├─ Script Item           - Slate border, white background
├─ Examiner Card         - Purple border, white background
├─ Stats Card            - White background, colored icons
└─ Info Box              - Blue-50 background, blue border
```

## Responsive Breakpoints

```
┌─────────────────────────────────────────────────────────────────┐
│                    RESPONSIVE DESIGN                             │
└─────────────────────────────────────────────────────────────────┘

Mobile (< 768px)
├─ Single column layout
├─ Full-width cards
├─ Stacked form fields
└─ Touch-friendly buttons

Tablet (768px - 1024px)
├─ 2-column grid
├─ Adjusted spacing
├─ Readable text size
└─ Optimized for touch

Desktop (> 1024px)
├─ 3-column grid
├─ Comfortable spacing
├─ Full feature display
└─ Mouse-friendly interactions
```

This visual guide helps understand the system architecture, data flow, and UI structure at a glance.
