# Requirements Document: Examiner-Project Assignment System

## Introduction

The system uses a two-level examiner assignment hierarchy:

1. **Master Level (ExaminerExpertise)**: Examiners are associated with Subjects to define their qualifications/expertise. This is a master data setup that defines what subjects an examiner is qualified to mark.

2. **Script Level (Allocation)**: Examiners are allocated to specific scripts to mark them. Since scripts are automatically attached to papers, and papers belong to projects, examiners are indirectly linked to projects through script allocations. Multiple examiners can be allocated to the same script for quality assurance or consensus marking.

This two-level hierarchy is simple and efficient: examiners define their subject expertise at the master level, and then are assigned to mark specific scripts. The project linkage is implicit through the script-paper-project relationship.

## Glossary

- **Examiner**: A User with UserType "examiner" who marks student scripts
- **Admin**: A User with UserType "admin" who has system-wide management permissions
- **Coordinator**: A User with UserType "coordinator" who manages projects and assignments within their university
- **Project**: A container for papers and subjects within a specific Session and University
- **Session**: An academic session (e.g., Spring 2024, Fall 2024)
- **University**: The institution managing the examination system
- **Department**: An organizational unit within a University
- **Subject**: A course or subject within a Department
- **Paper**: An examination paper for a Subject within a Project
- **ExaminerExpertise**: A record linking an Examiner to a Subject at the master level, indicating the examiner's qualification/expertise in that subject
- **Allocation**: A record linking an Examiner to a Script, indicating the examiner is assigned to mark that script
- **Script**: An examination script that belongs to a Paper, which belongs to a Project (Script → Paper → Project)
- **Implicit Project Link**: Examiners are indirectly linked to projects through script allocations

## Requirements

### Requirement 1: ExaminerExpertise Model Remains Subject-Based (Master Level)

**User Story:** As a system architect, I want the ExaminerExpertise model to remain subject-based at the master level, so that examiners can define their qualifications/expertise in specific subjects.

#### Acceptance Criteria

1. THE ExaminerExpertise model SHALL maintain its current structure with ExaminerId and SubjectId foreign keys
2. THE ExaminerExpertise model SHALL represent master-level subject expertise/qualifications
3. THE ExaminerExpertise model SHALL retain IsActive, CreatedAt, and Id properties
4. WHEN an examiner is assigned to a project, THE system SHALL validate that the examiner has expertise in at least one subject within that project
5. THE ExaminerExpertiseController endpoints SHALL continue to manage subject-based expertise assignments

### Requirement 2: Create ProjectAllocation Model for Project-Level Assignments

**User Story:** As a system architect, I want a new ProjectAllocation model to assign examiners to projects, so that examiners can be assigned to specific projects based on their subject expertise.

#### Acceptance Criteria

1. THE ProjectAllocation model SHALL have ExaminerId and ProjectId foreign keys
2. THE ProjectAllocation model SHALL maintain a unique constraint on (ExaminerId, ProjectId) to prevent duplicate assignments
3. THE ProjectAllocation model SHALL include IsActive and CreatedAt properties
4. THE ProjectAllocation model SHALL include navigation properties to Examiner and Project
5. WHEN a ProjectAllocation is created, THE system SHALL validate that the examiner has expertise in at least one subject within the project
6. THE database migration SHALL create the ProjectAllocation table with appropriate constraints

### Requirement 3: Retrieve Examiner's Assigned Projects

### Requirement 3: Retrieve Examiner's Assigned Projects

**User Story:** As an examiner, I want to retrieve the list of projects I'm assigned to, so that I can see which projects I can mark scripts for.

#### Acceptance Criteria

1. WHEN an examiner requests their assigned projects, THE ProjectAllocationController SHALL return a list of active project assignments
2. THE endpoint SHALL return only assignments where IsActive is true
3. THE endpoint SHALL include project details (ProjectId, ProjectName, SessionId, UniversityId)
4. THE endpoint SHALL be accessible to examiners and coordinators
5. IF the examiner has no active assignments, THE endpoint SHALL return an empty list

### Requirement 4: Retrieve Project's Assigned Examiners

**User Story:** As a coordinator, I want to retrieve the list of examiners assigned to a project, so that I can manage project assignments.

#### Acceptance Criteria

1. WHEN a coordinator requests examiners for a project, THE ProjectAllocationController SHALL return a list of active examiner assignments
2. THE endpoint SHALL return only assignments where IsActive is true
3. THE endpoint SHALL include examiner details (ExaminerId, Name, Email, UserType)
4. THE endpoint SHALL be accessible to admins and coordinators
5. IF the project has no active assignments, THE endpoint SHALL return an empty list

### Requirement 5: Assign Examiner to Project with Subject Expertise Validation

**User Story:** As a coordinator, I want to assign an examiner to a project, so that the examiner can mark scripts for all subjects in that project they have expertise in.

#### Acceptance Criteria

1. WHEN a coordinator submits an assignment request with ExaminerId and ProjectId, THE ProjectAllocationController SHALL validate that the examiner has expertise in at least one subject within the project
2. THE endpoint SHALL validate that the examiner exists and is active
3. THE endpoint SHALL validate that the project exists and is active
4. IF an assignment already exists for the examiner and project, THE endpoint SHALL reactivate it (set IsActive to true) instead of creating a duplicate
5. THE endpoint SHALL return a success response with the assignment details
6. THE endpoint SHALL be restricted to admins and coordinators
7. IF validation fails (no subject expertise), THE endpoint SHALL return a descriptive error message
8. IF the examiner has no subject expertise, THE endpoint SHALL return a 400 error with message "Examiner must have expertise in at least one subject within this project"

