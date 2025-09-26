using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ApiExplorer;
using Microsoft.EntityFrameworkCore;
using OrderService.Data;
using OrderService.Models;

namespace OrderService.Controllers
{
    [ApiController]
    [Route("order/[controller]")]

    public class DashboardController : ControllerBase
    {
        public readonly OrderDbContext _context;

        public DashboardController(OrderDbContext context)
        {
            _context = context;
        }

        [HttpGet("inventory/getRecentOrders")]
        public async Task<IActionResult> GetRecentOrders()
        {
            var orders = await _context.SalesOrders
                .OrderByDescending(o => o.CreatedOn)
                .Take(5)
                .ToListAsync();

            return Ok(orders);
        }

        [HttpGet("customer/getRecentOrdersUser/{id}")]
        public async Task<IActionResult> GetRecentOrdersUser(int id)
        {
            var orders = await _context.SalesOrders
                .Where(o => o.CustomerId == id)              // filter by userId
                .OrderByDescending(o => o.CreatedOn)     // order by date
                .Take(5)                                 // take top 5
                .ToListAsync();

            return Ok(orders);
        }


        [HttpGet("inventory/getRecentPurchaseOrders")]
        public async Task<IActionResult> GetRecentPurchaseOrders()
        {
            var orders = await _context.PurchaseOrders
                .OrderByDescending(o => o.CreatedOn)
                .Take(5)
                .ToListAsync();

            return Ok(orders);
        }

        [HttpGet("customer/tilesData/{customerId}")]
        public async Task<IActionResult> GetTilesData(int customerId)
        {
            // Check if customer has any orders
            var hasOrders = await _context.SalesOrders.AnyAsync(o => o.CustomerId == customerId);
            if (!hasOrders)
            {
                return NotFound("No orders found for this customer.");
            }

            // Count orders by status
            var ordered = await _context.SalesOrders
                .CountAsync(o => o.CustomerId == customerId && o.Status == "Ordered");

            var confirmed = await _context.SalesOrders
                .CountAsync(o => o.CustomerId == customerId && o.Status == "Confirmed");

            var dispatched = await _context.SalesOrders
                .CountAsync(o => o.CustomerId == customerId && o.Status == "Dispatched");

            return Ok(new
            {
                ordered,
                confirmed,
                dispatched
            });
        }

        [HttpGet("inventory/getCurrentMonthSalesOrders")]
        public async Task<IActionResult> GetCurrentMonthSalesOrders()
        {
            // Convert current UTC time to IST
            var istTimeZone = TimeZoneInfo.FindSystemTimeZoneById("India Standard Time");
            var nowIst = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, istTimeZone);

            int currentYear = nowIst.Year;
            int currentMonth = nowIst.Month;

            // Count orders in current month (filtering in DB)
            var totalOrders = await _context.SalesOrders
                .CountAsync(o => o.CreatedOn.Year == currentYear && o.CreatedOn.Month == currentMonth);

            var orderedCount = await _context.SalesOrders
                .CountAsync(o => o.CreatedOn.Year == currentYear && o.CreatedOn.Month == currentMonth && o.Status == "Ordered");

            return Ok(new
            {
                totalOrders,
                orderedCount
            });
        }

        [HttpGet("inventory/getCurrentMonthPurchaseOrders")]
        public async Task<IActionResult> GetCurrentMonthPurchaseOrders()
        {
            // Convert current UTC time to IST
            var istTimeZone = TimeZoneInfo.FindSystemTimeZoneById("India Standard Time");
            var nowIst = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, istTimeZone);

            int currentYear = nowIst.Year;
            int currentMonth = nowIst.Month;

            // Query orders for current month
            var ordersInCurrentMonth = await _context.PurchaseOrders
                .Where(o => o.CreatedOn.Year == currentYear && o.CreatedOn.Month == currentMonth)
                .ToListAsync();

            // Total orders in current month
            var totalOrders = ordersInCurrentMonth.Count;

            // Orders with status "Ordered"
            var orderedCount = ordersInCurrentMonth.Count(o => o.Status == "Ordered");

            return Ok(new
            {
                totalOrders,
                orderedCount
            });
        }
    }
}
