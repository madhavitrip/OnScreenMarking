# Admin Dashboard - Visual Guide

## Dashboard Layout

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│  ADMINISTRATIVE PORTAL                                  System Status   │
│  Admin Dashboard                                        ✓ Operational   │
│  Manage all universities and system-wide operations                    │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐    │
│  │ 🏫 Total Univ.   │  │ 📊 Performance   │  │ 🟢 Active Status │    │
│  │ 5                │  │ 99.9%            │  │ Online           │    │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘    │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  System-wide Management                                                │
│                                                                         │
│  ┌──────────────────────────────┐  ┌──────────────────────────────┐   │
│  │ 👥 User Management           │  │ ⚙️ System Config             │   │
│  │ Manage admins, coordinators, │  │ Global system settings and   │   │
│  │ and examiners                │  │ security                     │   │
│  │ Manage >                     │  │ Manage >                     │   │
│  └──────────────────────────────┘  └──────────────────────────────┘   │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Universities                                    [+ Add University]    │
│                                                                         │
│  ┌─────────────────────────────┐  ┌─────────────────────────────┐    │
│  │ ╔═════════════════════════╗ │  │ ╔═════════════════════════╗ │    │
│  │ ║ 🏫 University 1         ║ │  │ ║ 🏫 University 2         ║ │    │
│  │ ║    5 departments        ║ │  │ ║    3 departments        ║ │    │
│  │ ║                 [Active]║ │  │ ║                 [Active]║ │    │
│  │ ╚═════════════════════════╝ │  │ ╚═════════════════════════╝ │    │
│  │                             │  │                             │    │
│  │ Departments: 5  Projects: 2 │  │ Departments: 3  Projects: 1 │    │
│  │                             │  │                             │    │
│  │ Management Modules:         │  │ Management Modules:         │    │
│  │ ┌──────────┐ ┌──────────┐  │  │ ┌──────────┐ ┌──────────┐  │    │
│  │ │Departments│ │Subjects  │  │  │ │Departments│ │Subjects  │  │    │
│  │ └──────────┘ └──────────┘  │  │ └──────────┘ └──────────┘  │    │
│  │ ┌──────────┐ ┌──────────┐  │  │ ┌──────────┐ ┌──────────┐  │    │
│  │ │Sessions  │ │Projects  │  │  │ │Sessions  │ │Projects  │  │    │
│  │ └──────────┘ └──────────┘  │  │ └──────────┘ └──────────┘  │    │
│  │ ┌──────────┐                │  │ ┌──────────┐                │    │
│  │ │Papers    │                │  │ │Papers    │                │    │
│  │ └──────────┘                │  │ └──────────┘                │    │
│  │                             │  │                             │    │
│  │ [Users] [Edit]              │  │ [Users] [Edit]              │    │
│  └─────────────────────────────┘  └─────────────────────────────┘    │
│                                                                         │
│  ┌─────────────────────────────┐                                      │
│  │ ╔═════════════════════════╗ │                                      │
│  │ ║ 🏫 University 3         ║ │                                      │
│  │ ║    2 departments        ║ │                                      │
│  │ ║                 [Active]║ │                                      │
│  │ ╚═════════════════════════╝ │                                      │
│  │                             │                                      │
│  │ Departments: 2  Projects: 0 │                                      │
│  │                             │                                      │
│  │ Management Modules:         │                                      │
│  │ ┌──────────┐ ┌──────────┐  │                                      │
│  │ │Departments│ │Subjects  │  │                                      │
│  │ └──────────┘ └──────────┘  │                                      │
│  │ ┌──────────┐ ┌──────────┐  │                                      │
│  │ │Sessions  │ │Projects  │  │                                      │
│  │ └──────────┘ └──────────┘  │                                      │
│  │ ┌──────────┐                │                                      │
│  │ │Papers    │                │                                      │
│  │ └──────────┘                │                                      │
│  │                             │                                      │
│  │ [Users] [Edit]              │                                      │
│  └─────────────────────────────┘                                      │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

## University Card Detail

```
┌─────────────────────────────────────────────────────────┐
│ ╔═════════════════════════════════════════════════════╗ │
│ ║ 🏫 University Name                        [Active]  ║ │
│ ║    5 departments                                    ║ │
│ ╚═════════════════════════════════════════════════════╝ │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Departments: 5              Projects: 2                │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Management Modules                                     │
│                                                         │
│  ┌──────────────────┐  ┌──────────────────┐            │
│  │ 🏢 Departments   │  │ 📚 Subjects      │            │
│  │ Configure...     │  │ Define course... │            │
│  │ >                │  │ >                │            │
│  └──────────────────┘  └──────────────────┘            │
│                                                         │
│  ┌──────────────────┐  ┌──────────────────┐            │
│  │ 📅 Sessions      │  │ 📋 Projects      │            │
│  │ Manage exam...   │  │ Organize marking │            │
│  │ >                │  │ >                │            │
│  └──────────────────┘  └──────────────────┘            │
│                                                         │
│  ┌──────────────────┐                                  │
│  │ 📄 Papers        │                                  │
│  │ Configure exam.. │                                  │
│  │ >                │                                  │
│  └──────────────────┘                                  │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  [👥 Users]              [⚙️ Edit]                     │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## Responsive Layouts

### Desktop (3 columns)
```
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│  University 1    │  │  University 2    │  │  University 3    │
└──────────────────┘  └──────────────────┘  └──────────────────┘

┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│  University 4    │  │  University 5    │  │  University 6    │
└──────────────────┘  └──────────────────┘  └──────────────────┘
```

### Tablet (2 columns)
```
┌──────────────────┐  ┌──────────────────┐
│  University 1    │  │  University 2    │
└──────────────────┘  └──────────────────┘

┌──────────────────┐  ┌──────────────────┐
│  University 3    │  │  University 4    │
└──────────────────┘  └──────────────────┘

┌──────────────────┐  ┌──────────────────┐
│  University 5    │  │  University 6    │
└──────────────────┘  └──────────────────┘
```

### Mobile (1 column)
```
┌──────────────────┐
│  University 1    │
└──────────────────┘

┌──────────────────┐
│  University 2    │
└──────────────────┘

┌──────────────────┐
│  University 3    │
└──────────────────┘

┌──────────────────┐
│  University 4    │
└──────────────────┘
```

## User Interaction Flow

### Scenario 1: Access Department Management for University 1

```
1. Admin sees University 1 card
   ↓
2. Admin clicks "Departments" module
   ↓
3. Navigates to: /admin/departments?universityId=1
   ↓
4. DepartmentManagement page loads
   ↓
5. Pre-filtered to show only University 1's departments
   ↓
6. Admin can create/edit/delete departments for University 1
```

### Scenario 2: Add New University

```
1. Admin clicks "+ Add University" button
   ↓
2. Navigates to: /admin/universities
   ↓
3. UniversityManagement page loads
   ↓
4. Admin fills in university details
   ↓
5. Clicks "Create"
   ↓
6. New university appears on dashboard
```

### Scenario 3: Manage Users for University 1

```
1. Admin sees University 1 card
   ↓
2. Admin clicks "Users" button
   ↓
3. Navigates to: /admin/users?universityId=1
   ↓
4. UsersManagement page loads
   ↓
5. Pre-filtered to show only University 1's users
   ↓
6. Admin can create/edit/delete users for University 1
```

## Color Scheme

```
System-wide Modules:
  User Management: Orange (🟠)
  System Config: Slate (🟦)

University Modules:
  Departments: Purple (🟣)
  Subjects: Green (🟢)
  Sessions: Yellow (🟡)
  Projects: Red (🔴)
  Papers: Indigo (🟦)

Status Indicators:
  Active: Green (✓)
  Inactive: Red (✗)
  Online: Green (🟢)
```

## Empty State

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│                      🏫                                 │
│                                                         │
│              No universities yet                        │
│                                                         │
│         Create one to get started!                      │
│                                                         │
│         [+ Create First University]                     │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## Loading State

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│                    ⟳ Loading...                         │
│                                                         │
│              Loading universities...                    │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## Error State

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  ⚠️  Error Loading Universities                         │
│                                                         │
│  Failed to load universities                            │
│                                                         │
│  [Try Again]                                            │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## Module Access Matrix

```
┌──────────────────┬──────────────────┬──────────────────┐
│ Module           │ Access Level     │ URL Pattern      │
├──────────────────┼──────────────────┼──────────────────┤
│ Departments      │ Per University   │ /admin/dept...   │
│ Subjects         │ Per University   │ /admin/subj...   │
│ Sessions         │ Per University   │ /admin/sess...   │
│ Projects         │ Per University   │ /admin/proj...   │
│ Papers           │ Per University   │ /admin/pape...   │
│ Users            │ Per University   │ /admin/users...  │
│ User Management  │ System-wide      │ /admin/users     │
│ System Config    │ System-wide      │ /settings        │
│ Universities     │ System-wide      │ /admin/univ...   │
└──────────────────┴──────────────────┴──────────────────┘
```

## Navigation Paths

```
Admin Dashboard
├─ System-wide Modules
│  ├─ User Management → /admin/users
│  └─ System Config → /settings
│
├─ Universities Grid
│  ├─ University 1
│  │  ├─ Departments → /admin/departments?universityId=1
│  │  ├─ Subjects → /admin/subjects?universityId=1
│  │  ├─ Sessions → /admin/sessions?universityId=1
│  │  ├─ Projects → /admin/projects?universityId=1
│  │  ├─ Papers → /admin/papers?universityId=1
│  │  ├─ Users → /admin/users?universityId=1
│  │  └─ Edit → /admin/universities
│  │
│  ├─ University 2
│  │  └─ [Same as University 1]
│  │
│  └─ University N
│     └─ [Same as University 1]
│
└─ Add University → /admin/universities
```

## Key Features Visualization

### Feature 1: Quick Stats
```
Shows system-wide metrics at a glance
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ Total Univ.  │  │ Performance  │  │ Active Status│
│ 5            │  │ 99.9%        │  │ Online       │
└──────────────┘  └──────────────┘  └──────────────┘
```

### Feature 2: University Cards
```
Shows all universities with quick access to modules
┌─────────────────────────────────────┐
│ University Name                     │
│ Departments: 5  Projects: 2         │
│ [Module] [Module] [Module]          │
│ [Module] [Module] [Module]          │
│ [Users] [Edit]                      │
└─────────────────────────────────────┘
```

### Feature 3: System-wide Modules
```
Accessible from dashboard for all universities
┌──────────────────────────────────────┐
│ User Management | System Config      │
└──────────────────────────────────────┘
```

### Feature 4: Add University
```
Quick access to create new universities
[+ Add University]
```
