# Breadcrumb Navigation Fix

## Problem
When navigating from Admin Dashboard → Sessions & Projects → Subject Configuration, the breadcrumb was only showing:
```
Dashboard > Subject Configuration
```

Instead of the expected:
```
Dashboard > Sessions & Projects > Subject Configuration
```

## Root Cause
The breadcrumb system was only tracking the current route, not the full navigation path. It didn't know that the user came from Sessions & Projects page.

## Solution
Implemented explicit breadcrumb setting in each page component using the `useBreadcrumb()` hook.

### How It Works

#### 1. SessionProjectManagement.jsx
When the user navigates to Sessions & Projects page, it sets the breadcrumb:

```jsx
import { useBreadcrumb } from '../context/BreadcrumbContext';

export default function SessionProjectManagement() {
  const { setBreadcrumb } = useBreadcrumb();

  useEffect(() => {
    // Set breadcrumb for this page
    setBreadcrumb([
      { label: 'Sessions & Projects', path: '/admin/sessions', icon: 'Calendar' }
    ]);
    fetchSessions();
  }, []);
  
  // ... rest of component
}
```

#### 2. SubjectConfig.jsx
When the user navigates to Subject Configuration, it sets the breadcrumb with the full path:

```jsx
import { useBreadcrumb } from '../context/BreadcrumbContext';
import { encryptId } from '../utils/encryption';

export default function SubjectConfig() {
  const { setBreadcrumb } = useBreadcrumb();
  const [searchParams] = useSearchParams();
  const encryptedProjectId = searchParams.get('projectId');
  const projectId = encryptedProjectId ? decryptId(encryptedProjectId) : null;

  useEffect(() => {
    if (projectId) {
      // Set breadcrumb with full path
      setBreadcrumb([
        { label: 'Sessions & Projects', path: '/admin/sessions', icon: 'Calendar' },
        { label: 'Subject Configuration', path: `/admin/subject-config?projectId=${encryptedProjectId}`, icon: 'Layers' }
      ]);
      fetchProjectData();
      fetchSubjects();
    }
  }, [projectId, encryptedProjectId]);
  
  // ... rest of component
}
```

## Navigation Flow

### Before Fix
```
Dashboard
    ↓
Sessions & Projects (breadcrumb: Dashboard > Sessions & Projects)
    ↓
Subject Configuration (breadcrumb: Dashboard > Subject Configuration) ❌
```

### After Fix
```
Dashboard
    ↓
Sessions & Projects (breadcrumb: Dashboard > Sessions & Projects)
    ↓
Subject Configuration (breadcrumb: Dashboard > Sessions & Projects > Subject Configuration) ✅
```

## Implementation Details

### BreadcrumbContext Changes
- Added `navigationHistory` state to track visited routes
- Updated breadcrumb logic to check if Sessions & Projects was visited
- Breadcrumbs now include intermediate pages in the navigation path

### Page Component Changes
Each page now explicitly sets its breadcrumb using `setBreadcrumb()`:

```jsx
const { setBreadcrumb } = useBreadcrumb();

useEffect(() => {
  setBreadcrumb([
    { label: 'Page Name', path: '/path', icon: 'IconName' }
  ]);
}, []);
```

## Breadcrumb Structure

Each breadcrumb item has:
```jsx
{
  label: 'Display Name',           // Text shown in breadcrumb
  path: '/admin/page',             // Route path
  icon: 'IconName',                // Icon from lucide-react
  queryParams: { id: '123' }       // Optional query parameters
}
```

## How to Add Breadcrumbs to New Pages

### Step 1: Import useBreadcrumb
```jsx
import { useBreadcrumb } from '../context/BreadcrumbContext';
```

### Step 2: Get setBreadcrumb from hook
```jsx
const { setBreadcrumb } = useBreadcrumb();
```

### Step 3: Set breadcrumb in useEffect
```jsx
useEffect(() => {
  setBreadcrumb([
    { label: 'Page Name', path: '/admin/page', icon: 'IconName' }
  ]);
}, []);
```

### Step 4: For nested pages, include parent pages
```jsx
useEffect(() => {
  setBreadcrumb([
    { label: 'Parent Page', path: '/admin/parent', icon: 'ParentIcon' },
    { label: 'Current Page', path: '/admin/current', icon: 'CurrentIcon' }
  ]);
}, []);
```

## Example: Multi-Level Navigation

