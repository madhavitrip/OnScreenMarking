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
    public class RoleController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public RoleController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/role
        [HttpGet]
        public async Task<ActionResult> GetAllRoles()
        {
            try
            {
                var roles = await _context.Roles
                    .OrderBy(r => r.HierarchyLevel)
                    .ToListAsync();

                var roleDtos = roles.Select(r => new RoleDto
                {
                    RoleId = r.RoleId,
                    RoleName = r.RoleName,
                    Description = r.Description,
                    HierarchyLevel = r.HierarchyLevel,
                    IsActive = r.IsActive,
                    PermissionsList = r.PermissionsList,
                    CreatedAt = r.CreatedAt,
                    UpdatedAt = r.UpdatedAt
                }).ToList();

                return Ok(new { success = true, data = roleDtos });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        // GET: api/role/{roleId}
        [HttpGet("{roleId}")]
        public async Task<ActionResult> GetRoleById(int roleId)
        {
            try
            {
                var role = await _context.Roles.FindAsync(roleId);
                if (role == null)
                {
                    return NotFound(new { success = false, message = "Role not found" });
                }

                var roleDto = new RoleDto
                {
                    RoleId = role.RoleId,
                    RoleName = role.RoleName,
                    Description = role.Description,
                    HierarchyLevel = role.HierarchyLevel,
                    IsActive = role.IsActive,
                    PermissionsList = role.PermissionsList,
                    CreatedAt = role.CreatedAt,
                    UpdatedAt = role.UpdatedAt
                };

                return Ok(new { success = true, data = roleDto });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        // POST: api/role/create
        [HttpPost("create")]
        public async Task<ActionResult> CreateRole([FromBody] CreateRoleRequest request)
        {
            try
            {
                if (request == null || string.IsNullOrWhiteSpace(request.RoleName))
                {
                    return BadRequest(new { success = false, message = "Role Name is required" });
                }

                // Check if role name already exists
                var exists = await _context.Roles.AnyAsync(r => r.RoleName.ToLower() == request.RoleName.ToLower().Trim());
                if (exists)
                {
                    return BadRequest(new { success = false, message = $"Role '{request.RoleName}' already exists" });
                }

                var role = new Role
                {
                    RoleName = request.RoleName.Trim(),
                    Description = request.Description?.Trim(),
                    HierarchyLevel = request.HierarchyLevel,
                    IsActive = true,
                    PermissionsList = request.Permissions ?? new List<string>(),
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                _context.Roles.Add(role);
                await _context.SaveChangesAsync();

                var roleDto = new RoleDto
                {
                    RoleId = role.RoleId,
                    RoleName = role.RoleName,
                    Description = role.Description,
                    HierarchyLevel = role.HierarchyLevel,
                    IsActive = role.IsActive,
                    PermissionsList = role.PermissionsList,
                    CreatedAt = role.CreatedAt,
                    UpdatedAt = role.UpdatedAt
                };

                return Ok(new { success = true, message = "Role created successfully", data = roleDto });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        // PUT: api/role/{roleId}
        [HttpPut("{roleId}")]
        public async Task<IActionResult> UpdateRole(int roleId, [FromBody] UpdateRoleRequest request)
        {
            try
            {
                if (request == null || string.IsNullOrWhiteSpace(request.RoleName))
                {
                    return BadRequest(new { success = false, message = "Role Name is required" });
                }

                var role = await _context.Roles.FindAsync(roleId);
                if (role == null)
                {
                    return NotFound(new { success = false, message = "Role not found" });
                }

                // Check if new name conflicts with another role
                var exists = await _context.Roles.AnyAsync(r => r.RoleId != roleId && r.RoleName.ToLower() == request.RoleName.ToLower().Trim());
                if (exists)
                {
                    return BadRequest(new { success = false, message = $"Another role named '{request.RoleName}' already exists" });
                }

                role.RoleName = request.RoleName.Trim();
                role.Description = request.Description?.Trim();
                role.HierarchyLevel = request.HierarchyLevel;
                role.PermissionsList = request.Permissions ?? new List<string>();
                role.UpdatedAt = DateTime.UtcNow;

                _context.Entry(role).State = EntityState.Modified;
                await _context.SaveChangesAsync();

                return Ok(new { success = true, message = "Role updated successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        // DELETE: api/role/{roleId}
        [HttpDelete("{roleId}")]
        public async Task<IActionResult> DeleteRole(int roleId)
        {
            try
            {
                var role = await _context.Roles.FindAsync(roleId);
                if (role == null)
                {
                    return NotFound(new { success = false, message = "Role not found" });
                }

                _context.Roles.Remove(role);
                await _context.SaveChangesAsync();

                return Ok(new { success = true, message = "Role deleted successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        // GET: api/role/permissions/all
        [HttpGet("permissions/all")]
        public ActionResult GetAllPermissions()
        {
            try
            {
                var permissions = new List<string>
                {
                    // User Management
                    "CREATE_USER", "READ_USER", "UPDATE_USER", "DELETE_USER",
                    
                    // Paper Management
                    "CREATE_PAPER", "READ_PAPER", "UPDATE_PAPER", "DELETE_PAPER",
                    
                    // Script Management
                    "CREATE_SCRIPT", "READ_SCRIPT", "UPDATE_SCRIPT", "DELETE_SCRIPT",
                    
                    // Marking Management
                    "CREATE_MARKING", "READ_MARKING", "UPDATE_MARKING", "DELETE_MARKING",
                    
                    // Allocation Management
                    "CREATE_ALLOCATION", "READ_ALLOCATION", "UPDATE_ALLOCATION", "DELETE_ALLOCATION",
                    
                    // Report Management
                    "VIEW_REPORTS", "EXPORT_REPORTS",
                    
                    // Role Management
                    "CREATE_ROLE", "READ_ROLE", "UPDATE_ROLE", "DELETE_ROLE",
                    
                    // System Administration
                    "VIEW_LOGS", "MANAGE_SETTINGS", "VIEW_ANALYTICS"
                };

                return Ok(new { success = true, data = permissions });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }
    }
}
