using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace API.Models
{
    public class Marking
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        public int ScriptId { get; set; }
        public Script Script { get; set; }
        public int ExaminerId { get; set; }
        public User Examiner { get; set; }
        public int? DepartmentId { get; set; }
        public Department Department { get; set; }
        public string MarksJson { get; set; } // JSON string of marks
        public string SectionMarksJson { get; set; } // JSON string of section marks
        public decimal TotalMarks { get; set; } = 0;
        public decimal MaxMarks { get; set; } = 100;
        public decimal Percentage { get; set; } = 0;
        public string Remarks { get; set; }
        public string Status { get; set; } = "draft"; // draft, submitted, reviewed
        public DateTime StartedAt { get; set; } = DateTime.UtcNow;
        public DateTime? SubmittedAt { get; set; }
        public DateTime? ReviewedAt { get; set; }
        public int? ReviewedById { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
