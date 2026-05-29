using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using API.Data;
using API.Models;
using API.Models.DTOs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class CoursesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public CoursesController(ApplicationDbContext context)
        {
            _context = context;
        }

        [AllowAnonymous]
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Courses>>> GetCourses(
            [FromQuery] int? departmentId = null,
            [FromQuery] int? universityId = null)
        {
            try
            {
                var query = _context.Courses.AsQueryable();

                if (departmentId.HasValue)
                {
                    query = query.Where(c => c.DepartmentId == departmentId.Value);
                }
                else if (universityId.HasValue)
                {
                    query = query.Where(c => c.Department.UniversityId == universityId.Value);
                }

                var courses = await query
                    .Include(c => c.Department)
                    .Include(c => c.CourseSubjects)
                        .ThenInclude(cs => cs.Subject)
                    .OrderBy(c => c.Name)
                    .ToListAsync();

                return Ok(courses);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Courses>> GetCourse(int id)
        {
            try
            {
                var course = await _context.Courses
                    .Include(c => c.Department)
                    .Include(c => c.CourseSubjects)
                        .ThenInclude(cs => cs.Subject)
                    .FirstOrDefaultAsync(c => c.Id == id);

                if (course == null)
                    return NotFound(new { success = false, message = "Course not found" });

                return Ok(course);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        [HttpPost]
        [Authorize(Roles = "admin,coordinator")]
        public async Task<ActionResult<Courses>> CreateCourse([FromBody] CourseDto courseDto)
        {
            try
            {
                if (string.IsNullOrEmpty(courseDto.Name))
                    return BadRequest(new { success = false, message = "Course name is required" });

                if (courseDto.DepartmentId <= 0)
                    return BadRequest(new { success = false, message = "Department ID is required" });

                var department = await _context.Departments.FindAsync(courseDto.DepartmentId);
                if (department == null)
                    return BadRequest(new { success = false, message = "Department not found" });

                var course = new Courses
                {
                    Name = courseDto.Name,
                    Type = courseDto.Type,
                    DepartmentId = courseDto.DepartmentId,
                    IsActive = true
                };

                _context.Courses.Add(course);
                await _context.SaveChangesAsync();

                return CreatedAtAction(nameof(GetCourse), new { id = course.Id }, course);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "admin,coordinator")]
        public async Task<IActionResult> UpdateCourse(int id, [FromBody] CourseDto courseDto)
        {
            try
            {
                var course = await _context.Courses.FindAsync(id);
                if (course == null)
                    return NotFound(new { success = false, message = "Course not found" });

                if (!string.IsNullOrEmpty(courseDto.Name))
                    course.Name = courseDto.Name;
                
                course.Type = courseDto.Type;
                course.IsActive = courseDto.IsActive;

                _context.Courses.Update(course);
                await _context.SaveChangesAsync();

                return Ok(new { success = true, message = "Course updated successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "admin,coordinator")]
        public async Task<IActionResult> DeleteCourse(int id)
        {
            try
            {
                var course = await _context.Courses.FindAsync(id);
                if (course == null)
                    return NotFound(new { success = false, message = "Course not found" });

                _context.Courses.Remove(course);
                await _context.SaveChangesAsync();

                return Ok(new { success = true, message = "Course deleted successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        [HttpGet("{id}/subjects")]
        public async Task<ActionResult<IEnumerable<Subject>>> GetCourseSubjects(int id)
        {
            try
            {
                var subjects = await _context.CourseSubjects
                    .Where(cs => cs.CourseId == id)
                    .Select(cs => cs.Subject)
                    .Where(s => s.Status)
                    .ToListAsync();

                return Ok(subjects);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        [HttpPost("{courseId}/subjects/{subjectId}")]
        [Authorize(Roles = "admin,coordinator")]
        public async Task<IActionResult> AddSubjectToCourse(int courseId, int subjectId)
        {
            try
            {
                var course = await _context.Courses.FindAsync(courseId);
                if (course == null)
                    return NotFound(new { success = false, message = "Course not found" });

                var subject = await _context.Subjects.FindAsync(subjectId);
                if (subject == null)
                    return NotFound(new { success = false, message = "Subject not found" });

                var exists = await _context.CourseSubjects
                    .AnyAsync(cs => cs.CourseId == courseId && cs.SubjectId == subjectId);

                if (!exists)
                {
                    var courseSubject = new CourseSubject
                    {
                        CourseId = courseId,
                        SubjectId = subjectId
                    };
                    _context.CourseSubjects.Add(courseSubject);
                    await _context.SaveChangesAsync();
                }

                return Ok(new { success = true, message = "Subject added to course successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        [HttpDelete("{courseId}/subjects/{subjectId}")]
        [Authorize(Roles = "admin,coordinator")]
        public async Task<IActionResult> RemoveSubjectFromCourse(int courseId, int subjectId)
        {
            try
            {
                var mapping = await _context.CourseSubjects
                    .FirstOrDefaultAsync(cs => cs.CourseId == courseId && cs.SubjectId == subjectId);

                if (mapping == null)
                    return NotFound(new { success = false, message = "Subject mapping not found for this course" });

                _context.CourseSubjects.Remove(mapping);
                await _context.SaveChangesAsync();

                return Ok(new { success = true, message = "Subject removed from course successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }
    }
}
