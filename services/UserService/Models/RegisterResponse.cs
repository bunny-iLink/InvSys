using System.ComponentModel.DataAnnotations;
public class RegisterResponse
{
    /// <summary>
    /// Response message after a registration attempt
    /// </summary>
    public string Message { get; set; } = string.Empty;
}