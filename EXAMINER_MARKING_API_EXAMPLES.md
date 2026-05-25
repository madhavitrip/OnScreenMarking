# Examiner Marking API - Request/Response Examples

## Base URL
```
https://localhost:7243/api
```

## Authentication
All endpoints require Bearer token in Authorization header:
```
Authorization: Bearer {token}
```

---

## 1. Get Marking Details

### Request
```http
GET /marking/1/details
Authorization: Bearer {token}
```

### Response (200 OK)
```json
{
  "marking": {
    "id": 1,
    "scriptId": 1,
    "examinerId": 5,
    "examinerName": "Dr. Rajesh Kumar",
    "allocationId": 1,
    "totalMarks": 0,
    "maxMarks": 100,
    "percentage": 0,
    "remarks": "",
    "status": "draft",
    "startedAt": "2024-05-22T10:30:00Z",
    "submittedAt": null
  },
  "script": {
    "id": 1,
    "scriptId": "OSM-2024-001",
    "barcode": "BAR-001",
    "paperId": 1,
    "cleanPdfUrl": "https://storage.example.com/scripts/OSM-2024-001.pdf",
    "status": "pending",
    "maxMarks": 100
  },
  "sections": [
    {
      "id": 1,
      "name": "Section A - Multiple Choice",
      "description": "Objective type questions",
      "totalQuestions": 10,
      "totalMarks": 20,
      "startQuestion": 1,
      "endQuestion": 10,
      "questions": [
        {
          "questionId": 1,
          "questionNo": 1,
          "marks": 2,
          "type": "MCQ",
          "isOptional": false,
          "optionalGroupCode": null,
          "marksAwarded": 0,
          "isSkipped": false,
          "remarks": "",
          "isAttempted": false
        },
        {
          "questionId": 2,
          "questionNo": 2,
          "marks": 2,
          "type": "MCQ",
          "isOptional": false,
          "optionalGroupCode": null,
          "marksAwarded": 1,
          "isSkipped": false,
          "remarks": "Partial credit - calculation error",
          "isAttempted": true
        }
      ]
    },
    {
      "id": 2,
      "name": "Section B - Short Answer",
      "description": "Short answer type questions",
      "totalQuestions": 8,
      "totalMarks": 40,
      "startQuestion": 11,
      "endQuestion": 18,
      "questions": [
        {
          "questionId": 11,
          "questionNo": 11,
          "marks": 5,
          "type": "SA",
          "isOptional": false,
          "optionalGroupCode": null,
          "marksAwarded": 5,
          "isSkipped": false,
          "remarks": "Excellent answer",
          "isAttempted": true
        }
      ]
    },
    {
      "id": 3,
      "name": "Section C - Long Answer",
      "description": "Long answer type questions",
      "totalQuestions": 4,
      "totalMarks": 40,
      "startQuestion": 19,
      "endQuestion": 22,
      "questions": [
        {
          "questionId": 19,
          "questionNo": 19,
          "marks": 10,
          "type": "LA",
          "isOptional": false,
          "optionalGroupCode": null,
          "marksAwarded": 0,
          "isSkipped": true,
          "remarks": "",
          "isAttempted": false
        }
      ]
    }
  ]
}
```

---

## 2. Save Question Marks

### Request
```http
POST /marking/1/question-marks
Authorization: Bearer {token}
Content-Type: application/json

[
  {
    "questionId": 1,
    "marksAwarded": 2,
    "isSkipped": false,
    "remarks": "Correct answer",
    "isAttempted": true
  },
  {
    "questionId": 2,
    "marksAwarded": 1,
    "isSkipped": false,
    "remarks": "Partial credit - calculation error",
    "isAttempted": true
  },
  {
    "questionId": 3,
    "marksAwarded": 0,
    "isSkipped": true,
    "remarks": "",
    "isAttempted": false
  },
  {
    "questionId": 11,
    "marksAwarded": 5,
    "isSkipped": false,
    "remarks": "Excellent answer with clear explanation",
    "isAttempted": true
  },
  {
    "questionId": 12,
    "marksAwarded": 3,
    "isSkipped": false,
    "remarks": "Good but incomplete",
    "isAttempted": true
  },
  {
    "questionId": 19,
    "marksAwarded": 10,
    "isSkipped": false,
    "remarks": "Comprehensive answer with examples",
    "isAttempted": true
  },
  {
    "questionId": 20,
    "marksAwarded": 7,
    "isSkipped": false,
    "remarks": "Good understanding but lacks depth",
    "isAttempted": true
  },
  {
    "questionId": 21,
    "marksAwarded": 0,
    "isSkipped": true,
    "remarks": "",
    "isAttempted": false
  }
]
```

### Response (200 OK)
```json
{
  "success": true,
  "message": "Question marks saved successfully",
  "totalMarks": 28
}
```

### Response (400 Bad Request)
```json
{
  "success": false,
  "message": "Marking not found"
}
```

---

## 3. Get Question Marks

### Request
```http
GET /marking/1/question-marks
Authorization: Bearer {token}
```

### Response (200 OK)
```json
[
  {
    "questionId": 1,
    "questionNo": 1,
    "marksAwarded": 2,
    "isSkipped": false,
    "remarks": "Correct answer",
    "isAttempted": true
  },
  {
    "questionId": 2,
    "questionNo": 2,
    "marksAwarded": 1,
    "isSkipped": false,
    "remarks": "Partial credit - calculation error",
    "isAttempted": true
  },
  {
    "questionId": 3,
    "questionNo": 3,
    "marksAwarded": 0,
    "isSkipped": true,
    "remarks": "",
    "isAttempted": false
  }
]
```

