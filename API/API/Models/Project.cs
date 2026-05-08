using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace API.Models
{
    public class Project
    {
        [Key]
[DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int ProjectId {get;set;}
        public string ProjectName {get;set;}
        public int Session {get;set;}
        public Session Session {get;set;}
        public int UniversityId {get;set;}
        public University University {get;set;}
        public bool IsActive {get;set;}
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public ICollection<Paper> Papers { get; set; }
    }
}
