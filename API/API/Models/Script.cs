using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace API.Models
{
    public class Script
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        public string ScriptId { get; set; }
        public int PaperId { get; set; }
        public Paper Paper { get; set; }
        public int DepartmentId { get; set; } 
        public Department Department { get; set; }
        public DateTime ExamDate { get; set; }
        public string ScannedImageUrl { get; set; }
        public string Status { get; set; } = "pending"; // pending, in_progress, completed
        public int? AssignedExaminerId { get; set; }
        public User AssignedExaminer { get; set; }
        public decimal TotalMarks { get; set; } = 0;
        public decimal MaxMarks { get; set; } = 100;
        public decimal Percentage { get; set; } = 0;
        public string Remarks { get; set; }
        public DateTime? SubmittedAt { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
