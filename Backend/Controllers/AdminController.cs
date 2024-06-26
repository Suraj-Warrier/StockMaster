using Microsoft.AspNetCore.Mvc;

[Route("api/[controller]")]
[ApiController]
public class AdminController : ControllerBase
{
    private readonly UserService _userService;

    public AdminController(UserService userService)
    {
        _userService = userService;
    }

    [HttpPost("deleteAllUsers")]
    public async Task<IActionResult> DeleteAllUsers()
    {
        await _userService.DeleteAllUsersAsync();
        return Ok("All users have been deleted.");
    }
}
