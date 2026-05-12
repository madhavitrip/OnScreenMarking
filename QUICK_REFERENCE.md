# Quick Reference: Admin & Coordinator Dashboard

## 🚀 Quick Start

### For Admins
1. Login with admin credentials
2. Redirected to `/admin/dashboard`
3. View all universities
4. Access all management modules
5. Create/manage universities and departments

### For Coordinators
1. Login with coordinator credentials
2. Redirected to `/coordinator/dashboard`
3. View only their assigned university
4. Access university-scoped modules
5. Cannot create universities

### For Examiners
1. Login with examiner credentials
2. Redirected to home page
3. Access marking features
4. Cannot access admin/coordinator modules

---

## 📁 File Structure

```
UI/src/
├── pages/
│   ├── AdminDashboard.jsx (existing, unchanged)
│   ├── CoordinatorDashboard.jsx (NEW)
│   ├── DepartmentManagement.jsx (MODIFIED)
│   ├── UniversityManagement.jsx (existing)
│   └── ...
├── components/
│   ├── Layout.jsx (existing)
│   ├── Sidebar.jsx (MODIFIED)
│   ├── Navbar.jsx (existing)
│   └── ...
├── services/
│   └── api.js (existing)
└── App.jsx (MODIFIED)

API/API/
├── Controllers/
│   ├── UniversitiesController.cs (MODIFIED)
│   ├── DepartmentController.cs (MODIFIED)
│   └── ...
├── Models/
│   ├── User.cs (existing)
│   ├── University.cs (existing)
│   ├── Department.cs (existing)
│   └── ...
└── ...
```

---

## 🔑 Key Changes

### Backend
| File | Change | Impact |
|------|--------|--------|
| UniversitiesController.cs | Added `GetMyUniversity()` endpoint | Coordinators can fetch their university |
| UniversitiesController.cs | Added admin-only check for POST | Only admins can create universities |
| DepartmentController.cs | Added university ownership validation | Coordinators scoped to their university |

### Frontend
| File | Change | Impact |
|------|--------|--------|
| App.jsx | Added coordinator routes | Coordinators routed to `/coordinator/*` |
| Sidebar.jsx | Added role-based menus | Different menus for each role |
| DepartmentManagement.jsx | Added university scoping | Coordinators see read-only university field |
| CoordinatorDashboard.jsx | NEW component | Coordinator-specific dashboard |

---

## 🔐 Authorization Rules

### Universities
```
GET /api/universities
  ✅ Admin: All universities
  ✅ Coordinator: All universities (read-only)
  ✅ Examiner: All universities (read-only)

POST /api/universities
  ✅ Admin: Can create
  ❌ Coordinator: Cannot create
  ❌ Examiner: Cannot create

GET /api/universities/current/my-university
  ✅ Coordinator: Their university
  ❌ Admin: Not applicable
  ❌ Examiner: Not applicable
```

### Departments
```
GET /api/department
  ✅ Admin: All departments
  ✅ Coordinator: All departments (read-only)
  ✅ Examiner: All departments (read-only)

POST /api/department
  ✅ Admin: Any university
  ✅ Coordinator: Their university only
  ❌ Examiner: Cannot create

PUT /api/department/{id}
  ✅ Admin: Any department
  ✅ Coordinator: Their university only
  ❌ Examiner: Cannot update
```

---

## 🧪 Testing Checklist

### Admin Tests
- [ ] Login as admin
- [ ] See all universities on dashboard
- [ ] Create new university
- [ ] Create departments for different universities
- [ ] Access all management modules
- [ ] Cannot be restricted by university

### Coordinator Tests
- [ ] Login as coordinator
- [ ] See only their university on dashboard
- [ ] Cannot create universities
- [ ] Can create departments for their university
- [ ] Cannot create departments for other universities
- [ ] University field is read-only
- [ ] Cannot access other universities' data

### Examiner Tests
- [ ] Login as examiner
- [ ] See home page (not admin/coordinator dashboard)
- [ ] Can access marking features
- [ ] Cannot access admin/coordinator modules
- [ ] Cannot create/manage universities or departments

---

## 🐛 Troubleshooting

### Admin Dashboard Not Loading
```
1. Check localStorage: userType should be 'admin'
2. Check browser console for errors
3. Verify API token is valid
4. Check network tab for failed requests
```

### Coordinator Cannot See Dashboard
```
1. Check localStorage: universityId should be set
2. Verify user has UniversityId in database
3. Check /api/universities/current/my-university endpoint
4. Verify API token includes correct claims
```

### Department Creation Fails
```
1. Verify university exists in database
2. Check API response for error message
3. For coordinators: verify universityId matches
4. Check backend logs for validation errors
```

