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
    public class AllocationController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public AllocationController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Allocation>>> GetAllocations(
            [FromQuery] int? examinerId = null,
            [FromQuery] int? scriptId = null,
            [FromQuery] string status = null,
            [FromQuery] int page = 1,
            [FromQuery] int limit = 10)
        {
            try
            {
                var query = _context.Allocations.AsQueryable();

                if (examinerId.HasValue)
                    query = query.Where(a => a.ExaminerId == examinerId.Value);

                if (scriptId.HasValue)
                    query = query.Where(a => a.ScriptId == scriptId.Value);

                if (!string.IsNullOrEmpty(status))
                    query = query.Where(a => a.Status == status);

                var total = await query.CountAsync();
                var allocations = await query
                    .Include(a => a.Script)
                    .Include(a => a.Examiner)
                    .Skip((page - 1) * limit)
                    .Take(limit)
                    .OrderByDescending(a => a.AllocatedAt)
                    .ToListAsync();

                Response.Headers.Add("X-Total-Count", total.ToString());

                return Ok(allocations);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Allocation>> GetAllocation(int id)
        {
            try
            {
                var allocation = await _context.Allocations
                    .Include(a => a.Script)
                    .Include(a => a.Examiner)
                    .FirstOrDefaultAsync(a => a.AllocationId == id);

                if (allocation == null)
                    return NotFound(new { success = false, message = "Allocation not found" });

                return Ok(allocation);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        [HttpPost]
        [Authorize(Roles = "admin,coordinator")]
        public async Task<ActionResult<Allocation>> CreateAllocation([FromBody] AllocationDto allocationDto)
        {
            try
            {
                if (allocationDto.ScriptId <= 0)
                    return BadRequest(new { success = false, message = "Script ID is required" });

                if (allocationDto.ExaminerId <= 0)
                    return BadRequest(new { success = false, message = "Examiner ID is required" });

                // Verify script exists
                var script = await _context.Scripts.FindAsync(allocationDto.ScriptId);
                if (script == null)
                    return BadRequest(new { success = false, message = "Script not found" });

                // Verify examiner exists
                var examiner = await _context.Users.FindAsync(allocationDto.ExaminerId);
                if (examiner == null)
                    return BadRequest(new { success = false, message = "Examiner not found" });

                // Check if allocation already exists for this script
                var existingAllocation = await _context.Allocations
                    .FirstOrDefaultAsync(a => a.ScriptId == allocationDto.ScriptId && a.Status != "cancelled");

                if (existingAllocation != null)
                    return BadRequest(new { success = false, message = "Script already allocated" });

                var allocation = new Allocation
                {
                    ScriptId = allocationDto.ScriptId,
                    ExaminerId = allocationDto.ExaminerId,
                    AllocatedAt = DateTime.UtcNow,
                    Status = "allocated"
                };

                _context.Allocations.Add(allocation);
                
                // Update script status
                script.Status = "allocated";
                script.UpdatedAt = DateTime.UtcNow;
                _context.Scripts.Update(script);

                await _context.SaveChangesAsync();

                return CreatedAtAction(nameof(GetAllocation), new { id = allocation.AllocationId }, allocation);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        [HttpPut("{id}/start")]
        [Authorize(Roles = "examiner")]
        public async Task<IActionResult> StartMarking(int id)
        {
            try
            {
                var allocation = await _context.Allocations.FindAsync(id);
                if (allocation == null)
                    return NotFound(new { success = false, message = "Allocation not found" });

                if (allocation.Status != "allocated")
                    return BadRequest(new { success = false, message = "Allocation is not in allocated status" });

                allocation.StartedAt = DateTime.UtcNow;
                allocation.Status = "in_progress";

                _context.Allocations.Update(allocation);
                await _context.SaveChangesAsync();

                return Ok(new { success = true, message = "Marking started successfully" });
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
                var allocation = await _context.Allocations
                    .Include(a => a.Script)
                    .FirstOrDefaultAsync(a => a.AllocationId == id);

                if (allocation == null)
                    return NotFound(new { success = false, message = "Allocation not found" });

                if (allocation.Status != "in_progress")
                    return BadRequest(new { success = false, message = "Allocation is not in progress" });

                allocation.SubmittedAt = DateTime.UtcNow;
                allocation.Status = "submitted";

                if (allocation.StartedAt.HasValue)
                {
                    allocation.TimeTakenSeconds = (int)(allocation.SubmittedAt.Value - allocation.StartedAt.Value).TotalSeconds;
                }

                _context.Allocations.Update(allocation);

                // Update script status
                if (allocation.Script != null)
                {
                    allocation.Script.Status = "completed";
                    allocation.Script.UpdatedAt = DateTime.UtcNow;
                    _context.Scripts.Update(allocation.Script);
                }

                await _context.SaveChangesAsync();

                return Ok(new { success = true, message = "Marking submitted successfully", timeTaken = allocation.TimeTakenSeconds });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        [HttpPut("{id}/cancel")]
        [Authorize(Roles = "admin,coordinator")]
        public async Task<IActionResult> CancelAllocation(int id)
        {
            try
            {
                var allocation = await _context.Allocations
                    .Include(a => a.Script)
                    .FirstOrDefaultAsync(a => a.AllocationId == id);

                if (allocation == null)
                    return NotFound(new { success = false, message = "Allocation not found" });

                allocation.Status = "cancelled";

                _context.Allocations.Update(allocation);

                // Reset script status
                if (allocation.Script != null)
                {
                    allocation.Script.Status = "pending";
                    allocation.Script.UpdatedAt = DateTime.UtcNow;
                    _context.Scripts.Update(allocation.Script);
                }

                await _context.SaveChangesAsync();

                return Ok(new { success = true, message = "Allocation cancelled successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        [HttpGet("examiner/{examinerId}")]
        public async Task<ActionResult<IEnumerable<Allocation>>> GetExaminerAllocations(int examinerId)
        {
            try
            {
                var allocations = await _context.Allocations
                    .Where(a => a.ExaminerId == examinerId)
                    .Include(a => a.Script)
                    .Include(a => a.Examiner)
                    .OrderByDescending(a => a.AllocatedAt)
                    .ToListAsync();

                return Ok(allocations);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        [HttpGet("script/{scriptId}")]
        public async Task<ActionResult<Allocation>> GetScriptAllocation(int scriptId)
        {
            try
            {
                var allocation = await _context.Allocations
                    .Include(a => a.Script)
                    .Include(a => a.Examiner)
                    .FirstOrDefaultAsync(a => a.ScriptId == scriptId && a.Status != "cancelled");

                if (allocation == null)
                    return NotFound(new { success = false, message = "No active allocation found for this script" });

                return Ok(allocation);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }
    }
}
