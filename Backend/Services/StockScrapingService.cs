using System.Collections.Concurrent;
using System.Diagnostics;
using Backend.WebSockets;

public class StockScrapingService : BackgroundService
{
    private readonly ILogger<StockScrapingService> _logger;
    private readonly StockWebSocketHandler _webSocketHandler;
    public static ConcurrentDictionary<string, decimal> LatestStockPrices = new ConcurrentDictionary<string, decimal>();
    public static ConcurrentDictionary<string,List<string>> LatestFundamentals = new ConcurrentDictionary<string,List<string>>();
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

                var stockData = ParseStockPrices(result);
                var stockandprice = new Dictionary<string,string> ();

                foreach(var stock in stockData){
                    // _logger.LogInformation("{Name}",stock.Key);
                    stockandprice[stock.Key] = stock.Value[0];
                    LatestFundamentals[stock.Key] = new List<string> {stock.Value[1],stock.Value[2],stock.Value[3]};
                }
                await _webSocketHandler.BroadcastStockPrices(stockandprice);

                foreach (var stock in stockData)
                {
                    LatestStockPrices[stock.Key] = decimal.Parse(stock.Value[0]);
                }
                // foreach(var stock in LatestFundamentals){
                //     _logger.LogInformation("{Name}",stock.Key);
                // }
            }
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error executing Python script: {ex.Message}");
        }
    }

    private Dictionary<string, List<string>> ParseStockPrices(string result)
{
    var stockPrices = new Dictionary<string, List<string>>();
    var lines = result.Split('\n');
    foreach (var line in lines)
    {
        if (!string.IsNullOrWhiteSpace(line))
        {
            var parts = line.Split(new[] { ", " }, StringSplitOptions.RemoveEmptyEntries);
            if (parts.Length == 5)
            {
                string symbol = parts[0].Trim().Replace("Stock: ", ""); // Adjust as needed
                string price = parts[1].Trim().Replace("Price: ", ""); // Adjust as needed
                string MarketCap = parts[2].Trim().Replace("Market Cap: ","");
                string AvgVol = parts[3].Trim().Replace("Avg Volume: ","");
                string PERatio = parts[4].Trim().Replace("PE Ratio: ","");
                
                stockPrices[symbol] =new List<string> {price,MarketCap,AvgVol,PERatio};
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
