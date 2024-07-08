using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Net.WebSockets;
using System.Text;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;

namespace Backend.WebSockets
{
    public class WebSocketMessage
    {
        public string Type { get; set; } // Example: "stockUpdate"
        public Dictionary<string, string> StockPrices { get; set; }
        public DateTime Timestamp { get; set; }
    }

    public class StockWebSocketHandler
    {
        private readonly ConcurrentDictionary<string, WebSocket> _sockets = new ConcurrentDictionary<string, WebSocket>();
        private readonly ILogger<StockWebSocketHandler> _logger;

        public event Action<Dictionary<string, string>> OnStockPricesUpdated;

        public StockWebSocketHandler(ILogger<StockWebSocketHandler> logger)
        {
            _logger = logger;
        }

        public async Task HandleWebSocketAsync(HttpContext context, WebSocket webSocket)
        {
            string socketId = Guid.NewGuid().ToString();
            _sockets.TryAdd(socketId, webSocket);

            try
            {
                while (webSocket.State == WebSocketState.Open)
                {
                    var buffer = new byte[1024 * 4];
                    var receiveResult = await webSocket.ReceiveAsync(new ArraySegment<byte>(buffer), CancellationToken.None);

                    if (receiveResult.MessageType == WebSocketMessageType.Text)
                    {
                        var message = Encoding.UTF8.GetString(buffer, 0, receiveResult.Count);
                        _logger.LogInformation($"Received message from client: {message}");
                    }
                    else if (receiveResult.MessageType == WebSocketMessageType.Close)
                    {
                        _sockets.TryRemove(socketId, out _);
                        break;
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError($"WebSocket connection error: {ex.Message}");
            }
            finally
            {
                if (webSocket != null)
                {
                    _sockets.TryRemove(socketId, out _);
                    await webSocket.CloseAsync(WebSocketCloseStatus.NormalClosure, "Closed by the server", CancellationToken.None);
                }
            }
        }

        public async Task BroadcastStockPrices(Dictionary<string,string> stockPrices)
        {
            var stockandprice =new Dictionary<string,string> ();
            foreach (var stock in stockPrices){
                stockandprice[stock.Key] = stock.Value;
            }
            var message = new WebSocketMessage
            {
                Type = "stockUpdate",
                StockPrices = stockandprice,
                Timestamp = DateTime.UtcNow
            };

            var jsonMessage = JsonSerializer.Serialize(message);
            var buffer = Encoding.UTF8.GetBytes(jsonMessage);

            foreach (var socket in _sockets)
            {
                if (socket.Value.State == WebSocketState.Open)
                {
                    await socket.Value.SendAsync(new ArraySegment<byte>(buffer, 0, buffer.Length), WebSocketMessageType.Text, true, CancellationToken.None);
                }
            }

            OnStockPricesUpdated?.Invoke(stockPrices);
        }
    }
}
