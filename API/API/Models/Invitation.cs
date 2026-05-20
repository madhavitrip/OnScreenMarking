using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace API.Models
{
    public class Invitation
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        
        [Required]
        public string Email { get; set; }
        
        [Required]
        public string Token { get; set; }
        
        [Required]
        public int UniversityId { get; set; }
        public University? University { get; set; }
        
        public int? DepartmentId { get; set; }
        public Department? Department { get; set; }
        
        public bool IsUsed { get; set; } = false;
        
        public DateTime ExpiresAt { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
