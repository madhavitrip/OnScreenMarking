# Session & Project Management - Redesign

## Overview

The SessionProjectManagement page has been redesigned to provide a better workflow:
1. **Sessions displayed first** - All sessions shown as selectable cards
2. **Select a session** - Click on a session to view its projects
3. **Projects filtered** - Only projects for the selected session are displayed
4. **University scoped** - If accessed from a university card, projects are filtered by that university

## New Workflow

### Before
- Tab-based interface (Sessions tab / Projects tab)
- All projects shown regardless of session
- No clear relationship between sessions and projects
- Confusing navigation

### After
- Sessions displayed as clickable cards
- Select a session to view its projects
- Clear visual hierarchy
- Intuitive workflow

## User Flow

```
1. User opens Sessions & Projects page
   ↓
2. Sees all available sessions as cards
   ↓
3. Clicks on a session to select it
   ↓
4. Selected session highlighted in blue
   ↓
5. Projects section appears below
   ↓
6. Shows only projects for that session
   ↓
7. Can add/edit projects for selected session
   ↓
8. Can click on another session to switch
```

## Page Layout

### Header
```
Sessions & Projects
Select a session to view and manage its projects
```

### Sessions Section
```
Sessions                                    [+ Add Session]

[Session 1]  [Session 2]  [Session 3]
[Session 4]  [Session 5]  [Session 6]

Each session card shows:
- Session name
- Active/Inactive status
- Edit button
- Clickable to select
```

### Projects Section (appears when session selected)
```
Projects for [Selected Session Name]        [+ Add Project]

[Project 1]  [Project 2]  [Project 3]
[Project 4]  [Project 5]  [Project 6]

Table showing:
- Project name
- Status
- Edit and Papers buttons
```

## Features

### Session Management
- ✅ View all sessions as cards
- ✅ Click to select a session
- ✅ Add new sessions
- ✅ Edit existing sessions
- ✅ Visual feedback for selected session (blue border)

### Project Management
- ✅ View projects for selected session only
- ✅ Add new projects to selected session
- ✅ Edit existing projects
- ✅ View papers for each project
- ✅ Filter by university if accessed from university card

### University Scoping
- ✅ If accessed with `?universityId=X`, projects filtered by that university
- ✅ New projects automatically assigned to the university
- ✅ Works seamlessly with admin dashboard

## Component Structure

### State Management
```javascript
const [sessions, setSessions] = useState([]);
const [projects, setProjects] = useState([]);
const [selectedSessionId, setSelectedSessionId] = useState(null);
const [showSessionForm, setShowSessionForm] = useState(false);
const [showProjectForm, setShowProjectForm] = useState(false);
const [editingId, setEditingId] = useState(null);
const [formData, setFormData] = useState({...});
const [loading, setLoading] = useState(false);
const [error, setError] = useState('');
```

### Key Functions
- `fetchSessions()` - Load all sessions
- `fetchProjects(sessionId)` - Load projects for selected session
- `handleSessionSubmit()` - Create/update session
- `handleProjectSubmit()` - Create/update project
- `handleEditSession()` - Edit session
- `handleEditProject()` - Edit project
- `handleCancel()` - Cancel form

## API Integration

### Endpoints Used
```
GET /api/session
  - Fetch all sessions

GET /api/project
  - Fetch all projects (filtered client-side)

POST /api/session
  - Create new session

PUT /api/session/{id}
  - Update session

POST /api/project
  - Create new project

PUT /api/project/{id}
  - Update project
```

### URL Parameters
```
?universityId=1
  - Filters projects by university
  - Pre-fills university in project form
```

## Responsive Design

### Desktop (> 1024px)
- Sessions: 3 columns
- Projects: Full width table

### Tablet (768px - 1024px)
- Sessions: 2 columns
- Projects: Full width table

### Mobile (< 768px)
- Sessions: 1 column
- Projects: Full width table (scrollable)

## Visual Design

### Session Cards
- Compact design (p-4)
- Border changes on selection (border-2)
- Background changes on selection (bg-blue-50)
- Hover effect (border-blue-300)
- Status badge (green/red)
- Edit button

### Project Table
- Clean, minimal design
- Hover rows (bg-gray-50)
- Status badges
- Action buttons (Edit, Papers)
- Responsive scrolling

### Forms
- Compact forms (p-4)
- Minimal spacing
- Clear labels
- Submit and Cancel buttons

## Benefits

1. **Clear Workflow** - Users understand the session → project relationship
2. **Intuitive** - Click to select, see results immediately
3. **Efficient** - No tab switching needed
4. **Organized** - Projects grouped by session
5. **Scalable** - Works with many sessions and projects
6. **Mobile Friendly** - Responsive design
7. **University Scoped** - Works with admin dashboard

## Testing Checklist

- [ ] Sessions load correctly
- [ ] Can select a session
- [ ] Selected session highlighted in blue
- [ ] Projects load for selected session
- [ ] Projects filtered by university if provided
- [ ] Can add new session
- [ ] Can edit session
- [ ] Can add new project
- [ ] Can edit project
- [ ] Can view papers for project
- [ ] Forms validate correctly
- [ ] Error messages display
- [ ] Loading states work
- [ ] Empty states display
- [ ] Responsive on mobile
- [ ] Responsive on tablet
- [ ] Responsive on desktop

## URL Patterns

### From Admin Dashboard
```
/admin/sessions?universityId=1
  - Shows sessions
  - Projects filtered by university 1

/admin/projects?universityId=1
  - Shows sessions
  - Projects filtered by university 1
```

### Direct Access
```
/admin/sessions
  - Shows all sessions
  - Shows all projects (no filtering)

/admin/projects
  - Shows all sessions
  - Shows all projects (no filtering)
```

## Future Enhancements

1. **Search/Filter** - Search sessions by name
2. **Sort** - Sort sessions by date, name, status
3. **Bulk Actions** - Select multiple sessions
4. **Drag & Drop** - Drag projects between sessions
5. **Quick Stats** - Show project count per session
6. **Favorites** - Mark frequently used sessions
7. **Export** - Export session/project data
8. **Import** - Import session/project data

## Migration Notes

- Old tab-based interface removed
- New card-based session selection
- Projects now dependent on session selection
- All existing functionality preserved
- No breaking changes to API
- Backward compatible

## Performance

- Single API call for sessions
- Single API call for projects (filtered client-side)
- Efficient filtering
- Minimal re-renders
- Smooth transitions

## Accessibility

- Semantic HTML
- Proper heading hierarchy
- ARIA labels where needed
- Keyboard navigation support
- Color contrast compliance
- Focus indicators

## Browser Support

- Chrome/Edge: ✅ Fully supported
- Firefox: ✅ Fully supported
- Safari: ✅ Fully supported
- IE11: ❌ Not supported

## Files Modified

- `UI/src/pages/SessionProjectManagement.jsx` - Complete redesign

## Summary

The new SessionProjectManagement page provides a much more intuitive workflow for managing sessions and projects. Users can easily see all sessions, select one, and manage its projects. The design is clean, responsive, and integrates seamlessly with the admin dashboard's university scoping.
