using Backend.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using Microsoft.AspNetCore.Authorization;


namespace Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AccountController : ControllerBase
    {
        private readonly UserManager<User> _userManager;
        private readonly SignInManager<User> _signInManager;
        private readonly IConfiguration _configuration;
        private readonly EmailService _emailService;
        private readonly ILogger<AccountController> _logger;

        public AccountController(UserManager<User> userManager, SignInManager<User> signInManager, IConfiguration configuration, EmailService emailService, ILogger<AccountController> logger)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _configuration = configuration;
            _emailService = emailService;
            _logger = logger;
        }

        [HttpPost("register")]
         [AllowAnonymous]
        public async Task<IActionResult> Register([FromBody] RegisterModel model)
        {
            var user = new User { UserName = model.Email, Email = model.Email };
            var result = await _userManager.CreateAsync(user, model.Password);
            if (result.Succeeded)
            {
                var token = await _userManager.GenerateEmailConfirmationTokenAsync(user);
                var confirmationLink = Url.Action(nameof(VerifyEmail), "Account", new { token, email = user.Email }, Request.Scheme);

                await _emailService.SendEmailAsync(user.Email, "Confirm your email", $"Please confirm your email by clicking on this link: {confirmationLink}");

                _logger.LogInformation("User registered successfully and email confirmation sent to {Email}", user.Email);
                return Ok(new { Message = "Registration successful. Please check your email to confirm your account." });
            }
            _logger.LogWarning("User registration failed: {Errors}", result.Errors);
            return BadRequest(result.Errors);
        }

        [HttpGet("verify-email")]
         [AllowAnonymous]
        public async Task<IActionResult> VerifyEmail(string token, string email)
        {
            var user = await _userManager.FindByEmailAsync(email);
            if (user == null) 
            {
                _logger.LogWarning("Email verification failed: invalid email {Email}", email);
                return BadRequest("Invalid Email");
            }

            var result = await _userManager.ConfirmEmailAsync(user, token);
            if (result.Succeeded)
            {
                _logger.LogInformation("Email confirmed successfully for {Email}", email);
                return Ok("Email confirmed successfully.");
            }

            _logger.LogWarning("Email confirmation failed for {Email}", email);
            return BadRequest("Error confirming email.");
        }

        [AllowAnonymous]
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginModel model)
        {
            var user = await _userManager.FindByEmailAsync(model.Email);
            if (user == null || !user.EmailConfirmed)
            {
                _logger.LogWarning("Login attempt failed for unverified email {Email}", model.Email);
                return Unauthorized("Email is not verified");
            }

            var result = await _signInManager.PasswordSignInAsync(model.Email, model.Password, false, false);
            if (result.Succeeded)
            {
                var token = GenerateJwtToken(user);
                _logger.LogInformation("User {Email} logged in successfully", model.Email);
                return Ok(new { token, userId = user.Id });
            }

            _logger.LogWarning("Login attempt failed for {Email}", model.Email);
            return Unauthorized();
        }


        [Authorize]
        [HttpPost("change-password")]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto model)
        {
            if (!ModelState.IsValid)
            {
                _logger.LogWarning("Change password failed due to invalid model state");
                return BadRequest(ModelState);
            }

            var user = await _userManager.GetUserAsync(User);
            if (user == null)
            {
                _logger.LogWarning("Change password failed: user not found");
                return Unauthorized("not auth");
            }

            if (model.NewPassword != model.ConfirmPassword)
            {
                _logger.LogWarning("Change password failed: new password and confirm password do not match for user {UserId}", user.Id);
                return BadRequest("New password and confirm password do not match");
            }

            var result = await _userManager.ChangePasswordAsync(user, model.CurrentPassword, model.NewPassword);
            if (result.Succeeded)
            {
                await _signInManager.RefreshSignInAsync(user);
                _logger.LogInformation("Password changed successfully for user {UserId}", user.Id);
                return Ok(new { success = true });
            }

            foreach (var error in result.Errors)
            {
                _logger.LogWarning("Change password failed for user {UserId}: {Error}", user.Id, error.Description);
                ModelState.AddModelError(string.Empty, error.Description);
            }

            _logger.LogWarning("Change password failed for user {UserId} for some reason", user.Id);
            return BadRequest(ModelState);
        }

        // private string GenerateJwtToken(User user)
        // {
        //     var key = _configuration.GetValue<string>("JwtSettings:Secret");
        //     var keyBytes = Encoding.UTF8.GetBytes(key);
        //     var tokenHandler = new JwtSecurityTokenHandler();
        //     var tokenDescriptor = new SecurityTokenDescriptor
        // {
        //     //  Subject = new ClaimsIdentity(new Claim[]
        //     //  {
        //     //      new Claim(JwtRegisteredClaimNames.Sub, user.Email),
        //     //     new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
        //     //     new Claim(ClaimTypes.NameIdentifier, user.Id)
        //     //  }),
        //      Subject = null,
        //      Expires = DateTime.UtcNow.AddDays(2),
        //      SigningCredentials = new SigningCredentials(
        //                           new SymmetricSecurityKey(keyBytes),
        //                           SecurityAlgorithms.HmacSha256Signature),
        //     Issuer = _configuration.GetValue<string>("JwtSettings:Issuer"),
        //     Audience = _configuration.GetValue<string>("JwtSettings:Audience")
            
        // };
        // var token = tokenHandler.CreateToken(tokenDescriptor);
        //      return tokenHandler.WriteToken(token);




            
        // }

        private string GenerateJwtToken(User user)
        {
            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["JwtSettings:Secret"]));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            var claims = new[] {
                new Claim(JwtRegisteredClaimNames.Sub, "blah"),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),  
            };

            var token = new JwtSecurityToken(_configuration["JwtSettings:Issuer"],
                _configuration["JwtSettings:Audience"],
                claims,
                expires: DateTime.UtcNow.AddDays(2),
                signingCredentials: credentials);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
        

    }
    

    public class RegisterModel
    {
        public string Email { get; set; }
        public string Password { get; set; }
    }

    public class LoginModel
    {
        public string Email { get; set; }
        public string Password { get; set; }
    }

    public class VerifyEmailModel
    {
        public string Email { get; set; }
        public string Token { get; set; }
    }   
}
