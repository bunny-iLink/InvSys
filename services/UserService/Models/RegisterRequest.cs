using System.ComponentModel.DataAnnotations;

namespace UserService.Models
{
    /// <summary>
    /// Register request model
    /// </summary>
    public class RegisterRequest
    {
        [Required]
        public string Email { get; set; } = string.Empty;
        [Required]
        public string Password { get; set; } = string.Empty;
        [Required]
        public string FirstName { get; set; } = string.Empty;
    }
}