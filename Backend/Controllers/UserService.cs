using Backend.Data;
using Microsoft.AspNetCore.Identity;
using Backend.Models;
using System.Threading.Tasks;

public class UserService
{
    private readonly ApplicationDBContext _context;

    public UserService(ApplicationDBContext context)
    {
        _context = context;
    }

    public async Task DeleteAllUsersAsync()
    {
        var users = _context.Users.ToList();
        _context.Users.RemoveRange(users);

        var userRoles = _context.UserRoles.ToList();
        _context.UserRoles.RemoveRange(userRoles);

        await _context.SaveChangesAsync();
    }
}
