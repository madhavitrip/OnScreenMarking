# Script Allocation - User Guide

## Quick Start

### Prerequisites
- You must be an Admin or Coordinator
- Examiners must have subject expertise assigned
- Papers must be linked to subjects
- Scripts must be created and in "pending" status

### Accessing Script Allocation

1. Go to **Admin Dashboard** or **Coordinator Dashboard**
2. Click on **Script Allocation** card (blue card with lightning bolt icon)
3. Or navigate directly to `/admin/allocate-scripts`

## Step-by-Step Allocation Process

### Step 1: Select Project
```
1. View all available projects
2. Click on the project containing the papers you want to allocate
3. The system will load all papers for that project
```

**Example**: Select "Semester 1 - 2024" project

### Step 2: Select Paper
```
1. View all papers in the selected project
2. Click on the paper for which you want to allocate scripts
3. The system will:
   - Display paper details (code, name, max marks, subjects)
   - Load all pending scripts for that paper
   - Fetch examiners with expertise in the paper's subjects
```

**Example**: Select "Mathematics Paper 1"
- Associated Subjects: Mathematics, Applied Mathematics
- Pending Scripts: 50
- Available Examiners: 8 (all with expertise in Math or Applied Math)

### Step 3: Allocate Scripts

#### View Paper Information
- **Paper Name**: Full name of the paper
- **Paper Code**: Unique identifier
- **Max Marks**: Total marks for the paper
- **Associated Subjects**: All subjects this paper covers

#### View Statistics
- **Pending Scripts**: Number of scripts waiting to be allocated
- **Allocated**: Number of scripts you've selected for allocation in this session
- **Subject Experts**: Number of examiners available for this paper

#### Allocate Each Script
```
For each script:
1. Look at the Script ID and Barcode
2. Click the "Assign to Examiner" dropdown
3. Select an examiner from the list
4. View the selected examiner's details:
   - Name and email
   - Subject expertise
   - Current allocation count
```

**Tips**:
- Look at "Allocated Count" to balance workload
- Check "Expertise" to ensure examiner is qualified
- You can change your selection anytime before clicking "Allocate"

#### Submit Allocations
```
1. Review all your selections
2. Click "Clear Selection" if you want to start over
3. Click "Allocate X Scripts" to submit
4. Wait for confirmation message
```

## Understanding the Examiner Panel

### Examiner Information
Each examiner card shows:

| Field | Meaning |
|-------|---------|
| **Name** | Full name of the examiner |
| **Email** | Contact email |
| **Expertise** | All subjects they're expert in (purple badges) |
| **Allocated Count** | How many scripts they already have allocated |

### Example
```
John Doe
john.doe@university.edu

Expertise: Mathematics, Applied Mathematics

3 scripts allocated
```

This means John has expertise in both Mathematics and Applied Mathematics, and already has 3 scripts allocated to him.

## Common Scenarios

### Scenario 1: Allocate All Scripts for a Paper
```
1. Select Project → "Semester 1"
2. Select Paper → "Mathematics Paper 1"
3. For each script, select an examiner
4. Click "Allocate 50 Scripts"
5. Confirm success message
```

### Scenario 2: Balance Workload
```
1. Look at "Allocated Count" for each examiner
2. Distribute scripts to examiners with lower counts
3. This ensures fair distribution of work
```

### Scenario 3: Allocate Only Some Scripts
```
1. Select scripts for allocation
2. Leave other scripts unselected
3. Click "Allocate X Scripts" (where X is your count)
4. Remaining scripts stay in "pending" status
```

### Scenario 4: Change Your Mind
```
1. Click "Clear Selection" to reset all choices
2. Start over with new selections
3. Or close the page without clicking "Allocate"
```

## Error Messages & Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| "No papers found for this project" | Project has no papers | Create papers first in Papers Management |
| "No pending scripts for this paper" | All scripts already allocated | Select a different paper |
| "No examiners available" | No examiners have expertise in paper's subjects | Assign expertise to examiners first |
| "Please select an examiner for at least one script" | You didn't select any examiners | Choose an examiner for at least one script |
| "Script already allocated" | Script was allocated by someone else | Refresh the page to see latest status |

## Best Practices

### 1. Plan Before Allocating
- Know how many scripts need allocation
- Check examiner availability and expertise
- Plan workload distribution

### 2. Balance Workload
- Look at "Allocated Count" for each examiner
- Try to distribute scripts evenly
- Consider examiner expertise level

### 3. Verify Information
- Check paper subjects match examiner expertise
- Confirm script count before allocating
- Review examiner details before selection

### 4. Document Your Work
- Note which examiners got which papers
- Keep track of allocation dates
- Monitor progress through marking phase

### 5. Handle Issues Promptly
- If an examiner is unavailable, reassign their scripts
- If a script is allocated incorrectly, cancel and reallocate
- Communicate with examiners about their allocations

## After Allocation

### What Happens Next
1. **Scripts Status Changes**: From "pending" to "allocated"
2. **Examiners Notified**: They can see allocated scripts in their dashboard
3. **Marking Begins**: Examiners can start marking their allocated scripts
4. **Progress Tracking**: Monitor marking progress in Reports

### Monitoring Allocations
- Go to **Reports** to see allocation status
- Check **Examiner Dashboard** to see their progress
- Use **Allocation History** to track changes

## Troubleshooting

### Issue: Examiners Not Showing Up
**Solution**: 
- Ensure examiners have expertise assigned for the paper's subjects
- Go to **User Management** → Select examiner → Add expertise
- Refresh the allocation page

### Issue: Scripts Not Showing Up
**Solution**:
- Ensure scripts are created and in "pending" status
- Check that scripts are linked to the correct paper
- Verify paper is linked to correct subjects

### Issue: Can't Allocate Scripts
**Solution**:
- Ensure you're logged in as Admin or Coordinator
- Check that you have permission to allocate
- Try refreshing the page
- Contact system administrator if issue persists

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Tab` | Move between form fields |
| `Enter` | Select dropdown option |
| `Escape` | Close dropdown |
| `Ctrl+R` | Refresh page |

## Support

For issues or questions:
1. Check this guide first
2. Contact your system administrator
3. Report bugs with screenshot and steps to reproduce
