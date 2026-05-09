using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using API.Data;
using API.Models;
using API.Models.DTOs;

namespace API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class SectionController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public SectionController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Section>>> GetSections([FromQuery] int? paperId = null)
        {
            try
            {
                var query = _context.Sections.AsQueryable();

                if (paperId.HasValue)
                    query = query.Where(s => s.PaperId == paperId.Value);

                var sections = await query
                    .Include(s => s.Paper)
                    .Include(s => s.Questions)
                    .OrderBy(s => s.Id)
                    .ToListAsync();

                return Ok(sections);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Section>> GetSection(int id)
        {
            try
            {
                var section = await _context.Sections
                    .Include(s => s.Paper)
                    .Include(s => s.Questions)
                    .FirstOrDefaultAsync(s => s.Id == id);

                if (section == null)
                    return NotFound(new { success = false, message = "Section not found" });

                return Ok(section);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        [HttpPost]
        [Authorize(Roles = "admin,coordinator")]
        public async Task<ActionResult<Section>> CreateSection([FromBody] SectionDto sectionDto)
        {
            try
            {
                if (string.IsNullOrEmpty(sectionDto.Name))
                    return BadRequest(new { success = false, message = "Section name is required" });

                if (sectionDto.PaperId <= 0)
                    return BadRequest(new { success = false, message = "Paper ID is required" });

                // Verify paper exists
                var paper = await _context.Papers.FindAsync(sectionDto.PaperId);
                if (paper == null)
                    return BadRequest(new { success = false, message = "Paper not found" });

                // Validate start and end question
                if (sectionDto.StartQuestion <= 0 || sectionDto.EndQuestion <= 0)
                    return BadRequest(new { success = false, message = "Start and End question numbers must be greater than 0" });

                if (sectionDto.EndQuestion < sectionDto.StartQuestion)
                    return BadRequest(new { success = false, message = "End question must be greater than or equal to start question" });

                // Calculate total questions from range
                int calculatedTotalQuestions = sectionDto.EndQuestion - sectionDto.StartQuestion + 1;
                if (calculatedTotalQuestions != sectionDto.TotalQuestions)
                    return BadRequest(new { success = false, message = $"Total questions ({sectionDto.TotalQuestions}) does not match the range ({calculatedTotalQuestions})" });

                var section = new Section
                {
                    PaperId = sectionDto.PaperId,
                    Name = sectionDto.Name,
                    Description = sectionDto.Description,
                    TotalQuestions = sectionDto.TotalQuestions,
                    TotalMarks = sectionDto.TotalMarks,
                    StartQuestion = sectionDto.StartQuestion,
                    EndQuestion = sectionDto.EndQuestion,
                    CreatedAt = DateTime.UtcNow
                };

                _context.Sections.Add(section);
                await _context.SaveChangesAsync();

                // Save questions from UI (if provided) or auto-create them
                var questions = new List<Question>();

                if (sectionDto.Questions != null && sectionDto.Questions.Count > 0)
                {
                    // Use questions from UI
                    foreach (var questionDto in sectionDto.Questions)
                    {
                        // Validate question type is provided
                        if (string.IsNullOrEmpty(questionDto.Type))
                            return BadRequest(new { success = false, message = $"Question {questionDto.QuestionNo} must have a type selected" });

                        var question = new Question
                        {
                            SectionId = section.Id,
                            QuestionNo = questionDto.QuestionNo,
                            Marks = questionDto.Marks,
                            Type = questionDto.Type,
                            IsOptional = questionDto.IsOptional,
                            OptionalGroupCode = questionDto.OptionalGroupCode,
                            CreatedAt = DateTime.UtcNow
                        };
                        questions.Add(question);
                    }
                }
                else
                {
                    // Auto-create questions with default values (fallback)
                    decimal marksPerQuestion = (decimal)sectionDto.TotalMarks / sectionDto.TotalQuestions;

                    for (int i = sectionDto.StartQuestion; i <= sectionDto.EndQuestion; i++)
                    {
                        var question = new Question
                        {
                            SectionId = section.Id,
                            QuestionNo = i,
                            Marks = marksPerQuestion,
                            Type = "MCQ", // default type
                            IsOptional = false,
                            CreatedAt = DateTime.UtcNow
                        };
                        questions.Add(question);
                    }
                }

                _context.Questions.AddRange(questions);
                await _context.SaveChangesAsync();

                return CreatedAtAction(nameof(GetSection), new { id = section.Id }, section);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "admin,coordinator")]
        public async Task<IActionResult> UpdateSection(int id, [FromBody] SectionDto sectionDto)
        {
            try
            {
                var section = await _context.Sections.FindAsync(id);
                if (section == null)
                    return NotFound(new { success = false, message = "Section not found" });

                section.Name = sectionDto.Name;
                section.Description = sectionDto.Description;
                section.TotalQuestions = sectionDto.TotalQuestions;
                section.TotalMarks = sectionDto.TotalMarks;

                _context.Sections.Update(section);
                await _context.SaveChangesAsync();

                return Ok(new { success = true, message = "Section updated successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> DeleteSection(int id)
        {
            try
            {
                var section = await _context.Sections.FindAsync(id);
                if (section == null)
                    return NotFound(new { success = false, message = "Section not found" });

                _context.Sections.Remove(section);
                await _context.SaveChangesAsync();

                return Ok(new { success = true, message = "Section deleted successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        [HttpGet("{id}/questions")]
        public async Task<ActionResult<IEnumerable<Question>>> GetSectionQuestions(int id)
        {
            try
            {
                var questions = await _context.Questions
                    .Where(q => q.SectionId == id)
                    .OrderBy(q => q.QuestionNo)
                    .ToListAsync();

                return Ok(questions);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        [HttpPut("question/{questionId}")]
        [Authorize(Roles = "admin,coordinator")]
        public async Task<IActionResult> UpdateQuestion(int questionId, [FromBody] QuestionDto questionDto)
        {
            try
            {
                var question = await _context.Questions.FindAsync(questionId);
                if (question == null)
                    return NotFound(new { success = false, message = "Question not found" });

                question.Marks = questionDto.Marks;
                question.Type = questionDto.Type;
                question.IsOptional = questionDto.IsOptional;
                question.OptionalGroupCode = questionDto.OptionalGroupCode;

                _context.Questions.Update(question);
                await _context.SaveChangesAsync();

                return Ok(new { success = true, message = "Question updated successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }
    }
}
