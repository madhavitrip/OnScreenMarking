namespace API.Models.DTOs
{
    public class ScriptDto
    {
        public int Id { get; set; }
        public string ScriptId { get; set; }
        public string RollNo { get; set; }
        public string StudentName { get; set; }
        public int PaperId { get; set; }
        public string Subject { get; set; }
        public DateTime ExamDate { get; set; }
        public string ScannedImageUrl { get; set; }
        public string Status { get; set; }
        public int? AssignedExaminerId { get; set; }
        public string AssignedExaminerName { get; set; }
        public decimal TotalMarks { get; set; }
        public decimal MaxMarks { get; set; }
        public decimal Percentage { get; set; }
        public string Remarks { get; set; }
        public DateTime? SubmittedAt { get; set; }
    }

    public class AssignScriptRequest
    {
        public int ScriptId { get; set; }
        public int ExaminerId { get; set; }
    }

    public class ScriptStatusUpdateRequest
    {
        public int ScriptId { get; set; }
        public string Status { get; set; }
        public string Remarks { get; set; }
    }
}
