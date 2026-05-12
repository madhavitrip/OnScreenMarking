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
    public class UsersController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public UsersController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<UserDto>>> GetUsers()
        {
            try
            {
                var users = await _context.Users
                    .Include(u => u.University)
                    .Include(u => u.Department)
                    .OrderBy(u => u.Name)
                    .ToListAsync();

                var userDtos = users.Select(u => new UserDto
                {
                    Id = u.Id,
                    Name = u.Name,
                    Email = u.Email,
                    UserType = u.UserType,
                    UniversityId = u.UniversityId,
                    DepartmentId = u.DepartmentId,
                    Phone = u.Phone,
                    Address = u.Address,
                    ProfileImage = u.ProfileImage,
                    IsActive = u.IsActive,
                    University = u.University != null ? new University { UniversityId = u.University.UniversityId, UniversityName = u.University.UniversityName } : null
                }).ToList();

                return Ok(userDtos);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        [HttpGet("examiners")]
        public async Task<ActionResult<IEnumerable<UserDto>>> GetExaminers([FromQuery] int? universityId = null, [FromQuery] int? subjectId = null)
        {
            try
            {
                var query = _context.Users
                    .Where(u => u.UserType == "examiner" && u.IsActive)
                    .AsQueryable();

                if (universityId.HasValue)
                {
                    query = query.Where(u => u.UniversityId == universityId.Value);
                }

                if (subjectId.HasValue)
                {
                    // Filter by expertise
                    query = query.Where(u => u.Expertise.Any(e => e.SubjectId == subjectId.Value && e.IsActive));
                }

                var examiners = await query
                    .Include(u => u.University)
                    .OrderBy(u => u.Name)
                    .ToListAsync();

                var userDtos = examiners.Select(u => new UserDto
                {
                    Id = u.Id,
                    Name = u.Name,
                    Email = u.Email,
                    UserType = u.UserType,
                    UniversityId = u.UniversityId,
                    Phone = u.Phone,
                    ProfileImage = u.ProfileImage,
                    IsActive = u.IsActive
                }).ToList();

                return Ok(userDtos);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }
    }
}
