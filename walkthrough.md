# Synchronization of UI and Centralized Search/Pagination

We have successfully synchronized the UI pages of **Departments**, **Courses**, and **Subjects** to share a modern premium slate-style aesthetic. We introduced a centralized table hook and pagination UI component, and integrated them seamlessly across all three sections.

---

## What We Accomplished

### 1. Centralized Table Service Hook (`tableService.js`)
We created a custom React hook `useTable` and a reusable component `TablePagination` inside [tableService.js](file:///d:/OnScreenMarking/UI/src/services/tableService.js).
- **`useTable`**: Automatically manages loading states, errors, query parameters (`page`, `pageSize`, `search`), extra filters, and debounces search entries (300ms) before firing backend request triggers.
- **`TablePagination`**: Renders a premium, responsive pagination panel showing entries count, page size selection, page navigation numbering (with auto ellipses), and dynamic next/prev buttons.

### 2. Synced UI Redesign (Slate-Card Aesthetic)
We updated all three management pages to render unified aesthetic layouts matching the premium slate container specs:
- **[DepartmentManagement.jsx](file:///d:/OnScreenMarking/UI/src/pages/DepartmentManagement.jsx)**: Refactored to use standard custom shadow borders, beautiful building & layers iconography, dynamic action buttons, and full debounced search pagination.
- **[CourseManagement.jsx](file:///d:/OnScreenMarking/UI/src/pages/CourseManagement.jsx)**: Modernized to load data seamlessly via `useTable`, querying list selections (like departments and subjects) using `{ pageSize: 0 }` to avoid drop-down select truncation.
- **[SubjectManagement.jsx](file:///d:/OnScreenMarking/UI/src/pages/SubjectManagement.jsx)**: Upgraded from the previous basic layout to the unified slate panel structure, incorporating debounced query inputs and native page numbering.

### 3. Upgraded API Service Layer
We expanded standard list functions in API services to build and append search/paging query strings:
- **[departmentService.js](file:///d:/OnScreenMarking/UI/src/services/departmentService.js)**
- **[courseService.js](file:///d:/OnScreenMarking/UI/src/services/courseService.js)**
- **[subjectService.js](file:///d:/OnScreenMarking/UI/src/services/subjectService.js)**

---

## Verification Plan

### Automated Build Checks
- **Backend API**: The controllers were updated to support paging and search criteria with full backward compatibility (defaulting to returning all records when `pageSize <= 0`).
- **Frontend App**: All imports are clean and compile successfully.

### Manual Testing Guidelines
1. **Paging Controls**: Select different page size values (e.g., `5 per page`, `10 per page`) and navigate between pages to ensure seamless state updates.
2. **Debounced Search**: Type in the search input bars and verify the grid updates dynamically without page reload.
3. **Modals & Synchronization**: Add a new subject or course through modals and verify that the grid auto-refreshes to reflect your changes correctly.
