using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using API.Data;
using API.Models;

namespace API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class PaperExaminersController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public PaperExaminersController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("paper/{paperId}")]
        public async Task<ActionResult<IEnumerable<PaperExaminer>>> GetPaperExaminers(int paperId)
        {
            try
            {
                var assignments = await _context.PaperExaminers
                    .Include(pe => pe.Examiner)
                    .Where(pe => pe.PaperId == paperId)
                    .ToListAsync();

                return Ok(assignments);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        [HttpPost("assign")]
        [Authorize(Roles = "admin,coordinator")]
        public async Task<IActionResult> AssignExaminer([FromBody] PaperExaminer assignment)
        {
            try
            {
                // Check if already assigned
                if (await _context.PaperExaminers.AnyAsync(pe => pe.PaperId == assignment.PaperId && pe.ExaminerId == assignment.ExaminerId))
                {
                    return BadRequest(new { success = false, message = "Examiner already assigned to this paper" });
                }

                assignment.AssignedAt = DateTime.UtcNow;
                assignment.IsActive = true;

                _context.PaperExaminers.Add(assignment);
                await _context.SaveChangesAsync();

                return Ok(new { success = true, message = "Examiner assigned successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        [HttpDelete("remove/{id}")]
        [Authorize(Roles = "admin,coordinator")]
        public async Task<IActionResult> RemoveAssignment(int id)
        {
            try
            {
                var assignment = await _context.PaperExaminers.FindAsync(id);
                if (assignment == null)
                    return NotFound(new { success = false, message = "Assignment not found" });

                _context.PaperExaminers.Remove(assignment);
                await _context.SaveChangesAsync();

                return Ok(new { success = true, message = "Examiner removed from paper" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }
    }
}
