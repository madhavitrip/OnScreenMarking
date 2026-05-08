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
                // Verify script exists and examiner is assigned
                var script = await _context.Scripts
                    .Include(s => s.Paper)
                    .FirstOrDefaultAsync(s => s.Id == request.ScriptId);

                if (script == null)
                    return BadRequest(new { success = false, message = "Script not found" });

                if (script.AssignedExaminerId != request.ExaminerId)
                    return BadRequest(new { success = false, message = "Script not assigned to this examiner" });

                var existingMarking = await _context.Markings
                    .FirstOrDefaultAsync(m => m.ScriptId == request.ScriptId && m.ExaminerId == request.ExaminerId);

                if (existingMarking != null)
                    return BadRequest(new { success = false, message = "Marking already exists for this script" });

                // Get examiner's department
                var examiner = await _context.Users.FindAsync(request.ExaminerId);
                var departmentId = examiner?.DepartmentId;

                var marking = new Marking
                {
                    ScriptId = request.ScriptId,
                    ExaminerId = request.ExaminerId,
                    DepartmentId = departmentId,
                    MarksJson = request.MarksJson,
                    SectionMarksJson = request.SectionMarksJson,
                    TotalMarks = request.TotalMarks,
                    MaxMarks = script.MaxMarks,
                    Percentage = (request.TotalMarks / script.MaxMarks) * 100,
                    Remarks = request.Remarks,
                    Status = "draft"
                };

                _context.Markings.Add(marking);
                await _context.SaveChangesAsync();

                var markingDto = new MarkingDto
                {
                    Id = marking.Id,
                    ScriptId = marking.ScriptId,
                    ExaminerId = marking.ExaminerId,
                    DepartmentId = marking.DepartmentId,
                    MarksJson = marking.MarksJson,
                    SectionMarksJson = marking.SectionMarksJson,
                    TotalMarks = marking.TotalMarks,
                    MaxMarks = marking.MaxMarks,
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
                    .Include(m => m.Department)
                    .FirstOrDefaultAsync(m => m.Id == id);

                if (marking == null)
                    return NotFound(new { success = false, message = "Marking not found" });

                var markingDto = new MarkingDto
                {
                    Id = marking.Id,
                    ScriptId = marking.ScriptId,
                    ExaminerId = marking.ExaminerId,
                    DepartmentId = marking.DepartmentId,
                    MarksJson = marking.MarksJson,
                    SectionMarksJson = marking.SectionMarksJson,
                    TotalMarks = marking.TotalMarks,
                    MaxMarks = marking.MaxMarks,
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

                existingMarking.MarksJson = request.MarksJson;
                existingMarking.SectionMarksJson = request.SectionMarksJson;
                existingMarking.TotalMarks = request.TotalMarks;
                existingMarking.Percentage = (request.TotalMarks / existingMarking.MaxMarks) * 100;
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
                    .Include(m => m.Department)
                    .Skip((page - 1) * limit)
                    .Take(limit)
                    .OrderByDescending(m => m.CreatedAt)
                    .ToListAsync();

                var markingDtos = markings.Select(m => new MarkingDto
                {
                    Id = m.Id,
                    ScriptId = m.ScriptId,
                    ExaminerId = m.ExaminerId,
                    DepartmentId = m.DepartmentId,
                    MarksJson = m.MarksJson,
                    SectionMarksJson = m.SectionMarksJson,
                    TotalMarks = m.TotalMarks,
                    MaxMarks = m.MaxMarks,
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
                    .Include(m => m.Department)
                    .FirstOrDefaultAsync(m => m.ScriptId == scriptId);

                if (marking == null)
                    return NotFound(new { success = false, message = "Marking not found for this script" });

                var markingDto = new MarkingDto
                {
                    Id = marking.Id,
                    ScriptId = marking.ScriptId,
                    ExaminerId = marking.ExaminerId,
                    DepartmentId = marking.DepartmentId,
                    MarksJson = marking.MarksJson,
                    SectionMarksJson = marking.SectionMarksJson,
                    TotalMarks = marking.TotalMarks,
                    MaxMarks = marking.MaxMarks,
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
    }
}
