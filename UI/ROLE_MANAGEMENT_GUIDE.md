# Role Management UI Guide

## Overview
The Role Management system provides a comprehensive interface for creating, managing, and assigning roles with granular permissions to users in the On-Screen Marking portal.

## Features

### 1. Role Management Page (`/role-management`)
Main interface for managing all roles in the system.

#### Components:
- **RoleStatistics**: Dashboard showing:
  - Total Roles
  - Total Permissions
  - Active Roles
  - Hierarchical Roles

- **Role List**: Expandable list of all roles with:
  - Role name and description
  - Permission count
  - Active/Inactive status
  - Hierarchy level
  - Creation and update dates

#### Actions:
- **Create Role**: Opens modal to create new role
- **Edit Role**: Modify existing role details and permissions
- **Delete Role**: Remove role from system
- **View Details**: Expand role to see full details

### 2. Create Role Modal
Modal for creating new roles with:
- Role name (required)
- Description (optional)
- Permission selection (required - at least one)
- Parent role selection (optional - for hierarchy)

### 3. Edit Role Modal
Modal for editing existing roles with:
- Pre-filled role information
- Role ID and hierarchy level display
- Current status indicator
- Permission modification
- Update confirmation

### 4. Permission Selector Component
Interactive permission selection interface with:
- Grouped permissions by category (CREATE, READ, UPDATE, DELETE, VIEW, EXPORT, MANAGE)
- Category-level selection (select all permissions in category)
- Individual permission selection
- Permission count display
- Search and filter capabilities

### 5. Assign Role Modal
Modal for assigning roles to users with:
- User information display
- Role selection dropdown
- Selected role details preview
- Permission list preview
- Confirmation button

### 6. Users Management Enhancement
Enhanced Users Management page with:
- Role column in user table
- "Assign Role" button for each user
- Role status indicator
- Integration with role assignment modal

## File Structure

```
UI/src/
├── pages/
│   ├── RoleManagement.jsx          # Main role management page
│   └── UsersManagement.jsx         # Enhanced with role assignment
├── components/
│   └── RoleManagement/
│       ├── CreateRoleModal.jsx     # Create role modal
│       ├── EditRoleModal.jsx       # Edit role modal
│       ├── PermissionSelector.jsx  # Permission selection component
│       ├── AssignRoleModal.jsx     # Assign role to user modal
│       └── RoleStatistics.jsx      # Statistics dashboard
└── services/
    └── roleService.js             # API service for roles
```

## API Integration

### Role Service (`roleService.js`)
Provides methods for:
- `getAllRoles()` - Fetch all roles
- `getRoleById(roleId)` - Fetch specific role
- `createRole(roleData)` - Create new role
- `updateRole(roleId, roleData)` - Update role
- `deleteRole(roleId)` - Delete role
- `getRoleHierarchy(roleId)` - Get role hierarchy
- `getAllPermissions()` - Fetch all available permissions

### API Endpoints
- `GET /api/role` - Get all roles
- `GET /api/role/{roleId}` - Get role by ID
- `POST /api/role/create` - Create role
- `PUT /api/role/{roleId}` - Update role
- `DELETE /api/role/{roleId}` - Delete role
- `GET /api/role/{roleId}/hierarchy` - Get role hierarchy
- `GET /api/role/permissions/all` - Get all permissions

## Usage Examples

### Creating a Role
1. Navigate to Role Management page
2. Click "Create Role" button
3. Fill in role name and description
4. Select permissions by:
   - Clicking category to expand
   - Selecting individual permissions or entire category
5. Click "Create Role" to save

### Assigning Role to User
1. Go to Users Management page
2. Find user in table
3. Click "Assign Role" button
4. Select role from dropdown
5. Review role details
6. Click "Assign Role" to confirm

### Editing a Role
1. Go to Role Management page
2. Find role in list
3. Click expand button to view details
4. Click "Edit" button
5. Modify role details and permissions
6. Click "Update Role" to save

### Deleting a Role
1. Go to Role Management page
2. Find role in list
3. Click expand button to view details
4. Click "Delete" button
5. Confirm deletion in dialog

## Permission Categories

### User Management
- `CREATE_USER` - Create new users
- `READ_USER` - View user information
- `UPDATE_USER` - Modify user details
- `DELETE_USER` - Remove users

### Paper Management
- `CREATE_PAPER` - Create papers
- `READ_PAPER` - View papers
- `UPDATE_PAPER` - Modify papers
- `DELETE_PAPER` - Remove papers

### Script Management
- `CREATE_SCRIPT` - Create scripts
- `READ_SCRIPT` - View scripts
- `UPDATE_SCRIPT` - Modify scripts
- `DELETE_SCRIPT` - Remove scripts

### Marking Management
- `CREATE_MARKING` - Create markings
- `READ_MARKING` - View markings
- `UPDATE_MARKING` - Modify markings
- `DELETE_MARKING` - Remove markings

### Allocation Management
- `CREATE_ALLOCATION` - Create allocations
- `READ_ALLOCATION` - View allocations
- `UPDATE_ALLOCATION` - Modify allocations
- `DELETE_ALLOCATION` - Remove allocations

### Report Management
- `VIEW_REPORTS` - View reports
- `EXPORT_REPORTS` - Export reports

### Role Management
- `CREATE_ROLE` - Create roles
- `READ_ROLE` - View roles
- `UPDATE_ROLE` - Modify roles
- `DELETE_ROLE` - Remove roles

### System Administration
- `VIEW_LOGS` - View system logs
- `MANAGE_SETTINGS` - Manage system settings
- `VIEW_ANALYTICS` - View analytics

## Styling

All components use Tailwind CSS 4 with:
- Consistent color scheme (blue primary, gray neutral)
- Responsive design (mobile-first)
- Lucide React icons
- Smooth transitions and hover effects

## Error Handling

- API errors are caught and displayed to user
- Form validation prevents invalid submissions
- Confirmation dialogs for destructive actions
- Loading states during async operations
- Success/error notifications

## Best Practices

1. **Always assign roles to users** - Users without roles won't have access to protected endpoints
2. **Use meaningful role names** - Make it clear what each role does
3. **Organize permissions logically** - Group related permissions together
4. **Test permissions** - Verify users have correct access after role assignment
5. **Document role purposes** - Use descriptions to explain role intent
6. **Review role hierarchy** - Ensure parent-child relationships make sense

## Troubleshooting

### Roles not loading
- Check API connection
- Verify authentication token
- Check browser console for errors

### Can't assign role to user
- Ensure user exists
- Verify role exists
- Check API response for errors

### Permissions not showing
- Refresh page
- Clear browser cache
- Check API endpoint

## Future Enhancements

- Bulk role assignment
- Role templates
- Permission inheritance
- Role analytics
- Audit logs for role changes
- Role cloning
- Permission search/filter
