using System;
using System.Collections.Generic;

namespace API.Models.DTOs
{
    public class AttendanceDto
    {
        public int AttendanceId { get; set; }
        public int ExaminerId { get; set; }
        public string ExaminerName { get; set; }
        public string ExaminerEmail { get; set; }
        public DateTime Date { get; set; }
        public string Status { get; set; }
        public string? Remarks { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    public class BulkImportAttendanceRequest
    {
        public string Email { get; set; }
        public string Date { get; set; } // Received as string, parsed in controller
        public string Status { get; set; }
        public string? Remarks { get; set; }
    }

    public class BulkImportResponse
    {
        public bool Success { get; set; }
        public int TotalProcessed { get; set; }
        public int TotalImported { get; set; }
        public List<string> FailedEmails { get; set; } = new List<string>();
        public string Message { get; set; }
    }
}
