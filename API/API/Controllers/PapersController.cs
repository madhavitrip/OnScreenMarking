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
    public class PapersController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public PapersController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<PaperDto>>> GetPapers([FromQuery] int? subjectId = null, [FromQuery] int? projectId = null, [FromQuery] int? universityId = null)
        {
            try
            {
                var query = _context.Papers
            .Include(p => p.Project)
            .Include(p => p.SubjectPapers)
                .ThenInclude(sp => sp.Subject)
            .AsQueryable();

                if (subjectId.HasValue)
                {
                    query = query.Where(p =>
                        p.SubjectPapers.Any(sp => sp.SubjectId == subjectId.Value));
                }
                if (projectId.HasValue)
                    query = query.Where(p => p.ProjectId == projectId.Value);

                if (universityId.HasValue)
                    query = query.Where(p => p.Project.UniversityId == universityId.Value);

                var papers = await query
                    .OrderBy(p => p.PaperNumber)
                    .ToListAsync();

                var paperDtos = papers.Select(p => new PaperDto
                {
                    PaperId = p.PaperId,
                    ProjectId = p.ProjectId,
                    PaperCode = p.PaperCode,
                    PaperName = p.PaperName,
                    PaperNumber = p.PaperNumber,
                    MaxMarks = p.MaxMarks,
                    TotalQuestions = p.TotalQuestions,
                    Description = p.Description,
                    IsActive = p.IsActive,
                    SubjectIds = p.SubjectPapers
                .Select(sp => sp.SubjectId)
                .ToList(),

                    SubjectNames = p.SubjectPapers
                .Select(sp => sp.Subject.SubName)
                .ToList()
                }).ToList();

                return Ok(paperDtos);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<PaperDto>> GetPaper(int id)
        {
            try
            {
                var paper = await _context.Papers
           .Include(p => p.Project)
           .Include(p => p.Sections)
           .Include(p => p.SubjectPapers)
               .ThenInclude(sp => sp.Subject)
           .FirstOrDefaultAsync(p => p.PaperId == id);

                if (paper == null)
                    return NotFound(new { success = false, message = "Paper not found" });

                var paperDto = new PaperDto
                {
                    PaperId = paper.PaperId,
                    ProjectId = paper.ProjectId,
                    PaperCode = paper.PaperCode,
                    PaperName = paper.PaperName,
                    PaperNumber = paper.PaperNumber,
                    MaxMarks = paper.MaxMarks,
                    TotalQuestions = paper.TotalQuestions,
                    Description = paper.Description,
                    IsActive = paper.IsActive,
                    SubjectIds = paper.SubjectPapers
                .Select(sp => sp.SubjectId)
                .ToList(),

                    SubjectNames = paper.SubjectPapers
                .Select(sp => sp.Subject.SubName)
                .ToList()
                };

                return Ok(paperDto);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        [HttpPost]
        [Authorize(Roles = "admin,coordinator")]
        public async Task<ActionResult<PaperDto>> CreatePaper(
      [FromBody] PaperDto paperDto)
        {
            try
            {
                // Validate project exists
                var project = await _context.Projects
                    .FindAsync(paperDto.ProjectId);

                if (project == null)
                {
                    return BadRequest(new
                    {
                        success = false,
                        message = "Project not found"
                    });
                }

                // Validate subjects exist
                var subjects = await _context.Subjects
                    .Where(s => paperDto.SubjectIds.Contains(s.SubjectId))
                    .ToListAsync();

                if (subjects.Count != paperDto.SubjectIds.Count)
                {
                    return BadRequest(new
                    {
                        success = false,
                        message = "One or more subjects not found"
                    });
                }

                // Check duplicate paper code
                if (await _context.Papers
                    .AnyAsync(p => p.PaperCode == paperDto.PaperCode))
                {
                    return BadRequest(new
                    {
                        success = false,
                        message = "Paper code already exists"
                    });
                }

                var paper = new Paper
                {
                    ProjectId = paperDto.ProjectId,
                    PaperCode = paperDto.PaperCode,
                    PaperName = paperDto.PaperName,
                    PaperNumber = paperDto.PaperNumber,
                    MaxMarks = paperDto.MaxMarks,
                    TotalQuestions = paperDto.TotalQuestions,
                    Description = paperDto.Description,
                    CatchNo = paperDto.CatchNo,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                _context.Papers.Add(paper);

                await _context.SaveChangesAsync();

                // Create mappings
                foreach (var subjectId in paperDto.SubjectIds)
                {
                    _context.SubjectPapers.Add(new SubjectPaper
                    {
                        SubjectId = subjectId,
                        PaperId = paper.PaperId
                    });
                }

                await _context.SaveChangesAsync();

                return CreatedAtAction(
                    nameof(GetPaper),
                    new { id = paper.PaperId },
                    paperDto);
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
        public async Task<IActionResult> UpdatePaper(int id, [FromBody] PaperDto paperDto)
        {
            try
            {
                var paper = await _context.Papers.FirstOrDefaultAsync(p => p.PaperId == id);
                if (paper == null)
                    return NotFound(new { success = false, message = "Paper not found" });

                paper.PaperName = paperDto.PaperName;
                paper.MaxMarks = paperDto.MaxMarks;
                paper.TotalQuestions = paperDto.TotalQuestions;
                paper.Description = paperDto.Description;
                paper.CatchNo = paperDto.CatchNo;
                paper.IsActive = paperDto.IsActive;
                paper.UpdatedAt = DateTime.UtcNow;

                _context.Papers.Update(paper);
                await _context.SaveChangesAsync();

                return Ok(new { success = true, message = "Paper updated successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> DeletePaper(int id)
        {
            try
            {
                var paper = await _context.Papers.FirstOrDefaultAsync(p => p.PaperId == id);
                if (paper == null)
                    return NotFound(new { success = false, message = "Paper not found" });

                _context.Papers.Remove(paper);
                await _context.SaveChangesAsync();

                return Ok(new { success = true, message = "Paper deleted successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        [HttpGet("{id}/sections")]
        public async Task<ActionResult<IEnumerable<Section>>> GetPaperSections(int id)
        {
            try
            {
                var sections = await _context.Sections
                    .Where(s => s.PaperId == id)
                    .Include(s => s.Questions)
                    .OrderBy(s => s.Id)
                    .ToListAsync();

                return Ok(sections);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }
    }
}

