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

    public StockStorageService(IServiceProvider serviceProvider, ILogger<StockStorageService> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    public Task StartAsync(CancellationToken cancellationToken)
    {
        _logger.LogInformation("Stock Storage Service is starting.");

        _timer = new Timer(UpdateStockData, null, TimeSpan.Zero, TimeSpan.FromMinutes(1));

        return Task.CompletedTask;
    }

    private void UpdateStockData(object state)
    {
        using (var scope = _serviceProvider.CreateScope())
        {
            var context = scope.ServiceProvider.GetRequiredService<ApplicationDBContext>();
            var stocks = context.Stocks.ToList();

            foreach (var stock in stocks)
            {
                if (StockScrapingService.LatestStockPrices.TryGetValue(stock.Symbol, out var latestPrice))
                {
                    AddPriceIfIntervalPassed(stock.FiveMinData, latestPrice, TimeSpan.FromMinutes(5));
                    AddPriceIfIntervalPassed(stock.ThirtyMinData, latestPrice, TimeSpan.FromMinutes(30));
                    AddPriceIfIntervalPassed(stock.OneHourData, latestPrice, TimeSpan.FromHours(1));
                    AddPriceIfIntervalPassed(stock.OneDayData, latestPrice, TimeSpan.FromDays(1));
                    AddPriceIfIntervalPassed(stock.OneWeekData, latestPrice, TimeSpan.FromDays(7));

                    context.Update(stock);
                }
            }

            context.SaveChanges();
        }
    }

    private void AddPriceIfIntervalPassed(List<PriceTimestamp> priceTimestamps, decimal latestPrice, TimeSpan interval)
    {
        if (!priceTimestamps.Any() || DateTime.UtcNow - priceTimestamps.Last().Timestamp >= interval)
        {
            priceTimestamps.Add(new PriceTimestamp { Price = latestPrice, Timestamp = DateTime.UtcNow });
        }
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
