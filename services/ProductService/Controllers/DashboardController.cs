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

        /// <summary>
        /// Retrieves the total number of products in the system.
        /// </summary>
        /// <returns>An object containing the total count of products.</returns>
        [HttpGet("getProductsCount")]
        public async Task<IActionResult> GetProductsCount()
        {
            var productsCount = await _context.Products.CountAsync();
            return Ok(new
            {
                productsCount
            });
        }

        /// <summary>
        /// Retrieves the count of products with low stock (quantity less than 21).
        /// </summary>
        /// <returns>An object containing the count of low-stock products.</returns>
        [HttpGet("getLowProductsCount")]
        public async Task<IActionResult> GetLowProductsCount()
        {
            // Get products with quantity less than 21
            var lowProductsCount = await _context.Products.CountAsync(p => p.Quantity < 21);
            return Ok(new
            {
                lowProductsCount
            });
        }
    }
}