### Dashboard
```jsx
useEffect(() => {
  setBreadcrumb([]);  // Dashboard is always first, no need to add
}, []);
```

### Universities
```jsx
useEffect(() => {
  setBreadcrumb([
    { label: 'Universities', path: '/admin/universities', icon: 'Building2' }
  ]);
}, []);
```

### Departments (from Universities)
```jsx
useEffect(() => {
  setBreadcrumb([
    { label: 'Universities', path: '/admin/universities', icon: 'Building2' },
    { label: 'Departments', path: '/admin/masters', icon: 'Briefcase' }
  ]);
}, []);
```

### Subjects (from Departments)
```jsx
useEffect(() => {
  setBreadcrumb([
    { label: 'Universities', path: '/admin/universities', icon: 'Building2' },
    { label: 'Departments', path: '/admin/masters', icon: 'Briefcase' },
    { label: 'Subjects', path: '/admin/subjects', icon: 'BookOpen' }
  ]);
}, []);
```

## Available Icons

All icons from lucide-react can be used:
- `LayoutDashboard` - Dashboard
- `Building2` - Universities
- `Briefcase` - Departments
- `BookOpen` - Subjects
- `Calendar` - Sessions
- `FileText` - Papers
- `Layers` - Configuration
- `Users` - Users
- `Home` - Home
- `ChevronRight` - Chevron
- And many more...

## Testing the Fix

### Test Case 1: Sessions & Projects Navigation
1. Go to Admin Dashboard
2. Click "Sessions & Projects"
3. Verify breadcrumb shows: `Dashboard > Sessions & Projects`
4. Click on a project's "Configure" button
5. Verify breadcrumb shows: `Dashboard > Sessions & Projects > Subject Configuration`

### Test Case 2: Breadcrumb Navigation
1. From Subject Configuration page
2. Click "Sessions & Projects" in breadcrumb
3. Should navigate back to Sessions & Projects page
4. Breadcrumb should show: `Dashboard > Sessions & Projects`

### Test Case 3: Query Parameters
1. Navigate to Subject Configuration with encrypted projectId
2. Click "Sessions & Projects" in breadcrumb
3. Should navigate to Sessions & Projects (without projectId)
4. Breadcrumb should show: `Dashboard > Sessions & Projects`

## Files Modified

1. **UI/src/context/BreadcrumbContext.jsx**
   - Added navigation history tracking
   - Updated breadcrumb logic

2. **UI/src/pages/SessionProjectManagement.jsx**
   - Added `useBreadcrumb()` hook
   - Set breadcrumb in useEffect

3. **UI/src/pages/SubjectConfig.jsx**
   - Added `useBreadcrumb()` hook
   - Set breadcrumb with full path in useEffect
   - Imported `encryptId` for breadcrumb links

## Troubleshooting

### Breadcrumb Not Showing Full Path
- Ensure `setBreadcrumb()` is called in useEffect
- Check that all parent pages are included in the breadcrumb array
- Verify icons are valid lucide-react icon names

### Breadcrumb Not Updating
- Check that dependencies in useEffect are correct
- Ensure `setBreadcrumb()` is called when route changes
- Verify BreadcrumbProvider wraps the app

### Navigation Not Working
- Ensure paths in breadcrumb match routes in App.jsx
- Check that query parameters are properly formatted
- Verify encrypted IDs are included in paths

## Best Practices

✅ **Do:**
- Set breadcrumbs in useEffect when component mounts
- Include all parent pages in breadcrumb array
- Use consistent icon names
- Test breadcrumb navigation

❌ **Don't:**
- Forget to import useBreadcrumb
- Set breadcrumbs outside of useEffect
- Use invalid icon names
- Forget to include parent pages

## Future Enhancements

1. **Automatic Breadcrumb Generation**
   - Generate breadcrumbs from route configuration
   - Reduce manual setup in each component

2. **Breadcrumb Customization**
   - Allow components to customize breadcrumb appearance
   - Add breadcrumb actions (Save, Cancel, etc.)

3. **Breadcrumb History**
   - Store full navigation history
   - Allow "back" button functionality

4. **Dynamic Breadcrumb Labels**
   - Load breadcrumb labels from API
   - Show resource names in breadcrumbs

## References

- React Hooks: https://react.dev/reference/react
- Context API: https://react.dev/reference/react/useContext
- Lucide React Icons: https://lucide.dev/
