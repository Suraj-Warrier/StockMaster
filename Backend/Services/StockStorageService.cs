using Backend.Data;
using Backend.Models;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

public class StockStorageService : IHostedService, IDisposable
{
    private readonly ILogger<StockStorageService> _logger;
    private readonly IServiceProvider _serviceProvider;
    private Timer _timer;
    private readonly int maxRecords = 1000;
    private readonly TimeSpan dailyTime = new TimeSpan(15, 30, 0); // 3:30 PM IST
    private static readonly List<TimeSpan> fiveMinTimes = GenerateTimeIntervals(TimeSpan.FromMinutes(5), new TimeSpan(9, 15, 0), new TimeSpan(15, 30, 0));
    private static readonly List<TimeSpan> thirtyMinTimes = GenerateTimeIntervals(TimeSpan.FromMinutes(30), new TimeSpan(9, 15, 0), new TimeSpan(15, 30, 0));
    private static readonly List<TimeSpan> hourlyTimes = GenerateTimeIntervals(TimeSpan.FromHours(1), new TimeSpan(9, 15, 0), new TimeSpan(15, 30, 0));

    public StockStorageService(IServiceProvider serviceProvider, ILogger<StockStorageService> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    public Task StartAsync(CancellationToken cancellationToken)
    {
        _logger.LogInformation("Stock Storage Service is starting.");

        _timer = new Timer(UpdateStockData, null, TimeSpan.Zero, TimeSpan.FromSeconds(45));

        return Task.CompletedTask;
    }

    private void UpdateStockData(object state)
    {
        using (var scope = _serviceProvider.CreateScope())
        {
            var context = scope.ServiceProvider.GetRequiredService<ApplicationDBContext>();
            var stocks = context.Stocks.ToList();
            // foreach(var stock in stocks){
            //     _logger.LogInformation("{Name}",stock.StockName);
            // }
            foreach (var stock in stocks)
            {

                if (StockScrapingService.LatestStockPrices.TryGetValue(stock.Symbol, out var latestPrice))
                {
                    DateTime currentTimeUtc = DateTime.UtcNow;
                    DateTime currentTimeIst = TimeZoneInfo.ConvertTimeFromUtc(currentTimeUtc, TimeZoneInfo.FindSystemTimeZoneById("India Standard Time"));
                    TimeSpan currentTimeSpan = currentTimeIst.TimeOfDay;
                    // _logger.LogInformation("currentTimeSpan: {currentTimeSpan} ",currentTimeSpan);
                    // foreach(var times in fiveMinTimes){
                    //     _logger.LogInformation("{times}",times);
                    // }
                   

                    if (IsWithinRange(fiveMinTimes,currentTimeSpan))
                    {
                        AddPriceIfNotExists(stock.FiveMinData, latestPrice, currentTimeIst, currentTimeSpan);
                    }
                    if (IsWithinRange(thirtyMinTimes,currentTimeSpan))
                    {
                        AddPriceIfNotExists(stock.ThirtyMinData, latestPrice, currentTimeIst, currentTimeSpan);
                    }
                    if (IsWithinRange(hourlyTimes,currentTimeSpan))
                    {
                        AddPriceIfNotExists(stock.OneHourData, latestPrice, currentTimeIst, currentTimeSpan);
                    }
                    if (IsDailyTime(currentTimeIst))
                    {
                        AddPriceWithLimit(stock.OneDayData, latestPrice, currentTimeIst);
                    }
                    if (IsWeeklyTime(currentTimeIst))
                    {
                        AddPriceWithLimit(stock.OneWeekData, latestPrice, currentTimeIst);
                    }

                    context.Update(stock);
                }
                if(StockScrapingService.LatestFundamentals.TryGetValue(stock.Symbol, out var stockData)){
                    _logger.LogInformation("inside if: {Name}",stock.StockName);
                    if(stockData.Count >= 3){
                        stock.MarketCap = stockData[0];
                        stock.AvgVol = stockData[1];
                        stock.PERatio = stockData[2];
                        
                    }
                    context.Update(stock);
                }
            }

            context.SaveChanges();
        }
    }

    private bool IsWithinRange(List<TimeSpan> Times, TimeSpan curr_time){
        // _logger.LogInformation("{minutes}",curr_time.Hours);
        return (Times.Any(t => t.Hours*100+t.Minutes == curr_time.Hours*100+curr_time.Minutes));
    }

    private void AddPriceIfNotExists(List<PriceTimestamp> priceTimestamps, decimal latestPrice, DateTime currentTime, TimeSpan currentTimeSpan)
    {
        if (!priceTimestamps.Any(pt => pt.Timestamp.Date == currentTime.Date && pt.Timestamp.TimeOfDay.Hours*100+pt.Timestamp.TimeOfDay.Minutes == currentTimeSpan.Hours*100+currentTimeSpan.Minutes))
        {
            AddPriceWithLimit(priceTimestamps, latestPrice, currentTime);
        }
    }

    private void AddPriceWithLimit(List<PriceTimestamp> priceTimestamps, decimal latestPrice, DateTime currentTime)
    {
        if (priceTimestamps.Count >= maxRecords)
        {
            priceTimestamps.RemoveAt(0);
        }
        priceTimestamps.Add(new PriceTimestamp { Price = latestPrice, Timestamp = currentTime });
    }

    private bool IsDailyTime(DateTime currentTime)
    {
        return currentTime.TimeOfDay.Hours*100+currentTime.TimeOfDay.Minutes == dailyTime.Hours*100+dailyTime.Minutes && currentTime.DayOfWeek != DayOfWeek.Saturday && currentTime.DayOfWeek != DayOfWeek.Sunday;
    }

    private bool IsWeeklyTime(DateTime currentTime)
    {
        return IsDailyTime(currentTime) && currentTime.DayOfWeek == DayOfWeek.Friday;
    }

    private static List<TimeSpan> GenerateTimeIntervals(TimeSpan interval, TimeSpan startTime, TimeSpan endTime)
    {
        var times = new List<TimeSpan>();
        for (var time = startTime; time <= endTime; time = time.Add(interval))
        {
            times.Add(time);
        }
        return times;
    }

    public Task StopAsync(CancellationToken cancellationToken)
    {
        _logger.LogInformation("Stock Storage Service is stopping.");

        _timer?.Change(Timeout.Infinite, 0);

        return Task.CompletedTask;
    }

    public void Dispose()
    {
        _timer?.Dispose();
    }
}
