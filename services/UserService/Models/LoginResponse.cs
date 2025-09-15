using System.ComponentModel.DataAnnotations;
public class LoginResponse
{
    /// <summary>
    /// JWT Token, sent as response to a successful login
    /// </summary>
    public string Token { get; set; } = string.Empty;
}