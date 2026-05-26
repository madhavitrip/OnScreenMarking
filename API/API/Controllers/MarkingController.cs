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
    public class MarkingController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public MarkingController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpPost]
        [Authorize(Roles = "examiner")]
        public async Task<ActionResult<MarkingDto>> CreateMarking([FromBody] SubmitMarkingRequest request)
        {
            try
            {
                // Verify allocation exists
                var allocation = await _context.Allocations
                    .Include(a => a.Script)
                    .FirstOrDefaultAsync(a => a.AllocationId == request.AllocationId);

                if (allocation == null)
                    return BadRequest(new { success = false, message = "Allocation not found" });

                if (allocation.ExaminerId != request.ExaminerId)
                    return BadRequest(new { success = false, message = "Allocation not assigned to this examiner" });

                var existingMarking = await _context.Markings
                    .FirstOrDefaultAsync(m => m.AllocationId == request.AllocationId);

                if (existingMarking != null)
                    return BadRequest(new { success = false, message = "Marking already exists for this allocation" });

                var marking = new Marking
                {
                    ScriptId = allocation.ScriptId,
                    ExaminerId = request.ExaminerId,
                    AllocationId = request.AllocationId,
                    TotalMarks = request.TotalMarks,
                    Percentage = (request.TotalMarks / allocation.Script.MaxMarks) * 100,
                    Remarks = request.Remarks,
                    Status = "draft",
                    StartedAt = DateTime.UtcNow
                };

                _context.Markings.Add(marking);
                await _context.SaveChangesAsync();

                var markingDto = new MarkingDto
                {
                    Id = marking.Id,
                    ScriptId = marking.ScriptId,
                    ExaminerId = marking.ExaminerId,
                    AllocationId = marking.AllocationId,
                    TotalMarks = marking.TotalMarks,
                    Percentage = marking.Percentage,
                    Remarks = marking.Remarks,
                    Status = marking.Status,
                    StartedAt = marking.StartedAt
                };

                return CreatedAtAction(nameof(GetMarking), new { id = marking.Id }, markingDto);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<MarkingDto>> GetMarking(int id)
        {
            try
            {
                var marking = await _context.Markings
                    .Include(m => m.Script)
                    .Include(m => m.Examiner)
                    .Include(m => m.Allocation)
                    .FirstOrDefaultAsync(m => m.Id == id);

                if (marking == null)
                    return NotFound(new { success = false, message = "Marking not found" });

                var markingDto = new MarkingDto
                {
                    Id = marking.Id,
                    ScriptId = marking.ScriptId,
                    ExaminerId = marking.ExaminerId,
                    AllocationId = marking.AllocationId,
                    TotalMarks = marking.TotalMarks,
                    Percentage = marking.Percentage,
                    Remarks = marking.Remarks,
                    Status = marking.Status,
                    StartedAt = marking.StartedAt,
                    SubmittedAt = marking.SubmittedAt
                };

                return Ok(markingDto);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "examiner")]
        public async Task<IActionResult> UpdateMarking(int id, [FromBody] SubmitMarkingRequest request)
        {
            try
            {
                var existingMarking = await _context.Markings
                    .Include(m => m.Script)
                    .FirstOrDefaultAsync(m => m.Id == id);

                if (existingMarking == null)
                    return NotFound(new { success = false, message = "Marking not found" });

                if (existingMarking.Status == "submitted")
                    return BadRequest(new { success = false, message = "Cannot update submitted marking" });

                existingMarking.TotalMarks = request.TotalMarks;
                existingMarking.Percentage = (request.TotalMarks) * 100;
                existingMarking.Remarks = request.Remarks;
                existingMarking.UpdatedAt = DateTime.UtcNow;

                _context.Markings.Update(existingMarking);
                await _context.SaveChangesAsync();

                return Ok(new { success = true, message = "Marking updated successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        [HttpPut("{id}/submit")]
        [Authorize(Roles = "examiner")]
        public async Task<IActionResult> SubmitMarking(int id)
        {
            try
            {
                var marking = await _context.Markings
                    .Include(m => m.Script)
                    .FirstOrDefaultAsync(m => m.Id == id);

                if (marking == null)
                    return NotFound(new { success = false, message = "Marking not found" });

                marking.Status = "submitted";
                marking.SubmittedAt = DateTime.UtcNow;
                marking.UpdatedAt = DateTime.UtcNow;

                _context.Markings.Update(marking);

                // Update script status
                var script = marking.Script;
                if (script != null)
                {
                    script.Status = "completed";
                    script.TotalMarks = marking.TotalMarks;
                    script.Percentage = marking.Percentage;
                    script.Remarks = marking.Remarks;
                    script.SubmittedAt = DateTime.UtcNow;
                    script.UpdatedAt = DateTime.UtcNow;
                    _context.Scripts.Update(script);
                }

                await _context.SaveChangesAsync();

                return Ok(new { success = true, message = "Marking submitted successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        [HttpGet("examiner/{examinerId}")]
        public async Task<ActionResult<IEnumerable<MarkingDto>>> GetExaminerMarkings(
            int examinerId,
            [FromQuery] string status = null,
            [FromQuery] int page = 1,
            [FromQuery] int limit = 10)
        {
            try
            {
                var query = _context.Markings
                    .Where(m => m.ExaminerId == examinerId)
                    .AsQueryable();

                if (!string.IsNullOrEmpty(status))
                    query = query.Where(m => m.Status == status);

                var total = await query.CountAsync();
                var markings = await query
                    .Include(m => m.Script)
                    .Include(m => m.Examiner)
                    .Include(m => m.Allocation)
                    .Skip((page - 1) * limit)
                    .Take(limit)
                    .OrderByDescending(m => m.CreatedAt)
                    .ToListAsync();

                var markingDtos = markings.Select(m => new MarkingDto
                {
                    Id = m.Id,
                    ScriptId = m.ScriptId,
                    ExaminerId = m.ExaminerId,
                    AllocationId = m.AllocationId,
                    TotalMarks = m.TotalMarks,
                    Percentage = m.Percentage,
                    Remarks = m.Remarks,
                    Status = m.Status,
                    StartedAt = m.StartedAt,
                    SubmittedAt = m.SubmittedAt
                }).ToList();

                Response.Headers.Add("X-Total-Count", total.ToString());

                return Ok(markingDtos);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        [HttpGet("script/{scriptId}")]
        public async Task<ActionResult<MarkingDto>> GetScriptMarking(int scriptId)
        {
            try
            {
                var marking = await _context.Markings
                    .Include(m => m.Script)
                    .Include(m => m.Examiner)
                    .Include(m => m.Allocation)
                    .FirstOrDefaultAsync(m => m.ScriptId == scriptId);

                if (marking == null)
                    return NotFound(new { success = false, message = "Marking not found for this script" });

                var markingDto = new MarkingDto
                {
                    Id = marking.Id,
                    ScriptId = marking.ScriptId,
                    ExaminerId = marking.ExaminerId,
                    AllocationId = marking.AllocationId,
                    TotalMarks = marking.TotalMarks,
                    Percentage = marking.Percentage,
                    Remarks = marking.Remarks,
                    Status = marking.Status,
                    StartedAt = marking.StartedAt,
                    SubmittedAt = marking.SubmittedAt
                };

                return Ok(markingDto);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        [HttpGet("{markingId}/details")]
        public async Task<ActionResult<object>> GetMarkingDetails(int markingId)
        {
            try
            {
                var marking = await _context.Markings
                    .Include(m => m.Script)
                        .ThenInclude(s => s.Paper)
                            .ThenInclude(p => p.Sections)
                                .ThenInclude(sec => sec.Questions)
                    .Include(m => m.Examiner)
                    .Include(m => m.Allocation)
                    .Include(m => m.QuestionMarks)
                        .ThenInclude(qm => qm.Question)
                    .FirstOrDefaultAsync(m => m.Id == markingId);

                if (marking == null)
                    return NotFound(new { success = false, message = "Marking not found" });

                var sections = marking.Script.Paper.Sections.Select(s => new
                {
                    id = s.Id,
                    name = s.Name,
                    description = s.Description,
                    totalQuestions = s.TotalQuestions,
                    totalMarks = s.TotalMarks,
                    startQuestion = s.StartQuestion,
                    endQuestion = s.EndQuestion,
                    questions = s.Questions.Select(q => new
                    {
                        questionId = q.QuestionId,
                        questionNo = q.QuestionNo,
                        marks = q.Marks,
                        type = q.Type,
                        isOptional = q.IsOptional,
                        optionalGroupCode = q.OptionalGroupCode,
                        marksAwarded = marking.QuestionMarks
                            .FirstOrDefault(qm => qm.QuestionId == q.QuestionId)?.MarksAwarded ?? 0,
                        isSkipped = marking.QuestionMarks
                            .FirstOrDefault(qm => qm.QuestionId == q.QuestionId)?.IsSkipped ?? false,
                        remarks = marking.QuestionMarks
                            .FirstOrDefault(qm => qm.QuestionId == q.QuestionId)?.Remarks ?? "",
                        isAttempted = marking.QuestionMarks
                            .FirstOrDefault(qm => qm.QuestionId == q.QuestionId)?.IsAttempted ?? false
                    }).ToList()
                }).ToList();

                return Ok(new
                {
                    marking = new
                    {
                        id = marking.Id,
                        scriptId = marking.ScriptId,
                        examinerId = marking.ExaminerId,
                        examinerName = marking.Examiner.Name,
                        allocationId = marking.AllocationId,
                        totalMarks = marking.TotalMarks,
                        percentage = marking.Percentage,
                        remarks = marking.Remarks,
                        status = marking.Status,
                        startedAt = marking.StartedAt,
                        submittedAt = marking.SubmittedAt
                    },
                    script = new
                    {
                        id = marking.Script.Id,
                        paperId = marking.Script.PaperId,
                        cleanPdfUrl = marking.Script.CleanPdfUrl,
                        status = marking.Script.Status,
                        maxMarks = marking.Script.MaxMarks
                    },
                    sections = sections
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        [HttpPost("{markingId}/question-marks")]
        [Authorize(Roles = "examiner")]
        public async Task<IActionResult> SaveQuestionMarks(int markingId, [FromBody] List<QuestionMarkDto> questionMarks)
        {
            try
            {
                var marking = await _context.Markings
                    .Include(m => m.QuestionMarks)
                    .Include(m => m.Script)
                    .FirstOrDefaultAsync(m => m.Id == markingId);

                if (marking == null)
                    return NotFound(new { success = false, message = "Marking not found" });

                if (marking.Status == "submitted")
                    return BadRequest(new { success = false, message = "Cannot update submitted marking" });

                // Remove existing question marks
                _context.QuestionMarks.RemoveRange(marking.QuestionMarks);

                // Add new question marks
                decimal totalMarks = 0;
                foreach (var qm in questionMarks)
                {
                    var question = await _context.Questions.FirstOrDefaultAsync(q => q.QuestionId == qm.QuestionId);
                    if (question == null)
                        continue;

                    var questionMark = new QuestionMark
                    {
                        MarkingId = markingId,
                        QuestionId = qm.QuestionId,
                        MarksAwarded = qm.MarksAwarded,
                        IsSkipped = qm.IsSkipped,
                        Remarks = qm.Remarks ?? "",
                        IsAttempted = qm.IsAttempted
                    };

                    _context.QuestionMarks.Add(questionMark);
                    if (!qm.IsSkipped)
                        totalMarks += qm.MarksAwarded;
                }

                // Update marking totals
                marking.TotalMarks = totalMarks;
                marking.Percentage = (totalMarks) * 100;
                marking.UpdatedAt = DateTime.UtcNow;

                _context.Markings.Update(marking);
                await _context.SaveChangesAsync();

                return Ok(new { success = true, message = "Question marks saved successfully", totalMarks = totalMarks });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        [HttpGet("{markingId}/question-marks")]
        public async Task<ActionResult<List<QuestionMarkDto>>> GetQuestionMarks(int markingId)
        {
            try
            {
                var questionMarks = await _context.QuestionMarks
                    .Where(qm => qm.MarkingId == markingId)
                    .Include(qm => qm.Question)
                    .Select(qm => new QuestionMarkDto
                    {
                        QuestionId = qm.QuestionId,
                        QuestionNo = qm.Question.QuestionNo,
                        MarksAwarded = qm.MarksAwarded,
                        IsSkipped = qm.IsSkipped,
                        Remarks = qm.Remarks,
                        IsAttempted = qm.IsAttempted
                    })
                    .ToListAsync();

                return Ok(questionMarks);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }
    }
}
