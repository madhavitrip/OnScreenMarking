using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using API.Data;
using API.Models;

namespace API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SubjectConfigController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public SubjectConfigController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<SubjectConfig>>> GetAllSubjects()
        {
            try
            {
                var configs = await _context.SubjectConfigs
                    .Include(sc => sc.Department)
                    .Include(sc => sc.Sections)
                    .ThenInclude(s => s.Questions)
                    .OrderBy(sc => sc.Name)
                    .ToListAsync();

                return Ok(configs);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<SubjectConfig>> GetSubject(int id)
        {
            try
            {
                var config = await _context.SubjectConfigs
                    .Include(sc => sc.Department)
                    .Include(sc => sc.Sections)
                    .ThenInclude(s => s.Questions)
                    .FirstOrDefaultAsync(sc => sc.Id == id);

                if (config == null)
                    return NotFound(new { success = false, message = "Subject configuration not found" });

                return Ok(config);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        [HttpGet("department/{departmentId}")]
        public async Task<ActionResult<IEnumerable<SubjectConfig>>> GetSubjectsByDepartment(int departmentId)
        {
            try
            {
                var configs = await _context.SubjectConfigs
                    .Where(sc => sc.DepartmentId == departmentId && sc.IsActive)
                    .Include(sc => sc.Department)
                    .Include(sc => sc.Sections)
                    .ThenInclude(s => s.Questions)
                    .OrderBy(sc => sc.Name)
                    .ToListAsync();

                return Ok(configs);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        [HttpPost]
        [Authorize(Roles = "admin")]
        public async Task<ActionResult<SubjectConfig>> CreateSubject([FromBody] SubjectConfig config)
        {
            try
            {
                if (_context.SubjectConfigs.Any(sc => sc.Name == config.Name && sc.DepartmentId == config.DepartmentId))
                    return BadRequest(new { success = false, message = "Subject configuration already exists for this department" });

                // Verify department exists
                var department = await _context.Departments.FindAsync(config.DepartmentId);
                if (department == null)
                    return BadRequest(new { success = false, message = "Department not found" });

                _context.SubjectConfigs.Add(config);
                await _context.SaveChangesAsync();

                return CreatedAtAction(nameof(GetSubject), new { id = config.Id }, config);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> UpdateSubject(int id, [FromBody] SubjectConfig config)
        {
            try
            {
                var existingConfig = await _context.SubjectConfigs.FindAsync(id);
                if (existingConfig == null)
                    return NotFound(new { success = false, message = "Subject configuration not found" });

                existingConfig.Name = config.Name;
                existingConfig.Code = config.Code;
                existingConfig.TotalMarks = config.TotalMarks;
                existingConfig.Duration = config.Duration;
                existingConfig.IsActive = config.IsActive;
                existingConfig.UpdatedAt = DateTime.UtcNow;

                _context.SubjectConfigs.Update(existingConfig);
                await _context.SaveChangesAsync();

                return Ok(new { success = true, message = "Subject configuration updated successfully", data = existingConfig });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> DeleteSubject(int id)
        {
            try
            {
                var config = await _context.SubjectConfigs.FindAsync(id);
                if (config == null)
                    return NotFound(new { success = false, message = "Subject configuration not found" });

                _context.SubjectConfigs.Remove(config);
                await _context.SaveChangesAsync();

                return Ok(new { success = true, message = "Subject configuration deleted successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }
    }
}
