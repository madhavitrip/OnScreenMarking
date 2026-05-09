using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace API.Models
{
    public class Department
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int DepartmentId { get; set; }
        public string Name { get; set; }
        public bool IsActive { get; set; } = true;
        public int UniversityId { get; set; }
        public University? University { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        
        // Navigation properties
        public ICollection<Subject> Subjects { get; set; } = new List<Subject>();
        public ICollection<User> Users { get; set; } = new List<User>();
    }
}
