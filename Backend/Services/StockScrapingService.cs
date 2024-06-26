using System.Collections.Concurrent;
using System.Diagnostics;
using Backend.WebSockets;

public class StockScrapingService : BackgroundService
{
    private readonly ILogger<StockScrapingService> _logger;
    private readonly StockWebSocketHandler _webSocketHandler;
    public static ConcurrentDictionary<string, decimal> LatestStockPrices = new ConcurrentDictionary<string, decimal>();

    public StockScrapingService(ILogger<StockScrapingService> logger, StockWebSocketHandler webSocketHandler)
    {
        _logger = logger;
        _webSocketHandler = webSocketHandler;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await ScrapeStockPrices();
                // await Task.Delay(TimeSpan.FromSeconds(3), stoppingToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while scraping stock prices.");
            }
        }
    }

    private async Task ScrapeStockPrices()
    {
        string result;
        try
        {
            string pythonScriptPath = "../scraper/stock_price_scraper.py";
            ProcessStartInfo start = new ProcessStartInfo
            {
                FileName = "python",
                Arguments = pythonScriptPath,
                UseShellExecute = false,
                RedirectStandardOutput = true,
                RedirectStandardError = true,
                CreateNoWindow = true
            };

            using (Process process = new Process())
            {
                process.StartInfo = start;
                process.Start();

                result = await process.StandardOutput.ReadToEndAsync();
                string error = await process.StandardError.ReadToEndAsync();

                process.WaitForExit();

                if (!string.IsNullOrWhiteSpace(error))
                {
                    _logger.LogError($"Error from Python script: {error}");
                }

                var stockPrices = ParseStockPrices(result);
                await _webSocketHandler.BroadcastStockPrices(stockPrices);

                foreach (var stock in stockPrices)
                {
                    LatestStockPrices[stock.Key] = decimal.Parse(stock.Value);
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error executing Python script: {ex.Message}");
        }
    }

    private Dictionary<string, string> ParseStockPrices(string result)
{
    var stockPrices = new Dictionary<string, string>();
    var lines = result.Split('\n');
    foreach (var line in lines)
    {
        if (!string.IsNullOrWhiteSpace(line))
        {
            var parts = line.Split(new[] { ", " }, StringSplitOptions.RemoveEmptyEntries);
            if (parts.Length == 2)
            {
                string symbol = parts[0].Trim().Replace("Stock: ", ""); // Adjust as needed
                string price = parts[1].Trim().Replace("Price: ", ""); // Adjust as needed
                stockPrices[symbol] = price;
            }
            else
            {
                _logger.LogWarning($"Unexpected line format: {line}");
            }
        }
    }
    return stockPrices;
}

}
