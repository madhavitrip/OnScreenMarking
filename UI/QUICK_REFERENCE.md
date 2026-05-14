# Quick Reference: Breadcrumbs & Encryption

## Breadcrumb Navigation

### How It Works
- Automatically tracks user navigation from Dashboard
- Shows path: Dashboard > Current Page
- Clickable links to navigate back

### Example Flow
```
User clicks "Sessions & Projects" 
  ↓
Breadcrumb: Dashboard > Sessions & Projects
  ↓
User clicks "Configure" on a project
  ↓
Breadcrumb: Dashboard > Sessions & Projects > Subject Configuration
  ↓
User clicks "Sessions & Projects" in breadcrumb
  ↓
Back to Sessions & Projects page
```

## ID Encryption

### Why Encrypt IDs?
- Prevents casual inspection of sensitive IDs in URLs
- Makes URLs less predictable
- Adds a layer of security

### How to Use

#### 1. Encrypt ID in Link
```jsx
import { encryptId } from '../utils/encryption';

<a href={`/admin/subject-config?projectId=${encryptId(project.projectId)}`}>
  Configure
</a>
```

#### 2. Decrypt ID in Component
```jsx
import { decryptId } from '../utils/encryption';
import { useSearchParams } from 'react-router-dom';

const [searchParams] = useSearchParams();
const encryptedId = searchParams.get('projectId');
const projectId = encryptedId ? decryptId(encryptedId) : null;
```

## Common Tasks

### Add Breadcrumb to New Route

1. Add route to `BreadcrumbContext.jsx`:
```jsx
const routeLabels = {
  '/admin/my-page': { label: 'My Page', icon: 'BookOpen' },
};
```

2. Breadcrumb automatically appears on that page

### Encrypt Multiple IDs

```jsx
// In link
href={`/page?id1=${encryptId(val1)}&id2=${encryptId(val2)}`}

// In component
const id1 = decryptId(searchParams.get('id1'));
const id2 = decryptId(searchParams.get('id2'));

// Or use helper
const { id1, id2 } = getDecryptedParams(searchParams, ['id1', 'id2']);
```

### Handle Missing IDs

```jsx
// Safe way
const projectId = encryptedId ? decryptId(encryptedId) : null;

// In JSX
{selectedSubject?.subjectName || 'Subject'}
```

## Files Reference

| File | Purpose |
|------|---------|
| `UI/src/utils/encryption.js` | Encryption/decryption functions |
| `UI/src/context/BreadcrumbContext.jsx` | Breadcrumb state management |
| `UI/src/components/Breadcrumb.jsx` | Breadcrumb display component |
| `UI/src/components/Layout.jsx` | Includes breadcrumb in layout |
| `UI/src/App.jsx` | Wraps app with BreadcrumbProvider |

## Encryption Functions

```jsx
// Encrypt a single ID
encryptId(5) // Returns: "MzQyMTU0"

// Decrypt an ID
decryptId("MzQyMTU0") // Returns: "5"

// Create encrypted URL params
createEncryptedParams({ projectId: 5, subjectId: 10 })
// Returns: "projectId=MzQyMTU0&subjectId=MzQyMTU1"

// Get decrypted params from URL
getDecryptedParams(searchParams, ['projectId', 'subjectId'])
// Returns: { projectId: "5", subjectId: "10" }
```

## Breadcrumb Icons

Available icons for breadcrumbs:
- `LayoutDashboard` - Dashboard
- `Building2` - Universities
- `Briefcase` - Departments
- `BookOpen` - Subjects
- `Calendar` - Sessions
- `FileText` - Papers
- `Layers` - Configuration
- `Users` - Users

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Breadcrumb not showing | Add route to `routeLabels` in BreadcrumbContext |
| ID not decrypting | Check import path and SECRET_KEY match |
| Navigation not working | Verify route path in breadcrumb matches App.jsx |
| Null reference error | Use optional chaining: `obj?.property` |

## Best Practices

✅ **Do:**
- Always encrypt IDs in URLs
- Use optional chaining for potentially null values
- Add new routes to breadcrumb mapping
- Test breadcrumb navigation

❌ **Don't:**
- Pass unencrypted sensitive IDs in URLs
- Forget to decrypt IDs in components
- Store sensitive data in URLs
- Modify SECRET_KEY without updating all instances

## Next Steps

1. Review `BREADCRUMB_ENCRYPTION_IMPLEMENTATION.md` for details
2. Follow `MIGRATION_GUIDE_ENCRYPTION.md` to add to other pages
3. Test breadcrumb navigation
4. Test ID encryption/decryption
