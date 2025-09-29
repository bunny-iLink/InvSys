using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using UserService.Data;
using UserService.Models;

namespace UserService.Controllers
{
    [ApiController]
    public class DashboardController : ControllerBase
    {
        private readonly UserDbContext _context;

        public DashboardController(UserDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Retrieves the total count of users by their roles.
        /// </summary>
        /// <returns>
        /// Returns an <see cref="OkObjectResult"/> containing the number of users for each role:
        /// "customer", "admin", and "superadmin".
        /// </returns>
        [HttpGet("userCounts")]
        public async Task<IActionResult> GetUserCounts()
        {
            var customers = await _context.Users.CountAsync(u => u.Role == "customer");
            var admins = await _context.Users.CountAsync(u => u.Role == "admin");
            var superadmins = await _context.Users.CountAsync(u => u.Role == "superadmin");

            return Ok(new
            {
                customers,
                admins,
                superadmins
            });
        }
    }
}