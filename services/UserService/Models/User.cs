using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace UserService.Models
{
    /// <summary>
    /// User entity model
    /// </summary>
    [Table("TbUser")]
    public class User
    {
        [Key]
        public int UserId { get; set; }
        public string FirstName { get; set; } = string.Empty;
        public string? LastName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public bool IsActive { get; set; } = true;
        public string? VerificationToken { get; set; } = string.Empty;
        [Column("IsVerified")]
        public bool IsVerified { get; set; } = false;
    }
}