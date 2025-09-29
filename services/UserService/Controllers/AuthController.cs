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

        /// <summary>
        /// Initializes a new instance of the <see cref="AuthController"/> class.
        /// </summary>
        /// <param name="context">Database context for accessing user data.</param>
        /// <param name="tokenService">Service for generating JWT tokens.</param>
        /// <param name="emailService">Service for sending verification emails.</param>
        public AuthController(UserDbContext context, ITokenService tokenService, IEmailService emailService)
        {
            _context = context;
            _tokenService = tokenService;
            _emailService = emailService;
        }

        /// <summary>
        /// Authenticates a user and generates a JWT token if successful.
        /// </summary>
        /// <param name="loginRequest">The login request containing email and password.</param>
        /// <returns>
        /// Returns an <see cref="OkObjectResult"/> with a <see cref="LoginResponse"/> if authentication is successful.
        /// Returns <see cref="UnauthorizedResult"/> if credentials are invalid or user is inactive/not verified.
        /// </returns>
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
        /// Registers a new user and sends an email verification link.
        /// </summary>
        /// <param name="registerRequest">The registration request containing user's name, email, and password.</param>
        /// <returns>
        /// Returns an <see cref="OkObjectResult"/> with a <see cref="RegisterResponse"/> if registration is successful.
        /// Returns <see cref="BadRequestObjectResult"/> if the email is already registered.
        /// </returns>
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
        /// Verifies a user's email based on the verification token.
        /// </summary>
        /// <param name="email">The user's email address.</param>
        /// <param name="token">The verification token sent to the user's email.</param>
        /// <returns>
        /// Returns <see cref="OkObjectResult"/> with a <see cref="RegisterResponse"/> if email verification succeeds.
        /// Returns <see cref="BadRequestObjectResult"/> if the verification token is invalid or expired.
        /// </returns>
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