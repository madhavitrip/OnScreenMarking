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
        public int SubjectId {get;set;}
        public string SubjectName {get;set;}
        public int DepartmentId {get;set;}
        public Department Department {get;set;}
        public bool IsActive {get;set;}
         public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
         public ICollection<Paper> Papers { get; set; }
    }
}