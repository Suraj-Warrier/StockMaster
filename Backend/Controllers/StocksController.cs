using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Data;
using System.Threading.Tasks;

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
                .Select(s => new { s.StockName, s.Symbol })
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

    }
}
