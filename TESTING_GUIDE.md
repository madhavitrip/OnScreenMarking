# Testing Guide: Admin & Coordinator Dashboard

## Setup Requirements

### Backend
1. Ensure database has at least one university
2. Create test users:
   - **Admin User**: `userType = 'admin'`, `universityId = null`
   - **Coordinator User**: `userType = 'coordinator'`, `universityId = 1` (or any existing university)
   - **Examiner User**: `userType = 'examiner'`, `universityId = 1`

### Frontend
- Ensure `.env` or `vite.config.js` has correct API URL
- Clear localStorage before each test

## Test Scenarios

### Scenario 1: Admin Login & Dashboard
**Steps:**
1. Login with admin credentials
2. Verify redirected to `/admin/dashboard`
3. Verify "Admin Dashboard" header displayed
4. Verify all universities shown in stats
5. Verify all 8 management modules visible:
   - Universities
   - Departments
   - Subjects
   - Sessions
   - Projects
   - Papers
   - User Management
   - System Config

**Expected Results:**
- ✅ Dashboard loads successfully
- ✅ All modules accessible
- ✅ Sidebar shows admin navigation menu

---

### Scenario 2: Admin Create University
**Steps:**
1. Login as admin
2. Click "Universities" module
3. Click "+ Add University" button
4. Enter university name
5. Click "Create"

**Expected Results:**
- ✅ University created successfully
- ✅ Appears in universities list
- ✅ Can edit and view departments

---

### Scenario 3: Admin Manage Departments (All Universities)
**Steps:**
1. Login as admin
2. Click "Departments" module
3. Click "+ Add Department"
4. Select different universities from dropdown
5. Create departments for multiple universities

**Expected Results:**
- ✅ University dropdown shows all universities
- ✅ Can select any university
- ✅ Departments created for selected university
- ✅ Can view departments from all universities

---

### Scenario 4: Coordinator Login & Dashboard
**Steps:**
1. Login with coordinator credentials (assigned to University 1)
2. Verify redirected to `/coordinator/dashboard`
3. Verify "University Dashboard" header shows their university name
4. Verify only 5 management modules visible:
   - Departments
   - Subjects
   - Sessions
   - Projects
   - Papers
5. Verify stats show only their university's data

**Expected Results:**
- ✅ Dashboard loads with correct university name
- ✅ Only 5 modules visible (no Universities or User Management)
- ✅ Sidebar shows coordinator navigation menu
- ✅ Stats reflect only their university

---

### Scenario 5: Coordinator Cannot Create Universities
**Steps:**
1. Login as coordinator
2. Try to access `/admin/universities` directly
3. Try to call POST `/api/universities` via API

**Expected Results:**
- ✅ Route not accessible (redirected to home)
- ✅ API returns 403 Forbidden
- ✅ No "Add University" button visible

---

### Scenario 6: Coordinator Create Department (Own University Only)
**Steps:**
1. Login as coordinator (assigned to University 1)
2. Click "Departments" module
3. Verify university field shows their university (read-only)
4. Try to change university (should not be possible)
5. Create a department

**Expected Results:**
- ✅ University field is read-only
- ✅ Shows coordinator's assigned university
- ✅ Department created for their university only
- ✅ Cannot select other universities

---

### Scenario 7: Coordinator Cannot Access Other Universities
**Steps:**
1. Login as coordinator (assigned to University 1)
2. Try to access `/admin/departments?universityId=2`
3. Try to call API with different university ID

**Expected Results:**
- ✅ Cannot create departments for other universities
- ✅ API returns 403 Forbidden if attempting to create
- ✅ Can only see their own university's departments

---

### Scenario 8: Examiner Login & Access
**Steps:**
1. Login with examiner credentials
2. Verify redirected to home page
3. Verify can access:
   - Scripts
   - Marking
   - Reports
   - Settings
4. Try to access admin modules

**Expected Results:**
- ✅ Examiner dashboard loads
- ✅ Can access marking features
- ✅ Cannot access admin/coordinator modules
- ✅ Sidebar shows examiner navigation only

---

### Scenario 9: Navigation Menu Updates
**Steps:**
1. Login as admin
2. Verify sidebar shows admin menu items
3. Logout and login as coordinator
4. Verify sidebar shows coordinator menu items
5. Logout and login as examiner
6. Verify sidebar shows examiner menu items

**Expected Results:**
- ✅ Menu items change based on user role
- ✅ Correct icons and labels displayed
- ✅ Active route highlighted correctly

---

### Scenario 10: API Endpoint Security
**Steps:**
1. Use Postman/API client to test endpoints
2. Test `/api/universities` with different user types
3. Test `/api/universities/current/my-university` with coordinator
4. Test POST `/api/universities` with coordinator token

**Expected Results:**
- ✅ GET `/api/universities` returns all universities for admin
- ✅ GET `/api/universities/current/my-university` returns coordinator's university
- ✅ POST `/api/universities` returns 403 for coordinator
- ✅ POST `/api/department` validates university ownership

---

## Debugging Tips

### If Admin Dashboard Not Loading
1. Check browser console for errors
2. Verify `userType` is 'admin' in localStorage
3. Verify API token is valid
4. Check network tab for failed API calls

### If Coordinator Cannot See Dashboard
1. Verify `universityId` is set in localStorage
2. Check `/api/universities/current/my-university` endpoint
3. Verify user has `UniversityId` set in database
4. Check browser console for errors

### If Department Creation Fails
1. Verify university exists in database
2. Check API response for error message
3. Verify user has correct role
4. For coordinators, verify `UniversityId` matches

### If Routes Not Working
1. Clear browser cache
2. Verify `userType` in localStorage
3. Check App.jsx routing logic
4. Verify user is logged in

---

## Database Queries for Testing

### Create Test Admin User
```sql
INSERT INTO Users (Name, Email, PasswordHash, UserType, IsActive, ProfileImage, CreatedAt, UpdatedAt)
VALUES ('Admin User', 'admin@test.com', '[HASHED_PASSWORD]', 'admin', 1, 'https://example.com/admin.jpg', NOW(), NOW());
```

### Create Test Coordinator User
```sql
INSERT INTO Users (Name, Email, PasswordHash, UserType, UniversityId, IsActive, ProfileImage, CreatedAt, UpdatedAt)
VALUES ('Coordinator User', 'coordinator@test.com', '[HASHED_PASSWORD]', 'coordinator', 1, 1, 'https://example.com/coord.jpg', NOW(), NOW());
```

### Create Test Examiner User
```sql
INSERT INTO Users (Name, Email, PasswordHash, UserType, UniversityId, IsActive, ProfileImage, CreatedAt, UpdatedAt)
VALUES ('Examiner User', 'examiner@test.com', '[HASHED_PASSWORD]', 'examiner', 1, 1, 'https://example.com/exam.jpg', NOW(), NOW());
```

### Verify University Assignment
```sql
SELECT Id, Name, Email, UserType, UniversityId FROM Users WHERE UserType IN ('admin', 'coordinator', 'examiner');
```

---

## Performance Considerations

1. **Dashboard Load Time**: Should load within 2 seconds
2. **Department List**: Should handle 100+ departments smoothly
3. **University Dropdown**: Should load all universities quickly
4. **API Calls**: Minimize number of API calls on dashboard load

---

## Known Limitations

1. Coordinators cannot manage users in their university (future enhancement)
2. No department-level coordinators (future enhancement)
3. No audit logging for admin/coordinator actions (future enhancement)
4. Subject/Session/Project scoping not yet implemented (future enhancement)
