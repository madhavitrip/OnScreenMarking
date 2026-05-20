using System.Text;

namespace API.Services
{
    public interface IPasswordGenerationService
    {
        string GeneratePassword();
    }

    public class PasswordGenerationService : IPasswordGenerationService
    {
        public string GeneratePassword()
        {
            const string validChars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
            const int passwordLength = 10;

            StringBuilder password = new StringBuilder();
            Random random = new Random();

            for (int i = 0; i < passwordLength; i++)
            {
                int index = random.Next(validChars.Length);
                password.Append(validChars[index]);
            }

            return password.ToString();
        }
    }
}
