using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace API.Models
{
    public class College
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        public string CollegeName { get; set; }
        public string CollegeCode { get; set; }
        public string CollegeType { get; set; }
        public string Address { get; set; }
        public bool IsActive { get; set; }
        public string District { get; set; }
    }
}
