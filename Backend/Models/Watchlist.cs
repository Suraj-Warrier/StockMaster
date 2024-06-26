using System.Collections.Generic;

namespace Backend.Models
{
    public class Watchlist
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;

        public List<WatchlistStock> WatchlistStocks { get; set; } = new List<WatchlistStock>();

        // Foreign key for User
        public string UserId { get; set; }
        public User User { get; set; }
    }
}
