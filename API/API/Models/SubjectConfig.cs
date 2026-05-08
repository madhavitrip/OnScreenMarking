using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace API.Models
{
    public class SubjectConfig
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        public int DepartmentId { get; set; }
        public Department Department { get; set; }
        public string Code { get; set; }
        public string Name { get; set; } // e.g., "Mathematics", "Physics"
        public int TotalMarks { get; set; } = 100;
        public bool IsActive { get; set; } = true;
        // Navigation properties
        public ICollection<Paper> Papers { get; set; } = new List<Paper>();
        public ICollection<Section> Sections { get; set; } = new List<Section>();
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }

    public class Section
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        public int PaperId { get; set; }
        public Paper Paper { get; set; }
        public int SubjectConfigId { get; set; }
        public SubjectConfig SubjectConfig { get; set; }
        public string SectionId { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public int TotalQuestions { get; set; }
        public int TotalMarks { get; set; }
        public ICollection<Question> Questions { get; set; } = new List<Question>();
    }

    public class Question
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        public int SectionId { get; set; }
        public Section Section { get; set; }
        public int QuestionNo { get; set; }
        public int Marks { get; set; }
        public string Type { get; set; } // MCQ, SA, LA, CS, NP, EXP, RC, WS, LIT, GV
    }
}
