using Mailjet.Client;
using Mailjet.Client.Resources;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json.Linq;
using System.Threading.Tasks;

public class EmailService
{
    private readonly IConfiguration _configuration;

    public EmailService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public async Task SendEmailAsync(string toEmail, string subject, string message)
    {
        MailjetClient client = new MailjetClient(_configuration["Mailjet:ApiKey"], _configuration["Mailjet:SecretKey"]);

        MailjetRequest request = new MailjetRequest
        {
            Resource = Send.Resource
        }
        .Property(Send.FromEmail, _configuration["Mailjet:Sender"])
        .Property(Send.FromName, "Your App Name")
        .Property(Send.Subject, subject)
        .Property(Send.TextPart, message)
        .Property(Send.HtmlPart, message)
        .Property(Send.Recipients, new JArray {
            new JObject {
                {"Email", toEmail}
            }
        });

        await client.PostAsync(request);
    }
}
