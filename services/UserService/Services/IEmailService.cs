namespace UserService.Services
{
    public interface IEmailService
    {
        void SendVerificationEmail(string toEmail, string verificationCode);
    }
}
