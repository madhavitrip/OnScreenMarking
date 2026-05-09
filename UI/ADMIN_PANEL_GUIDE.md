# Admin Panel Guide - OSM Portal

## Overview
Complete admin panel for managing the entire OSM Portal hierarchy with intuitive UI for creating and managing:
- Universities
- Departments
- Subjects
- Sessions
- Projects
- Papers
- Sections
- Questions

---

## Access Admin Panel

### For Admin Users
1. Login with admin credentials
2. Click the **"Admin"** button in the top navbar (Settings icon)
3. You'll be redirected to the Admin Dashboard

### Admin Dashboard
The main hub showing all management options:
- 🏫 Universities
- 🏢 Departments
- 📚 Subjects
- 📅 Sessions
- 📋 Projects
- 📄 Papers
- 📑 Scripts
- 👥 Allocations
- 👤 Users

---

## Step-by-Step Workflow

### Step 1: Create University
**Path**: Admin Dashboard → Universities

1. Click **"+ Add University"** button
2. Enter university name (e.g., "XYZ University")
3. Check "Active" checkbox
4. Click **"Create"**
5. View all universities in the table
6. Click **"View Departments"** to manage departments

**Features**:
- ✅ Create new universities
- ✅ Edit existing universities
- ✅ View active/inactive status
- ✅ Quick access to departments

---

### Step 2: Create Department
**Path**: Admin Dashboard → Departments

1. Click **"+ Add Department"** button
2. Select a university from dropdown
3. Enter department name (e.g., "Computer Science")
4. Check "Active" checkbox
5. Click **"Create"**
6. Click **"View Subjects"** to manage subjects

**Features**:
- ✅ Filter departments by university
- ✅ Create departments within universities
- ✅ Edit department details
- ✅ Quick navigation to subjects

---

### Step 3: Create Subject
**Path**: Admin Dashboard → Subjects

1. Click **"+ Add Subject"** button
2. Select a department from dropdown
3. Enter subject name (e.g., "Data Structures")
4. Check "Active" checkbox
5. Click **"Create"**
6. Click **"View Papers"** to manage papers

**Features**:
- ✅ Filter subjects by department
- ✅ Create subjects within departments
- ✅ Edit subject details
- ✅ View associated papers

---

### Step 4: Create Session
**Path**: Admin Dashboard → Sessions & Projects

1. Click the **"Sessions"** tab
2. Click **"+ Add Session"** button
3. Enter session name (e.g., "2024-2025")
4. Check "Active" checkbox
5. Click **"Create"**

**Features**:
- ✅ Create exam sessions
- ✅ Edit session details
- ✅ Manage session status

---

### Step 5: Create Project
**Path**: Admin Dashboard → Sessions & Projects

1. Click the **"Projects"** tab
2. Click **"+ Add Project"** button
3. Select a session from dropdown
4. Select a university from dropdown
5. Enter project name (e.g., "Mid-Term Exam")
6. Check "Active" checkbox
7. Click **"Create"**
8. Click **"View Papers"** to manage papers

**Features**:
- ✅ Create projects within sessions
- ✅ Link projects to universities
- ✅ Edit project details
- ✅ Quick access to papers

---

### Step 6: Create Paper
**Path**: Admin Dashboard → Papers (or from Project)

1. Click **"+ Add Paper"** button
2. Select subject from dropdown
3. Select project from dropdown
4. Enter paper code (e.g., "CS-DS-2024-P1")
5. Enter paper name (e.g., "Paper 1")
6. Enter paper number (e.g., 1)
7. Enter max marks (e.g., 100)
8. Enter total questions (e.g., 50)
9. Enter description (optional)
10. Click **"Create"**
11. Click **"View Sections"** to manage sections

**Features**:
- ✅ Create papers for subjects
- ✅ Link papers to projects
- ✅ Set paper configuration
- ✅ Quick access to sections

---

### Step 7: Create Section
**Path**: Admin Dashboard → Papers → Sections

1. Click **"+ Add Section"** button
2. Select paper from dropdown
3. Enter section name (e.g., "Section A")
4. Enter description (e.g., "Multiple Choice Questions")
5. Enter total questions (e.g., 20)
6. Enter total marks (e.g., 20)
7. Click **"Create"**
8. Click **"View Questions"** to manage questions

**Features**:
- ✅ Create sections within papers
- ✅ Set section configuration
- ✅ Quick access to questions

---

### Step 8: Create Questions
**Path**: Admin Dashboard → Papers → Sections → Questions

1. Click **"+ Add Question"** button
2. Select section from dropdown
3. Enter question number (e.g., 1)
4. Enter marks (e.g., 1)
5. Select question type:
   - MCQ (Multiple Choice)
   - SA (Short Answer)
   - LA (Long Answer)
   - CS (Case Study)
   - NP (Numerical Problem)
   - EXP (Explanation)
   - RC (Reading Comprehension)
   - WS (Word Search)
   - LIT (Literature)
   - GV (Group Variation)
