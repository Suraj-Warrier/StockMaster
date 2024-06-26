using System.Collections.Generic;
using Microsoft.AspNetCore.Identity;

namespace Backend.Models
{
    public class User : IdentityUser
    {
        public List<Watchlist> Watchlists { get; set; } = new List<Watchlist>();
    }
}
