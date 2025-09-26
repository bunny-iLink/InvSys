using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProductService.Data;
using ProductService.Models;

namespace ProductService.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class DashboardController : ControllerBase
    {
        private readonly ProductDbContext _context;

        public DashboardController(ProductDbContext context)
        {
            _context = context;
        }

        [HttpGet("getProductsCount")]
        public async Task<IActionResult> GetProductsCount()
        {
            var productsCount = await _context.Products.CountAsync();
            return Ok(new
            {
                productsCount
            });
        }

        [HttpGet("getLowProductsCount")]
        public async Task<IActionResult> GetLowProductsCount()
        {
            // Get products with quantity less than 20
            var lowProductsCount = await _context.Products.CountAsync(p => p.Quantity < 21);
            return Ok(new
            {
                lowProductsCount
            });
        }
    }
}