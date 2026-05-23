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
        public async Task<ActionResult<IEnumerable<Subject>>> GetSubjects(
    [FromQuery] int? departmentId = null)
        {
            try
            {
                var query = _context.Subjects
                    .Where(s => s.Status)
                    .Include(s => s.DepartmentSubjects)
                        .ThenInclude(ds => ds.Department)
                    .Include(s => s.SubjectPapers)
                        .ThenInclude(sp => sp.Paper)
                    .Include(s => s.ExaminerExpertises)
                    .AsQueryable();

                if (departmentId.HasValue)
                {
                    query = query.Where(s =>
                        s.DepartmentSubjects.Any(ds =>
                            ds.DepartmentId == departmentId.Value));
                }

                var subjects = await query
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

        [HttpGet("Project")]
        public async Task<ActionResult<IEnumerable<Subject>>> GetSubjectByProject(
     [FromQuery] int projectId)
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

                // Get department ids of university
                var departmentIds = await _context.Departments
                    .Where(d => d.UniversityId == universityId)
                    .Select(d => d.DepartmentId)
                    .ToListAsync();

                // Get subjects mapped to those departments
                var subjects = await _context.Subjects
                    .Where(s =>
                        s.Status &&
                        s.DepartmentSubjects.Any(ds =>
                            departmentIds.Contains(ds.DepartmentId)))
                    .Include(s => s.DepartmentSubjects)
                        .ThenInclude(ds => ds.Department)
                    .Include(s => s.SubjectPapers)
                        .ThenInclude(sp => sp.Paper)
                    .Include(s => s.ExaminerExpertises)
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
        [HttpGet("University")]
        public async Task<ActionResult<IEnumerable<Subject>>> GetSubjectByUniversity(
      [FromQuery] int universityId)
        {
            try
            {
                if (universityId == 0)
                {
                    return BadRequest(new
                    {
                        success = false,
                        message = "Invalid university id."
                    });
                }

                // Get department ids of university
                var departmentIds = await _context.Departments
                    .Where(d => d.UniversityId == universityId)
                    .Select(d => d.DepartmentId)
                    .ToListAsync();

                // Get subjects mapped to those departments
                var subjects = await _context.Subjects
                    .Where(s =>
                        s.Status &&
                        s.DepartmentSubjects.Any(ds =>
                            departmentIds.Contains(ds.DepartmentId)))
                    .Include(s => s.DepartmentSubjects)
                        .ThenInclude(ds => ds.Department)
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
        [HttpGet("{id}")]
        public async Task<ActionResult<Subject>> GetSubject(int id)
        {
            try
            {
                var subject = await _context.Subjects
                    .Include(s => s.DepartmentSubjects)
                        .ThenInclude(ds => ds.Department)
                    .Include(s => s.SubjectPapers)
                        .ThenInclude(sp => sp.Paper)
                    .Include(s => s.ExaminerExpertises)
                    .FirstOrDefaultAsync(s => s.SubjectId == id);

                if (subject == null)
                {
                    return NotFound(new
                    {
                        success = false,
                        message = "Subject not found"
                    });
                }

                return Ok(subject);
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
        [HttpPost]
        [Authorize(Roles = "admin,coordinator")]
        public async Task<ActionResult<Subject>> CreateSubject(
     [FromBody] SubjectDto subjectDto)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(subjectDto.SubjectName))
                {
                    return BadRequest(new
                    {
                        success = false,
                        message = "Subject name is required"
                    });
                }

                if (string.IsNullOrWhiteSpace(subjectDto.SubjectCode))
                {
                    return BadRequest(new
                    {
                        success = false,
                        message = "Subject code is required"
                    });
                }

                if (subjectDto.DepartmentId <= 0)
                {
                    return BadRequest(new
                    {
                        success = false,
                        message = "Department ID is required"
                    });
                }

                // Verify department exists
                var department = await _context.Departments
                    .FirstOrDefaultAsync(d =>
                        d.DepartmentId == subjectDto.DepartmentId &&
                        d.IsActive);

                if (department == null)
                {
                    return BadRequest(new
                    {
                        success = false,
                        message = "Department not found"
                    });
                }

                // Optional duplicate check
                var existingSubject = await _context.Subjects
                    .FirstOrDefaultAsync(s =>
                        s.SubName == subjectDto.SubjectName);

                Subject subject;

                if (existingSubject != null)
                {
                    subject = existingSubject;
                }
                else
                {
                    subject = new Subject
                    {
                        SubName = subjectDto.SubjectName,
                        SubCode = subjectDto.SubjectCode,
                        Status = true,
                        created_at = DateTime.UtcNow,
                        updated_at = DateTime.UtcNow
                    };

                    _context.Subjects.Add(subject);

                    await _context.SaveChangesAsync();
                }

                // Check mapping already exists
                var mappingExists = await _context.DepartmentSubjects
                    .AnyAsync(ds =>
                        ds.DepartmentId == subjectDto.DepartmentId &&
                        ds.SubjectId == subject.SubjectId);

                if (!mappingExists)
                {
                    var departmentSubject = new DepartmentSubject
                    {
                        DepartmentId = subjectDto.DepartmentId,
                        SubjectId = subject.SubjectId
                    };

                    _context.DepartmentSubjects.Add(departmentSubject);

                    await _context.SaveChangesAsync();
                }

                return CreatedAtAction(
                    nameof(GetSubject),
                    new { id = subject.SubjectId },
                    subject);
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

        [HttpPut("{id}")]
        [Authorize(Roles = "admin,coordinator")]
        public async Task<IActionResult> UpdateSubject(int id, [FromBody] SubjectDto subjectDto)
        {
            try
            {
                var subject = await _context.Subjects.FindAsync(id);
                if (subject == null)
                    return NotFound(new { success = false, message = "Subject not found" });

                if (string.IsNullOrWhiteSpace(subjectDto.SubjectCode))
                {
                    return BadRequest(new { success = false, message = "Subject code is required" });
                }

                subject.SubName = subjectDto.SubjectName;
                subject.SubCode = subjectDto.SubjectCode;
                subject.Status = subjectDto.IsActive;

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
                var papers = await _context.SubjectPapers
                    .Where(sp => sp.SubjectId == id)
                    .Select(sp => sp.Paper)
                    .Where(p => p.IsActive)
                    .Include(p => p.Sections)
                    .OrderBy(p => p.PaperNumber)
                    .ToListAsync();

                return Ok(papers);
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

        [HttpGet("{id}/departments")]
        public async Task<ActionResult<IEnumerable<Department>>> GetSubjectDepartments(int id, [FromQuery] int? universityId = null)
        {
            try
            {
                var query = _context.DepartmentSubjects
                    .Where(ds => ds.SubjectId == id)
                    .Select(ds => ds.Department)
                    .Where(d => d.IsActive)
                    .AsQueryable();

                if (universityId.HasValue && universityId.Value > 0)
                {
                    query = query.Where(d => d.UniversityId == universityId.Value);
                }

                var departments = await query
                    .OrderBy(d => d.Name)
                    .ToListAsync();

                return Ok(departments);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        [HttpPost("{subjectId}/departments/{departmentId}")]
        [Authorize(Roles = "admin,coordinator")]
        public async Task<IActionResult> AddDepartmentToSubject(int subjectId, int departmentId)
        {
            try
            {
                var subject = await _context.Subjects.FindAsync(subjectId);
                if (subject == null)
                    return NotFound(new { success = false, message = "Subject not found" });

                var department = await _context.Departments.FindAsync(departmentId);
                if (department == null)
                    return NotFound(new { success = false, message = "Department not found" });

                var mappingExists = await _context.DepartmentSubjects
                    .AnyAsync(ds => ds.DepartmentId == departmentId && ds.SubjectId == subjectId);

                if (!mappingExists)
                {
                    var departmentSubject = new DepartmentSubject
                    {
                        DepartmentId = departmentId,
                        SubjectId = subjectId
                    };

                    _context.DepartmentSubjects.Add(departmentSubject);
                    await _context.SaveChangesAsync();
                }

                return Ok(new { success = true, message = "Department added to subject successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        [HttpDelete("{subjectId}/departments/{departmentId}")]
        [Authorize(Roles = "admin,coordinator")]
        public async Task<IActionResult> RemoveDepartmentFromSubject(int subjectId, int departmentId)
        {
            try
            {
                var mapping = await _context.DepartmentSubjects
                    .FirstOrDefaultAsync(ds => ds.DepartmentId == departmentId && ds.SubjectId == subjectId);

                if (mapping == null)
                    return NotFound(new { success = false, message = "Mapping not found" });

                _context.DepartmentSubjects.Remove(mapping);
                await _context.SaveChangesAsync();

                return Ok(new { success = true, message = "Department removed from subject successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }
    }
}
