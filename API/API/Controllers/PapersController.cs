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
        public async Task<ActionResult<IEnumerable<PaperDto>>> GetPapers([FromQuery] int? subjectConfigId = null)
        {
            try
            {
                var query = _context.Papers.AsQueryable();

                if (subjectConfigId.HasValue)
                    query = query.Where(p => p.SubjectConfigId == subjectConfigId.Value);

                var papers = await query
                    .Include(p => p.SubjectConfig)
                    .OrderBy(p => p.PaperNumber)
                    .ToListAsync();

                var paperDtos = papers.Select(p => new PaperDto
                {
                    Id = p.Id,
                    SubjectConfigId = p.SubjectConfigId,
                    PaperCode = p.PaperCode,
                    PaperName = p.PaperName,
                    PaperNumber = p.PaperNumber,
                    MaxMarks = p.MaxMarks,
                    TotalQuestions = p.TotalQuestions,
                    Description = p.Description,
                    IsActive = p.IsActive
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
                    .Include(p => p.SubjectConfig)
                    .Include(p => p.Sections)
                    .FirstOrDefaultAsync(p => p.Id == id);

                if (paper == null)
                    return NotFound(new { success = false, message = "Paper not found" });

                var paperDto = new PaperDto
                {
                    Id = paper.Id,
                    SubjectConfigId = paper.SubjectConfigId,
                    PaperCode = paper.PaperCode,
                    PaperName = paper.PaperName,
                    PaperNumber = paper.PaperNumber,
                    MaxMarks = paper.MaxMarks,
                    TotalQuestions = paper.TotalQuestions,
                    Description = paper.Description,
                    IsActive = paper.IsActive
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
        public async Task<ActionResult<PaperDto>> CreatePaper([FromBody] PaperDto paperDto)
        {
            try
            {
                // Validate subject exists
                var subject = await _context.SubjectConfigs.FindAsync(paperDto.SubjectConfigId);
                if (subject == null)
                    return BadRequest(new { success = false, message = "Subject not found" });

                // Check if paper code already exists
                if (await _context.Papers.AnyAsync(p => p.PaperCode == paperDto.PaperCode))
                    return BadRequest(new { success = false, message = "Paper code already exists" });

                var paper = new Paper
                {
                    SubjectConfigId = paperDto.SubjectConfigId,
                    PaperCode = paperDto.PaperCode,
                    PaperName = paperDto.PaperName,
                    PaperNumber = paperDto.PaperNumber,
                    MaxMarks = paperDto.MaxMarks,
                    TotalQuestions = paperDto.TotalQuestions,
                    Description = paperDto.Description,
                    IsActive = true
                };

                _context.Papers.Add(paper);
                await _context.SaveChangesAsync();

                return CreatedAtAction(nameof(GetPaper), new { id = paper.Id }, paperDto);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "admin,coordinator")]
        public async Task<IActionResult> UpdatePaper(int id, [FromBody] PaperDto paperDto)
        {
            try
            {
                var paper = await _context.Papers.FindAsync(id);
                if (paper == null)
                    return NotFound(new { success = false, message = "Paper not found" });

                paper.PaperName = paperDto.PaperName;
                paper.MaxMarks = paperDto.MaxMarks;
                paper.TotalQuestions = paperDto.TotalQuestions;
                paper.Description = paperDto.Description;
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
                var paper = await _context.Papers.FindAsync(id);
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
    }
}
