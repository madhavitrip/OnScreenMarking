using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using API.Data;
using API.Models;
using API.Models.DTOs;
using API.Services;

namespace API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class UsersController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IEmailService _emailService;

        public UsersController(ApplicationDbContext context, IEmailService emailService)
        {
            _context = context;
            _emailService = emailService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<UserDto>>> GetUsers([FromQuery] int? universityId = null)
        {
            try
            {
                var query = _context.Users.AsQueryable();

                if (universityId.HasValue && universityId.Value > 0)
                {
                    query = query.Where(u => u.UniversityId == universityId.Value);
                }

                var users = await query
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
                    IsApproved = u.IsApproved,
                    University = u.University != null ? new University { UniversityId = u.University.UniversityId, UniversityName = u.University.UniversityName } : null
                }).ToList();

                return Ok(userDtos);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<UserDto>> GetUserById(int id)
        {
            try
            {
                var user = await _context.Users
                    .Include(u => u.University)
                    .Include(u => u.Department)
                    .FirstOrDefaultAsync(u => u.Id == id);

                if (user == null)
                {
                    return NotFound(new { success = false, message = "User not found" });
                }

                var userDto = new UserDto
                {
                    Id = user.Id,
                    Name = user.Name,
                    Email = user.Email,
                    UserType = user.UserType,
                    UniversityId = user.UniversityId,
                    DepartmentId = user.DepartmentId,
                    Phone = user.Phone,
                    Address = user.Address,
                    ProfileImage = user.ProfileImage,
                    IsActive = user.IsActive,
                    IsApproved = user.IsApproved,
                    University = user.University != null ? new University { UniversityId = user.University.UniversityId, UniversityName = user.University.UniversityName } : null,
                    Department = user.Department != null ? new Department { DepartmentId = user.Department.DepartmentId, Name = user.Department.Name } : null
                };

                return Ok(userDto);
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

        [HttpPut("{id}/approve")]
        public async Task<IActionResult> ApproveUser(int id)
        {
            try
            {
                var loggedInUserType = User.FindFirst("userType")?.Value;
                var loggedInUserIdStr = User.FindFirst("id")?.Value;

                if (string.IsNullOrEmpty(loggedInUserIdStr))
                {
                    return Unauthorized(new { success = false, message = "Invalid token claims" });
                }

                int loggedInUserId = int.Parse(loggedInUserIdStr);
                var currentUser = await _context.Users.FindAsync(loggedInUserId);
                
                if (currentUser == null)
                {
                    return Unauthorized(new { success = false, message = "User not found" });
                }

                var targetUser = await _context.Users.FindAsync(id);
                if (targetUser == null)
                {
                    return NotFound(new { success = false, message = "Examiner not found" });
                }

                // If logged-in user is a coordinator, they can only approve examiners of their own university!
                if (loggedInUserType == "coordinator")
                {
                    if (targetUser.UniversityId != currentUser.UniversityId)
                    {
                        return StatusCode(403, new { success = false, message = "You can only approve examiners for your own university." });
                    }
                }
                else if (loggedInUserType != "admin")
                {
                    return StatusCode(403, new { success = false, message = "Only coordinators or admins can approve users." });
                }

                targetUser.IsApproved = true;
                targetUser.UpdatedAt = DateTime.UtcNow;
                
                await _context.SaveChangesAsync();
                return Ok(new { success = true, message = "User approved successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        [HttpPost("invite")]
        public async Task<IActionResult> InviteUser([FromBody] InviteRequest request)
        {
            try
            {
                if (request == null || string.IsNullOrWhiteSpace(request.Email))
                {
                    return BadRequest(new { success = false, message = "Email is required" });
                }

                var loggedInUserType = User.FindFirst("userType")?.Value;
                var loggedInUserIdStr = User.FindFirst("id")?.Value;

                if (string.IsNullOrEmpty(loggedInUserIdStr))
                {
                    return Unauthorized(new { success = false, message = "Invalid token claims" });
                }

                int loggedInUserId = int.Parse(loggedInUserIdStr);
                var currentUser = await _context.Users.FindAsync(loggedInUserId);
                
                if (currentUser == null)
                {
                    return Unauthorized(new { success = false, message = "User not found" });
                }

                // Verify permissions
                if (loggedInUserType == "coordinator")
                {
                    if (request.UniversityId != currentUser.UniversityId)
                    {
                        return StatusCode(403, new { success = false, message = "You can only invite examiners for your own university." });
                    }
                }
                else if (loggedInUserType != "admin")
                {
                    return StatusCode(403, new { success = false, message = "Only coordinators or admins can invite users." });
                }

                // Check if user already exists in system
                if (await _context.Users.AnyAsync(u => u.Email == request.Email))
                {
                    return BadRequest(new { success = false, message = "A user with this email address is already registered." });
                }

                // Generate a unique token for the invitation
                var token = Guid.NewGuid().ToString("N");
                
                // Create invitation record
                var invitation = new Invitation
                {
                    Email = request.Email.Trim().ToLower(),
                    Token = token,
                    UniversityId = request.UniversityId,
                    DepartmentId = request.DepartmentId,
                    UserType = string.IsNullOrWhiteSpace(request.UserType) ? "examiner" : request.UserType.Trim().ToLower(),
                    ExpiresAt = DateTime.UtcNow.AddDays(7),
                    IsUsed = false
                };

                _context.Invitations.Add(invitation);
                await _context.SaveChangesAsync();

                // Build a simulated invitation link
                var invitationLink = $"http://localhost:5173/accept-invitation?token={token}";

                bool emailSent = true;
                string emailError = null;

                // Send the actual invitation email
                try
                {
                    await _emailService.SendInvitationEmailAsync(invitation.Email, invitationLink);
                }
                catch (Exception ex)
                {
                    emailSent = false;
                    emailError = ex.Message;
                    Console.WriteLine($"Failed to send invitation email: {ex.Message}");
                }

                return Ok(new
                {
                    success = true,
                    message = emailSent ? "Invitation generated and email sent successfully." : "Invitation generated, but email failed to send.",
                    emailSent = emailSent,
                    emailError = emailError,
                    invitation = new
                    {
                        invitation.Id,
                        invitation.Email,
                        invitation.Token,
                        invitation.UniversityId,
                        invitation.DepartmentId,
                        invitation.UserType,
                        invitation.ExpiresAt,
                        InvitationLink = invitationLink
                    }
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateUser(int id, [FromBody] UpdateUserRequest request)
        {
            try
            {
                if (request == null)
                {
                    return BadRequest(new { success = false, message = "Invalid request payload" });
                }

                var loggedInUserType = User.FindFirst("userType")?.Value;
                if (loggedInUserType != "admin" && loggedInUserType != "coordinator")
                {
                    return StatusCode(403, new { success = false, message = "Only coordinators or admins can update users." });
                }

                var user = await _context.Users.FindAsync(id);
                if (user == null)
                {
                    return NotFound(new { success = false, message = "User not found" });
                }

                if (!string.IsNullOrWhiteSpace(request.UserType))
                {
                    user.UserType = request.UserType.Trim().ToLower();
                }

                if (request.DepartmentId.HasValue)
                {
                    user.DepartmentId = request.DepartmentId.Value > 0 ? request.DepartmentId.Value : null;
                }

                if (request.UniversityId.HasValue)
                {
                    user.UniversityId = request.UniversityId.Value > 0 ? request.UniversityId.Value : null;
                }

                user.UpdatedAt = DateTime.UtcNow;
                _context.Entry(user).State = EntityState.Modified;
                await _context.SaveChangesAsync();

                return Ok(new { success = true, message = "User updated successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }
    }
}
