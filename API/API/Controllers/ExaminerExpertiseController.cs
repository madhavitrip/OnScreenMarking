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
    public class ExaminerExpertiseController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ExaminerExpertiseController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("examiner/{examinerId}")]
        public async Task<ActionResult<IEnumerable<ExaminerExpertiseDto>>> GetExaminerExpertise(int examinerId)
        {
            try
            {
                var expertise = await _context.ExaminerExpertises
                    .Where(ee => ee.ExaminerId == examinerId && ee.IsActive)
                    .Include(ee => ee.Department)
                    .ToListAsync();

                var expertiseDtos = expertise.Select(e => new ExaminerExpertiseDto
                {
                    Id = e.Id,
                    ExaminerId = e.ExaminerId,
                    DepartmentId = e.DepartmentId,
                    IsActive = e.IsActive
                }).ToList();

                return Ok(expertiseDtos);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        [HttpGet("department/{departmentId}")]
        public async Task<ActionResult<IEnumerable<ExaminerExpertiseDto>>> GetDepartmentExaminers(int departmentId)
        {
            try
            {
                var expertise = await _context.ExaminerExpertises
                    .Where(ee => ee.DepartmentId == departmentId && ee.IsActive)
                    .Include(ee => ee.Examiner)
                    .Include(ee => ee.Department)
                    .ToListAsync();

                var expertiseDtos = expertise.Select(e => new ExaminerExpertiseDto
                {
                    Id = e.Id,
                    ExaminerId = e.ExaminerId,
                    DepartmentId = e.DepartmentId,
                    IsActive = e.IsActive
                }).ToList();

                return Ok(expertiseDtos);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        [HttpPost]
        [Authorize(Roles = "admin,coordinator")]
        public async Task<ActionResult<ExaminerExpertiseDto>> AddExpertise([FromBody] ExaminerExpertiseDto expertiseDto)
        {
            try
            {
                // Validate examiner exists
                var examiner = await _context.Users.FindAsync(expertiseDto.ExaminerId);
                if (examiner == null)
                    return BadRequest(new { success = false, message = "Examiner not found" });

                // Validate department exists if specified
                if (expertiseDto.DepartmentId.HasValue)
                {
                    var department = await _context.Departments.FindAsync(expertiseDto.DepartmentId.Value);
                    if (department == null)
                        return BadRequest(new { success = false, message = "Department not found" });
                }

                // Check if expertise already exists
                var existingExpertise = await _context.ExaminerExpertises
                    .FirstOrDefaultAsync(ee => ee.ExaminerId == expertiseDto.ExaminerId &&
                                              ee.DepartmentId == expertiseDto.DepartmentId);

                if (existingExpertise != null)
                {
                    existingExpertise.IsActive = true;
                    _context.ExaminerExpertises.Update(existingExpertise);
                }
                else
                {
                    var expertise = new ExaminerExpertise
                    {
                        ExaminerId = expertiseDto.ExaminerId,
                        DepartmentId = expertiseDto.DepartmentId,
                        IsActive = true
                    };

                    _context.ExaminerExpertises.Add(expertise);
                }

                await _context.SaveChangesAsync();

                return Ok(new { success = true, message = "Expertise added successfully", data = expertiseDto });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "admin,coordinator")]
        public async Task<IActionResult> UpdateExpertise(int id, [FromBody] ExaminerExpertiseDto expertiseDto)
        {
            try
            {
                var expertise = await _context.ExaminerExpertises.FindAsync(id);
                if (expertise == null)
                    return NotFound(new { success = false, message = "Expertise not found" });

                expertise.IsActive = expertiseDto.IsActive;

                _context.ExaminerExpertises.Update(expertise);
                await _context.SaveChangesAsync();

                return Ok(new { success = true, message = "Expertise updated successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "admin,coordinator")]
        public async Task<IActionResult> RemoveExpertise(int id)
        {
            try
            {
                var expertise = await _context.ExaminerExpertises.FindAsync(id);
                if (expertise == null)
                    return NotFound(new { success = false, message = "Expertise not found" });

                expertise.IsActive = false;

                _context.ExaminerExpertises.Update(expertise);
                await _context.SaveChangesAsync();

                return Ok(new { success = true, message = "Expertise removed successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }
    }
}
