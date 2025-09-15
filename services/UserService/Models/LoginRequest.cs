using System.ComponentModel.DataAnnotations;

namespace UserService.Models
{
    /// <summary>
    /// Login request model
    /// </summary>
    public class LoginRequest
    {
        [Required]
        public string Email { get; set; } = string.Empty;
        [Required]
        public string Password { get; set; } = string.Empty;
    }
}