# Migration Guide: Adding Encryption to Other Pages

This guide shows how to apply the encryption and breadcrumb pattern to other pages in the application.

## Step-by-Step Migration

### Step 1: Update Links to Use Encryption

**Before:**
```jsx
<a href={`/admin/papers?projectId=${project.projectId}`}>
  View Papers
</a>
```

**After:**
```jsx
import { encryptId } from '../utils/encryption';

<a href={`/admin/papers?projectId=${encryptId(project.projectId)}`}>
  View Papers
</a>
```

### Step 2: Update Component to Decrypt IDs

**Before:**
```jsx
export default function PapersManagement() {
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('projectId');
  
  useEffect(() => {
    if (projectId) {
      fetchPapers(projectId);
    }
  }, [projectId]);
}
```

**After:**
```jsx
import { useSearchParams } from 'react-router-dom';
import { decryptId } from '../utils/encryption';

export default function PapersManagement() {
  const [searchParams] = useSearchParams();
  const encryptedProjectId = searchParams.get('projectId');
  const projectId = encryptedProjectId ? decryptId(encryptedProjectId) : null;
  
  useEffect(() => {
    if (projectId) {
      fetchPapers(projectId);
    }
  }, [projectId]);
}
```

### Step 3: Add Route to Breadcrumb Mapping

Edit `UI/src/context/BreadcrumbContext.jsx`:

```jsx
const routeLabels = {
  '/admin/dashboard': { label: 'Dashboard', icon: 'LayoutDashboard' },
  '/admin/universities': { label: 'Universities', icon: 'Building2' },
  '/admin/masters': { label: 'Departments', icon: 'Briefcase' },
  '/admin/subjects': { label: 'Subjects', icon: 'BookOpen' },
  '/admin/sessions': { label: 'Sessions & Projects', icon: 'Calendar' },
  '/admin/papers': { label: 'Papers', icon: 'FileText' },
  '/admin/subject-config': { label: 'Subject Configuration', icon: 'Layers' },
  '/admin/users': { label: 'Users', icon: 'Users' },
  // ADD NEW ROUTES HERE
  '/admin/examiners': { label: 'Examiners', icon: 'Users' },
  '/admin/scripts': { label: 'Scripts', icon: 'FileText' },
};
```

## Common Patterns

### Pattern 1: Single ID Parameter

**Use Case:** Viewing details of a single item

```jsx
// In list component
<a href={`/admin/subject-detail?subjectId=${encryptId(subject.subjectId)}`}>
  {subject.name}
</a>

// In detail component
const [searchParams] = useSearchParams();
const encryptedId = searchParams.get('subjectId');
const subjectId = encryptedId ? decryptId(encryptedId) : null;
```

### Pattern 2: Multiple ID Parameters

**Use Case:** Nested resources (e.g., Project > Subject > Paper)

```jsx
// In component
import { encryptId } from '../utils/encryption';

const projectId = 5;
const subjectId = 10;
const paperId = 15;

<a href={`/admin/paper-detail?projectId=${encryptId(projectId)}&subjectId=${encryptId(subjectId)}&paperId=${encryptId(paperId)}`}>
  View Paper
</a>

// In detail component
const [searchParams] = useSearchParams();
const projectId = searchParams.get('projectId') ? decryptId(searchParams.get('projectId')) : null;
const subjectId = searchParams.get('subjectId') ? decryptId(searchParams.get('subjectId')) : null;
const paperId = searchParams.get('paperId') ? decryptId(searchParams.get('paperId')) : null;
```

### Pattern 3: Using Helper Function

**For cleaner code with multiple parameters:**

```jsx
import { getDecryptedParams } from '../utils/encryption';

export default function PaperDetail() {
  const [searchParams] = useSearchParams();
  const { projectId, subjectId, paperId } = getDecryptedParams(
    searchParams,
    ['projectId', 'subjectId', 'paperId']
  );
  
  // Use projectId, subjectId, paperId...
}
```

## Pages to Migrate

