using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace API.Models
{
    public class User
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        public string Name { get; set; }
        public string Email { get; set; }
        public string PasswordHash { get; set; }
        public string UserType { get; set; } // examiner, coordinator, admin
        public bool IsActive { get; set; } = true;
        public string ProfileImage { get; set; }
        public string Phone { get; set; }
        public string Address { get; set; }
        public int? DepartmentId { get; set; }
        public Department Department { get; set; }
        public int UniversityId {get; set;}
        public University University {get; set;}
        // Navigation properties
        public ICollection<ExaminerExpertise> Expertise { get; set; } = new List<ExaminerExpertise>();
        public ICollection<Script> AssignedScripts { get; set; } = new List<Script>();
        public ICollection<Marking> Markings { get; set; } = new List<Marking>();
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
