namespace Backend.Models
{
    public class WatchlistStock
    {
        public int WatchlistId { get; set; }
        public Watchlist Watchlist { get; set; }

        public int StockId { get; set; }
        public Stock Stock { get; set; }
    }
}
