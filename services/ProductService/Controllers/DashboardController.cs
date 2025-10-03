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
            var lowProductsCount = await _context.Products.CountAsync(p => p.Quantity <= p.MinStockLevel);
            return Ok(new
            {
                lowProductsCount
            });
        }

        [HttpGet("category-percentages")]
        public async Task<IActionResult> GetCategoryPercentages()
        {
            // Join Products and Categories and filter active ones
            var query = await (from p in _context.Products
                               join c in _context.Categories
                               on p.CategoryId equals c.CategoryId
                               where p.IsActive && c.IsActive
                               select new
                               {
                                   CategoryName = c.CategoryName,
                                   Quantity = p.Quantity
                               }).ToListAsync();

            if (!query.Any())
                return Ok(new List<object>());

            // Group by category and sum quantities
            var grouped = query
                .GroupBy(x => x.CategoryName)
                .Select(g => new
                {
                    CategoryName = g.Key,
                    TotalQuantity = g.Sum(x => x.Quantity)
                })
                .ToList();

            // Total quantity
            var totalQuantity = grouped.Sum(g => g.TotalQuantity);

            // Calculate percentages
            var result = grouped.Select(g => new Dictionary<string, decimal>
    {
        { g.CategoryName, Math.Round((decimal)g.TotalQuantity / totalQuantity * 100, 2) }
    }).ToList();

            return Ok(result);
        }

    }
}