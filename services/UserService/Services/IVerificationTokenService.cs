using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using UserService.Models;

namespace UserService.Services
{
    public interface IVerificationTokenService
    {
        string GenerateVerificationToken();
    }
}
