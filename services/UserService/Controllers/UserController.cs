using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using UserService.Data;
using UserService.Models;
using UserService.Services;
using System.Text.Json;

namespace UserService.Controllers
{
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly UserDbContext _context;
        private readonly IEmailService _emailService;

        public UserController(UserDbContext context, IEmailService emailService)
        {
            _context = context;
            _emailService = emailService;
        }

        /// <summary>
        /// Get all users endpoint. This will be called from the frontend to retrieve all users.
        /// </summary>
        /// <returns>List of all users</returns>
        [HttpGet("getAllUsers")]
        public async Task<IActionResult> GetAllUsers()
        {
            var users = await _context.Users
                .Where(u => u.Role != "superadmin")
                .ToListAsync();

            foreach (var u in users)
            {
                Console.WriteLine($"UserId={u.UserId}, IsVerified={u.IsVerified}, IsActive={u.IsActive}");
            }

            return Ok(users);
        }


        /// <summary>
        /// Get user by ID endpoint. This will be called from the frontend to retrieve a user by their ID.
        /// </summary>
        /// <param name="id">Represents UserId which uniquely identifies a user</param>
        /// <returns></returns>
        [HttpGet("getUserById/{id}")]
        public async Task<IActionResult> GetUserById(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
            {
                return NotFound();
            }

            if (user.Password != null)
            {
                user.Password = string.Empty;
            }

            return Ok(user);
        }

        [HttpPost("addUser")]
        public async Task<IActionResult> AddUser([FromBody] User user)
        {
            Console.WriteLine("👉 Entered AddUser endpoint");
            Console.WriteLine(JsonSerializer.Serialize(user));

            if (user == null)
            {
                Console.WriteLine("User object is null.");
                return BadRequest("Please provide user details.");
            }

            // Check if email already exists
            var existingUser = await _context.Users.FirstOrDefaultAsync(u => u.Email == user.Email);
            if (existingUser != null)
            {
                Console.WriteLine("Email already exists: " + user.Email);
                return Conflict("Email already exists.");
            }

            // Hash the password using bcrypt
            user.Password = BCrypt.Net.BCrypt.HashPassword(user.Password);

            // Add user to database
            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetAllUsers), new { id = user.UserId }, user);
        }

        [HttpPut("editUser/{id}")]
        public async Task<IActionResult> EditUser(int id, [FromBody] User updatedUser)
        {
            if (updatedUser == null)
            {
                return BadRequest("Invalid user data.");
            }

            var user = await _context.Users.FindAsync(id);
            if (user == null)
            {
                return NotFound("User not found.");
            }

            user.FirstName = updatedUser.FirstName;
            user.LastName = updatedUser.LastName;
            user.Email = updatedUser.Email;
            user.Role = updatedUser.Role;
            user.IsActive = updatedUser.IsActive;
            user.IsVerified = updatedUser.IsVerified;

            // ✅ Only hash password if a new one is provided
            if (!string.IsNullOrWhiteSpace(updatedUser.Password))
            {
                // Re-hash the new password
                user.Password = BCrypt.Net.BCrypt.HashPassword(updatedUser.Password);
            }

            _context.Users.Update(user);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpDelete("deleteUser/{id}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
            {
                return NotFound("User not found.");
            }

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}