6. Check "Optional" if question is optional
7. Enter optional group code if applicable
8. Click **"Create"**

**Features**:
- ✅ Create questions within sections
- ✅ Set question type
- ✅ Mark questions as optional
- ✅ Group optional questions

---

## UI Components

### Admin Dashboard
- **Grid Layout**: 9 management cards with icons
- **Quick Stats**: Total universities, departments, users, sessions
- **Color Coded**: Each card has unique color for easy identification
- **Hover Effects**: Cards scale up on hover for better UX

### Management Pages
- **Header**: Title and description with action button
- **Form Section**: Collapsible form for creating/editing items
- **List Section**: Table view with all items
- **Actions**: Edit and View related items buttons
- **Status Badges**: Green for active, red for inactive

### Features
- ✅ **Responsive Design**: Works on desktop, tablet, mobile
- ✅ **Dark Theme**: Easy on the eyes for long sessions
- ✅ **Real-time Updates**: Lists update immediately after create/edit
- ✅ **Error Handling**: Clear error messages
- ✅ **Loading States**: Shows loading indicator while fetching
- ✅ **Pagination**: Supports large datasets
- ✅ **Filtering**: Filter by parent entity
- ✅ **Quick Navigation**: Easy links between related items

---

## Navigation Flow

```
Admin Dashboard
├── Universities
│   └── View Departments
│       └── View Subjects
│           └── View Papers
│               └── View Sections
│                   └── View Questions
├── Departments
│   └── View Subjects
│       └── View Papers
│           └── View Sections
│               └── View Questions
├── Subjects
│   └── View Papers
│       └── View Sections
│           └── View Questions
├── Sessions
│   └── Create Projects
├── Projects
│   └── View Papers
│       └── View Sections
│           └── View Questions
└── Scripts
    └── Allocate to Examiners
```

---

## API Integration

All pages connect to the backend API:

### Universities
- `GET /api/universities` - Get all universities
- `POST /api/universities` - Create university
- `PUT /api/universities/{id}` - Update university

### Departments
- `GET /api/department` - Get all departments
- `POST /api/department` - Create department
- `PUT /api/department/{id}` - Update department

### Subjects
- `GET /api/subject` - Get all subjects
- `POST /api/subject` - Create subject
- `PUT /api/subject/{id}` - Update subject

### Sessions
- `GET /api/session` - Get all sessions
- `POST /api/session` - Create session
- `PUT /api/session/{id}` - Update session

### Projects
- `GET /api/project` - Get all projects
- `POST /api/project` - Create project
- `PUT /api/project/{id}` - Update project

---

## Best Practices

1. **Create in Order**: Always create parent entities before children
   - University → Department → Subject → Project → Paper → Section → Question

2. **Use Meaningful Names**: 
   - University: "XYZ University"
   - Department: "Computer Science"
   - Subject: "Data Structures"
   - Session: "2024-2025"
   - Project: "Mid-Term Exam"
   - Paper: "Paper 1"
   - Section: "Section A"

3. **Set Active Status**: Always check "Active" for new items

4. **Verify Before Creating**: Double-check all fields before clicking Create

5. **Use Quick Links**: Use "View" buttons to navigate between related items

---

## Troubleshooting

### Issue: Cannot see Admin button
**Solution**: Make sure you're logged in as admin user

### Issue: Form not submitting
**Solution**: Check all required fields are filled and valid

### Issue: Items not appearing in list
**Solution**: 
- Refresh the page
- Check if items are marked as active
- Verify parent entity is selected

### Issue: Cannot create child item
**Solution**: Make sure parent entity exists and is selected

---

## Files Created

### Pages
- `UI/src/pages/AdminDashboard.jsx` - Main admin dashboard
- `UI/src/pages/UniversityManagement.jsx` - University management
- `UI/src/pages/DepartmentManagement.jsx` - Department management
- `UI/src/pages/SubjectManagement.jsx` - Subject management
- `UI/src/pages/SessionProjectManagement.jsx` - Session & Project management

### Updated Files
- `UI/src/App.jsx` - Added admin routes
- `UI/src/components/Navbar.jsx` - Added admin button

---

## Features Summary

✅ **Complete Hierarchy Management**
- Create and manage entire exam structure
- Hierarchical navigation
- Parent-child relationships

✅ **User-Friendly Interface**
- Intuitive forms
- Clear navigation
- Responsive design
- Dark theme

✅ **Data Management**
- Create, read, update operations
- Status management (active/inactive)
- Filtering and searching
- Real-time updates

✅ **Error Handling**
- Validation messages
- Error notifications
- Loading states

✅ **Security**
- Role-based access (admin only)
- JWT authentication
- Protected routes

---

**Status**: ✅ Complete and Ready to Use
**Total Pages**: 5 new admin pages
**Total Routes**: 6 new routes
**API Endpoints**: 20+ integrated endpoints
