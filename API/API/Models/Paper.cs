using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace API.Models
{
    public class Paper
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        public int SubjectConfigId { get; set; }
        public SubjectConfig SubjectConfig { get; set; }
        public string PaperCode { get; set; } // e.g., "MATH-2024-P1", "MATH-2024-P2"
        public string PaperName { get; set; } // e.g., "Paper 1", "Paper 2"
        public int PaperNumber { get; set; } // 1, 2, 3, etc.
        public decimal MaxMarks { get; set; } = 100;
        public int TotalQuestions { get; set; }
        public string Description { get; set; }
        public bool IsActive { get; set; } = true;
        public int UniversityId { get; set; }
        public University University { get; set; }
        public ICollection<Section> Sections { get; set; } = new List<Section>();
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
