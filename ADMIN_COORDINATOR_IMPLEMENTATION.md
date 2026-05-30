# Admin & Coordinator Dashboard Implementation

## Overview
This implementation provides role-based access control for the On-Screen Marking portal with distinct dashboards and management capabilities for Admin and Coordinator users.

## Key Features Implemented

### 1. **Admin Dashboard** (`AdminDashboard.jsx`)
- **Access**: Only accessible to users with `userType === 'admin'`
- **Displays**: All universities in the system
- **Statistics**: 
  - Total Universities
  - Active Users
  - Live Projects
  - System Performance
- **Management Modules**: Full access to all system modules
  - Universities (Create, Read, Update)
  - Departments (All universities)
  - Subjects (All universities)
  - Sessions
  - Projects
  - Papers
  - User Management
  - System Configuration

### 2. **Coordinator Dashboard** (`CoordinatorDashboard.jsx`)
- **Access**: Only accessible to users with `userType === 'coordinator'`
- **Displays**: Only their assigned university's data
- **Statistics**:
  - Departments (in their university)
  - Subjects (in their university)
  - Live Projects (in their university)
  - System Performance
- **Management Modules**: University-scoped only
  - Departments (their university only)
  - Subjects (their university only)
  - Sessions (their university only)
  - Projects (their university only)
  - Papers (their university only)

### 3. **Backend Access Control**

#### UniversitiesController
- **GET /api/universities**: Returns all active universities (for admins)
- **GET /api/universities/current/my-university**: Returns coordinator's assigned university
- **POST /api/universities**: Only admins can create universities
  - Enforces `userType === 'admin'` check
  - Coordinators cannot create universities

#### DepartmentController
- **POST /api/department**: Both admins and coordinators can create
  - **Admins**: Can create departments for any university
  - **Coordinators**: Can only create departments for their own university
  - Validates university ownership for coordinators

### 4. **Frontend Routing** (`App.jsx`)

#### Admin Routes
```
/admin/dashboard          → AdminDashboard
/admin/universities       → UniversityManagement (all universities)
/admin/masters        → DepartmentManagement (all universities)
/admin/subjects           → SubjectManagement
/admin/sessions           → SessionProjectManagement
/admin/projects           → SessionProjectManagement
/admin/papers             → PapersManagement
/admin/users              → UsersManagement
```

#### Coordinator Routes
```
/coordinator/dashboard    → CoordinatorDashboard
/departments              → DepartmentManagement (their university only)
/subjects                 → SubjectManagement (their university only)
/sessions                 → SessionProjectManagement
/projects                 → SessionProjectManagement
/projects                 → PapersManagement
```

### 5. **Navigation** (`Sidebar.jsx`)
- **Dynamic menu items** based on user role
- **Admin menu**: Full system management options
- **Coordinator menu**: University-scoped management options
- **Examiner menu**: Script marking and reporting options

### 6. **University Scoping** (`DepartmentManagement.jsx`)
- **For Admins**: Can select any university from dropdown
- **For Coordinators**: University field is read-only (shows their assigned university)
- **Prevents**: Coordinators from creating departments in other universities

## Database Constraints

### User Model
- `UniversityId` (nullable): Associates users with universities
- `UserType`: Determines role (admin, coordinator, examiner)

### Department Model
- `UniversityId` (required): Links departments to universities
- Enforces university-scoped access

## Security Implementation

### Backend Validation
1. **JWT Claims**: User ID and UserType included in token
2. **Role-based Authorization**: `[Authorize(Roles = "admin")]` attributes
3. **University Ownership Check**: Coordinators validated against their university
4. **Forbid Response**: Returns 403 Forbidden for unauthorized access

### Frontend Validation
1. **Route Guards**: Role-based route rendering in App.jsx
2. **UI Hiding**: Management options hidden based on user role
3. **Read-only Fields**: University selection disabled for coordinators
4. **LocalStorage**: User role and university ID stored for quick access

## User Flow

### Admin Login
1. User logs in with admin credentials
2. `userType` set to 'admin' in localStorage
3. Redirected to `/admin/dashboard`
4. Can view all universities and manage all modules
5. Can create new universities
6. Can manage departments across all universities

### Coordinator Login
1. User logs in with coordinator credentials
2. `userType` set to 'coordinator' in localStorage
3. `universityId` set in localStorage
4. Redirected to `/coordinator/dashboard`
5. Can only see their assigned university's data
6. Can manage departments only for their university
7. Cannot create universities
8. Cannot access other universities' data

### Examiner Login
1. User logs in with examiner credentials
2. `userType` set to 'examiner' in localStorage
3. Redirected to home page
4. Can view scripts and perform marking
5. Cannot access admin/coordinator modules

## API Endpoints Summary

| Endpoint | Method | Role | Description |
|----------|--------|------|-------------|
| `/api/universities` | GET | All | Get all active universities |
| `/api/universities/current/my-university` | GET | Coordinator | Get coordinator's university |
| `/api/universities` | POST | Admin | Create new university |
| `/api/universities/{id}` | PUT | Admin | Update university |
| `/api/department` | GET | All | Get departments (with universityId filter) |
| `/api/department` | POST | Admin, Coordinator | Create department (scoped for coordinators) |
| `/api/department/{id}` | PUT | Admin, Coordinator | Update department |

## Testing Checklist

- [ ] Admin can login and see all universities
- [ ] Admin can create new universities
- [ ] Admin can manage departments across all universities
- [ ] Coordinator can login and see only their university
- [ ] Coordinator cannot create universities
- [ ] Coordinator can only create departments for their university
- [ ] Coordinator cannot access other universities' data
- [ ] Examiner can login and access marking features
- [ ] Examiner cannot access admin/coordinator modules
- [ ] Navigation menu updates based on user role
- [ ] University field is read-only for coordinators

## Files Modified/Created

### Created
- `UI/src/pages/CoordinatorDashboard.jsx` - New coordinator dashboard

### Modified
- `API/API/Controllers/UniversitiesController.cs` - Added university ownership check and my-university endpoint
- `API/API/Controllers/DepartmentController.cs` - Added university scoping for coordinators
- `UI/src/App.jsx` - Added coordinator routes and role-based routing
- `UI/src/components/Sidebar.jsx` - Added role-based navigation
- `UI/src/pages/DepartmentManagement.jsx` - Added university scoping UI

## Future Enhancements

1. **Subject Management**: Apply same university scoping pattern
2. **Session Management**: Scope to university level
3. **Project Management**: Scope to university level
4. **User Management**: Coordinators manage users in their university
5. **Audit Logging**: Track all admin and coordinator actions
6. **Department Coordinators**: Sub-role for department-level management
