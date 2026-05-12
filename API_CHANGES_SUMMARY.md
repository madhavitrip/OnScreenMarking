# API Changes Summary

## New Endpoints

### 1. Get Coordinator's University
**Endpoint:** `GET /api/universities/current/my-university`

**Authorization:** Required (Coordinator or Admin)

**Description:** Returns the university assigned to the current user (coordinator)

**Response:**
```json
{
  "universityId": 1,
  "universityName": "University of Example",
  "isActive": true,
  "departments": [
    {
      "departmentId": 1,
      "name": "Computer Science",
      "universityId": 1,
      "isActive": true
    }
  ],
  "projects": [
    {
      "projectId": 1,
      "projectName": "Spring 2026 Exams",
      "universityId": 1
    }
  ]
}
```

**Error Responses:**
- `401 Unauthorized`: User not authenticated
- `404 Not Found`: User not associated with a university

---

## Modified Endpoints

### 1. Create University
**Endpoint:** `POST /api/universities`

**Authorization:** Required - Admin only

**Changes:**
- Added explicit check for `userType == "admin"`
- Returns `403 Forbidden` if user is not admin
- Coordinators cannot create universities

**Request Body:**
```json
{
  "universityName": "New University",
  "isActive": true
}
```

**Response:**
```json
{
  "universityId": 2,
  "universityName": "New University",
  "isActive": true,
  "createdAt": "2026-05-12T10:30:00Z"
}
```

**Error Responses:**
- `400 Bad Request`: Missing university name
- `403 Forbidden`: User is not admin
- `500 Internal Server Error`: Database error

---

### 2. Create Department
**Endpoint:** `POST /api/department`

**Authorization:** Required - Admin or Coordinator

**Changes:**
- Added university ownership validation for coordinators
- Coordinators can only create departments for their assigned university
- Admins can create departments for any university

**Request Body:**
```json
{
  "name": "Computer Science",
  "universityId": 1,
  "isActive": true
}
```

**Response:**
```json
{
  "departmentId": 1,
  "name": "Computer Science",
  "universityId": 1,
  "isActive": true,
  "createdAt": "2026-05-12T10:30:00Z"
}
```

**Validation Rules:**
- Department name is required
- University ID is required
- University must exist
- For coordinators: `universityId` must match their assigned university

**Error Responses:**
- `400 Bad Request`: Missing required fields or invalid university
- `403 Forbidden`: Coordinator trying to create department for different university
- `500 Internal Server Error`: Database error

---

## Existing Endpoints (No Changes)

### Get All Universities
**Endpoint:** `GET /api/universities`

**Authorization:** Required

**Description:** Returns all active universities (unchanged)

**Response:**
```json
[
  {
    "universityId": 1,
    "universityName": "University of Example",
    "isActive": true,
    "departments": [],
    "projects": []
  }
]
```

---

### Get University by ID
**Endpoint:** `GET /api/universities/{id}`

**Authorization:** Required

**Description:** Returns specific university with departments and projects (unchanged)

---

### Update University
**Endpoint:** `PUT /api/universities/{id}`

**Authorization:** Required - Admin only

**Description:** Updates university details (unchanged)

---

### Get University Departments
**Endpoint:** `GET /api/universities/{id}/departments`

**Authorization:** Required

**Description:** Returns all departments for a specific university (unchanged)

---

### Get Departments
**Endpoint:** `GET /api/department`

**Authorization:** Required

**Query Parameters:**
- `universityId` (optional): Filter by university

**Description:** Returns departments, optionally filtered by university (unchanged)

---

### Get Department by ID
**Endpoint:** `GET /api/department/{id}`

**Authorization:** Required

**Description:** Returns specific department with subjects and users (unchanged)

---

### Update Department
**Endpoint:** `PUT /api/department/{id}`

**Authorization:** Required - Admin or Coordinator

**Description:** Updates department details (unchanged)

---

## JWT Claims

The JWT token includes the following claims:

```json
{
  "id": "1",
  "email": "user@example.com",
  "userType": "admin|coordinator|examiner",
  "role": "admin|coordinator|examiner"
}
```

**Note:** The `userType` claim is used for authorization checks in the backend.

---

## Authorization Patterns

### Admin-Only Operations
```csharp
[Authorize(Roles = "admin")]
public async Task<ActionResult> AdminOnlyEndpoint()
{
    // Only admins can access
}
```

### Admin or Coordinator
```csharp
[Authorize(Roles = "admin,coordinator")]
public async Task<ActionResult> AdminOrCoordinatorEndpoint()
{
    // Both admins and coordinators can access
    // But coordinators are scoped to their university
}
```

### University Scoping for Coordinators
```csharp
var userType = User.FindFirst("userType")?.Value;
if (userType == "coordinator")
{
    var userIdClaim = User.FindFirst("id")?.Value;
    if (int.TryParse(userIdClaim, out int userId))
    {
        var user = await _context.Users.FindAsync(userId);
        if (user?.UniversityId != requestedUniversityId)
            return Forbid();
    }
}
```

---

## Migration Notes

### Database Changes
No database schema changes required. The implementation uses existing columns:
- `User.UniversityId` - Already exists
- `User.UserType` - Already exists
- `Department.UniversityId` - Already exists

### Backward Compatibility
- All existing endpoints remain unchanged
- New endpoint is additive only
- Existing clients will continue to work
- No breaking changes to API contracts

---

## Testing the API

### Using cURL

**Get all universities:**
```bash
curl -H "Authorization: Bearer {token}" \
  https://localhost:7243/api/universities
```

**Get coordinator's university:**
```bash
curl -H "Authorization: Bearer {coordinator_token}" \
  https://localhost:7243/api/universities/current/my-university
```

**Create university (admin only):**
```bash
curl -X POST \
  -H "Authorization: Bearer {admin_token}" \
  -H "Content-Type: application/json" \
  -d '{"universityName":"New University","isActive":true}' \
  https://localhost:7243/api/universities
```

**Create department (coordinator scoped):**
```bash
curl -X POST \
  -H "Authorization: Bearer {coordinator_token}" \
  -H "Content-Type: application/json" \
  -d '{"name":"CS","universityId":1,"isActive":true}' \
  https://localhost:7243/api/department
```

---

## Error Handling

### Standard Error Response Format
```json
{
  "success": false,
  "message": "Error description"
}
```

### HTTP Status Codes
- `200 OK`: Successful GET request
- `201 Created`: Successful POST request
- `204 No Content`: Successful DELETE request
- `400 Bad Request`: Invalid input or missing required fields
- `401 Unauthorized`: Missing or invalid authentication token
- `403 Forbidden`: User lacks permission for this operation
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server-side error

---

## Rate Limiting

No rate limiting currently implemented. Consider adding for production:
- 100 requests per minute per user
- 1000 requests per minute per IP

---

## Security Considerations

1. **JWT Validation**: All endpoints validate JWT token
2. **Role-Based Access**: Endpoints check user role
3. **University Scoping**: Coordinators cannot access other universities
4. **Input Validation**: All inputs validated before processing
5. **SQL Injection Prevention**: Using Entity Framework Core parameterized queries

---

## Future Enhancements

1. **Audit Logging**: Log all admin/coordinator actions
2. **Rate Limiting**: Implement request rate limiting
3. **Caching**: Cache university and department lists
4. **Pagination**: Add pagination to list endpoints
5. **Filtering**: Add advanced filtering options
6. **Soft Deletes**: Implement soft delete for data retention
7. **Versioning**: API versioning for backward compatibility
