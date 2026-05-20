# Navigation Update Guide

## Adding Role Management to Navigation

To add the Role Management page to your application navigation, follow these steps:

### 1. Update App.jsx Routes

Add the following import and route to your `App.jsx`:

```jsx
import RoleManagement from './pages/RoleManagement';

// In your routes configuration:
{
  path: '/role-management',
  element: <RoleManagement />,
  requiresAuth: true,
  requiredPermission: 'read_role' // Optional: restrict to users with this permission
}
```

### 2. Update Navigation/Sidebar Component

Add the following link to your navigation menu (typically in Navbar or Sidebar component):

```jsx
<NavLink 
  to="/role-management" 
  className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100"
>
  <Shield size={20} />
  <span>Role Management</span>
</NavLink>
```

Make sure to import the Shield icon:
```jsx
import { Shield } from 'lucide-react';
```

### 3. Update Admin Dashboard

If you have an admin dashboard, add a card linking to Role Management:

```jsx
<div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition cursor-pointer"
  onClick={() => navigate('/role-management')}>
  <Shield className="text-purple-600 mb-3" size={32} />
  <h3 className="font-semibold text-gray-900 mb-2">Role Management</h3>
  <p className="text-gray-600 text-sm">Create and manage roles with permissions</p>
</div>
```

### 4. Update User Management Link

The Users Management page already includes role assignment functionality. No changes needed, but ensure the route exists:

```jsx
{
  path: '/users',
  element: <UsersManagement />,
  requiresAuth: true
}
```

### 5. Permission-Based Access Control (Optional)

If you want to restrict Role Management access to specific users:

```jsx
// In your route protection logic:
const canAccessRoleManagement = (user) => {
  return user?.role?.permissionsList?.includes('read_role') || 
         user?.role?.permissionsList?.includes('create_role');
};

// Then use in route:
{
  path: '/role-management',
  element: canAccessRoleManagement(currentUser) ? <RoleManagement /> : <AccessDenied />,
  requiresAuth: true
}
```

## Menu Structure Example

```
Admin Dashboard
├── Users Management
├── Role Management          ← Add here
├── Department Management
├── Papers Management
├── Scripts Management
├── Reports
└── Settings
```

## Sidebar Navigation Example

```jsx
const adminMenuItems = [
  {
    label: 'Users',
    icon: Users,
    path: '/users'
  },
  {
    label: 'Roles',
    icon: Shield,
    path: '/role-management'
  },
  {
    label: 'Departments',
    icon: Building,
    path: '/departments'
  },
  // ... other menu items
];
```

## Mobile Navigation

For mobile navigation, add to your mobile menu:

```jsx
<MobileMenuItem 
  icon={Shield} 
  label="Roles" 
  path="/role-management" 
/>
```

## Breadcrumb Navigation

Add breadcrumb support for Role Management:

```jsx
// In RoleManagement.jsx
const breadcrumbs = [
  { label: 'Dashboard', path: '/' },
  { label: 'Role Management', path: '/role-management', active: true }
];
```

## Quick Access Buttons

Add quick access buttons in relevant pages:

### In Users Management:
```jsx
<button 
  onClick={() => navigate('/role-management')}
  className="text-blue-600 hover:text-blue-700 text-sm font-semibold"
>
  Manage Roles
</button>
```

### In Admin Dashboard:
```jsx
<button 
  onClick={() => navigate('/role-management')}
  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
>
  <Plus size={20} />
  Create Role
</button>
```

## Environment Configuration

Ensure your `.env` file has the correct API URL:

```env
VITE_API_URL=http://localhost:5000/api
```

## Testing Navigation

1. Start your development server: `npm run dev`
2. Navigate to the Role Management page
3. Verify all links work correctly
4. Test role creation and assignment
5. Check that permissions are enforced

## Troubleshooting

### Page not found
- Ensure route is added to App.jsx
- Check path spelling matches exactly
- Verify component is imported correctly

### Navigation link not showing
- Check if user has required permissions
- Verify link is added to navigation component
- Check CSS classes for visibility

### API calls failing
- Verify API URL in .env
- Check authentication token
- Review browser console for errors

## Additional Resources

- See `ROLE_MANAGEMENT_GUIDE.md` for detailed feature documentation
- Check `roleService.js` for API integration details
- Review component files for implementation examples
