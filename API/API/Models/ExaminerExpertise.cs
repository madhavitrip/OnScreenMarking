using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace API.Models
{
    public class ExaminerExpertise
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        public int ExaminerId { get; set; }
        public User Examiner { get; set; }
        public int? DepartmentId { get; set; }
        public Department Department { get; set; }
        public bool IsActive { get; set; } = true;
    }
}
