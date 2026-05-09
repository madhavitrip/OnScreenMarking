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
    public class ProjectController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ProjectController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Project>>> GetProjects([FromQuery] int? sessionId = null, [FromQuery] int? universityId = null)
        {
            try
            {
                var query = _context.Projects.AsQueryable();

                if (sessionId.HasValue)
                    query = query.Where(p => p.SessionId == sessionId.Value);

                if (universityId.HasValue)
                    query = query.Where(p => p.UniversityId == universityId.Value);

                var projects = await query
                    .Where(p => p.IsActive)
                    .Include(p => p.Session)
                    .Include(p => p.University)
                    .Include(p => p.Papers)
                    .OrderBy(p => p.ProjectName)
                    .ToListAsync();

                return Ok(projects);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Project>> GetProject(int id)
        {
            try
            {
                var project = await _context.Projects
                    .Include(p => p.Session)
                    .Include(p => p.University)
                    .Include(p => p.Papers)
                    .FirstOrDefaultAsync(p => p.ProjectId == id);

                if (project == null)
                    return NotFound(new { success = false, message = "Project not found" });

                return Ok(project);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        [HttpPost]
        [Authorize(Roles = "admin,coordinator")]
        public async Task<ActionResult<Project>> CreateProject([FromBody] ProjectDto projectDto)
        {
            try
            {
                if (string.IsNullOrEmpty(projectDto.ProjectName))
                    return BadRequest(new { success = false, message = "Project name is required" });

                if (projectDto.SessionId <= 0)
                    return BadRequest(new { success = false, message = "Session ID is required" });

                if (projectDto.UniversityId <= 0)
                    return BadRequest(new { success = false, message = "University ID is required" });

                // Verify session exists
                var session = await _context.Sessions.FindAsync(projectDto.SessionId);
                if (session == null)
                    return BadRequest(new { success = false, message = "Session not found" });

                // Verify university exists
                var university = await _context.Universities.FindAsync(projectDto.UniversityId);
                if (university == null)
                    return BadRequest(new { success = false, message = "University not found" });

                var project = new Project
                {
                    ProjectName = projectDto.ProjectName,
                    SessionId = projectDto.SessionId,
                    UniversityId = projectDto.UniversityId,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                };

                _context.Projects.Add(project);
                await _context.SaveChangesAsync();

                return CreatedAtAction(nameof(GetProject), new { id = project.ProjectId }, project);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "admin,coordinator")]
        public async Task<IActionResult> UpdateProject(int id, [FromBody] ProjectDto projectDto)
        {
            try
            {
                var project = await _context.Projects.FindAsync(id);
                if (project == null)
                    return NotFound(new { success = false, message = "Project not found" });

                project.ProjectName = projectDto.ProjectName;
                project.IsActive = projectDto.IsActive;

                _context.Projects.Update(project);
                await _context.SaveChangesAsync();

                return Ok(new { success = true, message = "Project updated successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        [HttpGet("{id}/papers")]
        public async Task<ActionResult<IEnumerable<Paper>>> GetProjectPapers(int id)
        {
            try
            {
                var papers = await _context.Papers
                    .Where(p => p.ProjectId == id && p.IsActive)
                    .Include(p => p.Subject)
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
    }
}
