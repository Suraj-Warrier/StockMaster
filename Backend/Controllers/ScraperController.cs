using System;
using System.Diagnostics;
using System.IO;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System.Threading.Tasks;
using Backend.WebSockets;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ScraperController : ControllerBase
    {
        private readonly ILogger<ScraperController> _logger;
        private readonly StockWebSocketHandler _webSocketHandler;

        public ScraperController(ILogger<ScraperController> logger, StockWebSocketHandler webSocketHandler)
        {
            _logger = logger;
            _webSocketHandler = webSocketHandler;
        }

        // [HttpGet("scrapeStockPrices")]
        // public async Task<IActionResult> ScrapeStockPrices()
        // {
        //     try
        //     {
        //         string pythonScriptPath = "../scraper/stock_price_scraper.py";
                
        //         ProcessStartInfo start = new ProcessStartInfo
        //         {
        //             FileName = "python", // Assumes Python is in PATH environment variable
        //             Arguments = pythonScriptPath,
        //             UseShellExecute = false,
        //             RedirectStandardOutput = true,
        //             RedirectStandardError = true,
        //             CreateNoWindow = true
        //         };

        //         using (Process process = new Process())
        //         {
        //             process.StartInfo = start;
        //             process.Start();

        //             string result = await process.StandardOutput.ReadToEndAsync();
        //             string error = await process.StandardError.ReadToEndAsync();

        //             process.WaitForExit();

        //             if (!string.IsNullOrWhiteSpace(error))
        //             {
        //                 _logger.LogError($"Error from Python script: {error}");
        //                 return StatusCode(500, $"Error from Python script: {error}");
        //             }

        //             // Broadcast stock prices to respective WebSocket clients
        //             var stockPrices = ParseStockPrices(result);
        //             foreach (var stockPrice in stockPrices)
        //             {
        //                 await _webSocketHandler.BroadcastStockPrice(stockPrice.Key, stockPrice.Value);
        //             }

        //             return Ok(result);
        //         }
        //     }
        //     catch (Exception ex)
        //     {
        //         _logger.LogError($"Error executing Python script: {ex.Message}");
        //         return StatusCode(500, $"Error executing Python script: {ex.Message}");
        //     }
        // }

        private Dictionary<string, string> ParseStockPrices(string result)
        {
            // Implement parsing logic to extract stock prices from the script output
            // Example:
            var stockPrices = new Dictionary<string, string>();
            var lines = result.Split('\n');
            foreach (var line in lines)
            {
                var parts = line.Split(',');
                if (parts.Length == 2)
                {
                    stockPrices[parts[0]] = parts[1];
                }
            }
            return stockPrices;
        }
    }
}
  