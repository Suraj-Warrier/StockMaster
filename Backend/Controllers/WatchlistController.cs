using Backend.Data;
using Backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Threading.Tasks;

namespace Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class WatchlistController : ControllerBase
    {
        private readonly ApplicationDBContext _context;

        public WatchlistController(ApplicationDBContext context)
        {
            _context = context;
        }

        [HttpPost("create")]
        public async Task<IActionResult> CreateWatchlist([FromBody] CreateWatchlistModel model)
        {
            var userId = model.UserId;
            var existingWatchlist = await _context.Watchlists
                .FirstOrDefaultAsync(w => w.Name == model.Name && w.UserId == userId);

            if (existingWatchlist != null)
            {
                return BadRequest("Watchlist with the same name already exists for this user.");
            }

            var watchlist = new Watchlist
            {
                Name = model.Name,
                UserId = userId
            };

            _context.Watchlists.Add(watchlist);
            await _context.SaveChangesAsync();

            return Ok(watchlist);
        }

        [HttpDelete("delete/{id}")]
        public async Task<IActionResult> DeleteWatchlist(int id)
        {
            var watchlist = await _context.Watchlists
                .Include(w => w.WatchlistStocks)
                .FirstOrDefaultAsync(w => w.Id == id);

            if (watchlist == null)
            {
                return NotFound();
            }

            _context.WatchlistStocks.RemoveRange(watchlist.WatchlistStocks);
            _context.Watchlists.Remove(watchlist);
            await _context.SaveChangesAsync();

            return Ok();
        }

        [HttpGet("GetWatchlist/{id}")]
        public async Task<IActionResult> GetWatchlist(int id)
        {
            var watchlist = await _context.Watchlists
                .Include(w => w.WatchlistStocks)
                .FirstOrDefaultAsync(w => w.Id == id);

            if (watchlist == null)
            {
                return NotFound();
            }

            return Ok(watchlist);

        }

        [HttpPut("EditWatchlist")]
        public async Task<IActionResult> EditWatchlist([FromBody] RenameWatchlistModel model)
        {
            var watchlist = await _context.Watchlists.FindAsync(model.WatchlistId);
            if(watchlist==null){
                return NotFound("Watchlist not found");
            }
            watchlist.Name = model.NewName;
            _context.Watchlists.Update(watchlist);
            await _context.SaveChangesAsync();
            return Ok();
            
        }



        [HttpPost("addStock")]
        public async Task<IActionResult> AddStock([FromBody] AddRemoveStockModel model)
        {
            var watchlist = await _context.Watchlists
                .Include(w => w.WatchlistStocks)
                .FirstOrDefaultAsync(w => w.Id == model.WatchlistId);

            if (watchlist == null)
            {
                return NotFound("Watchlist not found.");
            }

            var stock = await _context.Stocks.FindAsync(model.StockId);
            if (stock == null)
            {
                return NotFound("Stock not found.");
            }

            var existingWatchlistStock = await _context.WatchlistStocks
                .FirstOrDefaultAsync(ws => ws.WatchlistId == model.WatchlistId && ws.StockId == model.StockId);

            if (existingWatchlistStock != null)
            {
                return BadRequest("Stock is already in the watchlist.");
            }

            var watchlistStock = new WatchlistStock
            {
                WatchlistId = model.WatchlistId,
                StockId = model.StockId
            };

            _context.WatchlistStocks.Add(watchlistStock);
            await _context.SaveChangesAsync();

            return Ok(watchlistStock);
        }


        [HttpDelete("deleteStock")]
        public async Task<IActionResult> DeleteStock([FromBody] AddRemoveStockModel model)
        {
            var watchlistStock = await _context.WatchlistStocks
                .FirstOrDefaultAsync(ws => ws.WatchlistId == model.WatchlistId && ws.StockId == model.StockId);

            if (watchlistStock == null)
            {
                return NotFound("Stock not found in the specified watchlist.");
            }

            _context.WatchlistStocks.Remove(watchlistStock);
            await _context.SaveChangesAsync();

            return Ok();
        }

        [HttpGet("list/{userId}")]
        public async Task<IActionResult> ListWatchlists(string userId)
        {
            var watchlists = await _context.Watchlists
                .Where(w => w.UserId == userId)
                .Select(w => new { w.Id, w.Name })
                .ToListAsync();

            return Ok(watchlists);
        }

        [HttpGet("stocks/{watchlistId}")]
        public async Task<IActionResult> ListStocksInWatchlist(int watchlistId)
        {
            var watchlist = await _context.Watchlists
                .Include(w => w.WatchlistStocks)
                .ThenInclude(ws => ws.Stock)
                .FirstOrDefaultAsync(w => w.Id == watchlistId);

            if (watchlist == null)
            {
                return NotFound("Watchlist not found.");
            }

            var stocks = watchlist.WatchlistStocks.Select(ws => new StockDTO
            {
                Id = ws.Stock.Id,
                Symbol = ws.Stock.Symbol,
                StockName = ws.Stock.StockName,
                MarketCap = ws.Stock.MarketCap,
                AvgVol = ws.Stock.AvgVol,
                PERatio = ws.Stock.PERatio
            }).ToList();

            return Ok(stocks);
        }
    }

    public class CreateWatchlistModel
    {
        public string UserId { get; set; }
        public string Name { get; set; }
    }

    public class AddRemoveStockModel
    {
        public int WatchlistId { get; set; }
        public int StockId { get; set; }
    }

    public class RenameWatchlistModel
    {
        public int WatchlistId {get;set;}
        public string NewName {get;set;} = string.Empty;
    }

    public class StockDTO
    {
        public int Id { get; set; }
        public string Symbol { get; set; }
        public string StockName { get; set; }
        public string MarketCap { get; set; }
        public string AvgVol { get; set; }
        public string PERatio { get; set; }
    }
}
