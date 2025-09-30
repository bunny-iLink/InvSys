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

        /// <summary>
        /// Initializes a new instance of the <see cref="UserController"/> class.
        /// </summary>
        /// <param name="context">Database context for accessing user data.</param>
        /// <param name="emailService">Service for sending emails to users.</param>
        public UserController(UserDbContext context, IEmailService emailService)
        {
            _context = context;
            _emailService = emailService;
        }

        /// <summary>
        /// Retrieves all users excluding superadmins.
        /// </summary>
        /// <returns>An <see cref="OkObjectResult"/> containing a list of users.</returns>
        [HttpGet("getAllUsers")]
        public async Task<IActionResult> GetAllUsers(int pageNumber = 1, int pageSize = 10)
        {
            var query = _context.Users.Where(u => u.Role != "superadmin");

            var totalRecords = await query.CountAsync();

            var users = await query
                .OrderBy(u => u.UserId)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return Ok(new
            {
                Data = users,
                TotalRecords = totalRecords,
                PageNumber = pageNumber,
                PageSize = pageSize
            });
        }

        /// <summary>
        /// Retrieves a single user by their unique ID.
        /// </summary>
        /// <param name="id">The unique identifier of the user.</param>
        /// <returns>
        /// An <see cref="OkObjectResult"/> containing the user if found; 
        /// <see cref="NotFoundResult"/> if the user does not exist.
        /// </returns>
        [HttpGet("getUserById/{id}")]
        public async Task<IActionResult> GetUserById(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
            {
                return NotFound();
            }

            // Do not return the password
            if (user.Password != null)
            {
                user.Password = string.Empty;
            }

            return Ok(user);
        }

        /// <summary>
        /// Adds a new user to the database.
        /// </summary>
        /// <param name="user">The user object to be added.</param>
        /// <returns>
        /// <see cref="CreatedAtActionResult"/> if user is successfully created; 
        /// <see cref="BadRequestResult"/> if user data is null; 
        /// <see cref="ConflictObjectResult"/> if email already exists.
        /// </returns>
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

            var existingUser = await _context.Users.FirstOrDefaultAsync(u => u.Email == user.Email);
            if (existingUser != null)
            {
                Console.WriteLine("Email already exists: " + user.Email);
                return Conflict("Email already exists.");
            }

            user.Password = BCrypt.Net.BCrypt.HashPassword(user.Password);

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetAllUsers), new { id = user.UserId }, user);
        }

        /// <summary>
        /// Updates an existing user's information.
        /// </summary>
        /// <param name="id">The unique identifier of the user to be updated.</param>
        /// <param name="updatedUser">The updated user object.</param>
        /// <returns>
        /// <see cref="NoContentResult"/> if the update is successful; 
        /// <see cref="BadRequestResult"/> if the updated data is invalid; 
        /// <see cref="NotFoundObjectResult"/> if the user does not exist.
        /// </returns>
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

            if (!string.IsNullOrWhiteSpace(updatedUser.Password))
            {
                user.Password = BCrypt.Net.BCrypt.HashPassword(updatedUser.Password);
            }

            _context.Users.Update(user);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        /// <summary>
        /// Deletes a user from the database.
        /// </summary>
        /// <param name="id">The unique identifier of the user to be deleted.</param>
        /// <returns>
        /// <see cref="NoContentResult"/> if deletion is successful; 
        /// <see cref="NotFoundObjectResult"/> if the user does not exist.
        /// </returns>
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