### Requirement 6: Deactivate Examiner-Project Assignment

**User Story:** As a coordinator, I want to deactivate an examiner's assignment to a project, so that the examiner can no longer mark scripts for that project.

#### Acceptance Criteria

1. WHEN a coordinator requests to deactivate an assignment, THE ProjectAllocationController SHALL set IsActive to false for the specified assignment
2. THE endpoint SHALL validate that the assignment exists
3. THE endpoint SHALL return a success response
4. THE endpoint SHALL be restricted to admins and coordinators
5. IF the assignment does not exist, THE endpoint SHALL return a 404 error

### Requirement 7: Support Multiple Examiners per Script (Allocation Model)

**User Story:** As a coordinator, I want to assign multiple examiners to a single script, so that scripts can be marked by multiple examiners for quality assurance or consensus marking.

#### Acceptance Criteria

1. THE Allocation model SHALL support one-to-many relationship (one Script → many Examiners)
2. WHEN a script is allocated to examiners, THE system SHALL allow multiple Allocation records for the same script with different examiners
3. THE Allocation model SHALL maintain ExaminerId, ScriptId, and status tracking
4. WHEN allocating an examiner to a script, THE system SHALL validate that the examiner is assigned to the project containing the script's paper
5. THE system SHALL allow tracking of which examiners have marked which scripts
6. THE Allocation model is already implemented and functional

### Requirement 8: Create ExaminerExpertiseManagement Page (Master Level)

**User Story:** As an admin or coordinator, I want a dedicated management page to assign subjects to examiners at the master level, so that I can define which subjects each examiner is qualified to mark.

#### Acceptance Criteria

1. THE ExaminerExpertiseManagement page SHALL display a list of examiners for the coordinator's university
2. THE page SHALL allow selection of an examiner to view and manage their subject expertise
3. THE page SHALL display a list of available subjects (filtered by university departments)
4. THE page SHALL provide a UI to assign subjects to the selected examiner
5. THE page SHALL display currently assigned subjects with their assignment status
6. THE page SHALL allow toggling of assignment status (activate/deactivate) for each subject
7. THE page SHALL prevent duplicate subject assignments through UI validation
8. THE page SHALL display success/error messages for assignment operations
9. THE page SHALL be accessible only to admins and coordinators
10. THE page SHALL be responsive and user-friendly

### Requirement 9: Create ProjectAllocationManagement Page (Project Level)

**User Story:** As a coordinator, I want a dedicated management page to assign examiners to projects, so that I can efficiently manage which examiners can mark scripts in each project.

#### Acceptance Criteria

1. THE ProjectAllocationManagement page SHALL display a list of projects for the coordinator's university
2. THE page SHALL allow selection of a project to view and manage its assigned examiners
3. THE page SHALL display a list of available examiners (filtered by university and active status)
4. THE page SHALL only show examiners who have subject expertise relevant to the project
5. THE page SHALL provide a UI to assign examiners to the selected project
6. THE page SHALL display currently assigned examiners with their assignment status
7. THE page SHALL allow toggling of assignment status (activate/deactivate) for each examiner
8. THE page SHALL prevent duplicate assignments through UI validation
9. THE page SHALL display success/error messages for assignment operations
10. THE page SHALL be accessible only to admins and coordinators
11. THE page SHALL be responsive and user-friendly

### Requirement 10: Update Examiner Home Page to Show Assigned Projects

**User Story:** As an examiner, I want my home page to display only the projects I'm assigned to, so that I can quickly see which projects I need to mark scripts for.

#### Acceptance Criteria

1. WHEN an examiner loads their home page, THE Home.jsx component SHALL fetch their assigned projects from the API
2. THE page SHALL display only active project assignments
3. THE page SHALL show project details (ProjectName, Session, University)
4. THE page SHALL replace hardcoded dashboard data with dynamic data from the API
5. IF the examiner has no assigned projects, THE page SHALL display a message indicating no assignments
6. THE page SHALL be responsive and display projects in a clear, organized manner

### Requirement 11: Create ProjectAllocationController Endpoints

**User Story:** As a developer, I want the ProjectAllocationController endpoints to manage examiner-project assignments, so that the API supports the project-level assignment model.

#### Acceptance Criteria

1. THE endpoint GET /api/projectallocation/examiner/{examinerId} SHALL return projects assigned to the examiner
2. THE endpoint GET /api/projectallocation/project/{projectId} SHALL return examiners assigned to the project
3. THE endpoint POST /api/projectallocation SHALL accept ExaminerId and ProjectId with subject expertise validation
4. THE endpoint PUT /api/projectallocation/{id} SHALL update the IsActive status of an assignment
5. THE endpoint DELETE /api/projectallocation/{id} SHALL deactivate an assignment (set IsActive to false)
6. ALL endpoints SHALL validate that referenced entities exist before processing
7. ALL endpoints SHALL return appropriate HTTP status codes (200, 201, 400, 404, 500)
8. ALL endpoints SHALL include error handling with descriptive messages

### Requirement 12: Prevent Duplicate Examiner-Project Assignments

**User Story:** As a system, I want to prevent duplicate examiner-project assignments, so that the data remains consistent and assignments are unique.

#### Acceptance Criteria

1. THE database schema SHALL enforce a unique constraint on (ExaminerId, ProjectId) in ProjectAllocation
2. WHEN an assignment already exists for an examiner and project, THE system SHALL reactivate it instead of creating a duplicate
3. THE API SHALL validate uniqueness before attempting to create a new assignment
4. IF a duplicate assignment is attempted, THE API SHALL return a 400 error with a descriptive message