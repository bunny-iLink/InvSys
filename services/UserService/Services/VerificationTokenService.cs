using System.Security.Cryptography;
using System.Text;

namespace UserService.Services
{
    public class VerificationTokenService : IVerificationTokenService
    {
        public string GenerateVerificationToken()
        {
            const string chars = "abcdefghijklmnopqrstuvwxyz0123456789";
            var bytes = new byte[32];
            using (var rng = RandomNumberGenerator.Create())
            {
                rng.GetBytes(bytes);
            }

            var result = new StringBuilder(32);
            foreach (var b in bytes)
            {
                result.Append(chars[b % chars.Length]);
            }

            return result.ToString();
        }
    }
}