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

        /// <summary>
        /// Retrieves the 5 most recent sales orders from the database,
        /// ordered by their creation date in descending order.
        /// </summary>
        /// <returns>
        /// An <see cref="IActionResult"/> containing a list of the most recent sales orders.
        /// </returns>
        [HttpGet("inventory/getRecentOrders")]
        public async Task<IActionResult> GetRecentOrders()
        {
            var orders = await _context.SalesOrders
                .OrderByDescending(o => o.CreatedOn)
                .Take(5)
                .ToListAsync();

            return Ok(orders);
        }


        /// <summary>
        /// Retrieves the 5 most recent sales orders for a specific customer,
        /// identified by their <paramref name="id"/>.
        /// Orders are returned in descending order of creation date.
        /// </summary>
        /// <param name="id">The unique identifier of the customer.</param>
        /// <returns>
        /// An <see cref="IActionResult"/> containing a list of the most recent sales orders
        /// for the specified customer. Returns an empty list if the customer has no orders.
        /// </returns>
        [HttpGet("customer/getRecentOrdersUser/{id}")]
        public async Task<IActionResult> GetRecentOrdersUser(int id)
        {
            var orders = await _context.SalesOrders
                .Where(o => o.CustomerId == id)
                .OrderByDescending(o => o.CreatedOn)
                .Take(5)
                .ToListAsync();

            return Ok(orders);
        }

        /// <summary>
        /// Retrieves the 5 most recent purchase orders from the database,
        /// ordered by their creation date in descending order.
        /// </summary>
        /// <returns>
        /// An <see cref="IActionResult"/> containing a list of the most recent purchase orders.
        /// Returns an empty list if no purchase orders exist.
        /// </returns>
        [HttpGet("inventory/getRecentPurchaseOrders")]
        public async Task<IActionResult> GetRecentPurchaseOrders()
        {
            var orders = await _context.PurchaseOrders
                .OrderByDescending(o => o.CreatedOn)
                .Take(5)
                .ToListAsync();

            return Ok(orders);
        }

        /// <summary>
        /// Retrieves summarized order status data for a specific customer,
        /// returning counts of orders in "Ordered", "Confirmed", and "Dispatched" statuses.
        /// </summary>
        /// <param name="customerId">The unique identifier of the customer.</param>
        /// <returns>
        /// An <see cref="IActionResult"/> containing an object with the counts of orders
        /// by status for the specified customer:
        /// <list type="bullet">
        /// <item><description>ordered: Number of orders with status "Ordered"</description></item>
        /// <item><description>confirmed: Number of orders with status "Confirmed"</description></item>
        /// <item><description>dispatched: Number of orders with status "Dispatched"</description></item>
        /// </list>
        /// Returns <see cref="NotFoundResult"/> if the customer has no orders.
        /// </returns>
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

        /// <summary>
        /// Retrieves sales order statistics for the current month based on India Standard Time (IST).
        /// Returns the total number of sales orders and the number of orders with status "Ordered".
        /// </summary>
        /// <returns>
        /// An <see cref="IActionResult"/> containing an object with:
        /// <list type="bullet">
        /// <item><description>totalOrders: Total number of sales orders created in the current month</description></item>
        /// <item><description>orderedCount: Number of sales orders with status "Ordered" in the current month</description></item>
        /// </list>
        /// </returns>
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

        /// <summary>
        /// Retrieves purchase order statistics for the current month based on India Standard Time (IST).
        /// Returns the total number of purchase orders and the number of orders with status "Ordered".
        /// </summary>
        /// <returns>
        /// An <see cref="IActionResult"/> containing an object with:
        /// <list type="bullet">
        /// <item><description>totalOrders: Total number of purchase orders created in the current month</description></item>
        /// <item><description>orderedCount: Number of purchase orders with status "Ordered" in the current month</description></item>
        /// </list>
        /// </returns>
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
