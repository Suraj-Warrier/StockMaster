using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Data;
using System.Threading.Tasks;
using System.Linq.Expressions;

namespace Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class StocksController : ControllerBase
    {
        private readonly ApplicationDBContext _context;

        public StocksController(ApplicationDBContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetStocks()
        {
            var stocks = await _context.Stocks
                .Select(s => new { s.StockName, s.Symbol, s.Id })
                .ToListAsync();

            return Ok(stocks);
        }

        [HttpGet("{symbol}")]
        public async Task<IActionResult> SelectedStock(string symbol)
        {
            // Explicitly check the type and debug if necessary
            var stock = await _context.Stocks
        .FirstOrDefaultAsync(s => s.Symbol == symbol);

            if (stock == null)
            {
                return NotFound();
            }

            return Ok(stock);
        }


    [HttpGet("getLastClose")]
    public async Task<IActionResult> GetLastClose()
    {
        try
        {
            // Fetch the stock entity from the database
            var stocks = await _context.Stocks
                .Select(x => new {x.Symbol, x.FiveMinData}).ToListAsync();

            if (stocks == null)
            {
                return NotFound();
            }

            var allFiveMinData = new List<LastPriceObj>();

            DateTime today = DateTime.Today.Date;
            foreach(var stock in stocks){
                var x = new LastPriceObj();
                x.Symbol = stock.Symbol;
                foreach(var data in stock.FiveMinData.OrderBy(d => d.Timestamp)){
                    if(data.Timestamp.Date < today){
                        x.LastPrice = data.Price;
                    }
                }
                allFiveMinData.Add(x);
            }     

            return Ok(allFiveMinData);
        }
        catch (Exception ex)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, $"Error: {ex.Message}");
        }
    }


    }

    public class LastPriceObj {
        public string Symbol{get;set;} = string.Empty;
        public decimal LastPrice {get;set;}

    }
}
