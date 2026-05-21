using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json;

namespace API.Models
{
    public class Role
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int RoleId { get; set; }
        
        [Required]
        public string RoleName { get; set; }
        
        public string Description { get; set; }
        
        public int HierarchyLevel { get; set; }
        
        public bool IsActive { get; set; } = true;
        
        public string Permissions { get; set; } = "[]";
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        
        [NotMapped]
        public List<string> PermissionsList
        {
            get => string.IsNullOrEmpty(Permissions) 
                ? new List<string>() 
                : JsonSerializer.Deserialize<List<string>>(Permissions) ?? new List<string>();
            set => Permissions = JsonSerializer.Serialize(value ?? new List<string>());
        }
    }
}
