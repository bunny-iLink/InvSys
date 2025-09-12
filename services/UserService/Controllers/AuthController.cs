using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using UserService.Data;
using UserService.Models;
using UserService.Services;
using BCrypt.Net;

namespace UserService.Controllers
{
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly UserDbContext _context;
        private readonly ITokenService _tokenService;
        private readonly IEmailService _emailService;

        public AuthController(UserDbContext context, ITokenService tokenService, IEmailService emailService)
        {
            _context = context;
            _tokenService = tokenService;
            _emailService = emailService;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest loginRequest)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == loginRequest.Email.Trim());
            Console.WriteLine(user);

            if (user == null || !user.IsActive)
            {
                return Unauthorized("Invalid email or user is inactive.");
            }

            bool isPasswordValid = BCrypt.Net.BCrypt.Verify(loginRequest.Password, user.Password);

            if (!isPasswordValid)
            {
                return Unauthorized("Invalid credentials");
            }

            var token = _tokenService.GenerateToken(user);

            return Ok(new LoginResponse { Token = token });
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest registerRequest)
        {
            var existingUser = await _context.Users.FirstOrDefaultAsync(u => u.Email == registerRequest.Email.Trim());

            if (existingUser != null)
            {
                return BadRequest("Email is already registered.");
            }

            var hashedPassword = BCrypt.Net.BCrypt.HashPassword(registerRequest.Password);
            var verificationToken = Guid.NewGuid().ToString();
            var newUser = new User
            {
                FirstName = registerRequest.FirstName,
                Email = registerRequest.Email.Trim(),
                Password = hashedPassword,
                Role = "customer",
                IsActive = true,
                VerificationToken = verificationToken
            };

            _context.Users.Add(newUser);
            _emailService.SendVerificationEmail(newUser.Email, newUser.VerificationToken);
            await _context.SaveChangesAsync();

            return Ok(new RegisterResponse { Message = "Registration successful." });
        }
    }
}