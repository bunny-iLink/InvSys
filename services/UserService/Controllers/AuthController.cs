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

        /// <summary>
        /// Login endpoint. This will be called from the frontend to authenticate a user.
        /// </summary>
        /// <param name="loginRequest"></param>
        /// <returns></returns>
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest loginRequest)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == loginRequest.Email.Trim());
            Console.WriteLine(user);

            if (user == null || !user.IsActive)
            {
                return Unauthorized("Invalid email or user is inactive.");
            }

            if (user.Role == "customer" && !user.IsVerified)
            {
                return Unauthorized("Please verify your email before logging in.");
            }

            bool isPasswordValid = BCrypt.Net.BCrypt.Verify(loginRequest.Password, user.Password);

            if (!isPasswordValid)
            {
                return Unauthorized("Invalid credentials");
            }

            var token = _tokenService.GenerateToken(user);

            return Ok(new LoginResponse
            {
                Token = token,
                UserId = user.UserId,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Email = user.Email,
                IsActive = user.IsActive,
                IsVerified = user.IsVerified,
                Role = user.Role
            });
        }


        /// <summary>
        /// Register endpoint. This will be called from the frontend to create a new user.
        /// </summary>
        /// <param name="registerRequest"></param>
        /// <returns></returns>
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

        /// <summary>
        /// Verify Email endpoint. This will be called when the user clicks the verification link in their email.
        /// </summary>
        /// <param name="token"></param>
        /// <returns>Returns a response message which will be displayed to user after clicking verification link received on email</returns>
        [HttpGet("verify-email")]
        public async Task<IActionResult> VerifyEmail([FromQuery] string email, [FromQuery] string token)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);

            if (user == null)
            {
                return BadRequest(new RegisterResponse { Message = "error: Invalid verification link" });
            }

            if (user.VerificationToken != null && user.VerificationToken != token)
            {
                return BadRequest(new RegisterResponse { Message = "error: Invalid or expired verification link." });
            }

            if (user.IsVerified || user.VerificationToken == null)
            {
                return Ok(new RegisterResponse { Message = "info: User already verified" });
            }

            user.IsActive = true;
            user.VerificationToken = null;
            user.IsVerified = true;

            await _context.SaveChangesAsync();

            return Ok(new RegisterResponse { Message = "success: Email verified successfully." });
        }


    }
}