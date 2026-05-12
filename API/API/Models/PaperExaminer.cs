using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace API.Models
{
    public class PaperExaminer
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        public int PaperId { get; set; }
        public Paper Paper { get; set; }
        public int ExaminerId { get; set; }
        public User Examiner { get; set; }
        public bool IsActive { get; set; } = true;
        public int? MaxScriptLimit { get; set; }
        public DateTime AssignedAt { get; set; } = DateTime.UtcNow;
    }
}
