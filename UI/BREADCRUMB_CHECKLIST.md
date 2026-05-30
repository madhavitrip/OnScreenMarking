# Breadcrumb Implementation Checklist

Use this checklist to add breadcrumbs to other pages in the application.

## For Each Page Component

### Step 1: Import
- [ ] `import { useBreadcrumb } from '../context/BreadcrumbContext';`

### Step 2: Get Hook
- [ ] `const { setBreadcrumb } = useBreadcrumb();`

### Step 3: Set Breadcrumb in useEffect
- [ ] Add useEffect that calls `setBreadcrumb()`
- [ ] Include all parent pages in breadcrumb array
- [ ] Use correct icon names from lucide-react

### Step 4: Test
- [ ] Breadcrumb displays correctly
- [ ] All parent pages shown
- [ ] Clicking breadcrumb navigates correctly
- [ ] Query parameters preserved

## Pages to Update

### Priority 1 (High)
- [ ] **UniversityManagement.jsx**
  ```jsx
  setBreadcrumb([
    { label: 'Universities', path: '/admin/universities', icon: 'Building2' }
  ]);
  ```

- [ ] **DepartmentManagement.jsx**
  ```jsx
  setBreadcrumb([
    { label: 'Universities', path: '/admin/universities', icon: 'Building2' },
    { label: 'Departments', path: '/admin/masters', icon: 'Briefcase' }
  ]);
  ```

- [ ] **SubjectManagement.jsx**
  ```jsx
  setBreadcrumb([
    { label: 'Universities', path: '/admin/universities', icon: 'Building2' },
    { label: 'Departments', path: '/admin/masters', icon: 'Briefcase' },
    { label: 'Subjects', path: '/admin/subjects', icon: 'BookOpen' }
  ]);
  ```

- [ ] **PapersManagement.jsx**
  ```jsx
  setBreadcrumb([
    { label: 'Sessions & Projects', path: '/admin/sessions', icon: 'Calendar' },
    { label: 'Papers', path: '/admin/papers', icon: 'FileText' }
  ]);
  ```

- [ ] **UsersManagement.jsx**
  ```jsx
  setBreadcrumb([
    { label: 'Users', path: '/admin/users', icon: 'Users' }
  ]);
  ```

### Priority 2 (Medium)
- [ ] **AdminDashboard.jsx**
  ```jsx
  setBreadcrumb([]);  // Dashboard is always first
  ```

- [ ] **CoordinatorDashboard.jsx**
  ```jsx
  setBreadcrumb([]);  // Dashboard is always first
  ```

### Priority 3 (Low)
- [ ] **Home.jsx**
- [ ] **Scripts.jsx**
- [ ] **ExaminerMarking.jsx**
- [ ] **Reports.jsx**
- [ ] **Settings.jsx**

## Template for Each Page

```jsx
import { useBreadcrumb } from '../context/BreadcrumbContext';

export default function PageName() {
  const { setBreadcrumb } = useBreadcrumb();

  useEffect(() => {
    // Set breadcrumb for this page
    setBreadcrumb([
      { label: 'Parent Page', path: '/admin/parent', icon: 'ParentIcon' },
      { label: 'Current Page', path: '/admin/current', icon: 'CurrentIcon' }
    ]);
  }, []);

  // ... rest of component
}
```

## Icon Reference

| Icon Name | Use Case |
|-----------|----------|
| `LayoutDashboard` | Dashboard |
| `Building2` | Universities |
| `Briefcase` | Departments |
| `BookOpen` | Subjects |
| `Calendar` | Sessions |
| `FileText` | Papers |
| `Layers` | Configuration |
| `Users` | Users/Examiners |
| `Home` | Home |
| `Settings` | Settings |
| `BarChart3` | Reports |
| `ClipboardList` | Scripts |
| `PenTool` | Marking |

## Common Patterns

### Single Level Page
```jsx
setBreadcrumb([
  { label: 'Page Name', path: '/admin/page', icon: 'IconName' }
]);
```

### Two Level Page
```jsx
setBreadcrumb([
  { label: 'Parent', path: '/admin/parent', icon: 'ParentIcon' },
  { label: 'Child', path: '/admin/child', icon: 'ChildIcon' }
]);
```

### Three Level Page
```jsx
setBreadcrumb([
  { label: 'Grandparent', path: '/admin/grandparent', icon: 'GrandparentIcon' },
  { label: 'Parent', path: '/admin/parent', icon: 'ParentIcon' },
  { label: 'Child', path: '/admin/child', icon: 'ChildIcon' }
]);
```

### With Query Parameters
```jsx
setBreadcrumb([
  { label: 'Parent', path: '/admin/parent', icon: 'ParentIcon' },
  { label: 'Child', path: `/admin/child?id=${encryptId(id)}`, icon: 'ChildIcon' }
]);
```

## Testing Checklist for Each Page

- [ ] Breadcrumb displays on page load
- [ ] All parent pages shown in breadcrumb
- [ ] Current page is last item (not clickable)
- [ ] Clicking parent breadcrumb navigates correctly
- [ ] Query parameters preserved when navigating
- [ ] No console errors
- [ ] Icons display correctly
- [ ] Breadcrumb responsive on mobile

## Verification Steps

1. **Visual Check**
   - [ ] Breadcrumb visible at top of page
   - [ ] Icons display correctly
   - [ ] Text is readable
   - [ ] Spacing looks good

2. **Navigation Check**
   - [ ] Click each breadcrumb item
   - [ ] Verify navigation works
   - [ ] Verify query params preserved
   - [ ] Verify page content loads

3. **Edge Cases**
   - [ ] Direct URL access (bookmark)
   - [ ] Browser back button
   - [ ] Page refresh
   - [ ] Mobile view

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Breadcrumb not showing | Check `setBreadcrumb()` is called in useEffect |
| Wrong icon | Verify icon name is valid lucide-react icon |
| Navigation not working | Check path matches route in App.jsx |
| Query params lost | Include query params in breadcrumb path |
| Breadcrumb not updating | Check useEffect dependencies |

## Completion Tracking

### Phase 1: Core Pages
- [ ] SessionProjectManagement ✅ (Done)
- [ ] SubjectConfig ✅ (Done)
- [ ] UniversityManagement
- [ ] DepartmentManagement
- [ ] SubjectManagement

### Phase 2: Management Pages
- [ ] PapersManagement
- [ ] UsersManagement
- [ ] AdminDashboard
- [ ] CoordinatorDashboard

### Phase 3: Examiner Pages
- [ ] Home
- [ ] Scripts
- [ ] ExaminerMarking
- [ ] Reports
- [ ] Settings

## Notes

- Always include parent pages in breadcrumb
- Use consistent icon names
- Test navigation thoroughly
- Keep breadcrumb paths simple
- Preserve query parameters when needed

## Questions?

Refer to:
- `UI/BREADCRUMB_FIX.md` - Detailed explanation of the fix
- `UI/BREADCRUMB_ENCRYPTION_IMPLEMENTATION.md` - Full implementation guide
- `UI/QUICK_REFERENCE.md` - Quick reference card
