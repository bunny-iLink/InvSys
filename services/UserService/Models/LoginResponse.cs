using System.ComponentModel.DataAnnotations;
public class LoginResponse
{
    public string? Token { get; set; }
    public int UserId { get; set; }
    public string Email { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string? LastName { get; set; }
    public bool IsActive { get; set; }
    public bool IsVerified { get; set; }
}