---

## 4. Update Marking (Save Remarks)

### Request
```http
PUT /marking/1
Authorization: Bearer {token}
Content-Type: application/json

{
  "totalMarks": 28,
  "remarks": "Good attempt. Student has shown understanding of most concepts. Some calculation errors in Section A. Overall performance is satisfactory."
}
```

### Response (200 OK)
```json
{
  "success": true,
  "message": "Marking updated successfully"
}
```

---

## 5. Submit Marking

### Request
```http
PUT /marking/1/submit
Authorization: Bearer {token}
```

### Response (200 OK)
```json
{
  "success": true,
  "message": "Marking submitted successfully"
}
```

### Response (400 Bad Request)
```json
{
  "success": false,
  "message": "Cannot update submitted marking"
}
```

---

## 6. Get Examiner's Markings

### Request
```http
GET /marking/examiner/5?status=draft&page=1&limit=10
Authorization: Bearer {token}
```

### Response (200 OK)
```json
[
  {
    "id": 1,
    "scriptId": 1,
    "examinerId": 5,
    "allocationId": 1,
    "totalMarks": 28,
    "maxMarks": 100,
    "percentage": 28,
    "remarks": "Good attempt...",
    "status": "draft",
    "startedAt": "2024-05-22T10:30:00Z",
    "submittedAt": null
  },
  {
    "id": 2,
    "scriptId": 2,
    "examinerId": 5,
    "allocationId": 2,
    "totalMarks": 85,
    "maxMarks": 100,
    "percentage": 85,
    "remarks": "Excellent performance...",
    "status": "submitted",
    "startedAt": "2024-05-22T11:00:00Z",
    "submittedAt": "2024-05-22T12:30:00Z"
  }
]
```

Headers:
```
X-Total-Count: 15
```

---

## 7. Get Script Marking

### Request
```http
GET /marking/script/1
Authorization: Bearer {token}
```

### Response (200 OK)
```json
{
  "id": 1,
  "scriptId": 1,
  "examinerId": 5,
  "allocationId": 1,
  "totalMarks": 28,
  "maxMarks": 100,
  "percentage": 28,
  "remarks": "Good attempt...",
  "status": "draft",
  "startedAt": "2024-05-22T10:30:00Z",
  "submittedAt": null
}
```

---

## Error Responses

### 401 Unauthorized
```json
{
  "type": "https://tools.ietf.org/html/rfc7235#section-3.1",
  "title": "Unauthorized",
  "status": 401,
  "detail": "Authorization header is missing or invalid"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "You do not have permission to access this marking"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Marking not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "An error occurred while processing your request"
}
```

---

## cURL Examples

### Get Marking Details
```bash
curl -X GET "https://localhost:7243/api/marking/1/details" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json"
```

### Save Question Marks
```bash
curl -X POST "https://localhost:7243/api/marking/1/question-marks" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '[
    {
      "questionId": 1,
      "marksAwarded": 2,
      "isSkipped": false,
      "remarks": "Correct",
      "isAttempted": true
    }
  ]'
```

### Submit Marking
```bash
curl -X PUT "https://localhost:7243/api/marking/1/submit" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json"
```

---

## JavaScript/Fetch Examples

### Get Marking Details
```javascript
const response = await fetch('https://localhost:7243/api/marking/1/details', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
const data = await response.json();
console.log(data);
```

### Save Question Marks
```javascript
const marks = [
  {
    questionId: 1,
    marksAwarded: 2,
    isSkipped: false,
    remarks: "Correct answer",
    isAttempted: true
  }
];

const response = await fetch('https://localhost:7243/api/marking/1/question-marks', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(marks)
});
const data = await response.json();
console.log(data);
```

### Submit Marking
```javascript
const response = await fetch('https://localhost:7243/api/marking/1/submit', {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
const data = await response.json();
console.log(data);
```

---

## Rate Limiting

- **Limit**: 100 requests per minute per user
- **Headers**: 
  - `X-RateLimit-Limit: 100`
  - `X-RateLimit-Remaining: 95`
  - `X-RateLimit-Reset: 1716379200`

---

## Pagination

For list endpoints, use query parameters:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 100)

Example:
```
GET /marking/examiner/5?page=2&limit=20
```

Response includes:
```
X-Total-Count: 150
```

---

## Validation Rules

### Question Marks
- `marksAwarded`: Must be between 0 and question's max marks
- `isSkipped`: Cannot be true if marksAwarded > 0
- `remarks`: Max 500 characters
- `isAttempted`: Auto-set based on marksAwarded

### Marking Remarks
- Max 1000 characters
- Cannot be updated after submission
- Can be empty

---

## Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 500 | Server Error |

---

## Testing Checklist

- [ ] Test with valid token
- [ ] Test with invalid token
- [ ] Test with expired token
- [ ] Test with marks exceeding max
- [ ] Test with negative marks
- [ ] Test skip functionality
- [ ] Test annotation saving
- [ ] Test submission workflow
- [ ] Test error handling
- [ ] Test pagination
- [ ] Test filtering by status
- [ ] Test concurrent requests
