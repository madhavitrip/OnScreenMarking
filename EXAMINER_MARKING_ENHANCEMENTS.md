# Examiner Marking Interface Enhancements

## Overview
Enhanced the `ExaminerMarking.jsx` component with a folder selection feature and improved UI layout for on-screen marking.

## New Features

### 1. Folder Selection Modal
- **Button**: "Select from Folder" button in the top-right corner (purple theme)
- **Functionality**: Opens a modal dialog allowing examiners to browse and select scripts from a folder
- **Features**:
  - View all available scripts with file size and date information
  - Select individual scripts or use "Select All" checkbox
  - Visual feedback with purple highlight for selected items
  - Shows count of selected scripts (e.g., "3 of 5 selected")
  - Copy selected scripts with a single click

### 2. Modal Interface
The folder selection modal includes:
- **Header**: Folder icon with title and close button
- **Content Area**: Scrollable list of scripts with:
  - Checkbox for selection
  - Script filename
  - File size and date metadata
  - Hover effects and visual feedback
- **Footer**: 
  - Selection counter
  - Cancel button
  - Copy Selected button (disabled when no scripts selected)

### 3. Script Selection Logic
- `toggleScriptSelection()`: Toggle individual script selection
- `handleSelectAll()`: Select/deselect all scripts at once
- `handleCopyScripts()`: Copy selected scripts and show confirmation

## UI/UX Improvements

### Color Scheme
- **Primary Actions**: Blue (Save, Submit)
- **Folder Operations**: Purple (Select from Folder, Copy)
- **Success**: Green (Submit Marks)
- **Neutral**: Gray (Reset, Cancel)

### Visual Feedback
- Selected scripts highlighted with purple border and background
- Hover effects on interactive elements
- Disabled state styling for buttons
- Smooth transitions and animations

### Layout
- "Select from Folder" button positioned at top-right for easy access
- Modal uses flexbox layout for responsive design
- Scrollable content area for handling many scripts
- Clear separation between header, content, and footer

## Mock Data
The component includes mock data for 5 sample scripts:
```javascript
[
  { id: 1, name: 'OSM-2024-001.pdf', size: '2.4 MB', date: '2024-05-20' },
  { id: 2, name: 'OSM-2024-002.pdf', size: '2.1 MB', date: '2024-05-20' },
  { id: 3, name: 'OSM-2024-003.pdf', size: '2.8 MB', date: '2024-05-20' },
  { id: 4, name: 'OSM-2024-004.pdf', size: '2.3 MB', date: '2024-05-20' },
  { id: 5, name: 'OSM-2024-005.pdf', size: '2.5 MB', date: '2024-05-20' },
]
```

## State Management
New state variables added:
- `showFolderModal`: Boolean to control modal visibility
- `selectedScripts`: Array of selected script IDs
- `folderScripts`: Array of available scripts in the folder

## Integration Points

### Future API Integration
To connect with the backend, replace the mock data with API calls:

1. **Fetch scripts from folder**:
   ```javascript
   useEffect(() => {
     // Call API to fetch scripts from folder
     // setFolderScripts(response.data);
   }, []);
   ```

2. **Copy scripts**:
   ```javascript
   const handleCopyScripts = async () => {
     // Call API to copy selected scripts
     // await api.copyScripts(selectedScripts);
   };
   ```

## Files Modified
- `d:\OnScreenMarking\UI\src\pages\ExaminerMarking.jsx`

## Dependencies
- Lucide React icons: `Folder`, `Copy`, `X` (already in use)
- React hooks: `useState`, `useEffect` (already in use)

## Testing Checklist
- [ ] Click "Select from Folder" button opens modal
- [ ] Select individual scripts
- [ ] "Select All" checkbox selects/deselects all scripts
- [ ] Visual feedback shows selected items
- [ ] Copy button is disabled when no scripts selected
- [ ] Copy button shows correct count
- [ ] Cancel button closes modal without copying
- [ ] Modal closes after successful copy
- [ ] Existing marking functionality still works

## Next Steps
1. Connect to backend API for fetching actual scripts from folder
2. Implement actual copy/import functionality
3. Add error handling for API calls
4. Add loading states during API operations
5. Consider adding search/filter functionality for large script lists
