namespace API.Models.DTOs
{
    public class ScriptDto
    {
        public int Id { get; set; }
        public string ScriptId { get; set; }
        public string Barcode { get; set; }
        public int PaperId { get; set; }
        public string CleanPdfUrl { get; set; }
        public string Status { get; set; }
        public bool IsReEvaluationRequested { get; set; }
        public decimal TotalMarks { get; set; }
        public decimal MaxMarks { get; set; }
        public decimal Percentage { get; set; }
        public string Remarks { get; set; }
        public DateTime? SubmittedAt { get; set; }
    }

    public class AssignScriptRequest
    {
        public int ExaminerId { get; set; }
    }

    public class ScriptStatusUpdateRequest
    {
        public string Status { get; set; }
        public string Remarks { get; set; }
    }
}
