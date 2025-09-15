using System;
using System.Net;
using System.Net.Mail;

namespace UserService.Services
{
    public class EmailService : IEmailService
    {
        public void SendVerificationEmail(string toEmail, string token)
        {
            string fromEmail = "info.invsys12@gmail.com";    // your Gmail
            string fromPassword = "ukawcanxdtxtigsj";  // 16-char app password
            string smtpServer = "smtp.gmail.com";
            int smtpPort = 587;

            string verificationLink = $"https://localhost:4200/verify?email={Uri.EscapeDataString(toEmail)}&token={token}";

            using (var client = new SmtpClient(smtpServer, smtpPort))
            {
                client.EnableSsl = true;
                client.Credentials = new NetworkCredential(fromEmail, fromPassword);

                var mail = new MailMessage(fromEmail, toEmail);
                mail.Subject = "Verify your email";
                mail.Body = $"Click this link to verify your account: {verificationLink}";
                mail.IsBodyHtml = true;
                mail.Body = $"<p>Please verify your account by clicking the link below:</p>" +
                            $"<a href='{verificationLink}'>Verify Email</a>";


                client.Send(mail);
            }

            Console.WriteLine("Verification email sent successfully via Gmail!");
        }
    }
}
