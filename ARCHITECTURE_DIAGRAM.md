# Architecture Diagram: Admin & Coordinator Dashboard

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend (React)                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    App.jsx (Router)                      │   │
│  │  - Role-based route rendering                           │   │
│  │  - Admin routes: /admin/*                               │   │
│  │  - Coordinator routes: /coordinator/*                   │   │
│  │  - Examiner routes: /*                                  │   │
│  └──────────────────────────────────────────────────────────┘   │
│                              │                                    │
│         ┌────────────────────┼────────────────────┐              │
│         │                    │                    │              │
│    ┌────▼─────┐      ┌──────▼──────┐      ┌─────▼────┐         │
│    │  Admin   │      │ Coordinator │      │ Examiner │         │
│    │ Routes   │      │   Routes    │      │  Routes  │         │
│    └────┬─────┘      └──────┬──────┘      └─────┬────┘         │
│         │                   │                    │              │
│    ┌────▼──────────────┐    │    ┌──────────────▼────┐         │
│    │ AdminDashboard   │    │    │ CoordinatorDash   │         │
│    │ - All Unis       │    │    │ - Their Uni Only  │         │
│    │ - All Modules    │    │    │ - Uni Modules     │         │
│    └────┬──────────────┘    │    └──────────────┬───┘         │
│         │                   │                   │              │
│    ┌────▼──────────────────▼───────────────────▼────┐         │
│    │           Sidebar (Role-based)                 │         │
│    │  - Admin: 9 menu items                         │         │
│    │  - Coordinator: 7 menu items                   │         │
│    │  - Examiner: 8 menu items                      │         │
│    └────┬──────────────────────────────────────────┘         │
│         │                                                      │
│    ┌────▼──────────────────────────────────────────┐         │
│    │    Management Pages                           │         │
│    │  - UniversityManagement (Admin only)          │         │
│    │  - DepartmentManagement (Scoped)              │         │
│    │  - SubjectManagement (Scoped)                 │         │
│    │  - SessionProjectManagement (Scoped)          │         │
│    │  - PapersManagement (Scoped)                  │         │
│    │  - UsersManagement (Admin only)               │         │
│    └────┬──────────────────────────────────────────┘         │
│         │                                                      │
│    ┌────▼──────────────────────────────────────────┐         │
│    │         API Service Layer                     │         │
│    │  - apiCall() function                         │         │
│    │  - JWT token management                       │         │
│    │  - Error handling                             │         │
│    └────┬──────────────────────────────────────────┘         │
│         │                                                      │
└─────────┼──────────────────────────────────────────────────────┘
          │
          │ HTTP/HTTPS
          │
┌─────────▼──────────────────────────────────────────────────────┐
│                    Backend (ASP.NET Core)                       │
├────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                  JWT Middleware                          │  │
│  │  - Token validation                                      │  │
│  │  - Claims extraction (id, email, userType)              │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              │                                   │
│  ┌──────────────────────────▼──────────────────────────────┐  │
│  │              Authorization Middleware                   │  │
│  │  - Role-based access control                           │  │
│  │  - University ownership validation                     │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              │                                   │
│         ┌────────────────────┼────────────────────┐             │
│         │                    │                    │             │
│    ┌────▼──────────┐  ┌─────▼──────┐  ┌────────▼────┐         │
│    │ Universities │  │ Departments │  │   Other     │         │
│    │ Controller   │  │ Controller  │  │ Controllers │         │
│    │              │  │             │  │             │         │
│    │ GET /        │  │ GET /       │  │ GET /       │         │
│    │ POST / (A)   │  │ POST / (A,C)│  │ POST / (A,C)│         │
│    │ PUT / (A)    │  │ PUT / (A,C) │  │ PUT / (A,C) │         │
│    │              │  │             │  │             │         │
│    │ NEW:         │  │ MODIFIED:   │  │             │         │
│    │ GET /current │  │ - Uni scope │  │             │         │
│    │ /my-uni (C)  │  │   for coord │  │             │         │
│    └────┬──────────┘  └─────┬──────┘  └────────┬────┘         │
│         │                   │                   │              │
│    ┌────▼───────────────────▼───────────────────▼────┐        │
│    │         Entity Framework Core                   │        │
│    │  - DbContext                                    │        │
│    │  - LINQ queries                                │        │
│    │  - Lazy loading with Include()                │        │
│    └────┬───────────────────────────────────────────┘        │
│         │                                                      │
└─────────┼──────────────────────────────────────────────────────┘
          │
          │ SQL
          │
┌─────────▼──────────────────────────────────────────────────────┐
│                    MySQL Database                               │
├────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    Users Table                           │  │
│  │  - Id (PK)                                               │  │
│  │  - Name, Email, PasswordHash                            │  │
│  │  - UserType (admin, coordinator, examiner)              │  │
│  │  - UniversityId (FK) - NULL for admins                  │  │
│  │  - DepartmentId (FK)                                     │  │
│  │  - IsActive, ProfileImage, Phone, Address              │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              │                                   │
│  ┌──────────────────────────▼──────────────────────────────┐  │
│  │                Universities Table                       │  │
│  │  - UniversityId (PK)                                    │  │
│  │  - UniversityName                                       │  │
│  │  - IsActive                                             │  │
│  │  - CreatedAt, UpdatedAt                                 │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              │                                   │
│  ┌──────────────────────────▼──────────────────────────────┐  │
│  │               Departments Table                         │  │
│  │  - DepartmentId (PK)                                    │  │
│  │  - Name                                                 │  │
│  │  - UniversityId (FK) - REQUIRED                         │  │
│  │  - IsActive                                             │  │
│  │  - CreatedAt, UpdatedAt                                 │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              │                                   │
│  ┌──────────────────────────▼──────────────────────────────┐  │
│  │              Other Tables                               │  │
│  │  - Subjects, Sessions, Projects, Papers, etc.          │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

## Data Flow Diagram

### Admin Login Flow
```
┌─────────────┐
│ Admin Login │
└──────┬──────┘
       │
       ▼
┌──────────────────────┐
│ POST /api/auth/login │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│ Verify credentials                   │
│ Generate JWT (userType: 'admin')     │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│ Store in localStorage:               │
│ - token                              │
│ - userType: 'admin'                  │
│ - userId                             │
│ - userName                           │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│ App.jsx checks userType === 'admin'  │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│ Render Admin Routes                  │
│ - /admin/dashboard                   │
│ - /admin/universities                │
│ - /admin/masters                 │
│ - etc.                               │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│ AdminDashboard loads                 │
│ - Fetches all universities           │
│ - Shows all modules                  │
│ - Displays system-wide stats         │
└──────────────────────────────────────┘
```

### Coordinator Login Flow
```
┌──────────────────────┐
│ Coordinator Login    │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│ POST /api/auth/login                 │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│ Verify credentials                   │
│ Generate JWT (userType: 'coordinator')
│ Include universityId in token        │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│ Store in localStorage:               │
│ - token                              │
│ - userType: 'coordinator'            │
│ - userId                             │
│ - universityId                       │
│ - userName                           │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│ App.jsx checks userType === 'coord'  │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│ Render Coordinator Routes            │
│ - /coordinator/dashboard             │
│ - /departments                       │
│ - /subjects                          │
│ - etc.                               │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│ CoordinatorDashboard loads           │
│ - Fetches their university           │
│ - Shows university-scoped modules    │
│ - Displays university-specific stats │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│ GET /api/universities/current/       │
│ my-university                        │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│ Backend validates JWT                │
│ Extracts userId from token           │
│ Queries user's university            │
│ Returns university data              │
└──────────────────────────────────────┘
```

### Department Creation Flow (Coordinator)
```
┌──────────────────────────────────────┐
│ Coordinator clicks "Add Department"  │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│ DepartmentManagement form opens      │
│ - University field: READ-ONLY        │
│ - Shows their university             │
│ - Department name input              │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│ Coordinator enters department name   │
│ Clicks "Create"                      │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│ POST /api/department                 │
│ {                                    │
│   name: "Computer Science",          │
│   universityId: 1,                   │
│   isActive: true                     │
│ }                                    │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│ Backend receives request             │
│ - Validates JWT token                │
│ - Extracts userType: 'coordinator'   │
│ - Extracts userId                    │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│ Check: Is userType 'coordinator'?    │
│ YES → Validate university ownership  │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│ Query user from database             │
│ Get user.UniversityId                │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│ Compare:                             │
│ user.UniversityId == request.uniId?  │
└──────┬───────────────────────────────┘
       │
       ├─ YES ──────────────────────────┐
       │                                │
       ▼                                ▼
┌──────────────────────┐      ┌──────────────────────┐
│ Create department    │      │ Return 403 Forbidden │
│ Save to database     │      │ (Unauthorized)       │
│ Return 201 Created   │      └──────────────────────┘
└──────────────────────┘
```

## Authorization Matrix

```
┌─────────────────────┬──────────┬──────────────┬──────────┐
│ Operation           │ Admin    │ Coordinator  │ Examiner │
├─────────────────────┼──────────┼──────────────┼──────────┤
│ View Universities   │ ✅ All   │ ❌ None      │ ❌ None  │
│ Create University   │ ✅ Yes   │ ❌ No        │ ❌ No    │
│ Update University   │ ✅ Yes   │ ❌ No        │ ❌ No    │
│                     │          │              │          │
│ View Departments    │ ✅ All   │ ✅ Their Uni │ ❌ None  │
│ Create Department   │ ✅ Any   │ ✅ Their Uni │ ❌ No    │
│ Update Department   │ ✅ Any   │ ✅ Their Uni │ ❌ No    │
│                     │          │              │          │
│ View Subjects       │ ✅ All   │ ✅ Their Uni │ ❌ None  │
│ Create Subject      │ ✅ Any   │ ✅ Their Uni │ ❌ No    │
│ Update Subject      │ ✅ Any   │ ✅ Their Uni │ ❌ No    │
│                     │          │              │          │
│ View Scripts        │ ❌ No    │ ❌ No        │ ✅ Theirs │
│ Mark Scripts        │ ❌ No    │ ❌ No        │ ✅ Yes    │
│ View Reports        │ ❌ No    │ ❌ No        │ ✅ Yes    │
│                     │          │              │          │
│ Manage Users        │ ✅ Yes   │ ❌ No        │ ❌ No    │
│ View Settings       │ ✅ Yes   │ ✅ Limited   │ ✅ Own    │
└─────────────────────┴──────────┴──────────────┴──────────┘
```

## Component Hierarchy

```
App
├── Login (public)
├── Admin Routes
│   └── Layout
│       ├── Navbar
│       ├── Sidebar (admin menu)
│       └── Main
│           ├── AdminDashboard
│           ├── UniversityManagement
│           ├── DepartmentManagement
│           ├── SubjectManagement
│           ├── SessionProjectManagement
│           ├── PapersManagement
│           ├── UsersManagement
│           └── Settings
├── Coordinator Routes
│   └── Layout
│       ├── Navbar
│       ├── Sidebar (coordinator menu)
│       └── Main
│           ├── CoordinatorDashboard
│           ├── DepartmentManagement (scoped)
│           ├── SubjectManagement (scoped)
│           ├── SessionProjectManagement (scoped)
│           ├── PapersManagement (scoped)
│           └── Settings
└── Examiner Routes
    └── Layout
        ├── Navbar
        ├── Sidebar (examiner menu)
        └── Main
            ├── Home
            ├── Scripts
            ├── ExaminerMarking
            ├── Reports
            └── Settings
```

## State Management

```
LocalStorage
├── token (JWT)
├── userType (admin|coordinator|examiner)
├── userId (numeric)
├── universityId (numeric, for coordinators)
└── userName (string)

Component State
├── AdminDashboard
│   ├── stats (universities, users, projects)
│   ├── loading
│   └── error
├── CoordinatorDashboard
│   ├── university (current university data)
│   ├── stats (departments, subjects, projects)
│   ├── loading
│   └── error
└── DepartmentManagement
    ├── departments (list)
    ├── universities (for dropdown)
    ├── formData (name, universityId, isActive)
    ├── editingId
    ├── showForm
    ├── loading
    └── error
```

---

This architecture ensures:
- ✅ Clear separation of concerns
- ✅ Role-based access control
- ✅ University scoping for coordinators
- ✅ Secure backend validation
- ✅ Intuitive frontend navigation
- ✅ Scalable design for future enhancements