### Routes Not Working
```
1. Clear browser cache
2. Check localStorage: userType should be set
3. Verify App.jsx routing logic
4. Check browser console for errors
```

---

## 📊 API Endpoints Summary

### New Endpoints
```
GET /api/universities/current/my-university
  - Returns coordinator's assigned university
  - Requires: Coordinator role
  - Response: University object with departments and projects
```

### Modified Endpoints
```
POST /api/universities
  - Now requires: Admin role
  - Returns: 403 Forbidden for non-admins

POST /api/department
  - Now validates: University ownership for coordinators
  - Returns: 403 Forbidden if coordinator tries other university
```

### Unchanged Endpoints
```
GET /api/universities
GET /api/universities/{id}
PUT /api/universities/{id}
GET /api/department
GET /api/department/{id}
PUT /api/department/{id}
GET /api/universities/{id}/departments
```

---

## 🎯 User Flows

### Admin Flow
```
Login → Admin Dashboard → Select Module → Manage All Data
```

### Coordinator Flow
```
Login → Coordinator Dashboard → Select Module → Manage University Data
```

### Examiner Flow
```
Login → Home → Scripts → Marking → Reports
```

---

## 💾 LocalStorage Keys

```
token              - JWT authentication token
userType           - 'admin' | 'coordinator' | 'examiner'
userId             - Numeric user ID
universityId       - Numeric university ID (coordinators only)
userName           - User's display name
```

---

## 🔄 Component Props & State

### AdminDashboard
```javascript
State:
  - stats: { universities, departments, users, projects, activePapers }
  - loading: boolean
  - error: string

Props: None (uses localStorage for auth)
```

### CoordinatorDashboard
```javascript
State:
  - university: { universityId, universityName, departments, projects }
  - stats: { departments, subjects, projects, activePapers }
  - loading: boolean
  - error: string

Props: None (uses localStorage for auth)
```

### DepartmentManagement
```javascript
State:
  - departments: array
  - universities: array
  - formData: { name, universityId, isActive }
  - editingId: number | null
  - showForm: boolean
  - loading: boolean
  - error: string

Props: None (uses URL params and localStorage)
```

### Sidebar
```javascript
Props: None

Computed:
  - menuItems: array (based on userType from localStorage)
  - userType: 'admin' | 'coordinator' | 'examiner'
```

---

## 🚨 Security Considerations

### Backend
- ✅ JWT validation on all endpoints
- ✅ Role-based authorization checks
- ✅ University ownership validation for coordinators
- ✅ 403 Forbidden for unauthorized access
- ✅ Input validation on all requests

### Frontend
- ✅ Route guards based on userType
- ✅ Hidden UI elements for unauthorized users
- ✅ Read-only fields for restricted operations
- ✅ LocalStorage for quick role checking
- ✅ Automatic logout on token expiration

---

## 📈 Performance Tips

1. **Dashboard Load**: Should complete in < 2 seconds
2. **API Calls**: Minimize on page load
3. **Database Queries**: Use Include() for related data
4. **Caching**: Consider caching university list
5. **Pagination**: Implement for large lists

---

## 🔮 Future Enhancements

1. **Subject Scoping**: Apply university scoping to subjects
2. **Session Scoping**: Apply university scoping to sessions
3. **Project Scoping**: Apply university scoping to projects
4. **User Management**: Coordinators manage users in their university
5. **Audit Logging**: Track all admin/coordinator actions
6. **Department Coordinators**: Sub-role for department-level management
7. **Bulk Operations**: Bulk create/update departments
8. **Export/Import**: Export and import university data

---

## 📞 Support Resources

1. **ADMIN_COORDINATOR_IMPLEMENTATION.md** - Detailed implementation guide
2. **TESTING_GUIDE.md** - Comprehensive testing procedures
3. **API_CHANGES_SUMMARY.md** - API documentation
4. **ARCHITECTURE_DIAGRAM.md** - System architecture
5. **IMPLEMENTATION_SUMMARY.md** - Project overview

---

## ✅ Deployment Checklist

- [ ] Backend compiled successfully
- [ ] Frontend builds without errors
- [ ] Database migrations applied
- [ ] Test users created (admin, coordinator, examiner)
- [ ] API endpoints tested
- [ ] Frontend routes tested
- [ ] Navigation menus verified
- [ ] Security checks passed
- [ ] Performance acceptable
- [ ] Documentation reviewed
- [ ] Ready for production

---

**Last Updated**: May 12, 2026
**Version**: 1.0.0
**Status**: ✅ Ready for Testing
