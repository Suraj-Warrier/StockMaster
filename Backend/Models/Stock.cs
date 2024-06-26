using System.Collections.Generic;

namespace Backend.Models
{
    public class Stock
    {
        public int Id { get; set; }
        public string StockName { get; set; } = string.Empty;
        public string Symbol { get; set; } = string.Empty;

        public List<PriceTimestamp> FiveMinData { get; set; } = new List<PriceTimestamp>();
        public List<PriceTimestamp> ThirtyMinData { get; set; } = new List<PriceTimestamp>();
        public List<PriceTimestamp> OneHourData { get; set; } = new List<PriceTimestamp>();
        public List<PriceTimestamp> OneDayData { get; set; } = new List<PriceTimestamp>();
        public List<PriceTimestamp> OneWeekData { get; set; } = new List<PriceTimestamp>();

        public List<WatchlistStock> WatchlistStocks { get; set; } = new List<WatchlistStock>();
    }
}
