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
    public class ScriptsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ScriptsController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<ScriptDto>>> GetScripts(
            [FromQuery] string status = null,
            [FromQuery] int? paperId = null,
            [FromQuery] int page = 1,
            [FromQuery] int limit = 10)
        {
            try
            {
                var query = _context.Scripts.AsQueryable();

                if (!string.IsNullOrEmpty(status))
                    query = query.Where(s => s.Status == status);

                if (paperId.HasValue)
                    query = query.Where(s => s.PaperId == paperId.Value);

                var total = await query.CountAsync();
                var scripts = await query
                    .Include(s => s.Paper)
                    .Skip((page - 1) * limit)
                    .Take(limit)
                    .OrderByDescending(s => s.CreatedAt)
                    .ToListAsync();

                var scriptDtos = scripts.Select(s => new ScriptDto
                {
                    Id = s.Id,
                    ScriptId = s.ScriptId,
                    Barcode = s.Barcode,
                    PaperId = s.PaperId,
                    CleanPdfUrl = s.CleanPdfUrl,
                    Status = s.Status,
                    IsReEvaluationRequested = s.IsReEvaluationRequested,
                    TotalMarks = s.TotalMarks,
                    MaxMarks = s.MaxMarks,
                    Percentage = s.Percentage,
                    Remarks = s.Remarks,
                    SubmittedAt = s.SubmittedAt
                }).ToList();

                Response.Headers.Add("X-Total-Count", total.ToString());
                Response.Headers.Add("X-Page", page.ToString());
                Response.Headers.Add("X-Limit", limit.ToString());

                return Ok(scriptDtos);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ScriptDto>> GetScript(int id)
        {
            try
            {
                var script = await _context.Scripts
                    .Include(s => s.Paper)
                    .FirstOrDefaultAsync(s => s.Id == id);

                if (script == null)
                    return NotFound(new { success = false, message = "Script not found" });

                var scriptDto = new ScriptDto
                {
                    Id = script.Id,
                    ScriptId = script.ScriptId,
                    Barcode = script.Barcode,
                    PaperId = script.PaperId,
                    CleanPdfUrl = script.CleanPdfUrl,
                    Status = script.Status,
                    IsReEvaluationRequested = script.IsReEvaluationRequested,
                    TotalMarks = script.TotalMarks,
                    MaxMarks = script.MaxMarks,
                    Percentage = script.Percentage,
                    Remarks = script.Remarks,
                    SubmittedAt = script.SubmittedAt
                };

                return Ok(scriptDto);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        [HttpPost]
        [Authorize(Roles = "admin,coordinator")]
        public async Task<ActionResult<ScriptDto>> CreateScript([FromBody] ScriptDto scriptDto)
        {
            try
            {
                // Validate paper exists
                var paper = await _context.Papers.FindAsync(scriptDto.PaperId);
                if (paper == null)
                    return BadRequest(new { success = false, message = "Paper not found" });

                if (_context.Scripts.Any(s => s.ScriptId == scriptDto.ScriptId))
                    return BadRequest(new { success = false, message = "Script already exists" });

                var script = new Script
                {
                    ScriptId = scriptDto.ScriptId,
                    Barcode = scriptDto.Barcode,
                    PaperId = scriptDto.PaperId,
                    CleanPdfUrl = scriptDto.CleanPdfUrl,
                    Status = "pending",
                    MaxMarks = scriptDto.MaxMarks
                };

                _context.Scripts.Add(script);
                await _context.SaveChangesAsync();

                return CreatedAtAction(nameof(GetScript), new { id = script.Id }, scriptDto);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateScript(int id, [FromBody] ScriptStatusUpdateRequest request)
        {
            try
            {
                var existingScript = await _context.Scripts.FindAsync(id);
                if (existingScript == null)
                    return NotFound(new { success = false, message = "Script not found" });

                existingScript.Status = request.Status;
                existingScript.Remarks = request.Remarks;
                existingScript.UpdatedAt = DateTime.UtcNow;

                if (request.Status == "completed")
                    existingScript.SubmittedAt = DateTime.UtcNow;

                _context.Scripts.Update(existingScript);
                await _context.SaveChangesAsync();

                return Ok(new { success = true, message = "Script updated successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        [HttpPut("{id}/assign")]
        [Authorize(Roles = "admin,coordinator")]
        public async Task<IActionResult> AssignScript(int id, [FromBody] AssignScriptRequest request)
        {
            try
            {
                var script = await _context.Scripts
                    .Include(s => s.Paper)
                    .FirstOrDefaultAsync(s => s.Id == id);
                
                if (script == null)
                    return NotFound(new { success = false, message = "Script not found" });

                // Verify examiner exists
                var examiner = await _context.Users.FindAsync(request.ExaminerId);
                if (examiner == null)
                    return BadRequest(new { success = false, message = "Examiner not found" });

                // Create allocation
                var allocation = new Allocation
                {
                    ScriptId = id,
                    ExaminerId = request.ExaminerId,
                    AllocatedAt = DateTime.UtcNow,
                    Status = "allocated"
                };

                _context.Allocations.Add(allocation);
                script.Status = "allocated";
                script.UpdatedAt = DateTime.UtcNow;

                _context.Scripts.Update(script);
                await _context.SaveChangesAsync();

                return Ok(new { success = true, message = "Script assigned successfully", allocationId = allocation.AllocationId });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        [HttpGet("examiner/{examinerId}")]
        public async Task<ActionResult<IEnumerable<ScriptDto>>> GetExaminerScripts(int examinerId)
        {
            try
            {
                var allocations = await _context.Allocations
                    .Where(a => a.ExaminerId == examinerId)
                    .Select(a => a.ScriptId)
                    .ToListAsync();

                var scripts = await _context.Scripts
                    .Where(s => allocations.Contains(s.Id))
                    .Include(s => s.Paper)
                    .OrderByDescending(s => s.CreatedAt)
                    .ToListAsync();

                var scriptDtos = scripts.Select(s => new ScriptDto
                {
                    Id = s.Id,
                    ScriptId = s.ScriptId,
                    Barcode = s.Barcode,
                    PaperId = s.PaperId,
                    CleanPdfUrl = s.CleanPdfUrl,
                    Status = s.Status,
                    IsReEvaluationRequested = s.IsReEvaluationRequested,
                    TotalMarks = s.TotalMarks,
                    MaxMarks = s.MaxMarks,
                    Percentage = s.Percentage,
                    Remarks = s.Remarks,
                    SubmittedAt = s.SubmittedAt
                }).ToList();

                return Ok(scriptDtos);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        [HttpGet("paper/{paperId}")]
        public async Task<ActionResult<IEnumerable<ScriptDto>>> GetPaperScripts(int paperId)
        {
            try
            {
                var scripts = await _context.Scripts
                    .Where(s => s.PaperId == paperId)
                    .Include(s => s.Paper)
                    .OrderByDescending(s => s.CreatedAt)
                    .ToListAsync();

                var scriptDtos = scripts.Select(s => new ScriptDto
                {
                    Id = s.Id,
                    ScriptId = s.ScriptId,
                    Barcode = s.Barcode,
                    PaperId = s.PaperId,
                    CleanPdfUrl = s.CleanPdfUrl,
                    Status = s.Status,
                    IsReEvaluationRequested = s.IsReEvaluationRequested,
                    TotalMarks = s.TotalMarks,
                    MaxMarks = s.MaxMarks,
                    Percentage = s.Percentage,
                    Remarks = s.Remarks,
                    SubmittedAt = s.SubmittedAt
                }).ToList();

                return Ok(scriptDtos);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }
    }
}
