namespace API.Models.DTOs
{
    public class SubjectConfigDto
    {
        public int Id { get; set; }
        public int DepartmentId { get; set; }
        public string Code { get; set; }
        public string Name { get; set; }
        public int TotalMarks { get; set; }
        public int Duration { get; set; }
        public bool IsActive { get; set; }
        public List<PaperDto> Papers { get; set; } = new List<PaperDto>();
        public List<SectionDto> Sections { get; set; } = new List<SectionDto>();
    }

    public class SectionDto
    {
        public int Id { get; set; }
        public int PaperId { get; set; }
        public int SubjectConfigId { get; set; }
        public string SectionId { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public int TotalQuestions { get; set; }
        public int TotalMarks { get; set; }
        public List<QuestionDto> Questions { get; set; } = new List<QuestionDto>();
    }

    public class QuestionDto
    {
        public int Id { get; set; }
        public int SectionId { get; set; }
        public int QuestionNo { get; set; }
        public int Marks { get; set; }
        public string Type { get; set; }
    }
}
