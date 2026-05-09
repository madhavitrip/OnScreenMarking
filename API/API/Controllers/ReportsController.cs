using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using API.Data;

namespace API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ReportsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ReportsController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("dashboard")]
        public async Task<IActionResult> GetDashboardStats()
        {
            try
            {
                var totalScripts = await _context.Scripts.CountAsync();
                var evaluatedScripts = await _context.Scripts.CountAsync(s => s.Status == "completed");
                var pendingScripts = await _context.Scripts.CountAsync(s => s.Status == "pending");
                var inProgressScripts = await _context.Scripts.CountAsync(s => s.Status == "in_progress");

                var completedMarkings = await _context.Markings
                    .Where(m => m.Status == "submitted")
                    .ToListAsync();

                decimal totalMarks = completedMarkings.Sum(m => m.TotalMarks);
                decimal averageScore = completedMarkings.Count > 0 ? totalMarks / completedMarkings.Count : 0;

                return Ok(new
                {
                    success = true,
                    data = new
                    {
                        totalScripts,
                        evaluatedScripts,
                        pendingScripts,
                        inProgressScripts,
                        averageScore = Math.Round(averageScore, 2),
                        completionRate = totalScripts > 0 ? Math.Round((evaluatedScripts / (decimal)totalScripts) * 100, 2) : 0
                    }
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        [HttpGet("department-wise")]
        public async Task<IActionResult> GetDepartmentWiseStats()
        {
            try
            {
                var departments = await _context.Departments
                    .Where(d => d.IsActive)
                    .ToListAsync();

                var departmentStats = new List<object>();

                foreach (var department in departments)
                {
                    var subjects = await _context.Subjects
                        .Where(s => s.DepartmentId == department.DepartmentId)
                        .Select(s => s.SubjectId)
                        .ToListAsync();

                    var papers = await _context.Papers
                        .Where(p => subjects.Contains(p.SubjectId))
                        .Select(p => p.PaperId)
                        .ToListAsync();

                    var scripts = await _context.Scripts
                        .Where(s => papers.Contains(s.PaperId))
                        .ToListAsync();

                    var markings = await _context.Markings
                        .Where(m => scripts.Select(s => s.Id).Contains(m.ScriptId) && m.Status == "submitted")
                        .ToListAsync();

                    decimal totalMarks = markings.Sum(m => m.TotalMarks);
                    decimal avgScore = markings.Count > 0 ? totalMarks / markings.Count : 0;

                    departmentStats.Add(new
                    {
                        department = department.Name,
                        total = scripts.Count,
                        evaluated = markings.Count,
                        pending = scripts.Count - markings.Count,
                        avgScore = Math.Round(avgScore, 2),
                        progress = scripts.Count > 0 ? Math.Round((markings.Count / (decimal)scripts.Count) * 100, 2) : 0
                    });
                }

                return Ok(new { success = true, data = departmentStats });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        [HttpGet("examiner-performance")]
        [Authorize(Roles = "coordinator,admin")]
        public async Task<IActionResult> GetExaminerPerformance()
        {
            try
            {
                var examiners = await _context.Users
                    .Where(u => u.UserType == "examiner")
                    .ToListAsync();

                var performanceData = new List<object>();

                foreach (var examiner in examiners)
                {
                    var markings = await _context.Markings
                        .Where(m => m.ExaminerId == examiner.Id && m.Status == "submitted")
                        .ToListAsync();

                    decimal totalMarks = markings.Sum(m => m.TotalMarks);
                    decimal avgMarks = markings.Count > 0 ? totalMarks / markings.Count : 0;

                    performanceData.Add(new
                    {
                        examiner = examiner.Name,
                        email = examiner.Email,
                        scriptsEvaluated = markings.Count,
                        avgMarks = Math.Round(avgMarks, 2),
                        accuracy = "95%"
                    });
                }

                return Ok(new { success = true, data = performanceData });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

       /* [HttpGet("score-distribution")]
        public async Task<IActionResult> GetScoreDistribution()
        {
            try
            {
                var markings = await _context.Markings
                    .Where(m => m.Status == "submitted")
                    .ToListAsync();

                var distribution = new
                {
                    @"90-100" = markings.Count(m => m.Percentage >= 90),
                    @"80-89" = markings.Count(m => m.Percentage >= 80 && m.Percentage < 90),
                    @"70-79" = markings.Count(m => m.Percentage >= 70 && m.Percentage < 80),
                    @"60-69" = markings.Count(m => m.Percentage >= 60 && m.Percentage < 70),
                    @"below-60" = markings.Count(m => m.Percentage < 60)
                };

                return Ok(new { success = true, data = distribution });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }*/

        [HttpGet("examiner/{examinerId}")]
        public async Task<IActionResult> GetExaminerReport(int examinerId)
        {
            try
            {
                var markings = await _context.Markings
                    .Where(m => m.ExaminerId == examinerId && m.Status == "submitted")
                    .Include(m => m.Script)
                    .Include(m => m.Allocation)
                    .ToListAsync();

                decimal totalMarks = markings.Sum(m => m.TotalMarks);
                decimal avgMarks = markings.Count > 0 ? totalMarks / markings.Count : 0;

                var subjectBreakdown = markings
                    .GroupBy(m => m.Script?.Paper?.Subject?.SubjectName ?? "Unassigned")
                    .Select(g => new
                    {
                        subject = g.Key,
                        count = g.Count(),
                        totalMarks = g.Sum(m => m.TotalMarks)
                    })
                    .ToList();

                return Ok(new
                {
                    success = true,
                    data = new
                    {
                        totalScriptsEvaluated = markings.Count,
                        averageMarks = Math.Round(avgMarks, 2),
                        subjectBreakdown,
                        markings
                    }
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }
    }
}
