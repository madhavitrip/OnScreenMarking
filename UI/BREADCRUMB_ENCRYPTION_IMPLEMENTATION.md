# Breadcrumb Navigation & ID Encryption Implementation

## Overview
This document outlines the implementation of breadcrumb navigation and encrypted route IDs across the OSM Portal application.

## Features Implemented

### 1. Breadcrumb Navigation System
- **Auto-tracking**: Breadcrumbs automatically track user navigation from Dashboard
- **Path-based**: Breadcrumbs start from Admin/Coordinator Dashboard and show the current page
- **Clickable**: Users can click on any breadcrumb to navigate back to that page
- **Query params preserved**: When navigating back, query parameters are preserved

#### Breadcrumb Flow Example:
```
Dashboard > Sessions & Projects > Subject Configuration
```

### 2. ID Encryption/Decryption
- **Secure URLs**: All sensitive IDs (projectId, subjectId, etc.) are encrypted in URLs
- **XOR-based encryption**: Uses XOR cipher with base64 encoding for URL safety
- **Automatic decryption**: Components automatically decrypt IDs from URL parameters

#### Example:
```
Before: /admin/subject-config?projectId=5
After:  /admin/subject-config?projectId=MzQyMTU0
```

## File Structure

### New Files Created

#### 1. `UI/src/utils/encryption.js`
Utility functions for ID encryption/decryption:
- `encryptId(id)` - Encrypts an ID for URL usage
- `decryptId(encryptedId)` - Decrypts an ID from URL
- `createEncryptedParams(params)` - Creates encrypted URL parameters
- `getDecryptedParams(searchParams, keys)` - Extracts and decrypts URL parameters

#### 2. `UI/src/context/BreadcrumbContext.jsx`
React Context for managing breadcrumb state:
- Automatically tracks route changes
- Maintains breadcrumb history
- Provides `useBreadcrumb()` hook for components

#### 3. `UI/src/components/Breadcrumb.jsx`
Breadcrumb display component:
- Shows navigation path from Dashboard
- Clickable links to navigate back
- Icons for each breadcrumb item
- Responsive design

### Modified Files

#### 1. `UI/src/App.jsx`
- Wrapped app with `BreadcrumbProvider`
- Enables breadcrumb tracking across all routes

#### 2. `UI/src/components/Layout.jsx`
- Added `<Breadcrumb />` component
- Displays breadcrumbs on all admin/coordinator pages

#### 3. `UI/src/pages/SessionProjectManagement.jsx`
- Updated links to use encrypted IDs
- Example: `href={`/admin/subject-config?projectId=${encryptId(project.projectId)}`}`

#### 4. `UI/src/pages/SubjectConfig.jsx`
- Decrypts projectId from URL
- Fixed null reference error with optional chaining
- Added project data fetching

## Usage Examples

### Using Encrypted IDs in Links
```jsx
import { encryptId } from '../utils/encryption';

// In your component
<a href={`/admin/subject-config?projectId=${encryptId(project.projectId)}`}>
  Configure
</a>
```

### Decrypting IDs in Components
```jsx
import { useSearchParams } from 'react-router-dom';
import { decryptId } from '../utils/encryption';

export default function MyComponent() {
  const [searchParams] = useSearchParams();
  const encryptedId = searchParams.get('projectId');
  const projectId = encryptedId ? decryptId(encryptedId) : null;
  
  // Use projectId...
}
```

### Using Breadcrumb Context
```jsx
import { useBreadcrumb } from '../context/BreadcrumbContext';

export default function MyComponent() {
  const { breadcrumbs, setBreadcrumb, addBreadcrumb } = useBreadcrumb();
  
  // Breadcrumbs are automatically managed based on route
}
```

## Breadcrumb Route Mapping

The following routes are automatically mapped to breadcrumbs:

| Route | Label | Icon |
|-------|-------|------|
| `/admin/dashboard` | Dashboard | LayoutDashboard |
| `/admin/universities` | Universities | Building2 |
| `/admin/masters` | Departments | Briefcase |
| `/admin/subjects` | Subjects | BookOpen |
| `/admin/sessions` | Sessions & Projects | Calendar |
| `/admin/papers` | Papers | FileText |
| `/admin/subject-config` | Subject Configuration | Layers |
| `/admin/users` | Users | Users |

## Security Considerations

### Current Implementation
- Uses XOR cipher with base64 encoding
- Suitable for obfuscating IDs in URLs
- Prevents casual inspection of IDs

### For Production
Consider upgrading to:
- AES encryption using `crypto-js` library
- Server-side session tokens instead of URL parameters
- HTTPS-only transmission

### Implementation Steps for Production
1. Install `crypto-js`: `npm install crypto-js`
2. Update `encryption.js` to use AES encryption
3. Store encryption key in environment variables
4. Add server-side validation of encrypted IDs

## Error Handling

### Fixed Issues
1. **Null Reference Error**: Added optional chaining (`?.`) for selectedSubject
2. **Invalid projectId**: Decryption handles invalid IDs gracefully
3. **Missing breadcrumbs**: Breadcrumbs default to Dashboard if not set

### Error Prevention
- All ID decryption wrapped in try-catch
- Components check for null/undefined before rendering
- Fallback values provided for missing data

## Testing Breadcrumbs

### Manual Testing Steps
1. Navigate to Admin Dashboard
2. Click on "Sessions & Projects"
   - Breadcrumb shows: Dashboard > Sessions & Projects
3. Select a session and click "Configure"
   - Breadcrumb shows: Dashboard > Sessions & Projects > Subject Configuration
4. Click on "Dashboard" in breadcrumb
   - Should navigate back to Dashboard
5. Verify encrypted projectId in URL

### Expected Behavior
- Breadcrumbs always start with Dashboard
- Current page is highlighted (not clickable)
- Previous pages are clickable links
- Query parameters preserved when navigating

## Future Enhancements

1. **Breadcrumb Customization**: Allow components to customize breadcrumb labels
2. **Breadcrumb Actions**: Add action buttons in breadcrumb (e.g., "Save", "Cancel")
3. **Mobile Optimization**: Collapse breadcrumbs on mobile devices
4. **Breadcrumb History**: Store breadcrumb history for "back" button functionality
5. **Dynamic Breadcrumbs**: Load breadcrumb labels from API based on IDs

## Troubleshooting

### Breadcrumbs Not Showing
- Ensure `BreadcrumbProvider` wraps the app in `App.jsx`
- Check that `<Breadcrumb />` is included in `Layout.jsx`
- Verify route is mapped in `BreadcrumbContext.jsx`

### Encrypted IDs Not Decrypting
- Check that `decryptId()` is called with the encrypted value
- Verify encryption/decryption use the same SECRET_KEY
- Check browser console for decryption errors

### Navigation Not Working
- Ensure links use correct route paths
- Verify query parameters are properly formatted
- Check that routes are defined in `App.jsx`

## References

- React Router: https://reactrouter.com/
- Context API: https://react.dev/reference/react/useContext
- URL Encoding: https://developer.mozilla.org/en-US/docs/Glossary/percent-encoding