### Priority 1 (High Security)
- [ ] `/admin/papers` - Contains exam papers
- [ ] `/admin/subject-config` - Contains subject configuration
- [ ] `/admin/users` - Contains user information

### Priority 2 (Medium Security)
- [ ] `/admin/masters` - Department management
- [ ] `/admin/subjects` - Subject management
- [ ] `/admin/sessions` - Session management

### Priority 3 (Low Security)
- [ ] `/admin/universities` - University management
- [ ] `/admin/dashboard` - Dashboard (no sensitive IDs)

## Testing Checklist

For each migrated page:

- [ ] Links use `encryptId()` for all ID parameters
- [ ] Component decrypts IDs using `decryptId()`
- [ ] Route is added to `routeLabels` in BreadcrumbContext
- [ ] Breadcrumb displays correctly
- [ ] Navigation works (clicking breadcrumb goes back)
- [ ] Query parameters are preserved
- [ ] No console errors
- [ ] Encrypted IDs are different each time (if using random salt)

## Example: Complete Migration

### Before (UniversityManagement.jsx)
```jsx
export default function UniversityManagement() {
  const [universities, setUniversities] = useState([]);
  
  return (
    <div>
      {universities.map(uni => (
        <div key={uni.universityId}>
          <h3>{uni.universityName}</h3>
          <a href={`/admin/masters?universityId=${uni.universityId}`}>
            View Departments
          </a>
        </div>
      ))}
    </div>
  );
}
```

### After (UniversityManagement.jsx)
```jsx
import { encryptId } from '../utils/encryption';

export default function UniversityManagement() {
  const [universities, setUniversities] = useState([]);
  
  return (
    <div>
      {universities.map(uni => (
        <div key={uni.universityId}>
          <h3>{uni.universityName}</h3>
          <a href={`/admin/masters?universityId=${encryptId(uni.universityId)}`}>
            View Departments
          </a>
        </div>
      ))}
    </div>
  );
}
```

### Before (DepartmentManagement.jsx)
```jsx
export default function DepartmentManagement() {
  const [searchParams] = useSearchParams();
  const universityId = searchParams.get('universityId');
  
  useEffect(() => {
    if (universityId) {
      fetchDepartments(universityId);
    }
  }, [universityId]);
}
```

### After (DepartmentManagement.jsx)
```jsx
import { decryptId } from '../utils/encryption';

export default function DepartmentManagement() {
  const [searchParams] = useSearchParams();
  const encryptedUniversityId = searchParams.get('universityId');
  const universityId = encryptedUniversityId ? decryptId(encryptedUniversityId) : null;
  
  useEffect(() => {
    if (universityId) {
      fetchDepartments(universityId);
    }
  }, [universityId]);
}
```

## Troubleshooting Migration

### Issue: "decryptId is not a function"
**Solution:** Ensure import statement is correct:
```jsx
import { decryptId } from '../utils/encryption';
```

### Issue: Encrypted ID not decrypting correctly
**Solution:** Check that:
1. ID is encrypted before being added to URL
2. Decryption uses the same SECRET_KEY
3. No URL encoding/decoding issues

### Issue: Breadcrumb not showing
**Solution:** 
1. Add route to `routeLabels` in BreadcrumbContext
2. Verify route path matches exactly
3. Check that BreadcrumbProvider wraps the app

## Performance Considerations

- Encryption/decryption is fast (< 1ms for typical IDs)
- No performance impact on page load
- Consider caching decrypted IDs if used multiple times

## Security Notes

- Current implementation uses XOR cipher (suitable for obfuscation)
- For sensitive data, upgrade to AES encryption
- Always use HTTPS in production
- Never store sensitive data in URLs (use session storage instead)

## Questions?

Refer to:
- `UI/BREADCRUMB_ENCRYPTION_IMPLEMENTATION.md` - Full implementation details
- `UI/src/utils/encryption.js` - Encryption utility functions
- `UI/src/context/BreadcrumbContext.jsx` - Breadcrumb context setup
