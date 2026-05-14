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
    public class SubjectController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public SubjectController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Subject>>> GetSubjects([FromQuery] int? departmentId = null)
        {
            try
            {
                var query = _context.Subjects.AsQueryable();

                if (departmentId.HasValue)
                    query = query.Where(s => s.DepartmentId == departmentId.Value);

                var subjects = await query
                    .Where(s => s.IsActive)
                    .Include(s => s.Department)
                    .Include(s => s.Papers)
                    .Include(s => s.ExaminerExpertises)
                    .OrderBy(s => s.SubjectName)
                    .ToListAsync();

                return Ok(subjects);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        [HttpGet("Project")]
        public async Task<ActionResult<IEnumerable<Subject>>> GetSubjectByProject([FromQuery] int projectId)
        {
            try
            {
                // Get UniversityId from Project
                var universityId = await _context.Projects
                    .Where(p => p.ProjectId == projectId)
                    .Select(p => p.UniversityId)
                    .FirstOrDefaultAsync();

                if (universityId == 0)
                {
                    return NotFound(new
                    {
                        success = false,
                        message = "University not found for this project."
                    });
                }

                // Get Department Ids of that University
                var departmentIds = await _context.Departments
                    .Where(d => d.UniversityId == universityId)
                    .Select(d => d.DepartmentId)
                    .ToListAsync();

                // Get Subjects by DepartmentIds
                var subjects = await _context.Subjects
                    .Where(s => departmentIds.Contains(s.DepartmentId) && s.IsActive)
                    .Include(s => s.Department)
                    .Include(s => s.Papers)
                    .Include(s => s.ExaminerExpertises)
                    .OrderBy(s => s.SubjectName)
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

        [HttpGet("University")]
        public async Task<ActionResult<IEnumerable<Subject>>> GetSubjectByUniversity([FromQuery] int universityId)
        {
            try
            {
                if (universityId == 0)
                {
                    return NotFound(new
                    {
                        success = false,
                        message = "University not found for this project."
                    });
                }

                // Get Department Ids of that University
                var departmentIds = await _context.Departments
                    .Where(d => d.UniversityId == universityId)
                    .Select(d => d.DepartmentId)
                    .ToListAsync();

                // Get Subjects by DepartmentIds
                var subjects = await _context.Subjects
                    .Where(s => departmentIds.Contains(s.DepartmentId) && s.IsActive)
                    .Include(s => s.Department)
                    .OrderBy(s => s.SubjectName)
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

        [HttpGet("{id}")]
        public async Task<ActionResult<Subject>> GetSubject(int id)
        {
            try
            {
                var subject = await _context.Subjects
                    .Include(s => s.Department)
                    .Include(s => s.Papers)
                    .Include(s => s.ExaminerExpertises)
                    .FirstOrDefaultAsync(s => s.SubjectId == id);

                if (subject == null)
                    return NotFound(new { success = false, message = "Subject not found" });

                return Ok(subject);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        [HttpPost]
        [Authorize(Roles = "admin,coordinator")]
        public async Task<ActionResult<Subject>> CreateSubject([FromBody] SubjectDto subjectDto)
        {
            try
            {
                if (string.IsNullOrEmpty(subjectDto.SubjectName))
                    return BadRequest(new { success = false, message = "Subject name is required" });

                if (subjectDto.DepartmentId <= 0)
                    return BadRequest(new { success = false, message = "Department ID is required" });

                // Verify department exists
                var department = await _context.Departments.FindAsync(subjectDto.DepartmentId);
                if (department == null)
                    return BadRequest(new { success = false, message = "Department not found" });

                var subject = new Subject
                {
                    SubjectName = subjectDto.SubjectName,
                    DepartmentId = subjectDto.DepartmentId,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                };

                _context.Subjects.Add(subject);
                await _context.SaveChangesAsync();

                return CreatedAtAction(nameof(GetSubject), new { id = subject.SubjectId }, subject);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "admin,coordinator")]
        public async Task<IActionResult> UpdateSubject(int id, [FromBody] SubjectDto subjectDto)
        {
            try
            {
                var subject = await _context.Subjects.FindAsync(id);
                if (subject == null)
                    return NotFound(new { success = false, message = "Subject not found" });

                subject.SubjectName = subjectDto.SubjectName;
                subject.IsActive = subjectDto.IsActive;

                _context.Subjects.Update(subject);
                await _context.SaveChangesAsync();

                return Ok(new { success = true, message = "Subject updated successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        [HttpGet("{id}/papers")]
        public async Task<ActionResult<IEnumerable<Paper>>> GetSubjectPapers(int id)
        {
            try
            {
                var papers = await _context.Papers
                    .Where(p => p.SubjectId == id && p.IsActive)
                    .Include(p => p.Sections)
                    .OrderBy(p => p.PaperNumber)
                    .ToListAsync();

                return Ok(papers);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        [HttpGet("{id}/examiners")]
        public async Task<ActionResult<IEnumerable<ExaminerExpertise>>> GetSubjectExaminers(int id)
        {
            try
            {
                var examiners = await _context.ExaminerExpertises
                    .Where(ee => ee.SubjectId == id && ee.IsActive)
                    .Include(ee => ee.Examiner)
                    .ToListAsync();

                return Ok(examiners);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }
    }
}
