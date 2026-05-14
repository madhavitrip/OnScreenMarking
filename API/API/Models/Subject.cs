using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace API.Models
{
    public class Subject
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int SubjectId { get; set; }
        public string SubjectName { get; set; }
        public string SubjectCode { get; set; }
        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        public ICollection<DepartmentSubject> DepartmentSubjects { get; set; }
       = new List<DepartmentSubject>();

        public ICollection<SubjectPaper> SubjectPapers { get; set; }
            = new List<SubjectPaper>();
        // Navigation properties
        public ICollection<ExaminerExpertise> ExaminerExpertises { get; set; } = new List<ExaminerExpertise>();
    }
}