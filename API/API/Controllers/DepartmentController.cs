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
    public class DepartmentController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public DepartmentController(ApplicationDbContext context)
        {
            _context = context;
        }
        [AllowAnonymous]
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Department>>> GetDepartments(
     [FromQuery] int? universityId = null)
        {
            try
            {
                var query = _context.Departments.AsQueryable();

                if (universityId.HasValue)
                {
                    query = query.Where(d =>
                        d.UniversityId == universityId.Value);
                }

                var departments = await query
                    .Where(d => d.IsActive)
                    .Include(d => d.DepartmentSubjects)
                        .ThenInclude(ds => ds.Subject)
                    .OrderBy(d => d.Name)
                    .ToListAsync();

                return Ok(departments);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    success = false,
                    message = ex.Message
                });
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Department>> GetDepartment(int id)
        {
            try
            {
                var department = await _context.Departments
                    .Include(d => d.DepartmentSubjects)
                    .ThenInclude (ds => ds.Subject)
                    .FirstOrDefaultAsync(d => d.DepartmentId == id);

                if (department == null)
                    return NotFound(new { success = false, message = "Department not found" });

                return Ok(department);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        [HttpPost]
        [Authorize(Roles = "admin,coordinator")]
        public async Task<ActionResult<Department>> CreateDepartment([FromBody] Department department)
        {
            try
            {
                if (string.IsNullOrEmpty(department.Name))
                    return BadRequest(new { success = false, message = "Department name is required" });

                if (department.UniversityId <= 0)
                    return BadRequest(new { success = false, message = "University ID is required" });

                // Verify university exists
                var university = await _context.Universities.FindAsync(department.UniversityId);
                if (university == null)
                    return BadRequest(new { success = false, message = "University not found" });

                // Coordinators can only create departments for their own university
                var userType = User.FindFirst("userType")?.Value;
                if (userType == "coordinator")
                {
                    var userIdClaim = User.FindFirst("id")?.Value;
                    if (int.TryParse(userIdClaim, out int userId))
                    {
                        var user = await _context.Users.FindAsync(userId);
                        if (user?.UniversityId != department.UniversityId)
                            return Forbid();
                    }
                }

                department.IsActive = true;
                department.CreatedAt = DateTime.UtcNow;
                department.UpdatedAt = DateTime.UtcNow;

                _context.Departments.Add(department);
                await _context.SaveChangesAsync();

                return CreatedAtAction(nameof(GetDepartment), new { id = department.DepartmentId }, department);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "admin,coordinator")]
        public async Task<IActionResult> UpdateDepartment(int id, [FromBody] Department department)
        {
            try
            {
                var existingDepartment = await _context.Departments.FindAsync(id);
                if (existingDepartment == null)
                    return NotFound(new { success = false, message = "Department not found" });

                existingDepartment.Name = department.Name;
                existingDepartment.IsActive = department.IsActive;
                existingDepartment.UpdatedAt = DateTime.UtcNow;

                _context.Departments.Update(existingDepartment);
                await _context.SaveChangesAsync();

                return Ok(new { success = true, message = "Department updated successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        [HttpGet("{id}/subjects")]
        public async Task<ActionResult<IEnumerable<Subject>>> GetDepartmentSubjects(int id)
        {
            try
            {
                var subjects = await _context.DepartmentSubjects
                    .Where(ds => ds.DepartmentId == id)
                    .Select(ds => ds.Subject)
                    .Where(s => s.Status)
                    .Include(s => s.SubjectPapers)
                        .ThenInclude(sp => sp.Paper)
                    .OrderBy(s => s.SubName)
                    .ToListAsync();

                return Ok(subjects);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    success = false,
                    message = ex.Message
                });
            }
        }
    }
}
